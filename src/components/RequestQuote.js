import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { FileText, Search, Trash2, Send, ShoppingCart, AlertTriangle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { getToken } from '../services/auth';

const RequestQuote = () => {
  const { currentRole, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('quoteCart');
    console.log('Loading cart from localStorage:', savedCart);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Parsed cart items:', parsedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('quoteCart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quoteCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Token refresh function (same as Products.js)
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

  // Enhanced fetch with token refresh (same as Products.js)
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

  // Remove product from quote
  const removeFromQuote = (productId) => {
    setCartItems(prev => prev.filter(p => p.id !== productId));
  };

  // Update product quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromQuote(productId);
    } else {
      setCartItems(prev => prev.map(p => 
        p.id === productId ? { ...p, quantity } : p
      ));
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, product) => {
      return total + (product.netPrice * product.quantity);
    }, 0);
  };

  // Submit quote request
  const handleSubmitQuote = async () => {
    if (cartItems.length === 0) {
      setError('Please add at least one product to your quote.');
      return;
    }

    if (!isAuthenticated) {
      setError('Please login to submit a quote request.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare quote data
      const quoteData = {
        products: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          sku: item.sku,
          brand: item.brand,
          category: item.category,
          msrp: item.msrp,
          netPrice: item.netPrice,
          quantity: item.quantity,
          totalPrice: item.netPrice * item.quantity
        })),
        totalAmount: calculateTotal(),
        status: 'pending',
        userLevel: currentRole,
        requestedAt: new Date().toISOString(),
        additionalNotes: '' // Can be added later if needed
      };

      console.log('Submitting quote:', quoteData);

      // Submit to API
      const response = await fetchWithAuth(
        'http://optimus-india-njs-01.netbird.cloud:3006/quotes',
        {
          method: 'POST',
          body: JSON.stringify(quoteData),
          signal: AbortSignal.timeout(30000) // 30 second timeout
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        console.error('Quote submission failed:', errorText);
        throw new Error(`Failed to submit quote request. Status: ${response.status}. ${errorText || ''}`);
      }

      const result = await response.json();
      console.log('Quote submitted successfully:', result);

      // Clear cart and show success
      setCartItems([]);
      localStorage.removeItem('quoteCart');
      setSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err) {
      console.error('Error submitting quote:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear all items from your quote?')) {
      setCartItems([]);
      localStorage.removeItem('quoteCart');
    }
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
                <h1 className="text-3xl font-bold text-gray-900">Request Quote</h1>
                <p className="text-gray-600">Review your selected products and submit quote request</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Quote request submitted successfully! We will contact you soon.
                  </p>
                </div>
              </div>
            </div>
          )}

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

          <div className="grid grid-cols-1 gap-6">
            {/* Quote Items */}
            <div className="w-full">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Quote Items ({cartItems.length})
                  </h2>
                  {cartItems.length === 0 && (
                    <a
                      href="/products"
                      className="bg-[#405952] text-white px-4 py-2 rounded-lg hover:bg-[#2d3f38] transition-colors text-sm"
                    >
                      Browse Products
                    </a>
                  )}
                  {cartItems.length > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Amount</div>
                        <div className="text-2xl font-bold text-[#405952]">${calculateTotal().toFixed(2)}</div>
                      </div>
                      <button
                        onClick={handleSubmitQuote}
                        disabled={loading}
                        className="bg-[#405952] text-white px-6 py-3 rounded-lg hover:bg-[#2d3f38] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Request Quote
                          </>
                        )}
                      </button>
                      <button 
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-800 flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear Cart
                      </button>
                    </div>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Your quote cart is empty</p>
                    <p className="text-sm text-gray-500 mb-4">Add products from the Products page to create your quote</p>
                    <a
                      href="/products"
                      className="inline-flex items-center px-4 py-2 bg-[#405952] text-white rounded-lg hover:bg-[#2d3f38] transition-colors"
                    >
                      Browse Products
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map(product => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                {product.picture ? (
                                  <img 
                                    src={product.picture} 
                                    alt={product.name}
                                    className="w-10 h-10 object-contain rounded"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="w-10 h-10 flex items-center justify-center text-gray-400"
                                  style={{ display: product.picture ? 'none' : 'flex' }}
                                >
                                  📦
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>SKU: {product.sku}</span>
                                  <span>Brand: {product.brand}</span>
                                  <span>Category: {product.category}</span>
                                </div>
                              </div>
                            </div>
                            {product.description && (
                              <p className="text-gray-600 text-sm mb-2 ml-15">{product.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromQuote(product.id)}
                            className="text-red-600 hover:text-red-800 p-1 ml-4"
                            title="Remove from quote"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Qty:</span>
                              <button
                                onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 text-lg font-bold"
                              >
                                -
                              </button>
                              <span className="text-sm font-medium w-8 text-center">{product.quantity}</span>
                              <button
                                onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 text-lg font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              ${product.netPrice.toFixed(2)} × {product.quantity}
                            </div>
                            <div className="text-lg font-bold text-[#405952]">
                              ${(product.netPrice * product.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Request Quote Section */}
            {cartItems.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <div className="text-center py-8">
                    <div className="mb-6">
                      <div className="text-2xl font-bold text-[#405952] mb-2">
                        Total: ${calculateTotal().toFixed(2)}
                      </div>
                      <p className="text-gray-600">
                        {cartItems.length} {cartItems.length === 1 ? 'product' : 'products'} in quote
                      </p>
                    </div>

                    <button
                      onClick={handleSubmitQuote}
                      disabled={loading}
                      className="w-full bg-[#405952] text-white py-4 rounded-lg hover:bg-[#2d3f38] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-3" />
                          Request Quote
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 mt-4">
                      By submitting this quote request, you agree to be contacted by our sales team.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestQuote;

