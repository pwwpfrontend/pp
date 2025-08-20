import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, Home, Folder, MessageSquare, HelpCircle, ChevronDown, Settings, Users } from 'lucide-react';
import { logout } from '../services/auth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  console.log('Sidebar rendering with props:', { isOpen, toggleSidebar: !!toggleSidebar });
  const location = useLocation();
  
  // Add a simple test to see if Sidebar is working
  console.log('Sidebar location:', location.pathname);

  const storedEmail = useMemo(() => localStorage.getItem('email') || '', []);
  const storedRole = useMemo(() => localStorage.getItem('role') || '', []);
  const storedName = useMemo(() => localStorage.getItem('name') || '', []);
  
  const getNavigationItems = () => {
    const role = storedRole;
    
    // Admin navigation - no Products or Support
    if (role === 'admin') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Admin Products', path: '/admin/products', icon: Folder },
        { name: 'Admin Pricing', path: '/admin/pricing', icon: Settings },
        { name: 'Admin Users', path: '/admin/users', icon: Users },
        { name: 'Manage Quotes', path: '/admin/quotes', icon: MessageSquare },
      ];
    }

    // User navigation (Level1, Level2, Level3)
    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Products', path: '/products', icon: Folder },
      { name: 'Request Quote', path: '/request-quote', icon: MessageSquare },
      { name: 'Support', path: '/support', icon: HelpCircle },
    ];

    // All user levels (Level1, Level2, Level3) can see quotes
    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => location.pathname === path;

  const handleNavClick = () => {
    // Close sidebar when any navigation item is clicked
    if (isOpen) {
      toggleSidebar();
    }
  };

  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName = useMemo(() => storedName || storedRole || 'Account', [storedName, storedRole]);
  const displayLetter = useMemo(() => (displayName?.[0] || 'A').toUpperCase(), [displayName]);

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen bg-white shadow-lg z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-[300px]
      `}>
        {/* Top Section: Logo + Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <img
              src="/logo192.png"
              alt="Partner Portal Logo"
              className="h-8 w-8"
            />
            <span className="font-bold text-lg text-gray-800">PARTNER PORTAL</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={handleNavClick}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive(item.path) 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section: Account Info + Dropdown */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div>
            <button
              onClick={handleToggleMenu}
              className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#405952] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{displayLetter}</span>
                </div>
                <div className="text-left">
                  <p className="text-gray-900 font-medium text-sm leading-tight">{displayName}</p>
                  <p className="text-gray-500 text-xs leading-tight">{storedEmail || 'user@example.com'}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-700 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-200 ${isMenuOpen ? 'max-h-40 mt-2' : 'max-h-0'}`}>
              <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                <div
                  onClick={handleResetPassword}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Reset Password
                </div>
                <div
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                >
                  Logout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
