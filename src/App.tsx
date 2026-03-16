import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingContentManager from './pages/admin/LandingContentManager'
import DeviceCheck from './pages/DeviceCheck'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import DeviceRegistration from './pages/DeviceRegistration'
import MyDevices from './pages/MyDevices'
import DeviceDetails from './pages/DeviceDetails'
import Notifications from './pages/Notifications'
import MarketplaceInbox from './pages/MarketplaceInbox'
import MarketplaceThread from './pages/MarketplaceThread'
import MarketplaceBrowse from './pages/MarketplaceBrowse'
import MarketplaceListing from './pages/MarketplaceListing'
import BusinessMyListings from './pages/BusinessMyListings'
import CreateListing from './pages/CreateListing'
import BusinessDashboard from './pages/BusinessDashboard'
import BuyerOrders from './pages/BuyerOrders'
import SellerOrders from './pages/SellerOrders'
import BusinessPayouts from './pages/BusinessPayouts'
import AdminDeviceCategories from './pages/AdminDeviceCategories'
import ErrorBoundary from './components/ErrorBoundary'
import AdminDeviceManagement from './pages/AdminDeviceManagement'
import AdminDeviceDetails from './pages/AdminDeviceDetails'
import AdminLEAManagement from './pages/AdminLEAManagement'
import AdminReportManagement from './pages/AdminReportManagement'
import AdminCaseDetails from './pages/AdminCaseDetails'
import AdminSystemSettings from './pages/AdminSystemSettings'
import LEAAlerts from './pages/LEAAlerts'
import LEACases from './pages/LEACases'
import LEACaseDetails from './pages/LEACaseDetails'
import LEACommunication from './pages/LEACommunication'
import LEADeviceSearch from './pages/LEADeviceSearch'
import LEADeviceDetails from './pages/LEADeviceDetails'
import LEARecovery from './pages/LEARecovery'
import LEASettings from './pages/LEASettings'
import PaymentAddMethod from './pages/PaymentAddMethod'
import PaymentMethodSelection from './pages/PaymentMethodSelection'
import PaymentConfirmation from './pages/PaymentConfirmation'
import TransactionHistory from './pages/TransactionHistory'
import Search from './pages/Search'
import DeviceVerificationStatus from './pages/DeviceVerificationStatus'
import DeviceCheckReport from './pages/DeviceCheckReport'
import ReportDeviceIncident from './pages/ReportDeviceIncident'
import AdminDashboard from './pages/AdminDashboard'
import AdminAlerts from './pages/AdminAlerts'
import LEAPortal from './pages/LEAPortal'
import ReportDetails from './pages/ReportDetails'
import ReportsV2 from './pages/ReportsV2'
import DeviceTransfer from './pages/DeviceTransfer'
import FoundDevice from './pages/FoundDevice'
import EmailVerification from './pages/EmailVerification'
import PasswordReset from './pages/PasswordReset'
import VerifyDevice from './pages/VerifyDevice'
import UserManagement from './pages/UserManagement'
import Analytics from './pages/Analytics'
import ReportMissing from './pages/ReportMissing'
import BusinessRegister from './pages/BusinessRegister'
import BulkDeviceRegistration from './pages/BulkDeviceRegistration'
import AuditTrail from './pages/AuditTrail'
import AdminTransferHistory from './pages/AdminTransferHistory'
import LEATransferHistory from './pages/LEATransferHistory'
import Profile from './pages/Profile'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Settings from './pages/Settings'
import Checkout from './pages/Checkout'
import './App.css'
import { ToastProvider } from './components/Toast'
import NotFound from './pages/NotFound'
import AdminMarketplaceManagement from './pages/AdminMarketplaceManagement'

interface AppProps {}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ color: 'var(--primary-600)' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/my-devices" element={user ? <MyDevices /> : <Navigate to="/login" />} />
        <Route path="/device/:id" element={user ? <DeviceDetails /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
        <Route path="/marketplace" element={user ? <MarketplaceInbox /> : <Navigate to="/login" />} />
        <Route path="/marketplace/browse" element={<MarketplaceBrowse />} />
        <Route path="/marketplace/listing/:id" element={user ? <MarketplaceListing /> : <Navigate to="/login" />} />
        <Route path="/business" element={user ? <BusinessDashboard /> : <Navigate to="/login" />} />
        <Route path="/business/my-listings" element={user ? <BusinessMyListings /> : <Navigate to="/login" />} />
        <Route path="/marketplace/create-listing" element={user ? <CreateListing /> : <Navigate to="/login" />} />
        <Route path="/device-check" element={user ? <ErrorBoundary><DeviceCheck /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/verification-status" element={user ? <DeviceVerificationStatus /> : <Navigate to="/login" />} />
        <Route path="/device-check-report" element={user ? <DeviceCheckReport /> : <Navigate to="/login" />} />
        <Route path="/register-device" element={user ? <DeviceRegistration /> : <Navigate to="/login" />} />
        <Route path="/report-incident" element={user ? <ReportDeviceIncident /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user ? <ReportsV2 /> : <Navigate to="/login" />} />
          <Route path="/reports-v2" element={user ? <ReportsV2 /> : <Navigate to="/login" />} />
          <Route path="/reports/:caseId" element={user ? <ReportDetails /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user ? <ErrorBoundary><AdminDashboard /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/admin/alerts" element={user ? <ErrorBoundary><AdminAlerts /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/admin/device-management" element={user ? <ErrorBoundary><AdminDeviceManagement /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/admin/device-management/category/:categoryKey" element={user ? <ErrorBoundary><AdminDeviceManagement /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/admin/devices/:id" element={user ? <ErrorBoundary><AdminDeviceDetails /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/admin/lea-management" element={user ? <ErrorBoundary><AdminLEAManagement /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/admin/report-management" element={user ? <ErrorBoundary><AdminReportManagement /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/admin/report-management/:caseId" element={user ? <ErrorBoundary><AdminCaseDetails /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/admin/system-settings" element={user ? <ErrorBoundary><AdminSystemSettings /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/admin/transfers" element={user ? <ErrorBoundary><AdminTransferHistory /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/lea" element={user ? <LEAPortal /> : <Navigate to="/login" />} />
        <Route path="/lea/alerts" element={user ? <LEAAlerts /> : <Navigate to="/login" />} />
        <Route path="/lea/cases" element={user ? <LEACases /> : <Navigate to="/login" />} />
        <Route path="/lea/cases/:id" element={user ? <LEACaseDetails /> : <Navigate to="/login" />} />
        <Route path="/lea/devices/:id" element={user ? <LEADeviceDetails /> : <Navigate to="/login" />} />
        <Route path="/lea/communication" element={user ? <LEACommunication /> : <Navigate to="/login" />} />
        <Route path="/lea/device-search" element={user ? <LEADeviceSearch /> : <Navigate to="/login" />} />
        <Route path="/lea/recovery" element={user ? <LEARecovery /> : <Navigate to="/login" />} />
        <Route path="/lea/settings" element={user ? <LEASettings /> : <Navigate to="/login" />} />
        <Route path="/lea/transfers" element={user ? <LEATransferHistory /> : <Navigate to="/login" />} />
        <Route path="/transfer" element={user ? <DeviceTransfer /> : <Navigate to="/login" />} />
        <Route path="/found-device" element={user ? <FoundDevice /> : <Navigate to="/login" />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/verify-device" element={<VerifyDevice />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/user-management" element={user ? <UserManagement /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/login" />} />
        <Route path="/report-missing" element={user ? <ReportMissing /> : <Navigate to="/login" />} />
        <Route path="/business-register" element={<BusinessRegister />} />
        <Route path="/bulk-register" element={user ? <BulkDeviceRegistration /> : <Navigate to="/login" />} />
        <Route path="/audit-trail" element={user ? <AuditTrail /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/marketplace-inbox" element={user ? <MarketplaceInbox /> : <Navigate to="/login" />} />
        <Route path="/marketplace-inbox/:id" element={user ? <MarketplaceThread /> : <Navigate to="/login" />} />
        <Route path="/search" element={user ? <Search /> : <Navigate to="/login" />} />
        <Route path="/payments/add-method" element={user ? <PaymentAddMethod /> : <Navigate to="/login" />} />
        <Route path="/payments/method-selection" element={user ? <PaymentMethodSelection /> : <Navigate to="/login" />} />
        <Route path="/payments/confirm" element={user ? <PaymentConfirmation /> : <Navigate to="/login" />} />
        <Route path="/payments/transactions" element={user ? <TransactionHistory /> : <Navigate to="/login" />} />
        <Route path="/orders" element={user ? <BuyerOrders /> : <Navigate to="/login" />} />
        <Route path="/seller/orders" element={user ? <SellerOrders /> : <Navigate to="/login" />} />
        <Route path="/business/payouts" element={user ? <BusinessPayouts /> : <Navigate to="/login" />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />


        <Route path="/admin/device-categories" element={user ? <AdminDeviceCategories /> : <Navigate to="/login" />} />
        <Route path="/admin/landing-content" element={user ? <ErrorBoundary><LandingContentManager /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/admin/marketplace" element={user ? <ErrorBoundary><AdminMarketplaceManagement /></ErrorBoundary> : <Navigate to="/login" />} />
        <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" />} />
        {/* Catch-all route: send all unknown links to NotFound with back to dashboard */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

function App({}: AppProps = {}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
