import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Folder, MessageSquare, HelpCircle, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Products', path: '/products', icon: Folder },
    { name: 'Quotes', path: '/quotes', icon: MessageSquare },
    { name: 'Support', path: '/support', icon: HelpCircle },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = () => {
    // Close sidebar when any navigation item is clicked
    if (isOpen) {
      toggleSidebar();
    }
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

        {/* Bottom Section: Account Info + Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#405952] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <div>
                <p className="text-gray-900 font-medium text-sm">Optimus</p>
                <p className="text-gray-500 text-xs">optimus@pwp.com</p>
              </div>
            </div>
            <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
              <LogOut className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
