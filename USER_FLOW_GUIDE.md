# Check It Device Registry - Complete User Flow Guide

## 🎯 **OVERVIEW**

Check It is a Smart Device Registry & Recovery System that helps users protect their devices and recover them if stolen or lost. Here's how different users interact with the system:

---

## 👤 **REGULAR USER FLOW**

### **1. Getting Started (First Time User)**

#### **Step 1: Account Creation**

1. **Visit the Website**: Go to Check It homepage
2. **Click "Register"**: Navigate to registration page
3. **Fill Registration Form**:
   - Full Name (e.g., "John Doe")
   - Email Address (e.g., "john@example.com")
   - Password (minimum 6 characters)
   - Phone Number (optional but recommended)
   - Region/Location (for LEA assignment)
4. **Submit Registration**: Click "Create Account"
5. **Email Verification**: Check email for verification link (sent from noreply@veritas.edu.ng)
6. **Account Activated**: Click verification link to activate account

#### **Step 2: First Login**

1. **Go to Login Page**: Click "Login" on homepage
2. **Enter Credentials**: Email and password
3. **Access Dashboard**: Redirected to personal dashboard

---

### **2. Device Registration Process**

#### **Step 1: Register Your Device**

1. **Navigate to Device Registration**: Click "Register Device" in dashboard
2. **Fill Device Details**:
   - **Device Brand**: Samsung, Apple, Huawei, etc.
   - **Device Model**: Galaxy S21, iPhone 13, etc.
   - **Device Color**: Black, White, Blue, etc.
   - **IMEI Number**: 15-digit number (found in Settings > About Phone)
   - **Serial Number**: Device serial (optional if IMEI provided)
3. **Upload Proof of Ownership**:
   - Purchase receipt/invoice
   - Warranty card
   - Store receipt
   - Any document showing you bought the device
4. **Submit Registration**: Click "Register Device"
5. **Confirmation**: Device added with "Unverified" status

#### **Step 2: Wait for Admin Verification**

1. **Email Notification**: Receive confirmation that device was submitted
2. **Admin Review**: Admin reviews your proof of ownership
3. **Verification Result**:
   - **If Approved**: Email notification + device status becomes "Verified"
   - **If Rejected**: Email with reason + option to resubmit with better proof

---

### **3. Using the Public Check Feature**

#### **As a Buyer (Checking Before Purchase)**

1. **Visit Homepage**: No login required
2. **Enter Device Details**:
   - IMEI number OR Serial number of device you want to buy
3. **Click "Check Device"**
4. **View Results**:
   - **✅ Clean**: Device is registered, no reports - safe to buy
   - **❌ Stolen/Lost**: Device reported stolen - DO NOT BUY
   - **⚠️ Unverified**: Device registered but not verified yet
   - **ℹ️ Not Found**: Device not in system (could be okay)

#### **What Each Status Means**:

- **Clean**: ✅ Safe to purchase
- **Stolen/Lost**: ❌ Never buy - contact police
- **Unverified**: ⚠️ Ask seller for verification status
- **Not Found**: ℹ️ Device not registered (common for older devices)

---

### **4. Reporting Stolen/Lost Device**

#### **When Your Device is Stolen or Lost**

1. **Login to Dashboard**: Access your account
2. **Go to Reports Section**: Click "My Reports" or "Report Incident"
3. **Select Your Device**: Choose from your registered devices
4. **Fill Report Details**:
   - **Report Type**: Stolen or Lost
   - **When it Happened**: Date and time of incident
   - **Where it Happened**: Location details
   - **Description**: What happened (theft, misplaced, etc.)
   - **Evidence**: Upload photos, police report, etc. (optional)
5. **Submit Report**: Click "File Report"

#### **What Happens Next**:

1. **Case ID Generated**: System creates unique case ID (e.g., CASE-2024-123456)
2. **Device Status Updated**: Your device marked as "Stolen" or "Lost"
3. **LEA Notification**: Local law enforcement automatically notified
4. **Email Confirmation**: You receive case details via email
5. **Public Visibility**: Device now shows as stolen/lost in public checks

---

### **5. Device Recovery Process**

#### **If Someone Finds Your Device**

1. **Finder Uses Public Check**: They enter your device IMEI
2. **System Shows "Stolen/Lost"**: With your case ID and instructions
3. **Finder Reports Found Device**: They can report finding it
4. **You Get Notified**: Email/SMS that your device may be found
5. **LEA Coordinates Return**: Police help coordinate safe return
6. **Case Resolved**: Once returned, case marked as resolved

#### **Your Role in Recovery**:

- **Respond Quickly**: Answer calls/emails from LEA
- **Provide Proof**: Show ID and proof of ownership
- **Meet Safely**: Meet finder at police station or safe location
- **Confirm Recovery**: Confirm you got your device back

---

### **6. Device Transfer (Selling Your Device)**

#### **When You Want to Sell Your Device**

1. **Initiate Transfer**: Go to device details, click "Transfer Ownership"
2. **Enter Buyer Details**:
   - Buyer's email address
   - Reason for transfer (optional)
3. **System Generates OTP**: 6-digit code sent to buyer
4. **Share OTP**: Give the code to buyer (valid for 24 hours)
5. **Buyer Accepts**: Buyer logs in and enters OTP to accept
6. **Transfer Complete**: Device ownership transferred to buyer

#### **Security Features**:

- ✅ Both parties must agree
- ✅ OTP expires in 24 hours
- ✅ Email notifications to both parties
- ✅ Can cancel transfer before acceptance
- ✅ Complete audit trail

---

### **7. Dashboard Overview**

#### **What You See in Your Dashboard**:

1. **Device Summary**:
   - Total registered devices
   - Verified vs unverified devices
   - Any stolen/lost devices
2. **My Devices List**:
   - All your registered devices
   - Status of each device
   - Registration dates
3. **My Reports**:
   - Any theft/loss reports you've filed
   - Case IDs and status
   - Report dates
4. **Transfer History**:
   - Devices you've transferred
   - Devices transferred to you
   - Transfer status

---

## 👨‍💼 **ADMIN USER FLOW**

### **1. Admin Dashboard Access**

#### **Getting Admin Access**

1. **Admin Account Creation**: Created by system administrator
2. **Login with Admin Credentials**: Use admin email and password
3. **Access Admin Panel**: Navigate to /admin URL
4. **Admin Dashboard**: See system overview and management tools

---

### **2. Device Verification Process**

#### **Daily Verification Workflow**

1. **Check Verification Queue**: See all unverified devices
2. **Review Each Device**:
   - **Device Details**: Brand, model, IMEI, serial
   - **Owner Information**: Name, email, phone, region
   - **Proof Document**: View uploaded receipt/invoice
3. **Verification Decision**:
   - **Click "Review"**: Opens detailed verification modal
   - **Examine Proof**: Check if receipt shows device details
   - **Verify Details Match**: IMEI/serial matches receipt
   - **Check Authenticity**: Receipt looks genuine
4. **Make Decision**:
   - **✅ Approve**: Click "Approve" if everything checks out
   - **❌ Reject**: Click "Reject" if proof insufficient
   - **Add Notes**: Explain decision for user

#### **Verification Criteria Checklist**:

- ✅ Receipt shows correct IMEI/serial number
- ✅ Purchase date is reasonable (not too old/future)
- ✅ Store/seller appears legitimate
- ✅ Document quality is good (not blurry/tampered)
- ✅ Device details match registration
- ✅ User information seems genuine

---

### **3. System Monitoring**

#### **Dashboard Statistics**

1. **System Overview**:
   - Total registered users
   - Total registered devices
   - Total reports filed
   - Public checks performed
2. **Device Statistics**:
   - Verified vs unverified devices
   - Stolen/lost devices
   - Found devices
   - Pending transfers
3. **Report Statistics**:
   - Open cases
   - Under review cases
   - Resolved cases
   - Cases by region

#### **Daily Monitoring Tasks**:

1. **Check Verification Queue**: Process pending device verifications
2. **Review System Stats**: Monitor system usage and trends
3. **Check Audit Logs**: Review system activity for issues
4. **Monitor Reports**: Ensure LEA assignments are working
5. **User Management**: Handle user issues and role changes

---

### **4. User Management**

#### **Managing User Accounts**

1. **View All Users**: See complete user list
2. **User Details**: View user information and activity
3. **Role Management**:
   - Change user roles (user → business → admin → lea)
   - Activate/deactivate accounts
   - Reset passwords if needed
4. **Regional Assignment**: Assign LEA users to regions

#### **LEA Management**

1. **Create LEA Accounts**: Set up law enforcement users
2. **Regional Assignment**: Assign LEA to specific regions
3. **Agency Management**: Add/edit law enforcement agencies
4. **Contact Information**: Maintain LEA contact details

---

### **5. Report Management**

#### **Overseeing All Reports**

1. **View All Reports**: See system-wide theft/loss reports
2. **Case Assignment**: Ensure proper LEA assignment
3. **Status Monitoring**: Track case progress
4. **Escalation**: Handle cases that need attention
5. **Statistics**: Generate reports on theft trends

#### **LEA Coordination**

1. **Agency Setup**: Add law enforcement agencies
2. **Regional Mapping**: Map agencies to regions
3. **Contact Management**: Maintain LEA contact information
4. **Notification Testing**: Ensure LEA notifications work

---

### **6. System Administration**

#### **Technical Management**

1. **Background Jobs**: Monitor automated processes
2. **Email System**: Test and monitor notifications
3. **File Management**: Monitor uploaded files and storage
4. **Database Health**: Check system performance
5. **Security Monitoring**: Review audit logs for issues

#### **Configuration Management**

1. **System Settings**: Configure system parameters
2. **Email Templates**: Customize notification messages
3. **Regional Settings**: Set up regions and jurisdictions
4. **Integration Settings**: Configure external services

---

### **7. Analytics and Reporting**

#### **Business Intelligence**

1. **Usage Analytics**:
   - User registration trends
   - Device registration patterns
   - Public check frequency
   - Report filing trends
2. **Recovery Statistics**:
   - Recovery success rates
   - Average case resolution time
   - Regional crime patterns
   - Device theft hotspots
3. **System Performance**:
   - API response times
   - Email delivery rates
   - User engagement metrics
   - System uptime statistics

---

## 🚨 **EMERGENCY SCENARIOS**

### **For Users**

#### **Device Stolen - Immediate Actions**

1. **Report to Police**: File official police report first
2. **Login to Check It**: Access your account immediately
3. **File Theft Report**: Create detailed theft report
4. **Share Case ID**: Give case ID to police
5. **Monitor Status**: Check for updates regularly

#### **Found Your Device Listed as Stolen**

1. **Don't Panic**: May be false positive
2. **Contact Support**: Use admin email for help
3. **Provide Proof**: Show purchase receipt and ID
4. **Wait for Resolution**: Admin will investigate

### **For Admins**

#### **Suspicious Activity Detected**

1. **Check Audit Logs**: Review recent system activity
2. **Investigate Reports**: Look for patterns or fraud
3. **Contact Users**: Reach out for clarification
4. **Take Action**: Suspend accounts if necessary
5. **Document Everything**: Keep detailed records

#### **System Issues**

1. **Check Background Jobs**: Ensure automated processes running
2. **Test Email System**: Verify notifications working
3. **Monitor Database**: Check for performance issues
4. **Contact Technical Support**: Escalate if needed

---

## 📞 **SUPPORT AND HELP**

### **For Users**

- **Email Support**: onoyimab@veritas.edu.ng
- **System Status**: Check dashboard for announcements
- **FAQ**: Common questions and answers
- **User Guide**: This document

### **For Admins**

- **Technical Support**: System administrator contact
- **Documentation**: Complete API and system docs
- **Training Materials**: Admin training guides
- **Emergency Contacts**: 24/7 support if available

---

## 🎯 **SUCCESS METRICS**

### **User Success Indicators**

- ✅ Device successfully registered and verified
- ✅ Successful recovery of stolen device
- ✅ Smooth device transfer to new owner
- ✅ Prevented purchase of stolen device

### **Admin Success Indicators**

- ✅ Efficient device verification process
- ✅ Proper LEA case assignment
- ✅ System running smoothly
- ✅ Users getting help when needed

---

**The Check It Device Registry provides a comprehensive solution for device protection, theft prevention, and recovery coordination. Both users and administrators have clear workflows to ensure the system operates effectively and helps protect valuable devices.**
