# Check It - API Documentation

## Base URL
```
https://your-project.supabase.co/functions/v1
```

## Authentication

Most endpoints require JWT authentication via Supabase Auth.

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

## Endpoints

---

## Public Endpoints

### Check Device Status

Check if a device has been reported as stolen or lost.

**Endpoint:** `GET /public-check`

**Query Parameters:**
- `imei` (string, optional): Device IMEI number
- `serial` (string, optional): Device serial number

*Note: Either `imei` or `serial` is required*

**Rate Limit:** 10 requests per minute per IP

**Response:**

```json
{
  "status": "clean|stolen|lost|not_found",
  "message": "Human-readable status message",
  "case_id": "CASE-20241014-ABC12345",
  "report_type": "stolen|lost",
  "occurred_at": "2024-10-14T12:00:00Z",
  "recovery_instructions": "Contact local law enforcement..."
}
```

**Example:**
```bash
curl "https://your-project.supabase.co/functions/v1/public-check?imei=123456789012345"
```

---

## Device Management

### List User's Devices

Get all devices registered by the authenticated user.

**Endpoint:** `GET /device-management`

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "imei": "123456789012345",
    "serial": "ABC123456",
    "brand": "Apple",
    "model": "iPhone 13 Pro",
    "color": "Space Gray",
    "device_image_url": "https://...",
    "proof_url": "https://...",
    "status": "verified",
    "verified_by": "uuid",
    "verified_at": "2024-10-14T12:00:00Z",
    "created_at": "2024-10-14T10:00:00Z",
    "updated_at": "2024-10-14T12:00:00Z"
  }
]
```

---

### Get Device Details

Get details of a specific device owned by the user.

**Endpoint:** `GET /device-management/{device_id}`

**Authentication:** Required

**Response:** Same as single device object above

---

### Register New Device

Register a new device with proof of ownership.

**Endpoint:** `POST /device-management`

**Authentication:** Required

**Request Body:**
```json
{
  "brand": "Apple",
  "model": "iPhone 13 Pro",
  "color": "Space Gray",
  "imei": "123456789012345",
  "serial": "ABC123456",
  "proof_url": "https://example.com/receipt.pdf",
  "device_image_url": "https://example.com/device.jpg"
}
```

**Required Fields:**
- `brand`
- `model`
- `proof_url`
- At least one of: `imei` or `serial`

**Response:** Device object with status "unverified"

---

### Update Device

Update device information (owner only).

**Endpoint:** `PUT /device-management/{device_id}`

**Authentication:** Required

**Request Body:**
```json
{
  "color": "New Color",
  "device_image_url": "https://..."
}
```

**Response:** Updated device object

---

## Report Management

### Create Report

Create a new stolen, lost, or found report.

**Endpoint:** `POST /report-management`

**Authentication:** Required

**Request Body:**
```json
{
  "device_id": "uuid",
  "report_type": "stolen|lost|found",
  "description": "Device was stolen from my car on Main St",
  "occurred_at": "2024-10-14T18:30:00Z",
  "location": "123 Main St, Lagos",
  "evidence_url": "https://example.com/evidence.jpg"
}
```

**Required Fields:**
- `device_id`
- `report_type`
- `description`
- `occurred_at`

**Response:**
```json
{
  "id": "uuid",
  "device_id": "uuid",
  "report_type": "stolen",
  "reporter_id": "uuid",
  "description": "...",
  "occurred_at": "2024-10-14T18:30:00Z",
  "location": "...",
  "evidence_url": "...",
  "status": "open",
  "case_id": "CASE-20241014-ABC12345",
  "assigned_lea_id": "uuid",
  "created_at": "2024-10-14T19:00:00Z",
  "devices": {
    "id": "uuid",
    "brand": "Apple",
    "model": "iPhone 13 Pro",
    "imei": "123456789012345",
    "serial": "ABC123456",
    "user_id": "uuid"
  }
}
```

---

### List Reports

List reports accessible to the user (based on role).

**Endpoint:** `GET /report-management`

**Authentication:** Required

**Access Control:**
- **Users**: See reports for their own devices
- **LEA**: See reports in their assigned region
- **Admin**: See all reports

**Response:** Array of report objects with device details

---

### Get Report Details

Get detailed information about a specific report.

**Endpoint:** `GET /report-management/{case_id}`

**Authentication:** Required

**Response:**
```json
{
  "id": "uuid",
  "device_id": "uuid",
  "report_type": "stolen",
  "reporter_id": "uuid",
  "description": "...",
  "occurred_at": "2024-10-14T18:30:00Z",
  "location": "...",
  "evidence_url": "...",
  "status": "open",
  "case_id": "CASE-20241014-ABC12345",
  "assigned_lea_id": "uuid",
  "created_at": "2024-10-14T19:00:00Z",
  "devices": { /* device details */ },
  "law_enforcement_agencies": {
    "agency_name": "Lagos State Police",
    "contact_email": "contact@lagospolice.gov"
  }
}
```

---

### Update Report Status

Update the status of a report (LEA/Admin only).

**Endpoint:** `PUT /report-management/{case_id}`

**Authentication:** Required (LEA or Admin role)

**Request Body:**
```json
{
  "status": "under_review|resolved|dismissed"
}
```

**Response:** Updated report object

---

## Admin Portal

All admin endpoints require the user to have the `admin` role.

### Get Dashboard Statistics

Get system-wide statistics for the admin dashboard.

**Endpoint:** `GET /admin-portal/stats`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "total_devices": 1234,
  "total_reports": 56,
  "total_users": 890,
  "total_checks": 45678,
  "devices_by_status": {
    "verified": 1000,
    "unverified": 200,
    "stolen": 30,
    "lost": 4
  },
  "reports_by_status": {
    "open": 30,
    "under_review": 15,
    "resolved": 10,
    "dismissed": 1
  }
}
```

---

### Get Verification Queue

Get list of devices pending verification.

**Endpoint:** `GET /admin-portal/verification-queue`

**Authentication:** Required (Admin only)

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "brand": "Apple",
    "model": "iPhone 13",
    "imei": "123456789012345",
    "serial": "ABC123456",
    "proof_url": "https://...",
    "status": "unverified",
    "created_at": "2024-10-14T10:00:00Z",
    "users": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

---

### Verify Device

Mark a device as verified.

**Endpoint:** `POST /admin-portal/verify-device/{device_id}`

**Authentication:** Required (Admin only)

**Response:** Updated device object with status "verified"

---

### Get Audit Logs

View system audit logs.

**Endpoint:** `GET /admin-portal/audit-logs`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `limit` (integer, default: 100): Number of logs to return
- `offset` (integer, default: 0): Pagination offset

**Response:**
```json
[
  {
    "id": "uuid",
    "actor_id": "uuid",
    "action": "UPDATE on devices",
    "target_type": "devices",
    "target_id": "uuid",
    "metadata": {
      "old": { /* previous state */ },
      "new": { /* new state */ }
    },
    "created_at": "2024-10-14T12:00:00Z",
    "users": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
]
```

---

### List All Users

Get list of all registered users.

**Endpoint:** `GET /admin-portal/users`

**Authentication:** Required (Admin only)

**Response:** Array of user objects

---

### Update User Role

Change a user's role.

**Endpoint:** `PUT /admin-portal/users/{user_id}/role`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "role": "user|business|admin|lea"
}
```

**Response:** Updated user object

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "IMEI or serial number required"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization required"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Device not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Error message details"
}
```

---

## Rate Limiting

### Public Check Endpoint
- Limit: 10 requests per minute per IP address
- Reset: Rolling window (60 seconds)
- Headers: Standard rate limit headers not yet implemented

### Other Endpoints
- No rate limiting currently implemented
- Supabase connection limits apply

---

## Webhooks (Future)

Planned webhook support for:
- Device verification events
- Report status changes
- LEA notifications

## Postman Collection

Import the OpenAPI spec or use these example requests:

### Environment Variables
```
base_url: https://your-project.supabase.co/functions/v1
jwt_token: YOUR_JWT_TOKEN
```

## Support

For API support, contact the development team or refer to the main README.md file.
