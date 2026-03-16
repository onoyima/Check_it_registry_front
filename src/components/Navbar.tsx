import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Shield
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_image_url?: string;
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onMenuClick, sidebarOpen }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount] = useState(0);
  const { theme, toggleTheme } = useTheme();

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav 
      className={`navbar navbar-expand-lg fixed-top shadow-sm navbar-custom ${user ? 'with-sidebar' : ''}`}
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1030
      }}
    >
      <div className="container-fluid px-2 px-sm-3 px-md-4">
        <div className="d-flex justify-content-between align-items-center w-100" style={{ minHeight: '60px', height: '60px' }}>
          {/* Left side */}
          <div className="d-flex align-items-center">
            {/* Mobile menu button - temporarily visible on all screens for testing */}
            {user && (
              <button
                onClick={() => {
                  console.log('Menu button clicked, current sidebarOpen:', sidebarOpen);
                  onMenuClick?.();
                }}
                className="btn btn-link p-2 text-decoration-none"
                style={{ 
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
                title={sidebarOpen ? 'Close Menu' : 'Open Menu'}
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>

          {/* Central Logo & Links for Guests */}
          {!user && (
            <div className="d-none d-lg-flex position-absolute start-50 top-50 translate-middle align-items-center gap-4" style={{ zIndex: 1045 }}>
              <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none text-dark pe-4 border-end">
                <img src="/logo1.png" alt="Check It Logo" style={{ height: '28px', objectFit: 'contain' }} />
                <span className="fw-bold fs-5">Check It</span>
              </Link>
              <div className="d-flex align-items-center gap-4">
                <Link to="/search" className="custom-nav-link text-decoration-none">Verify Device</Link>
                <Link to="/marketplace/browse" className="custom-nav-link text-decoration-none">Marketplace</Link>
                <Link to="/found-device" className="custom-nav-link text-decoration-none">Report Found</Link>
              </div>
            </div>
          )}

          {/* Right side */}
          <div className="d-flex align-items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-link p-2 text-decoration-none"
              style={{ color: 'var(--text-secondary)' }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <div className="position-relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="btn btn-link p-2 position-relative text-decoration-none"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span 
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-white d-flex align-items-center justify-content-center"
                        style={{ 
                          backgroundColor: 'var(--danger-500)',
                          width: '20px',
                          height: '20px',
                          fontSize: '12px'
                        }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications dropdown */}
                  <AnimatePresence>
                    {isNotificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="position-absolute end-0 mt-2 modern-card shadow-lg"
                        style={{ width: '320px', zIndex: 1050 }}
                      >
                        <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
                          <h6 className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h6>
                        </div>
                        <div className="p-5 text-center" style={{ color: 'var(--text-secondary)' }}>
                          <Bell size={48} className="mb-3 opacity-50" />
                          <p className="mb-0">No notifications yet</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile dropdown */}
                <div className="position-relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="d-flex align-items-center gap-2 btn btn-link p-2 text-decoration-none"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {user.profile_image_url ? (
                      <img
                        src={user.profile_image_url}
                        alt={user.name}
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                        style={{ 
                          width: '32px', 
                          height: '32px',
                          background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--primary-600) 100%)',
                          fontSize: '14px'
                        }}
                      >
                        {getUserInitials(user.name)}
                      </div>
                    )}
                    <div className="d-none d-md-block text-start">
                      <p className="mb-0 fw-medium" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                        {user.name}
                      </p>
                      <p className="mb-0 text-capitalize" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {user.role}
                      </p>
                    </div>
                    <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
                  </button>

                  {/* Profile dropdown menu */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="position-absolute end-0 mt-2 modern-card shadow-lg"
                        style={{ width: '256px', zIndex: 1050 }}
                      >
                        <div className="p-4 border-bottom" style={{ borderBottomColor: 'var(--border-color)' }}>
                          <div className="d-flex align-items-center gap-3">
                            {user.profile_image_url ? (
                              <img
                                src={user.profile_image_url}
                                alt={user.name}
                                className="rounded-circle"
                                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                                style={{ 
                                  width: '48px', 
                                  height: '48px',
                                  background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--primary-600) 100%)'
                                }}
                              >
                                {getUserInitials(user.name)}
                              </div>
                            )}
                            <div className="flex-grow-1">
                              <p className="mb-1 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                                {user.name}
                              </p>
                              <p className="mb-1" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                {user.email}
                              </p>
                              <span 
                                className="badge text-capitalize"
                                style={{ 
                                  backgroundColor: 'rgba(14, 165, 233, 0.1)', 
                                  color: 'var(--primary-800)',
                                  fontSize: '12px'
                                }}
                              >
                                {user.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          <Link
                            to="/profile"
                            className="d-flex align-items-center gap-3 px-3 py-2 text-decoration-none rounded-2"
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User size={18} />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="d-flex align-items-center gap-3 px-3 py-2 text-decoration-none rounded-2"
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings size={18} />
                            <span>Settings</span>
                          </Link>
                          <Link
                            to="/help"
                            className="d-flex align-items-center gap-3 px-3 py-2 text-decoration-none rounded-2"
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <HelpCircle size={18} />
                            <span>Help & Support</span>
                          </Link>
                          <Link
                            to="/privacy"
                            className="d-flex align-items-center gap-3 px-3 py-2 text-decoration-none rounded-2"
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Shield size={18} />
                            <span>Privacy & Legal</span>
                          </Link>
                          <hr className="my-2" style={{ borderColor: 'var(--border-color)' }} />
                          <button
                            onClick={() => {
                              onLogout();
                              setIsProfileOpen(false);
                            }}
                            className="w-100 d-flex align-items-center gap-3 px-3 py-2 bg-transparent border-0 rounded-2"
                            style={{ color: 'var(--danger-500)' }}
                          >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Guest user buttons */
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-link text-decoration-none fw-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary rounded-pill px-4 fw-medium text-decoration-none shadow-sm hover-scale flex-shrink-0"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;