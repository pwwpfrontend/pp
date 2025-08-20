import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { 
  Package, 
  Settings, 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Crown,
  Building,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  console.log('Dashboard component rendering');
  const { currentRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  console.log('Dashboard currentRole:', currentRole);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Role-specific quick links
  const getQuickLinks = () => {
    const baseLinks = [
      {
        title: 'Products',
        description: 'Browse product catalog',
        icon: Package,
        href: '/products',
        color: 'bg-blue-500'
      },
      {
        title: 'Support',
        description: 'Get help and support',
        icon: MessageSquare,
        href: '/support',
        color: 'bg-green-500'
      }
    ];

    if (currentRole === 'admin') {
      return [
        ...baseLinks,
        {
          title: 'Product Management',
          description: 'Manage products and pricing',
          icon: Settings,
          href: '/admin/products',
          color: 'bg-purple-500'
        },
        {
          title: 'Pricing Configuration',
          description: 'Set discount rates and overrides',
          icon: TrendingUp,
          href: '/admin/pricing',
          color: 'bg-orange-500'
        },
        {
          title: 'User Management',
          description: 'Manage users and roles',
          icon: Users,
          href: '/admin/users',
          color: 'bg-red-500'
        }
      ];
    } else if (currentRole === 'level2' || currentRole === 'level3') {
      return [
        ...baseLinks,
        {
          title: 'Quotes',
          description: 'Create and manage quotes',
          icon: FileText,
          href: '/quotes',
          color: 'bg-indigo-500'
        }
      ];
    }

    return baseLinks;
  };

  // Role display information
  const getRoleInfo = () => {
    const roleInfo = {
      admin: {
        name: 'Administrator',
        description: 'Full system access with product and user management capabilities',
        icon: Crown,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      level1: {
        name: 'Professional Partner',
        description: 'Access to products with professional discount rates',
        icon: Shield,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      level2: {
        name: 'Expert Partner',
        description: 'Access to products and quotes with expert discount rates',
        icon: User,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      level3: {
        name: 'Master Partner',
        description: 'Access to products and quotes with master discount rates',
        icon: Crown,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    };

    return roleInfo[currentRole] || roleInfo.level1;
  };

  const quickLinks = getQuickLinks();
  const roleInfo = getRoleInfo();
  const IconComponent = roleInfo.icon;

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} />
      
      {/* Main content */}
      <main className="pt-16">
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className={`${roleInfo.bgColor} rounded-lg p-6 border border-gray-200`}>
              <div className="flex items-center mb-4">
                <IconComponent className={`w-8 h-8 ${roleInfo.color} mr-3`} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                  <p className="text-gray-600">You're logged in as a {roleInfo.name}</p>
                </div>
              </div>
              <p className="text-gray-700">{roleInfo.description}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => {
                const LinkIcon = link.icon;
                return (
                  <Link
                    key={index}
                    to={link.href}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`${link.color} p-3 rounded-lg mr-4`}>
                        <LinkIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{link.title}</h3>
                        <p className="text-gray-600 text-sm">{link.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Role-specific Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Successfully logged in</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Dashboard accessed</span>
                </div>
                {currentRole === 'admin' && (
                  <>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <span>Admin privileges active</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span>Product management available</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Authentication</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API Connection</span>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Role Access</span>
                  <span className="text-green-600 font-medium">{roleInfo.name}</span>
                </div>
                {currentRole === 'admin' && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Admin Panel</span>
                    <span className="text-green-600 font-medium">Available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <MessageSquare className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-800 mb-3">
                  If you need assistance with the platform or have questions about your partnership, 
                  our support team is here to help.
                </p>
                <Link
                  to="/support"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Contact Support
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
