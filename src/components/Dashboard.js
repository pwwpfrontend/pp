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
  User,
  Mail,
  Phone,
  Clock,
  HelpCircle
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
      }
      // Removed "Support" from here since we're embedding Contact Info directly
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
        color: 'text-green-600',
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

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-[#405952]" />
              Contact Information
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Email Support</h3>
                  <p className="text-gray-600">support@partnership-portal.com</p>
                  <p className="text-sm text-gray-500">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Phone Support</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-500">Mon-Fri, 9 AM - 6 PM EST</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Business Hours</h3>
                  <p className="text-gray-600">Monday - Friday</p>
                  <p className="text-sm text-gray-500">9:00 AM - 6:00 PM EST</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
