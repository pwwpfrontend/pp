import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { MessageSquare, DollarSign, Clock, CheckCircle, AlertCircle, XCircle, Plus, Search, Filter, FileText } from 'lucide-react';

const Quotes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock quotes data
  const mockQuotes = [
    {
      id: 1,
      customer: "TechCorp Solutions",
      amount: 12500,
      status: "Approved",
      date: "2024-01-15",
      priority: "High"
    },
    {
      id: 2,
      customer: "Innovate Systems",
      amount: 8750,
      status: "Pending",
      date: "2024-01-14",
      priority: "Medium"
    },
    {
      id: 3,
      customer: "Global Tech",
      amount: 18900,
      status: "In Review",
      date: "2024-01-13",
      priority: "High"
    },
    {
      id: 4,
      customer: "Digital Dynamics",
      amount: 6200,
      status: "Draft",
      date: "2024-01-12",
      priority: "Low"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'In Review':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'Draft':
        return <FileText className="w-4 h-4 text-gray-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Review':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quotes</h1>
          <p className="text-gray-600 mb-8">This is the quotes page with the new Header and Sidebar components.</p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                  <p className="text-2xl font-semibold text-gray-900">156</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">89</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">34</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-semibold text-gray-900">$2.4M</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-[#405952]" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center">
                  <Plus className="w-5 h-5 mr-3 text-[#405952]" />
                  <div>
                    <p className="font-medium text-gray-900">Create Quote</p>
                    <p className="text-sm text-gray-500">Generate new quote</p>
                  </div>
                </div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center">
                  <Search className="w-5 h-5 mr-3 text-[#405952]" />
                  <div>
                    <p className="font-medium text-gray-900">Search Quotes</p>
                    <p className="text-sm text-gray-500">Find specific quotes</p>
                  </div>
                </div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-3 text-[#405952]" />
                  <div>
                    <p className="font-medium text-gray-900">Export Data</p>
                    <p className="text-sm text-gray-500">Download reports</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Quotes Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Quotes</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search quotes..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent text-sm appearance-none">
                      <option>All Status</option>
                      <option>Approved</option>
                      <option>Pending</option>
                      <option>In Review</option>
                      <option>Draft</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{quote.customer}</div>
                        <div className="text-sm text-gray-500">Quote #{quote.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${quote.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1">{quote.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(quote.priority)}`}>
                          {quote.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quote.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-[#405952] hover:text-[#2d3f38] mr-3">View</button>
                        <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Quotes;
