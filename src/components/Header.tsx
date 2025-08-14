import React, { useState, useEffect, useRef } from 'react';
import { Package, Settings, Users, User, LogOut, ChevronDown, CreditCard, Home } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { organizationalSettings } = useOrder();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null; // Don't show header for unauthenticated users
  }

  const isSettingsActive = location.pathname === '/settings' || 
                          location.pathname === '/subscription' || 
                          (user.role === 'admin' && location.pathname === '/users');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            {/* Mobile Icon - Only visible on mobile */}
            {organizationalSettings.mobileIconUrl && (
              <img 
                src={organizationalSettings.mobileIconUrl} 
                alt={organizationalSettings.companyName || 'Company Icon'} 
                className="h-8 w-8 object-contain block md:hidden"
                style={{ maxWidth: '32px', maxHeight: '32px' }}
              />
            )}
            
            {/* Desktop Logo - Hidden on mobile if mobile icon exists */}
            {organizationalSettings.logoUrl ? (
              <img 
                src={organizationalSettings.logoUrl} 
                alt={organizationalSettings.companyName || 'Company Logo'} 
                className={`h-8 w-auto object-contain ${organizationalSettings.mobileIconUrl ? 'hidden md:block' : 'block'}`}
                style={{ maxWidth: '192px', maxHeight: '32px' }}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-indigo-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  {organizationalSettings.companyName || user.organization.name || 'CabinetTrack'}
                </h1>
              </div>
            )}
          </Link>
          
          <nav className="flex items-center ml-auto" style={{ gap: '16px' }}>
            <Link
              to="/dashboard"
              className={`inline-flex items-center p-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
            </Link>
            
            {/* Settings Dropdown */}
            <div className="relative" ref={settingsMenuRef}>
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`inline-flex items-center p-2 rounded-md text-sm font-medium transition-colors ${
                  isSettingsActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {showSettingsMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/settings"
                    className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                      location.pathname === '/settings'
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-700'
                    }`}
                    onClick={() => setShowSettingsMenu(false)}
                  >
                    <Settings className="h-4 w-4 mr-2 inline" />
                    General Settings
                  </Link>
                  <Link
                    to="/subscription"
                    className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                      location.pathname === '/subscription'
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-700'
                    }`}
                    onClick={() => setShowSettingsMenu(false)}
                  >
                    <CreditCard className="h-4 w-4 mr-2 inline" />
                    Billing
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/users"
                      className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                        location.pathname === '/users'
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-gray-700'
                      }`}
                      onClick={() => setShowSettingsMenu(false)}
                    >
                      <Users className="h-4 w-4 mr-2 inline" />
                      Users
                    </Link>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md p-2"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-800 font-medium text-sm">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <span className="hidden md:block">{user.firstName} {user.lastName}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                  <div className="text-gray-500">@{user.username}</div>
                  <div className="text-gray-500">{user.organization.name}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
