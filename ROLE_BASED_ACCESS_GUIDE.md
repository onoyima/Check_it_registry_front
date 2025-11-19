# Check It - Role-Based Access Control Guide

## 🎯 **USER ROLES & PERMISSIONS OVERVIEW**

The Check It Device Registry implements a comprehensive role-based access control system with four distinct user roles, each with specific permissions and capabilities.

---

## 👤 **REGULAR USER ROLE**

### **What Regular Users Can Do:**

#### **🔐 Authentication & Profile**
- ✅ Register new account (`POST /api/auth/register`)
- ✅ Login to system (`POST /api/auth/login`)
- ✅ View own profile (`GET /api/auth/me`)
- ✅ Logout from system (`POST /api/auth/logout`)

#### **📱 Device Management**
- ✅ Register new devices (`POST /api/device-management`)
- ✅ View own devices only (`GET /api/device-management`)
- ✅ View own device details (`GET /api/device-management/:id`)
- ✅ Update own device info (`PUT /api/device-management/:id`)
- ✅ Delete own devices (`DELETE /api/device-management/:id`)

#### **📋 Report Management**
- ✅ Create theft/loss reports for own devices (`POST /api/report-management`)
- ✅ View own reports only (`GET /api/report-management`)
- ✅ View own report details (`GET /api/report-management/:case_id`)
- ❌ Cannot update report status (LEA/Admin only)

#### **🔄 Device Transfer**
- ✅ Initiate device transfers (`POST /api/device-transfer/initiate`)
- ✅ Accept incoming transfers (`POST /api/device-transfer/accept`)
- ✅ Reject incoming transfers (`POST /api/device-transfer/reject`)
- ✅ View own transfer requests (`GET /api/device-transfer/requests`)
- ✅ Cancel own pending transfers (`DELETE /api/device-transfer/:id`)

#### **📁 File Management**
- ✅ Upload proof documents (`POST /api/files/upload/proof`)
- ✅ Upload device images (`POST /api/files/upload/device-image`)
- ✅ Upload evidence files (`POST /api/files/upload/evidence`)
- ✅ Upload handover proof (`POST /api/files/upload/handover-proof`)
- ✅ View own uploaded files (`GET /api/files/view/:subdir/:filename`)

#### **🔍 Public Access (No Auth Required)**
- ✅ Check device status (`GET /api/public-check`)
- ✅ Report found devices (`POST /api/found-device/report`)
- ✅ Check if device can be reported as found (`GET /api/found-device/check`)

### **What Regular Users CANNOT Do:**
- ❌ Access admin dashboard
- ❌ Verify other users' devices
- ❌ View other users' data
- ❌ Manage system settings
- ❌ Access LEA portal
- ❌ View system analytics
- ❌ Perform system maintenance

---

## 🏢 **BUSINESS USER ROLE**

### **Business Users Have Same Access as Regular Users Plus:**

#### **Enhanced Capabilities:**
- ✅ All regular user permissions
- ✅ Potential for bulk device registration (future feature)
- ✅ Business-specific reporting (future feature)
- ✅ Priority support access (future feature)

### **Current Implementation:**
- **Same as Regular User**: Currently has identical permissions to regular users
- **Future Enhancements**: Framework ready for business-specific features

---

## 👮‍♂️ **LEA (Law Enforcement) ROLE**

### **What LEA Users Can Do:**

#### **🔐 Authentication & Profile**
- ✅ All standard authentication features
- ✅ Regional assignment and management

#### **👮‍♂️ LEA Portal Access**
- ✅ View LEA dashboard statistics (`GET /api/lea-portal/stats`)
- ✅ View assigned cases in their region (`GET /api/lea-portal/cases`)
- ✅ View detailed case information (`GET /api/lea-portal/cases/:caseId`)
- ✅ Update case status (`PUT /api/lea-portal/cases/:caseId/status`)
- ✅ Add case notes (`POST /api/lea-portal/cases/:caseId/notes`)
- ✅ View regional statistics (`GET /api/lea-portal/regional-stats`)
- ✅ Export cases to CSV (`GET /api/lea-portal/export/cases`)

#### **📋 Report Management**
- ✅ View reports in their assigned region
- ✅ Update report status (open → under_review → resolved)
- ✅ Add investigation notes
- ✅ Coordinate device recovery
- ✅ Manage case assignments

#### **🔍 Found Device Management**
- ✅ View found device reports (`GET /api/found-device/reports`)
- ✅ Coordinate device returns
- ✅ Update recovery status

#### **📊 Regional Analytics**
- ✅ View crime statistics for their region
- ✅ Access theft hotspot data
- ✅ Monitor case resolution rates
- ✅ Track recovery success rates

### **LEA Regional Restrictions:**
- 🔒 Can only see cases in their assigned region
- 🔒 Cannot access other regions' data
- 🔒 Cannot modify system-wide settings
- 🔒 Cannot verify devices (Admin only)

### **What LEA Users CANNOT Do:**
- ❌ Access admin dashboard
- ❌ Verify device registrations
- ❌ Manage users or roles
- ❌ Access system maintenance tools
- ❌ View system-wide analytics
- ❌ Manage other LEA agencies

---

## 👨‍💼 **ADMIN ROLE**

### **What Admin Users Can Do:**

#### **🎛️ Complete System Access**
- ✅ **ALL** regular user permissions
- ✅ **ALL** LEA permissions (across all regions)
- ✅ **FULL** administrative control

#### **👥 User Management**
- ✅ View all users (`GET /api/user-management/users`)
- ✅ View detailed user profiles (`GET /api/user-management/users/:userId`)
- ✅ Update user roles (`PUT /api/user-management/users/:userId/role`)
- ✅ Update user regions (`PUT /api/user-management/users/:userId/region`)
- ✅ Suspend/unsuspend accounts (`PUT /api/user-management/users/:userId/suspend`)
- ✅ Reset user passwords (`POST /api/user-management/users/:userId/reset-password`)
- ✅ Bulk operations (`POST /api/user-management/bulk-operations`)
- ✅ User statistics (`GET /api/user-management/statistics`)

#### **📱 Device Verification & Management**
- ✅ View verification queue (`GET /api/admin-portal/verification-queue`)
- ✅ Verify device registrations (`POST /api/admin-portal/verify-device/:id`)
- ✅ View all devices system-wide
- ✅ Manage device statuses
- ✅ Override device ownership (if needed)

#### **📊 System Analytics**
- ✅ Comprehensive dashboard (`GET /api/analytics/dashboard`)
- ✅ Device brand analytics (`GET /api/analytics/devices/brands`)
- ✅ Theft hotspot analysis (`GET /api/analytics/hotspots`)
- ✅ LEA performance stats (`GET /api/analytics/lea-performance`)
- ✅ Export analytics data (`GET /api/analytics/export/:type`)

#### **🏥 System Health & Monitoring**
- ✅ System health status (`GET /api/system-health/status`)
- ✅ Detailed audit logs (`GET /api/system-health/audit-logs`)
- ✅ System maintenance (`POST /api/system-health/maintenance/:operation`)
- ✅ Performance monitoring (`GET /api/admin-system/performance`)

#### **⚙️ System Administration**
- ✅ System overview (`GET /api/admin-system/overview`)
- ✅ System configuration (`GET /api/admin-system/configuration`)
- ✅ Advanced user management (`GET /api/admin-system/users/management`)
- ✅ Verification queue management (`GET /api/admin-system/devices/verification-queue`)
- ✅ Report management (`GET /api/admin-system/reports/management`)
- ✅ System maintenance operations (`POST /api/admin-system/maintenance`)

#### **🏢 LEA Management**
- ✅ Manage LEA agencies (`GET/POST/PUT /api/dashboard-config/lea-agencies`)
- ✅ Assign regions to LEA
- ✅ Monitor LEA performance
- ✅ Configure system settings

#### **📧 Communication & Notifications**
- ✅ Test email system (`POST /api/test-email/send-test`)
- ✅ Check email configuration (`GET /api/test-email/config-test`)
- ✅ Send welcome emails (`POST /api/test-email/welcome-admin`)
- ✅ Manage notification templates

#### **📁 File Management**
- ✅ View file statistics (`GET /api/files/stats`)
- ✅ Cleanup old files (`POST /api/files/cleanup`)
- ✅ Access all uploaded files
- ✅ Manage file permissions

#### **🔧 System Configuration**
- ✅ Dashboard configuration (`GET/PUT /api/dashboard-config/config`)
- ✅ System settings management
- ✅ Notification template management
- ✅ Regional settings configuration

---

## 🔒 **SECURITY & ACCESS CONTROL**

### **Authentication Requirements:**
- 🔐 **JWT Token Required**: All authenticated endpoints require valid JWT
- 🔐 **Role Verification**: Middleware checks user role for each protected route
- 🔐 **Regional Restrictions**: LEA users restricted to their assigned region
- 🔐 **Ownership Validation**: Users can only access their own data

### **Route Protection Levels:**

#### **🌐 Public Routes (No Authentication)**
```
GET  /api/public-check
POST /api/found-device/report
GET  /api/found-device/check
GET  /api/info/status
GET  /api/info/info
GET  /health
```

#### **🔐 Authenticated Routes (Any Logged-in User)**
```
GET  /api/auth/me
POST /api/auth/logout
GET/POST/PUT/DELETE /api/device-management/*
GET/POST /api/report-management/*
GET/POST/PUT/DELETE /api/device-transfer/*
POST /api/files/upload/*
GET  /api/files/view/*
```

#### **👮‍♂️ LEA + Admin Routes**
```
GET/POST/PUT /api/lea-portal/*
GET /api/found-device/reports
```

#### **👨‍💼 Admin Only Routes**
```
GET/POST/PUT /api/admin-portal/*
GET/POST/PUT /api/user-management/*
GET/POST /api/analytics/*
GET/POST /api/system-health/*
GET/POST /api/admin-system/*
GET/POST/PUT /api/dashboard-config/*
POST /api/test-email/*
GET/POST /api/files/stats
GET/POST /api/files/cleanup
```

---

## 📋 **ROLE-BASED WORKFLOW EXAMPLES**

### **👤 Regular User Workflow:**
1. **Register Account** → **Login** → **Register Device** → **Upload Proof** → **Wait for Verification**
2. **If Device Stolen** → **File Report** → **Monitor Case Status** → **Coordinate Recovery**
3. **If Selling Device** → **Initiate Transfer** → **Share OTP** → **Complete Transfer**

### **👮‍♂️ LEA User Workflow:**
1. **Login** → **View Assigned Cases** → **Investigate Reports** → **Update Case Status**
2. **Coordinate Recovery** → **Add Case Notes** → **Mark Case Resolved**
3. **Monitor Regional Statistics** → **Export Case Reports**

### **👨‍💼 Admin Workflow:**
1. **Login** → **View System Overview** → **Check Verification Queue** → **Verify Devices**
2. **Monitor System Health** → **Manage Users** → **Configure LEA Agencies**
3. **Run System Maintenance** → **Analyze System Performance** → **Generate Reports**

---

## 🎯 **PERMISSION MATRIX SUMMARY**

| Feature | Regular User | Business User | LEA User | Admin |
|---------|-------------|---------------|----------|-------|
| **Device Registration** | Own Only | Own Only | View Regional | All Devices |
| **Device Verification** | ❌ | ❌ | ❌ | ✅ |
| **Report Management** | Own Only | Own Only | Regional Cases | All Reports |
| **User Management** | Own Profile | Own Profile | ❌ | All Users |
| **System Analytics** | ❌ | ❌ | Regional Only | System-wide |
| **LEA Portal** | ❌ | ❌ | ✅ | ✅ |
| **Admin Dashboard** | ❌ | ❌ | ❌ | ✅ |
| **System Maintenance** | ❌ | ❌ | ❌ | ✅ |
| **File Management** | Own Files | Own Files | Case Files | All Files |
| **Public Check** | ✅ | ✅ | ✅ | ✅ |
| **Device Transfer** | ✅ | ✅ | ❌ | ✅ |

---

## 🔧 **IMPLEMENTATION DETAILS**

### **Middleware Stack:**
1. **Authentication Check** (`authenticateToken`)
2. **Role Verification** (`requireRole(['admin', 'lea'])`)
3. **Regional Filtering** (for LEA users)
4. **Ownership Validation** (for user data)

### **Database Security:**
- ✅ **Row-level filtering** based on user role and region
- ✅ **Ownership validation** in all user-specific queries
- ✅ **Audit logging** for all administrative actions
- ✅ **IP address tracking** for security monitoring

### **Error Handling:**
- 🔒 **401 Unauthorized**: Missing or invalid token
- 🔒 **403 Forbidden**: Insufficient permissions
- 🔒 **404 Not Found**: Resource doesn't exist or no access
- 🔒 **400 Bad Request**: Invalid parameters or data

---

**The Check It Device Registry implements comprehensive role-based access control ensuring users can only access appropriate data and functionality based on their assigned role and regional assignments.**