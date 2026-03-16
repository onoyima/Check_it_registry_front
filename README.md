# Check It - Smart Device Registry & Recovery System

A secure, scalable web application for device registration, verification, theft reporting, and recovery using Supabase (PostgreSQL), Edge Functions, and React.

## Features

### Core Functionality

- **Device Registration**: Register devices with IMEI/serial numbers and proof of ownership
- **Public Device Check**: Anyone can check if a device is stolen/lost before purchasing
- **Theft Reporting**: Owners can report devices as stolen/lost with automatic LEA notification
- **Found Device Reports**: Finders can report found devices to help reunite with owners
- **Admin Dashboard**: Device verification queue, statistics, and system management
- **LEA Portal**: Law enforcement access to cases and reports in their region

### Security Features

- Role-based access control (user, business, admin, LEA)
- Row Level Security (RLS) on all database tables
- Rate limiting on public check endpoint (10 requests/minute per IP)
- Audit logging for all critical operations
- Encrypted sensitive data fields
- JWT authentication via Supabase Auth

## Tech Stack

- **Backend**: Node.js + Express + MySQL
- **Frontend**: React 18 + TypeScript + Vite
- **Auth**: JWT tokens with bcrypt password hashing
- **Database**: MySQL 8.0+ with foreign key constraints
- **API**: RESTful Express routes with CORS support
- **Deployment**: Traditional server hosting (VPS, cloud instances)

## Project Structure

```
.
├── src/
│   ├── components/          # Reusable React components
│   ├── lib/
│   │   └── supabase.ts     # API client (renamed from supabase)
│   ├── pages/
│   │   ├── PublicCheck.tsx       # Public device check page
│   │   ├── Login.tsx             # User login
│   │   ├── Register.tsx          # User registration
│   │   ├── Dashboard.tsx         # User dashboard
│   │   ├── DeviceRegistration.tsx # Device registration form
│   │   └── AdminDashboard.tsx    # Admin portal
│   ├── types/
│   │   └── database.ts     # TypeScript type definitions
│   ├── App.tsx             # Main app component with routing
│   └── main.tsx            # Application entry point
├── server/
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── public-check.js      # Public device status check
│   │   ├── device-management.js # Device CRUD operations
│   │   ├── report-management.js # Report creation and updates
│   │   └── admin-portal.js      # Admin operations
│   ├── app.js              # Express server setup
│   └── package.json        # Server dependencies
├── mysql/
│   └── schema.sql          # MySQL database schema
├── config/
│   └── database.js         # Database connection and utilities
├── .env                    # Frontend environment variables
├── server/.env             # Backend environment variables
└── package.json            # Frontend dependencies
```

## Database Schema

### Core Tables

- **users**: User accounts with roles and regions
- **devices**: Registered devices with IMEI/serial, ownership proof
- **reports**: Stolen/lost/found reports with case IDs
- **law_enforcement_agencies**: LEA contact info and regions
- **notifications**: Email/SMS/push notification queue
- **audit_logs**: System audit trail
- **device_transfers**: Ownership transfer requests
- **imei_checks**: Public check audit log for rate limiting

## API Endpoints

### Public Endpoints

```
GET  /api/public-check?imei={imei}    # Check device status
GET  /api/public-check?serial={serial} # Check by serial
```

### Authentication Endpoints

```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout
GET  /api/auth/me          # Get current user
```

### Authenticated Endpoints (require JWT Bearer token)

```
# Device Management
GET    /api/device-management          # List user's devices
GET    /api/device-management/{id}     # Get device details
POST   /api/device-management          # Register new device
PUT    /api/device-management/{id}     # Update device
DELETE /api/device-management/{id}     # Delete device

# Report Management
GET    /api/report-management          # List user's reports
GET    /api/report-management/{case_id} # Get report details
POST   /api/report-management          # Create report
PUT    /api/report-management/{case_id} # Update report (LEA/Admin)

# Admin Portal (Admin only)
GET    /api/admin-portal/stats              # Dashboard stats
GET    /api/admin-portal/verification-queue # Devices pending verification
POST   /api/admin-portal/verify-device/{id} # Verify device
GET    /api/admin-portal/audit-logs         # View audit logs
GET    /api/admin-portal/users              # List all users
PUT    /api/admin-portal/users/{id}/role    # Update user role
```

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- MySQL 8.0+ server
- Git

### Quick Setup

1. Clone and setup:

```bash
git clone <repository-url>
cd check-it-device-registry
node setup.js
```

2. Create MySQL database:

```bash
mysql -u root -p
CREATE DATABASE check_it_registry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```


3. Import database schema:

```bash
mysql -u root -p check_it_registry < mysql/schema.sql
```

4. Update environment variables:

```bash
# Edit .env for frontend
VITE_API_URL=http://localhost:3001/api

# Edit server/.env for backend
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=check_it_registry
JWT_SECRET=your-secret-key
```

5. Start development servers:

```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm run dev
```

### Manual Installation

1. Install dependencies:

```bash
npm install
npm run server:install
```

2. Setup database and environment files as above

3. Start servers individually:

```bash
# Backend
cd server && npm run dev

# Frontend (new terminal)
npm run dev
```

## User Flows

### Device Owner Flow

1. Register account → Login
2. Navigate to "Register Device"
3. Fill device details (brand, model, IMEI/serial, proof URL)
4. Wait for admin verification
5. Once verified, device is protected
6. If stolen/lost: Create report → System notifies LEA and updates status

### Public Check Flow

1. Visit homepage (no login required)
2. Enter IMEI or serial number
3. View device status:
   - **Clean**: Device registered, no reports
   - **Not Found**: Device not in system
   - **Stolen/Lost**: Warning with case ID and recovery instructions

### Admin Flow

1. Login with admin account
2. Access Admin Dashboard
3. Review verification queue
4. Check device proof documents
5. Verify legitimate devices
6. Monitor system statistics and audit logs

## Security Considerations

### Row Level Security (RLS)

All tables have RLS enabled with policies enforcing:

- Users can only view/edit their own data
- Admins can view all data
- LEA can view reports in their region
- Public endpoints use service role with controlled access

### Rate Limiting

- Public check endpoint: 10 requests per minute per IP
- Logged in `imei_checks` table for monitoring

### Audit Logging

All critical operations logged to `audit_logs`:

- Device status changes
- Report creation/updates
- Device transfers
- Admin actions

### Data Privacy

- Owner details never exposed in public checks
- Case IDs generated without revealing sensitive info
- Proof documents only accessible to owner and admin

## Future Enhancements (Phase 2-3)

### Planned Features

- AI fraud detection for suspicious registrations
- Blockchain-based immutable ownership ledger
- SMS/Push notifications via Twilio/FCM
- Marketplace API for shops to verify devices
- Insurance provider integrations
- Geo-heatmaps of theft hotspots
- QR code generation for devices
- Device transfer workflow with OTP verification
- 2FA for admin/LEA accounts

### Scalability

- Horizontal scaling ready (stateless functions)
- Redis caching for frequent IMEI lookups
- Database connection pooling via Supabase
- CDN for static assets

## Testing

### Manual Testing

1. Create test user account
2. Register test device
3. Admin: Verify device
4. Public check: Verify shows as clean
5. Report as stolen
6. Public check: Verify shows warning

### API Testing

Use curl or any HTTP client:

```bash
# Public check
curl "http://localhost:3001/api/public-check?imei=123456789012345"

# Register user
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Register device (authenticated)
curl -X POST "http://localhost:3001/api/device-management" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"brand":"Apple","model":"iPhone 13","imei":"123456789012345","proof_url":"https://example.com/receipt.pdf"}'
```

## Deployment

### Backend Deployment Options

- **VPS/Cloud Instance**: Ubuntu/CentOS with PM2 process manager
- **Docker**: Containerized deployment with docker-compose
- **Cloud Platforms**: AWS EC2, DigitalOcean Droplets, Linode
- **PaaS**: Heroku, Railway, Render

### Frontend Deployment

- **Static Hosting**: Vercel, Netlify, Cloudflare Pages
- **CDN**: AWS CloudFront, Cloudflare
- **Traditional**: Apache/Nginx serving built files

### Production Checklist

- [ ] Set up MySQL with proper user permissions
- [ ] Configure environment variables (JWT_SECRET, DB credentials)
- [ ] Enable HTTPS/TLS with SSL certificates
- [ ] Set up reverse proxy (Nginx/Apache)
- [ ] Configure PM2 for process management
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Set up monitoring (Sentry, New Relic)
- [ ] Enable firewall rules
- [ ] Load test API endpoints
- [ ] Security audit and penetration testing

## License

Proprietary - All rights reserved

## Support

For issues, questions, or contributions, contact the development team.
