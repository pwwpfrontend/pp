import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { FileText, Search, Filter, Clock, Package, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { getToken } from '../services/auth';

const Quotes = () => {
  const { currentRole, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Token refresh function (same as other components)
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('Attempting to refresh token...');
      
      const response = await fetch('http://optimus-india-njs-01.netbird.cloud:3006/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        },
        credentials: 'omit',
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        console.log('Token refreshed successfully');
        return data.accessToken;
      } else {
        throw new Error('No access token in refresh response');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  };

  // Enhanced fetch with token refresh
  const fetchWithAuth = async (url, options = {}) => {
    let token = getToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    const fetchOptions = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options.headers
      },
      credentials: 'omit',
      mode: 'cors'
    };

    try {
      let response = await fetch(url, fetchOptions);
      
      // If token is invalid/expired, try to refresh
      if (response.status === 401) {
        console.log('Access token expired (401), attempting refresh...');
        
        try {
          const newToken = await refreshAccessToken();
          
          // Retry the original request with new token
          fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, fetchOptions);
          
          if (!response.ok) {
            throw new Error(`Request failed after token refresh: ${response.status}`);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          throw new Error('Authentication failed. Please login again.');
        }
      }
      
      // Handle 403 Forbidden specifically
      if (response.status === 403) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        console.error('403 Forbidden response:', errorText);
        
        try {
          const newToken = await refreshAccessToken();
          
          fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, fetchOptions);
          
          if (retryResponse.ok) {
            console.log('403 resolved after token refresh');
            return retryResponse;
          } else {
            throw new Error(`Still forbidden after refresh: ${retryResponse.status}`);
          }
        } catch (refreshError) {
          console.error('Token refresh failed on 403:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          throw new Error(`Access denied (403). Your session may have expired or you may not have permission. Please login again. Server response: ${errorText}`);
        }
      }

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      throw error;
    }
  };

  // Fetch quotes from API
  useEffect(() => {
    const fetchQuotes = async () => {
      if (!isAuthenticated) {
        setError('Please login to view quotes.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching quotes...');

        const response = await fetchWithAuth(
          'http://optimus-india-njs-01.netbird.cloud:3006/quotes',
          {
            method: 'GET',
            signal: AbortSignal.timeout(30000) // 30 second timeout
          }
        );

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unable to read error response');
          console.error('Error response body:', errorText);
          throw new Error(`Failed to fetch quotes. Status: ${response.status}. ${errorText || ''}`);
        }

        const data = await response.json();
        console.log('Quotes fetched successfully:', data);

        // Handle different response formats
        const quotesArray = Array.isArray(data) ? data : (data.quotes || []);
        setQuotes(quotesArray);
        
      } catch (err) {
        console.error('Error fetching quotes:', err);
        setError(err.message);
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [isAuthenticated]);

  // Delete quote
  const handleDeleteQuote = async (quoteId) => {
    try {
      console.log('Deleting quote:', quoteId);

      const response = await fetchWithAuth(
        `http://optimus-india-njs-01.netbird.cloud:3006/quotes/${quoteId}`,
        {
          method: 'DELETE',
          signal: AbortSignal.timeout(30000)
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        throw new Error(`Failed to delete quote. Status: ${response.status}. ${errorText || ''}`);
      }

      // Remove quote from local state
      setQuotes(prev => prev.filter(quote => quote._id !== quoteId && quote.id !== quoteId));
      setShowDeleteDialog(null);
      
      console.log('Quote deleted successfully');
      
    } catch (err) {
      console.error('Error deleting quote:', err);
      setError(err.message);
    }
  };

  // Filter quotes based on search and status
  const filteredQuotes = quotes.filter(quote => {
    if (!quote) return false;
    
    const searchFields = [
      quote.customerInfo?.name || '',
      quote.customerInfo?.company || '',
      quote.customerInfo?.email || '',
      quote._id || quote.id || '',
      ...((quote.products || []).map(p => p.name || ''))
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchTerm === '' || searchFields.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      reviewed: { color: 'bg-blue-100 text-blue-800', label: 'Reviewed' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Calculate total items
  const getTotalItems = (products) => {
    if (!Array.isArray(products)) return 0;
    return products.reduce((total, product) => total + (product.quantity || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <Header toggleSidebar={toggleSidebar} />
        <main className="pt-16">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#405952]"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              <a
                href="/request-quote" 
                className="bg-[#405952] text-white px-6 py-3 rounded-lg hover:bg-[#2d3f38] transition-colors flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                New Quote
              </a>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search quotes by customer, company, or quote ID..."
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
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
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
                  <p className="text-gray-600 mb-2">No quotes found</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {quotes.length === 0 
                      ? "No quotes have been submitted yet" 
                      : "Try adjusting your search or filter criteria"
                    }
                  </p>
                  <a
                    href="/request-quote"
                    className="inline-flex items-center px-4 py-2 bg-[#405952] text-white rounded-lg hover:bg-[#2d3f38] transition-colors"
                  >
                    Create First Quote
                  </a>
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
                    {filteredQuotes.map((quote) => {
                      const quoteId = quote._id || quote.id;
                      const customerName = quote.customerInfo?.name || 'Unknown Customer';
                      const customerCompany = quote.customerInfo?.company || '';
                      const customerEmail = quote.customerInfo?.email || '';
                      
                      return (
                        <tr key={quoteId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {quoteId ? quoteId.slice(-8).toUpperCase() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customerName}</div>
                            {customerCompany && (
                              <div className="text-sm text-gray-500">{customerCompany}</div>
                            )}
                            {customerEmail && (
                              <div className="text-sm text-gray-500">{customerEmail}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(quote.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${(quote.totalAmount || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Package className="w-4 h-4 mr-1" />
                              {getTotalItems(quote.products)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(quote.requestedAt || quote.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => setSelectedQuote(quote)}
                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button 
                                onClick={() => setShowDeleteDialog(quoteId)}
                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quote Detail Modal */}
          {selectedQuote && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-96 overflow-y-auto m-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Quote Details - {(selectedQuote._id || selectedQuote.id || '').slice(-8).toUpperCase()}
                  </h2>
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {selectedQuote.customerInfo?.name || 'N/A'}</div>
                      <div><strong>Company:</strong> {selectedQuote.customerInfo?.company || 'N/A'}</div>
                      <div><strong>Email:</strong> {selectedQuote.customerInfo?.email || 'N/A'}</div>
                      <div><strong>Phone:</strong> {selectedQuote.customerInfo?.phone || 'N/A'}</div>
                      <div><strong>User Level:</strong> {selectedQuote.userLevel || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Quote Summary */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Quote Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Status:</strong> {getStatusBadge(selectedQuote.status)}</div>
                      <div><strong>Total Items:</strong> {getTotalItems(selectedQuote.products)}</div>
                      <div><strong>Total Amount:</strong> ${(selectedQuote.totalAmount || 0).toLocaleString()}</div>
                      <div><strong>Requested:</strong> {formatDate(selectedQuote.requestedAt || selectedQuote.createdAt)}</div>
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Products ({(selectedQuote.products || []).length})</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(selectedQuote.products || []).map((product, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">
                              <div className="font-medium text-gray-900">{product.name || 'N/A'}</div>
                              <div className="text-gray-500">{product.brand || ''} - {product.category || ''}</div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{product.sku || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{product.quantity || 0}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">${(product.netPrice || 0).toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">${(product.totalPrice || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Notes */}
                {selectedQuote.additionalNotes && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Additional Notes</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedQuote.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {showDeleteDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                  <h2 className="text-lg font-bold text-gray-900">Confirm Delete</h2>
                </div>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this quote? This action cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteDialog(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteQuote(showDeleteDialog)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quotes;