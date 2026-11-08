# Check It — Frontend

React 18 + TypeScript + Vite single-page application for the Check It device registry platform.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS 3 + CSS Variables (dark/light theme)
- **State:** React Context (Auth, Theme, Toast)
- **Animations:** Framer Motion
- **Icons:** Lucide React, React Icons

## Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   └── mobile/          # QR, NFC components
├── contexts/            # AuthContext, ThemeContext, ToastContext
├── lib/                 # ApiClient (fetch wrapper), client context
├── pages/               # 50+ page components
│   └── admin/           # Admin pages
├── services/            # Device fingerprint, geolocation, mobile bridge
├── types/               # TypeScript interfaces & type definitions
└── utils/               # Theme utilities
```

## Development

```bash
npm install
npm run dev        # Dev server on port 5173
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm test           # Run Jest tests
```

## Environment

```env
VITE_API_URL=http://localhost:3006/api
VITE_API_BASE_URL=http://localhost:3006
```

The dev server proxies `/api` requests to the backend via Vite's proxy config.

## Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing | Public |
| `/login`, `/register` | Auth | Public |
| `/dashboard` | User dashboard | Auth |
| `/register-device` | Device registration | Auth |
| `/my-devices` | Device list | Auth |
| `/reports` | Report history | Auth |
| `/device-check` | Public device check | Public |
| `/marketplace/browse` | Browse listings | Public |
| `/marketplace/create-listing` | Create listing | Business |
| `/checkout` | Purchase flow | Auth |
| `/orders` | Buyer orders | Auth |
| `/business` | Seller dashboard | Business |
| `/admin` | Admin dashboard | Admin |
| `/user-management` | User management | Admin |
| `/admin/system-settings` | System config | Admin |
| `/admin/lea-management` | LEA directory | Admin |
| `/analytics` | Platform analytics | Admin |
| `/lea` | LEA portal | LEA |
| `/lea/cases` | Case management | LEA |

## Notes

- `lib/apiClient.ts` is the API client — connects to the Express backend via fetch
- All API calls use `fetch()` directly with JWT Bearer tokens
- Role gating via `Layout` component with `allowedRoles` prop
- See root `README.md` for full project documentation


## Payment webhooks

Two domains are involved:
- **API domain** (webhooks hit the backend): `api.proveownership.com` per the deploy workflow
- **Frontend domain** (browser return): the server's `FRONTEND_URL` (should be `https://proveownership.com`; the local `.env` still says `dev.proveownership.com`)

Set these in the provider dashboards:

| Provider | Webhook URL | Callback / Redirect URL |
| --- | --- | --- |
| Paystack | `https://api.proveownership.com/api/payments/webhook/paystack` | `https://proveownership.com/payment/callback` |
| Monnify | `https://api.proveownership.com/api/payments/webhook/monnify` | `https://proveownership.com/payment/callback` |
| Flutterwave | `https://api.proveownership.com/api/payments/webhook/flutterwave` | `https://proveownership.com/payment/callback` |
| OPay | Not integrated — no URL to set | — |
| Vesicash | Not wired yet — no URL to set | — |

Notes:
- Don't add query strings to the callback URL in the dashboards. The backend appends them itself (`?kind=fee`, `?reference=...&provider=...`).
- **Paystack:** webhook signature is verified with `PAYSTACK_SECRET_KEY`. A callback is also sent per transaction, so the dashboard callback is just a fallback.
- **Monnify:** verified with `MONNIFY_SECRET_KEY` (HMAC-SHA512 of the raw body). Monnify also requires the redirect URL and often the server IP to be whitelisted in the dashboard.
- **Flutterwave:** set the Secret hash in the dashboard to exactly match `FLW_SECRET_HASH` in `.env`; it is checked via the `verif-hash` header.
- **Domain mismatch:** the deploy workflow calls `https://api.proveownership.com`, but the local `.env` uses `https://backend.proveownership.com`. Use whichever subdomain actually proxies to the backend on CyberPanel; if it is `backend.`, swap it in all three webhook URLs. Also make sure the server `FRONTEND_URL` is the real live site, because the backend builds the callback from it.
- **OPay** is not in the codebase at all, so there is nothing to configure for it yet.