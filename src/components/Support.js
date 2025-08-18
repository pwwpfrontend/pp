import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { HelpCircle, MessageCircle, FileText, Phone, Mail, Search, Filter, Download, ExternalLink, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';

const Support = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock FAQ data
  const faqData = [
    {
      category: "General",
      questions: [
        {
          question: "How do I reset my password?",
          answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page. You'll receive an email with instructions to create a new password."
        },
        {
          question: "What are the system requirements?",
          answer: "Our platform works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for optimal performance."
        }
      ]
    },
    {
      category: "Products",
      questions: [
        {
          question: "How do I request a product quote?",
          answer: "Navigate to the Products page, select the items you're interested in, and use the 'Request Quote' button. Our team will respond within 24 hours."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards, bank transfers, and purchase orders for qualified customers. Payment terms are typically Net 30."
        }
      ]
    },
    {
      category: "Technical",
      questions: [
        {
          question: "How do I integrate with your API?",
          answer: "Our API documentation is available in the Resources section. You'll need to generate an API key from your account settings first."
        },
        {
          question: "What file formats do you support?",
          answer: "We support PDF, CSV, Excel, and JSON formats for data import/export. File size limits are 10MB for standard uploads."
        }
      ]
    }
  ];

  // Mock support tickets
  const supportTickets = [
    {
      id: "TKT-001",
      subject: "Product pricing inquiry",
      status: "Open",
      priority: "Medium",
      created: "2024-01-15",
      lastUpdated: "2024-01-15"
    },
    {
      id: "TKT-002",
      subject: "API integration issue",
      status: "In Progress",
      priority: "High",
      created: "2024-01-14",
      lastUpdated: "2024-01-15"
    },
    {
      id: "TKT-003",
      subject: "Account access problem",
      status: "Resolved",
      priority: "Low",
      created: "2024-01-13",
      lastUpdated: "2024-01-14"
    }
  ];

  // Mock resources
  const resources = [
    {
      name: "User Manual",
      type: "PDF",
      size: "2.4 MB",
      description: "Complete user guide for all platform features"
    },
    {
      name: "API Documentation",
      type: "PDF",
      size: "1.8 MB",
      description: "Technical documentation for API integration"
    },
    {
      name: "Product Catalog",
      type: "Excel",
      size: "856 KB",
      description: "Complete product listing with specifications"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} />

      <main className="pt-16">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Support</h1>
          <p className="text-gray-600 mb-8">This is the support page with the new Header and Sidebar components.</p>
          
          {/* Quick Contact Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-[#405952]" />
              Quick Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Phone Support</h4>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Email Support</h4>
                <p className="text-sm text-gray-600">support@company.com</p>
                <p className="text-xs text-gray-500">24/7 response</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Live Chat</h4>
                <p className="text-sm text-gray-600">Available now</p>
                <p className="text-xs text-gray-500">Instant help</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'faq'
                      ? 'border-[#405952] text-[#405952]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  FAQ
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'tickets'
                      ? 'border-[#405952] text-[#405952]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Support Tickets
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'resources'
                      ? 'border-[#405952] text-[#405952]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Resources
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'faq' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search FAQ..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  {faqData.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h4 className="font-medium text-gray-900">{category.category}</h4>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {category.questions.map((item, questionIndex) => (
                          <div key={questionIndex} className="px-4 py-4">
                            <h5 className="font-medium text-gray-900 mb-2">{item.question}</h5>
                            <p className="text-gray-600 text-sm">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
                    <button className="bg-[#405952] text-white px-4 py-2 rounded-md hover:bg-[#2d3f38] transition-colors flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      New Ticket
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ticket ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {supportTickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {ticket.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {ticket.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {getStatusIcon(ticket.status)}
                                <span className="ml-1">{ticket.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ticket.created}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-[#405952] hover:text-[#2d3f38] mr-3">View</button>
                              <button className="text-blue-600 hover:text-blue-800 mr-3">Update</button>
                              <button className="text-red-600 hover:text-red-800">Close</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Resources & Downloads</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search resources..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((resource, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {resource.type}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">{resource.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{resource.size}</span>
                          <button className="text-[#405952] hover:text-[#2d3f38] text-sm font-medium flex items-center">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <h4 className="font-medium text-gray-900 mb-2">Need More Help?</h4>
                    <p className="text-gray-600 mb-4">Can't find what you're looking for? Our support team is here to help.</p>
                    <button className="bg-[#405952] text-white px-6 py-2 rounded-md hover:bg-[#2d3f38] transition-colors flex items-center mx-auto">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Support
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;
