# Check It - Role-Based Access Testing Guide

## 🧪 **COMPREHENSIVE ROLE TESTING SCENARIOS**

This guide provides step-by-step testing scenarios to verify that role-based access control is working correctly for all user types.

---

## 🎯 **TESTING SETUP**

### **Test Users to Create:**

```sql
-- Regular User
INSERT INTO users (id, name, email, password_hash, role, region) VALUES
('user-test-001', 'John Doe', 'user@test.com', '$2b$10$hashedpassword', 'user', 'lagos');

-- Business User
INSERT INTO users (id, name, email, password_hash, role, region) VALUES
('business-test-001', 'Jane Business', 'business@test.com', '$2b$10$hashedpassword', 'business', 'abuja');

-- LEA User
INSERT INTO users (id, name, email, password_hash, role, region) VALUES
('lea-test-001', 'Officer Smith', 'lea@test.com', '$2b$10$hashedpassword', 'lea', 'lagos');

-- Admin User
INSERT INTO users (id, name, email, password_hash, role, region) VALUES
('admin-test-001', 'Admin User', 'admin@test.com', '$2b$10$hashedpassword', 'admin', 'system');
```

### **Test Data Setup:**

```sql
-- Test LEA Agency
INSERT INTO law_enforcement_agencies (id, agency_name, contact_email, region) VALUES
('lea-agency-001', 'Lagos Police Command', 'lagos.police@test.com', 'lagos');

-- Test Devices
INSERT INTO devices (id, user_id, imei, brand, model, status) VALUES
('device-test-001', 'user-test-001', '123456789012345', 'Samsung', 'Galaxy S21', 'verified');

-- Test Reports
INSERT INTO reports (id, device_id, report_type, case_id, status, assigned_lea_id) VALUES
('report-test-001', 'device-test-001', 'stolen', 'CASE-2024-123456', 'open', 'lea-agency-001');
```

---

## 👤 **REGULAR USER TESTING**

### **✅ Test 1: Authentication & Profile**

```bash
# Register new user
curl -X POST http://localhost:3006/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "region": "lagos"
  }'

# Login
curl -X POST http://localhost:3006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'

# Get profile (use token from login)
curl -X GET http://localhost:3006/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Results:**

- ✅ Registration succeeds
- ✅ Login returns JWT token
- ✅ Profile returns user data without password

### **✅ Test 2: Device Management (Own Devices Only)**

```bash
# Register device (should succeed)
curl -X POST http://localhost:3006/api/device-management \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imei": "111111111111111",
    "brand": "Apple",
    "model": "iPhone 13",
    "proof_url": "https://example.com/receipt.jpg"
  }'

# List devices (should only show own devices)
curl -X GET http://localhost:3006/api/device-management \
  -H "Authorization: Bearer USER_TOKEN"

# Try to access another user's device (should fail)
curl -X GET http://localhost:3006/api/device-management/OTHER_USER_DEVICE_ID \
  -H "Authorization: Bearer USER_TOKEN"
```

**Expected Results:**

- ✅ Can register own devices
- ✅ Can view own devices only
- ❌ Cannot access other users' devices (404 or 403)

### **✅ Test 3: Report Management (Own Reports Only)**

```bash
# Create report for own device
curl -X POST http://localhost:3006/api/report-management \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "USER_DEVICE_ID",
    "report_type": "stolen",
    "description": "Device stolen from car",
    "location": "Lagos, Nigeria"
  }'

# List own reports
curl -X GET http://localhost:3006/api/report-management \
  -H "Authorization: Bearer USER_TOKEN"

# Try to update report status (should fail - LEA/Admin only)
curl -X PUT http://localhost:3006/api/report-management/CASE_ID \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved"}'
```

**Expected Results:**

- ✅ Can create reports for own devices
- ✅ Can view own reports only
- ❌ Cannot update report status (403 Forbidden)

### **✅ Test 4: Admin/LEA Access (Should Fail)**

```bash
# Try to access admin dashboard (should fail)
curl -X GET http://localhost:3006/api/admin-portal/stats \
  -H "Authorization: Bearer USER_TOKEN"

# Try to access LEA portal (should fail)
curl -X GET http://localhost:3006/api/lea-portal/stats \
  -H "Authorization: Bearer USER_TOKEN"

# Try to verify devices (should fail)
curl -X POST http://localhost:3006/api/admin-portal/verify-device/DEVICE_ID \
  -H "Authorization: Bearer USER_TOKEN"
```

**Expected Results:**

- ❌ All admin endpoints return 403 Forbidden
- ❌ All LEA endpoints return 403 Forbidden

---

## 👮‍♂️ **LEA USER TESTING**

### **✅ Test 1: LEA Portal Access**

```bash
# Login as LEA user
curl -X POST http://localhost:3006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lea@test.com",
    "password": "password123"
  }'

# Access LEA dashboard (should succeed)
curl -X GET http://localhost:3006/api/lea-portal/stats \
  -H "Authorization: Bearer LEA_TOKEN"

# View assigned cases (should show regional cases only)
curl -X GET http://localhost:3006/api/lea-portal/cases \
  -H "Authorization: Bearer LEA_TOKEN"
```

**Expected Results:**

- ✅ Can access LEA portal
- ✅ Can view cases in assigned region only
- ✅ Dashboard shows regional statistics

### **✅ Test 2: Case Management**

```bash
# View case details
curl -X GET http://localhost:3006/api/lea-portal/cases/CASE-2024-123456 \
  -H "Authorization: Bearer LEA_TOKEN"

# Update case status (should succeed)
curl -X PUT http://localhost:3006/api/lea-portal/cases/CASE-2024-123456/status \
  -H "Authorization: Bearer LEA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "under_review",
    "notes": "Investigation started"
  }'

# Add case notes
curl -X POST http://localhost:3006/api/lea-portal/cases/CASE-2024-123456/notes \
  -H "Authorization: Bearer LEA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Contacted victim, gathering evidence"}'
```

**Expected Results:**

- ✅ Can view cases in their region
- ✅ Can update case status
- ✅ Can add investigation notes

### **✅ Test 3: Regional Restrictions**

```bash
# Try to access cases from different region (should fail or show empty)
curl -X GET "http://localhost:3006/api/lea-portal/cases?region=abuja" \
  -H "Authorization: Bearer LEA_TOKEN_LAGOS"

# Try to access admin functions (should fail)
curl -X GET http://localhost:3006/api/admin-portal/verification-queue \
  -H "Authorization: Bearer LEA_TOKEN"
```

**Expected Results:**

- ❌ Cannot see cases from other regions
- ❌ Cannot access admin functions (403 Forbidden)

---

## 👨‍💼 **ADMIN USER TESTING**

### **✅ Test 1: Full System Access**

```bash
# Login as admin
curl -X POST http://localhost:3006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'

# Access admin dashboard (should succeed)
curl -X GET http://localhost:3006/api/admin-portal/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Access LEA portal (should succeed)
curl -X GET http://localhost:3006/api/lea-portal/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Access system management (should succeed)
curl -X GET http://localhost:3006/api/admin-system/overview \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Results:**

- ✅ Can access all admin endpoints
- ✅ Can access all LEA endpoints
- ✅ Can view system-wide data

### **✅ Test 2: Device Verification**

```bash
# View verification queue
curl -X GET http://localhost:3006/api/admin-portal/verification-queue \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Verify a device
curl -X POST http://localhost:3006/api/admin-portal/verify-device/DEVICE_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "notes": "Proof of ownership verified"
  }'
```

**Expected Results:**

- ✅ Can view all pending verifications
- ✅ Can approve/reject device verifications
- ✅ Notifications sent to device owners

### **✅ Test 3: User Management**

```bash
# View all users
curl -X GET http://localhost:3006/api/user-management/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Update user role
curl -X PUT http://localhost:3006/api/user-management/users/USER_ID/role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "lea",
    "reason": "Promoted to law enforcement"
  }'

# Reset user password
curl -X POST http://localhost:3006/api/user-management/users/USER_ID/reset-password \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_password": "newpassword123",
    "send_email": true
  }'
```

**Expected Results:**

- ✅ Can view all users system-wide
- ✅ Can update user roles
- ✅ Can reset passwords
- ✅ Users receive notifications

### **✅ Test 4: System Analytics**

```bash
# View comprehensive analytics
curl -X GET http://localhost:3006/api/analytics/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"

# View theft hotspots
curl -X GET http://localhost:3006/api/analytics/hotspots \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Export data
curl -X GET http://localhost:3006/api/analytics/export/devices \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Results:**

- ✅ Can access all analytics
- ✅ Can view system-wide statistics
- ✅ Can export data in various formats

---

## 🌐 **PUBLIC ACCESS TESTING**

### **✅ Test 1: Public Device Check (No Auth Required)**

```bash
# Check device status (no token needed)
curl -X GET "http://localhost:3006/api/public-check?imei=123456789012345"

# Check by serial number
curl -X GET "http://localhost:3006/api/public-check?serial=ABC123456"

# Report found device (no token needed)
curl -X POST http://localhost:3006/api/found-device/report \
  -H "Content-Type: application/json" \
  -d '{
    "imei": "123456789012345",
    "finder_name": "Good Samaritan",
    "finder_contact": "+1234567890",
    "location_found": "Central Park"
  }'
```

**Expected Results:**

- ✅ Public check works without authentication
- ✅ Returns appropriate device status
- ✅ Found device reporting works
- ✅ Notifications sent to owner and LEA

### **✅ Test 2: API Information (Public)**

```bash
# Get API status
curl -X GET http://localhost:3006/api/info/status

# Get API information
curl -X GET http://localhost:3006/api/info/info

# Health check
curl -X GET http://localhost:3006/health
```

**Expected Results:**

- ✅ API status returns system information
- ✅ API info returns endpoint documentation
- ✅ Health check returns system status

---

## 🔒 **SECURITY TESTING**

### **✅ Test 1: Token Validation**

```bash
# Try accessing protected endpoint without token
curl -X GET http://localhost:3006/api/device-management

# Try with invalid token
curl -X GET http://localhost:3006/api/device-management \
  -H "Authorization: Bearer invalid_token"

# Try with expired token
curl -X GET http://localhost:3006/api/device-management \
  -H "Authorization: Bearer expired_token"
```

**Expected Results:**

- ❌ No token: 401 Unauthorized
- ❌ Invalid token: 403 Forbidden
- ❌ Expired token: 403 Forbidden

### **✅ Test 2: Cross-Role Access Attempts**

```bash
# User trying to access admin endpoint
curl -X GET http://localhost:3006/api/admin-portal/stats \
  -H "Authorization: Bearer USER_TOKEN"

# LEA trying to access different region
curl -X GET "http://localhost:3006/api/lea-portal/cases?region=different_region" \
  -H "Authorization: Bearer LEA_TOKEN"

# User trying to access another user's data
curl -X GET http://localhost:3006/api/device-management/OTHER_USER_DEVICE \
  -H "Authorization: Bearer USER_TOKEN"
```

**Expected Results:**

- ❌ All unauthorized access attempts return 403 Forbidden
- ❌ Cross-region access blocked for LEA users
- ❌ Cross-user data access blocked

---

## 📊 **TESTING CHECKLIST**

### **✅ Regular User Tests**

- [ ] Can register and login
- [ ] Can manage own devices only
- [ ] Can create reports for own devices
- [ ] Can initiate and accept transfers
- [ ] Cannot access admin/LEA functions
- [ ] Cannot see other users' data

### **✅ LEA User Tests**

- [ ] Can access LEA portal
- [ ] Can view regional cases only
- [ ] Can update case status
- [ ] Can add investigation notes
- [ ] Cannot access admin functions
- [ ] Cannot see other regions' data

### **✅ Admin User Tests**

- [ ] Can access all system functions
- [ ] Can verify device registrations
- [ ] Can manage all users
- [ ] Can view system analytics
- [ ] Can perform maintenance operations
- [ ] Can access all regions' data

### **✅ Security Tests**

- [ ] Token validation works correctly
- [ ] Role restrictions enforced
- [ ] Regional restrictions enforced
- [ ] Ownership validation works
- [ ] Audit logging captures all actions
- [ ] Error messages don't leak sensitive info

### **✅ Public Access Tests**

- [ ] Public check works without auth
- [ ] Found device reporting works
- [ ] API documentation accessible
- [ ] Health checks work

---

## 🎯 **AUTOMATED TESTING SCRIPT**

```bash
#!/bin/bash
# Role-based access testing script

BASE_URL="http://localhost:3006"

echo "🧪 Starting Role-Based Access Control Tests..."

# Test 1: Public endpoints (no auth required)
echo "Testing public endpoints..."
curl -s "$BASE_URL/api/public-check?imei=123456789012345" | jq .
curl -s "$BASE_URL/health" | jq .

# Test 2: Authentication
echo "Testing authentication..."
USER_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}' | jq -r .token)

LEA_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"lea@test.com","password":"password123"}' | jq -r .token)

ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}' | jq -r .token)

# Test 3: Role-based access
echo "Testing user access..."
curl -s "$BASE_URL/api/device-management" -H "Authorization: Bearer $USER_TOKEN" | jq .

echo "Testing LEA access..."
curl -s "$BASE_URL/api/lea-portal/stats" -H "Authorization: Bearer $LEA_TOKEN" | jq .

echo "Testing admin access..."
curl -s "$BASE_URL/api/admin-portal/stats" -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Test 4: Access violations
echo "Testing access violations..."
curl -s "$BASE_URL/api/admin-portal/stats" -H "Authorization: Bearer $USER_TOKEN" | jq .
curl -s "$BASE_URL/api/admin-portal/stats" -H "Authorization: Bearer $LEA_TOKEN" | jq .

echo "✅ Role-based access control tests completed!"
```

---

**This comprehensive testing guide ensures that all role-based access controls are working correctly and securely across the entire Check It Device Registry system.**
