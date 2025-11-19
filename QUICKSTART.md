# Quick Start Guide

Get the Check It system running in 5 minutes.

## Prerequisites

- Node.js 18+
- Supabase project (database and functions already deployed)

## Step 1: Clone & Install

```bash
# Navigate to project directory
cd check-it-device-registry

# Install dependencies
npm install
```

## Step 2: Environment Setup

The `.env` file should already exist with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Step 3: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:5173

## Step 4: Create Test Data

### Create Admin User

1. Register a new account at http://localhost:5173/register
2. Note your user ID from the browser console or Supabase Auth dashboard
3. Update the user role in Supabase SQL Editor:

```sql
-- Replace 'USER_ID_HERE' with actual auth user ID
INSERT INTO users (id, name, email, role, region)
VALUES (
  'USER_ID_HERE',
  'Admin User',
  'admin@test.com',
  'admin',
  'Lagos'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Add Law Enforcement Agency

```sql
INSERT INTO law_enforcement_agencies (agency_name, contact_email, region, phone_number)
VALUES ('Lagos State Police', 'contact@lagospolice.gov', 'Lagos', '+234-123-4567');
```

## Step 5: Test Workflows

### Register a Device

1. Login with your account
2. Click "Register Device"
3. Fill in device details:
   - Brand: Apple
   - Model: iPhone 13 Pro
   - IMEI: 123456789012345
   - Proof URL: https://example.com/receipt.pdf (any valid URL for testing)
4. Submit

### Verify Device (Admin)

1. Navigate to http://localhost:5173/admin
2. You'll see the device in verification queue
3. Click "Verify" button

### Check Device Status (Public)

1. Go to homepage (http://localhost:5173)
2. Enter IMEI: 123456789012345
3. Should show "Clean" status

### Report as Stolen

1. In user dashboard, you'll need to create this feature OR
2. Use API directly:

```bash
curl -X POST "http://localhost:54321/functions/v1/report-management" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEVICE_UUID",
    "report_type": "stolen",
    "description": "Stolen from car",
    "occurred_at": "2024-10-14T18:00:00Z",
    "location": "123 Main St"
  }'
```

### Verify Stolen Status

1. Go back to homepage
2. Check same IMEI: 123456789012345
3. Should now show "STOLEN" warning with case ID

## Common Issues

### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

### "Missing Supabase environment variables"

Ensure `.env` file exists and contains valid keys.

### Can't Login

Verify:
1. User exists in Supabase Auth dashboard
2. User record exists in `users` table
3. Email/password are correct

### Public Check Returns "Not Found"

Verify:
1. Device was registered
2. IMEI matches exactly (case-sensitive)
3. Device status is not "pending_transfer"

## API Testing

### Get Auth Token

After login, get token from:
```javascript
// In browser console
const { data } = await supabase.auth.getSession()
console.log(data.session.access_token)
```

### Test Endpoints

```bash
# Public check
curl "http://localhost:54321/functions/v1/public-check?imei=123456789012345"

# List user devices
curl "http://localhost:54321/functions/v1/device-management" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Admin stats
curl "http://localhost:54321/functions/v1/admin-portal/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. Read full [README.md](./README.md) for detailed documentation
2. Review [API.md](./API.md) for complete API reference
3. See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
4. Explore the codebase:
   - `/src/pages` - React components
   - `/supabase/functions` - Edge Functions
   - `/supabase/migrations` - Database schema

## Building for Production

```bash
npm run build
```

Output in `dist/` directory, ready to deploy to Vercel/Netlify.

## Getting Help

- Check error messages in browser console
- Review Supabase logs in Dashboard → Edge Functions → Logs
- Check database logs in Dashboard → Database → Logs
- See [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section

## Key URLs

- Frontend: http://localhost:5173
- Supabase Studio: Your project dashboard
- API Base: `${VITE_SUPABASE_URL}/functions/v1`

Happy coding!
