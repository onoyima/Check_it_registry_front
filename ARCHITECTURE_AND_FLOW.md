# Check It Device Registry — Architecture & End‑to‑End Flow

This document provides a comprehensive overview of the implemented backend and frontend, including architecture, environment setup, routes and payloads, UI flows, testing steps, and deployment notes.

## Overview

- Purpose: Register devices, verify ownership, and securely transfer ownership between users.
- Stack:
  - Backend: `Express` + `MySQL`, JWT auth, OTP flows, email/SMS notifications.
  - Frontend: `React` (Vite), route-protected pages, device registration and transfer workflows.
- Status: Fully implemented core flows with streamlined registration and unified transfer endpoints.

## Repo Layout

- Backend: `server/`
  - Entry: `server/app.js` (full feature) and `server/index.js` (trimmed feature set)
  - Routes: `server/routes/*` (auth, device-management, device-transfer, public-check, files, admin)
  - Services: `server/services/*` (OwnershipTransferService, DeviceCategoryService, OTPService, NotificationService, etc.)
  - Config: `server/config.js` (MySQL pool, JWT, helpers), `server/config/swagger.js` (API docs)
- Frontend: `src/`
  - Contexts: `src/contexts/AuthContext.tsx`
  - Pages: `src/pages/*` (DeviceRegistration, DeviceTransfer, MyDevices, DeviceDetails, Login, Register, PublicCheck, etc.)
  - Components: `src/components/*` (Layout, Navbar, Sidebar, Toast, etc.)
  - Dev proxy: `vite.config.ts` (proxies `'/api'` to backend port from `server/.env`)

## Environment Setup

- Backend `.env` (in `server/.env`):
  - `PORT=3001`
  - `DB_HOST`, `DB_PORT=3306`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=check_it_registry`
  - `JWT_SECRET` (use a strong secret in production)
  - `FRONTEND_URL=http://localhost:5173` (for CORS)
- Frontend `.env` (repo root):
  - Optional: `VITE_API_BASE_URL` (if set, frontend calls `VITE_API_BASE_URL/api`)
  - Otherwise, frontend uses `'/api'` and Vite proxies to backend discovered from `server/.env`.

## Running Locally

- Install deps:
  - Backend: `npm run server:install` (or run `npm install` inside `server/`)
  - Frontend: `npm install`
- Start servers:
  - Backend: `npm run server:dev` (runs `nodemon app.js`)
  - Frontend: `npm run dev` (Vite at `http://localhost:5173/`)
- API docs (Swagger): `GET /api/docs` (served by `server/app.js`)
- Health check: `GET /health`

## Data Model (Conceptual)

- `users`: `id`, `name`, `email`, `password_hash`, `role`, `region`, `verified_at`, `profile_image_url`, timestamps
- `devices`: `id`, `user_id`, `category`, `imei`, `serial`, `brand`, `model`, `status` (`unverified`, `verified`, `stolen`, `lost`, `pending_transfer`), optional category fields (`vin`, `mac_address`, etc.)
- `ownership_transfers`: `id`, `device_id`, `from_user_id`, `buyer_email?`, `transfer_code`, `status`, `expires_at`, timestamps
- `otps`: transfer and account verification OTPs with expiry

## Authentication

- JWT-based auth
  - `POST /api/auth/register` → returns `token` and `user`
  - `POST /api/auth/login` → `{ token, user }`
  - `GET /api/auth/me` → current user
- Frontend stores `token` in `localStorage('auth_token')` and attaches `Authorization: Bearer <token>` to protected requests.

## Device Registration Flow

- Frontend (`src/pages/DeviceRegistration.tsx`):
  - Category dropdown via `GET /api/device-management/categories`.
  - Minimal fields enforced per category + always `brand`, `model`:
    - `mobile_phone`: `imei` (15 digits; client-side Luhn validation)
    - `computer` / `electronics`: `serialNumber`
    - `smart_watch`: `serialNumber` or `imei`
    - `vehicle`: `vin`
    - `others`: `description`
  - Optional uploads and extra fields removed to keep registration fast.
- Backend (`POST /api/device-management`):
  - Validates via `DeviceCategoryService.validateDeviceData(category, body)`:
    - Checks required fields and primary identifier format.
    - Vehicle requires only `vin`, `brand`, `model`.
  - Dedupes by `imei` or `serial` or `vin` and returns conflict if already registered.
  - Creates device with `status='unverified'` (can later be verified by email/flow).

### Example Requests

- Mobile Phone
  ```json
  {
    "category": "mobile_phone",
    "brand": "Samsung",
    "model": "Galaxy S22",
    "imei": "356789012345678"
  }
  ```
- Computer
  ```json
  {
    "category": "computer",
    "brand": "Dell",
    "model": "XPS 13",
    "serialNumber": "SNABCD12345"
  }
  ```
- Vehicle
  ```json
  {
    "category": "vehicle",
    "brand": "Toyota",
    "model": "Corolla",
    "vin": "JTDBR32E720012345"
  }
  ```

## Ownership Transfer — End‑to‑End

- Initiate (Seller)
  - `POST /api/device-transfer/initiate`
  - Body: `deviceId`, optional `salePrice`, `transferReason`, `buyerEmail`, `agreementTerms`, `transferLocation`
  - Preconditions: Seller owns the device, device is `verified`, not `stolen/lost`.
  - Creates transfer with 12-character `transfer_code`; sets device `pending_transfer`; sends notifications.

- Activate (Seller OTP)
  - `POST /api/device-transfer/verify-otp`
  - Body: `transferId`, `otpCode` (6 digits)
  - Marks transfer active so buyer can complete/reject.

- Accept (Buyer)
  - `POST /api/device-transfer/complete`
  - Body: `transferCode`, optional `otpCode` (buyer OTP)
  - Behavior:
    - If buyer OTP is required and not provided, backend sends OTP and returns a guidance error. Buyer then submits with `otpCode` to complete.
    - On success, transfer `completed`, device owner becomes buyer, device set to `verified`.

- Reject (Buyer)
  - `POST /api/device-transfer/reject`
  - Body: `transfer_code`, optional `rejection_reason`
  - Behavior:
    - Any authenticated user with a valid `transfer_code` can reject (restriction relaxed to avoid friction with differing emails).
    - Marks transfer `rejected`, device status returns to seller as `verified`. Notifies both parties.

- Cancel (Seller)
  - `POST /api/device-transfer/cancel` → `{ transferId }`
  - Cancels non-completed transfers and restores device status.

- Resend Code (Seller)
  - `POST /api/device-transfer/resend-code` → `{ transferId }`

- Listing Transfers
  - `GET /api/device-transfer/my-transfers?type=sent|received|all`
  - `GET /api/device-transfer/history` (paginated; admin/broader views)

### Common Buyer Guidance

- “Transfer not active” → Ask seller to verify their 6-digit OTP first.
- “Transfer has expired” → Seller should initiate a new transfer.
- “Verification code is required” → Check email for 6-digit OTP; submit with `otpCode`.

## Public Check & Device Management

- Public check endpoints allow non-authenticated verification of device status by identifiers.
- Device management pages:
  - My Devices: `GET /api/device-management` lists user devices.
  - Device Details: `GET /api/device-management/:id` returns full details for owned device.

## Notifications

- Email and optional SMS are queued for transfer events (initiation, OTP, completion, rejection).
- Failures to send notifications do not block core actions (e.g., rejection still succeeds if email fails).

## Error Handling & Status Codes

- 400: Validation errors, missing inputs.
- 401/403: Auth and authorization issues.
- 404: Resource not found.
- 409: Duplicate registration conflict.
- 500/503: Server/database errors with safe messages.

## Security Considerations

- JWT auth for all protected routes; token verified per request via DB lookup.
- CORS permits dev origin; set `FRONTEND_URL` in production.
- Rate limiting is disabled in development; enable in production if needed.
- Device transfer guards prevent stolen/lost device transfers and enforce seller OTP activation.

## Configuration & Deployment

- Build frontend: `npm run build` → serve `dist/` behind a reverse proxy.
- Backend deploy: run `node app.js` with proper `.env`; connect to production MySQL.
- Set `FRONTEND_URL` and `JWT_SECRET`, configure NotificationService for email/SMS providers.
- API docs at `/api/docs` (Swagger UI).

## Testing Scenarios (Step‑by‑Step)

- Registration
  - Select category, fill minimal identifier + `brand` + `model`.
  - Submit; expect success toast and redirect to My Devices. Device status `unverified`.

- Transfer
  - Seller: initiate transfer → verify seller OTP to activate.
  - Buyer: enter 12-character `transfer_code`.
    - If prompted, enter 6-digit buyer OTP to complete.
    - Or choose Reject with optional reason to decline; device returns to seller.
  - Check `my-transfers` and device lists to confirm statuses.

## API Reference (Key Endpoints)

- Auth
  - `POST /api/auth/register` → `{ name, email, password, phone?, region? }`
  - `POST /api/auth/login` → `{ email, password }` returns `{ token, user }`
  - `GET /api/auth/me`

- Device Management
  - `GET /api/device-management/categories`
  - `GET /api/device-management`
  - `GET /api/device-management/:id`
  - `POST /api/device-management` → minimal payload per category as shown above

- Ownership Transfer (Unified)
  - `POST /api/device-transfer/initiate` → `{ deviceId, salePrice?, transferReason?, buyerEmail?, agreementTerms?, transferLocation? }`
  - `POST /api/device-transfer/verify-otp` → `{ transferId, otpCode }`
  - `POST /api/device-transfer/complete` → `{ transferCode, otpCode? }`
  - `POST /api/device-transfer/reject` → `{ transfer_code, rejection_reason? }`
  - `POST /api/device-transfer/cancel` → `{ transferId }`
  - `POST /api/device-transfer/resend-code` → `{ transferId }`
  - `GET /api/device-transfer/my-transfers?type=sent|received|all`
  - `GET /api/device-transfer/history`

## Recent Implementation Changes

- Relaxed buyer restriction for rejections: any authenticated user holding the valid code can reject.
- Simplified registration UI: minimal required fields only, optional uploads removed for speed.
- Vehicle validation: backend now requires only `vin`, `brand`, `model` (no extra vehicle fields at registration).
- Dev proxy: frontend calls `'/api'` and Vite proxies to backend using `server/.env` `PORT`.

---

For questions or further improvements (e.g., enabling rate limits or enriching device verification flows), see `server/app.js` and `server/services/*` for extension points.