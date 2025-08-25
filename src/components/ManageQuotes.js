import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { FileText, Search, Filter, Clock, DollarSign, Package, User, Eye, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

const ManageQuotes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock quotes data - replace with actual API call
  const mockQuotes = [
    {
      id: 'QT-001',
      customer: {
        name: 'John Smith',
        email: 'john@techcorp.com',
        company: 'TechCorp Solutions',
        phone: '+1 (555) 123-4567'
      },
      status: 'pending',
      total: 12500.00,
      items: 3,
      created: '2024-01-20T10:30:00Z',
      lastUpdated: '2024-01-20T10:30:00Z',
      requirements: 'Need delivery within 2 weeks',
      products: [
        { id: 'PROD-001', name: 'Cisco Router 2900', price: 2500.00, quantity: 2 },
        { id: 'PROD-002', name: 'HP ProLiant Server', price: 4500.00, quantity: 1 },
        { id: 'PROD-003', name: 'Dell OptiPlex Desktop', price: 1200.00, quantity: 3 }
      ]
    },
    {
      id: 'QT-002',
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah@innovationlabs.com',
        company: 'Innovation Labs',
        phone: '+1 (555) 987-6543'
      },
      status: 'approved',
      total: 8750.00,
      items: 2,
      created: '2024-01-18T14:20:00Z',
      lastUpdated: '2024-01-19T09:15:00Z',
      requirements: 'Bulk order for new office setup',
      products: [
        { id: 'PROD-003', name: 'Dell OptiPlex Desktop', price: 1200.00, quantity: 5 },
        { id: 'PROD-005', name: 'Samsung Monitor 27"', price: 350.00, quantity: 5 }
      ]
    },
    {
      id: 'QT-003',
      customer: {
        name: 'Mike Chen',
        email: 'mike@globalsystems.com',
        company: 'Global Systems',
        phone: '+1 (555) 456-7890'
      },
      status: 'rejected',
      total: 18900.00,
      items: 5,
      created: '2024-01-15T11:45:00Z',
      lastUpdated: '2024-01-17T16:30:00Z',
      requirements: 'Enterprise solution with support',
      products: [
        { id: 'PROD-001', name: 'Cisco Router 2900', price: 2500.00, quantity: 3 },
        { id: 'PROD-002', name: 'HP ProLiant Server', price: 4500.00, quantity: 2 },
        { id: 'PROD-004', name: 'Microsoft Office 365', price: 15.00, quantity: 50 }
      ]
    },
    {
      id: 'QT-004',
      customer: {
        name: 'Emily Davis',
        email: 'emily@startupco.com',
        company: 'StartupCo',
        phone: '+1 (555) 321-6547'
      },
      status: 'pending',
      total: 3200.00,
      items: 2,
      created: '2024-01-21T08:15:00Z',
      lastUpdated: '2024-01-21T08:15:00Z',
      requirements: 'Budget-friendly options for startup',
      products: [
        { id: 'PROD-003', name: 'Dell OptiPlex Desktop', price: 1200.00, quantity: 2 },
        { id: 'PROD-005', name: 'Samsung Monitor 27"', price: 350.00, quantity: 2 }
      ]
    }
  ];

  // Filter quotes based on search and status
  const filteredQuotes = mockQuotes.filter(quote => {
    const matchesSearch = 
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle quote actions
  const handleApproveQuote = (quoteId) => {
    if (window.confirm('Are you sure you want to approve this quote?')) {
      // TODO: Implement API call to approve quote
      console.log('Approving quote:', quoteId);
      alert('Quote approved successfully!');
    }
  };

  const handleRejectQuote = (quoteId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      // TODO: Implement API call to reject quote
      console.log('Rejecting quote:', quoteId, 'Reason:', reason);
      alert('Quote rejected successfully!');
    }
  };

  const handleViewDetails = (quote) => {
    setSelectedQuote(quote);
    setShowQuoteDetails(true);
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Quotes</h1>
            <p className="text-gray-600">Review and manage customer quote requests</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by customer name, company, email, or quote ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quotes List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
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
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-[#405952] mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{quote.id}</div>
                            <div className="text-sm text-gray-500">{quote.items} items</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{quote.customer.name}</div>
                          <div className="text-sm text-gray-500">{quote.customer.company}</div>
                          <div className="text-sm text-gray-500">{quote.customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(quote.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${quote.total.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(quote.created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(quote)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          {quote.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveQuote(quote.id)}
                                className="text-green-600 hover:text-green-900 flex items-center"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectQuote(quote.id)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quote Details Modal */}
          {showQuoteDetails && selectedQuote && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Quote Details - {selectedQuote.id}</h2>
                    <button
                      onClick={() => setShowQuoteDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {selectedQuote.customer.name}</p>
                        <p><span className="font-medium">Company:</span> {selectedQuote.customer.company}</p>
                        <p><span className="font-medium">Email:</span> {selectedQuote.customer.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedQuote.customer.phone}</p>
                      </div>
                    </div>

                    {/* Quote Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Status:</span> {getStatusBadge(selectedQuote.status)}</p>
                        <p><span className="font-medium">Total:</span> ${selectedQuote.total.toFixed(2)}</p>
                        <p><span className="font-medium">Items:</span> {selectedQuote.items}</p>
                        <p><span className="font-medium">Created:</span> {formatDate(selectedQuote.created)}</p>
                        <p><span className="font-medium">Updated:</span> {formatDate(selectedQuote.lastUpdated)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  {selectedQuote.requirements && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedQuote.requirements}</p>
                    </div>
                  )}

                  {/* Products */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
                    <div className="space-y-3">
                      {selectedQuote.products.map((product) => (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-500">SKU: {product.id}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">${product.price.toFixed(2)} × {product.quantity}</p>
                              <p className="text-sm text-gray-500">${(product.price * product.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedQuote.status === 'pending' && (
                    <div className="flex space-x-4 mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => handleApproveQuote(selectedQuote.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Quote
                      </button>
                      <button
                        onClick={() => handleRejectQuote(selectedQuote.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Quote
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageQuotes;


