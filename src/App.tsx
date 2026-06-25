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
import SellerPayoutSettings from './pages/SellerPayoutSettings'
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
import PaymentCallback from './pages/PaymentCallback'
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
import ForgotPassword from './pages/ForgotPassword'
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
import Cart from './pages/Cart'
import { CartProvider } from './contexts/CartContext'
import './App.css'
import { ToastProvider } from './components/Toast'
import NotFound from './pages/NotFound'
import AdminMarketplaceManagement from './pages/AdminMarketplaceManagement'
import CustomCursor from './components/CustomCursor'
import ProtectedRoute from './components/ProtectedRoute'

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
        <Route path="/marketplace" element={<MarketplaceBrowse />} />
        <Route path="/marketplace/browse" element={<MarketplaceBrowse />} />
        <Route path="/marketplace/listing/:id" element={<MarketplaceListing />} />
        <Route path="/business" element={<ProtectedRoute allowedRoles={['business','admin']}><BusinessDashboard /></ProtectedRoute>} />
        <Route path="/business/my-listings" element={<ProtectedRoute allowedRoles={['business','admin']}><BusinessMyListings /></ProtectedRoute>} />
        <Route path="/marketplace/create-listing" element={user ? <CreateListing /> : <Navigate to="/login" />} />
        <Route path="/device-check" element={<ErrorBoundary><DeviceCheck /></ErrorBoundary>} />
        <Route path="/verification-status" element={user ? <DeviceVerificationStatus /> : <Navigate to="/login" />} />
        <Route path="/device-check-report" element={user ? <DeviceCheckReport /> : <Navigate to="/login" />} />
        <Route path="/register-device" element={user ? <DeviceRegistration /> : <Navigate to="/login" />} />
        <Route path="/report-incident" element={user ? <ReportDeviceIncident /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user ? <ReportsV2 /> : <Navigate to="/login" />} />
          <Route path="/reports-v2" element={user ? <ReportsV2 /> : <Navigate to="/login" />} />
          <Route path="/reports/:caseId" element={user ? <ReportDetails /> : <Navigate to="/login" />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><AdminDashboard /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/alerts" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><AdminAlerts /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/device-management" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><AdminDeviceManagement /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/device-management/category/:categoryKey" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><AdminDeviceManagement /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/devices/:id" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><AdminDeviceDetails /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/lea-management" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><AdminLEAManagement /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/report-management" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><AdminReportManagement /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/report-management/:caseId" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><AdminCaseDetails /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/system-settings" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><AdminSystemSettings /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/transfers" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><AdminTransferHistory /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/lea" element={<ProtectedRoute allowedRoles={['lea','admin']}><LEAPortal /></ProtectedRoute>} />
        <Route path="/lea/alerts" element={<ProtectedRoute allowedRoles={['lea','admin']}><LEAAlerts /></ProtectedRoute>} />
        <Route path="/lea/cases" element={<ProtectedRoute allowedRoles={['lea','admin']}><LEACases /></ProtectedRoute>} />
        <Route path="/lea/cases/:id" element={<ProtectedRoute allowedRoles={['lea','admin']}><LEACaseDetails /></ProtectedRoute>} />
        <Route path="/lea/devices/:id" element={<ProtectedRoute allowedRoles={['lea','admin']}><LEADeviceDetails /></ProtectedRoute>} />
        <Route path="/lea/communication" element={<ProtectedRoute allowedRoles={['lea','admin']}><LEACommunication /></ProtectedRoute>} />
        <Route path="/lea/device-search" element={<ProtectedRoute allowedRoles={['lea','admin']}><LEADeviceSearch /></ProtectedRoute>} />
        <Route path="/lea/recovery" element={<ProtectedRoute allowedRoles={['lea','admin']}><LEARecovery /></ProtectedRoute>} />
        <Route path="/lea/settings" element={<ProtectedRoute allowedRoles={['lea','admin']}><LEASettings /></ProtectedRoute>} />
        <Route path="/lea/transfers" element={<ProtectedRoute allowedRoles={['lea','admin']}><LEATransferHistory /></ProtectedRoute>} />
        <Route path="/transfer" element={user ? <DeviceTransfer /> : <Navigate to="/login" />} />
        <Route path="/found-device" element={<FoundDevice />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/verify-device" element={<VerifyDevice />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/user-management" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
        <Route path="/report-missing" element={user ? <ReportMissing /> : <Navigate to="/login" />} />
        <Route path="/business-register" element={<BusinessRegister />} />
        <Route path="/bulk-register" element={user ? <BulkDeviceRegistration /> : <Navigate to="/login" />} />
        <Route path="/audit-trail" element={<ProtectedRoute allowedRoles={['admin']}><AuditTrail /></ProtectedRoute>} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/marketplace-inbox" element={user ? <MarketplaceInbox /> : <Navigate to="/login" />} />
        <Route path="/marketplace-inbox/:id" element={user ? <MarketplaceThread /> : <Navigate to="/login" />} />
        <Route path="/search" element={<Search />} />
        <Route path="/payments/add-method" element={user ? <PaymentAddMethod /> : <Navigate to="/login" />} />
        <Route path="/payments/method-selection" element={user ? <PaymentMethodSelection /> : <Navigate to="/login" />} />
        <Route path="/payments/confirm" element={user ? <PaymentConfirmation /> : <Navigate to="/login" />} />
        <Route path="/payment/callback" element={user ? <PaymentCallback /> : <Navigate to="/login" />} />
        <Route path="/payments/transactions" element={user ? <TransactionHistory /> : <Navigate to="/login" />} />
        <Route path="/orders" element={user ? <BuyerOrders /> : <Navigate to="/login" />} />
        <Route path="/seller/orders" element={<ProtectedRoute allowedRoles={['business','admin']}><SellerOrders /></ProtectedRoute>} />
        <Route path="/business/payouts" element={<ProtectedRoute allowedRoles={['business','admin']}><BusinessPayouts /></ProtectedRoute>} />
        <Route path="/business/payout-settings" element={<ProtectedRoute allowedRoles={['business','admin']}><SellerPayoutSettings /></ProtectedRoute>} />
        <Route path="/privacy" element={<PrivacyPolicy />} />


        <Route path="/admin/device-categories" element={<ProtectedRoute allowedRoles={['admin']}><AdminDeviceCategories /></ProtectedRoute>} />
        <Route path="/admin/landing-content" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><LandingContentManager /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/marketplace" element={<ProtectedRoute allowedRoles={['admin']}><ErrorBoundary><AdminMarketplaceManagement /></ErrorBoundary></ProtectedRoute>} />
        <Route path="/cart" element={<Cart />} />
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
        <CartProvider>
          <ToastProvider>
            <CustomCursor />
            <AppRoutes />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
