import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { FileText, Plus, Search, Filter, Clock, DollarSign, Package, User } from 'lucide-react';

const Quotes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock quotes data - replace with actual API call
  const mockQuotes = [
    {
      id: 'QT-001',
      customer: 'TechCorp Solutions',
      contact: 'John Smith',
      email: 'john@techcorp.com',
      status: 'draft',
      total: 12500.00,
      items: 3,
      created: '2024-01-20',
      lastUpdated: '2024-01-20'
    },
    {
      id: 'QT-002',
      customer: 'Innovation Labs',
      contact: 'Sarah Johnson',
      email: 'sarah@innovationlabs.com',
      status: 'sent',
      total: 8750.00,
      items: 2,
      created: '2024-01-18',
      lastUpdated: '2024-01-19'
    },
    {
      id: 'QT-003',
      customer: 'Global Systems',
      contact: 'Mike Chen',
      email: 'mike@globalsystems.com',
      status: 'approved',
      total: 18900.00,
      items: 5,
      created: '2024-01-15',
      lastUpdated: '2024-01-17'
    }
  ];

  // Filter quotes based on search and status
  const filteredQuotes = mockQuotes.filter(quote => {
    const matchesSearch = 
      quote.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <main className="pt-16">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
                <p className="text-gray-600">Manage customer quotes and proposals</p>
              </div>
              <button className="bg-[#405952] text-white px-6 py-3 rounded-lg hover:bg-[#2d3f38] transition-colors flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                New Quote
              </button>
              </div>
            </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search quotes by customer, contact, or quote ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                  />
            </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Quotes Table */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Quotes ({filteredQuotes.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              {filteredQuotes.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No quotes found matching your criteria</p>
                </div>
              ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quote ID
                      </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
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
                    {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quote.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{quote.customer}</div>
                          <div className="text-sm text-gray-500">{quote.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{quote.contact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(quote.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${quote.total.toLocaleString()}
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Package className="w-4 h-4 mr-1" />
                            {quote.items}
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {quote.created}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">View</button>
                            <button className="text-green-600 hover:text-green-900">Edit</button>
                            <button className="text-purple-600 hover:text-purple-900">Send</button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>

          {/* Phase 2 Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Phase 2 - Coming Soon</h3>
                <p className="text-blue-800 mb-3">
                  This is a placeholder for the full quotes functionality. In Phase 2, you'll be able to:
                </p>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Create detailed quotes with multiple products</li>
                  <li>• Apply custom pricing and discounts</li>
                  <li>• Generate professional PDF proposals</li>
                  <li>• Track quote status and customer responses</li>
                  <li>• Convert quotes to orders</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Quotes;
