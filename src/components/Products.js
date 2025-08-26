import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { 
  Package, 
  Search, 
  Filter, 
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  X,
  ShoppingCart
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { getToken } from '../services/auth';

const Products = () => {
  const { currentRole, isAuthenticated, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const itemsPerPage = 10;

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
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('Saving cart to localStorage:', cartItems);
    localStorage.setItem('quoteCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Token refresh function
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

  // Corrected role mapping: level1 → expert, level2 → professional, level3 → beginner
  const getRoleMapping = (userRole) => {
    const roleMapping = {
      'level1': 'expert',
      'level2': 'professional', 
      'level3': 'beginner'
    };
    return roleMapping[userRole] || userRole;
  };

  // Partner-specific discount rates
  const getDiscountRate = (userRole) => {
    const actualLevel = getRoleMapping(userRole);
    
    const discountRates = {
      'beginner': 0.10,      // Professional = 10%
      'professional': 0.20,  // Expert = 20%
      'expert': 0.30         // Master = 30%
    };

    return discountRates[actualLevel] || 0.10;
  };

  // Calculate net price with discount
  const calculateNetPrice = (msrp, userRole) => {
    const discountRate = getDiscountRate(userRole);
    return msrp * (1 - discountRate);
  };

  // Extract brand from various data fields - with null safety
  const extractBrand = (product) => {
    if (!product) return 'Other';
    
    if (product.extraFields?.brand) {
      return product.extraFields.brand;
    }
    
    if (product.extraFields?.extraFields?.brand) {
      return product.extraFields.extraFields.brand;
    }
    
    if (product.brand) {
      return product.brand;
    }
    
    const productName = (product.name || product.product_name || '').toLowerCase();
    if (productName.includes('humly')) return 'Humly';
    if (productName.includes('milesight')) return 'Milesight';
    if (productName.includes('supernet')) return 'SuperNet';
    if (productName.includes('acmecorp')) return 'AcmeCorp';
    
    return 'Other';
  };

  // Handle product selection
  const handleProductClick = (product, event) => {
    if (event.target.closest('button')) {
      return;
    }
    
    setSelectedProduct(selectedProduct?.id === product.id ? null : product);
    
    if (selectedProduct?.id !== product.id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle download
  const handleDownload = (product) => {
    const productData = `
Product Details
==============
Name: ${product.name}
SKU: ${product.sku}
Brand: ${product.brand}
Category: ${product.category}
MSRP: $${product.msrp.toFixed(2)}
Your Price: $${product.netPrice.toFixed(2)}
Discount: ${product.discount.toFixed(0)}%
Description: ${product.description}

Additional Information:
${Object.entries(product.extraFields).map(([key, value]) => `${key}: ${value}`).join('\n')}
    `;

    const blob = new Blob([productData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_datasheet.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Fixed: Handle add to cart for quotes
  const handleAddToCart = (product) => {
    console.log('Adding product to cart:', product);
    
    // Create a clean product object for the cart
    const cartProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      category: product.category,
      msrp: product.msrp,
      netPrice: product.netPrice,
      discount: product.discount,
      description: product.description,
      picture: product.picture,
      extraFields: product.extraFields,
      quantity: 1
    };

    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Update quantity if item already exists
      const updatedCart = cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      console.log('Updated cart with increased quantity:', updatedCart);
      setCartItems(updatedCart);
    } else {
      // Add new item to cart
      const newCart = [...cartItems, cartProduct];
      console.log('Added new item to cart:', newCart);
      setCartItems(newCart);
    }
    
    // Show success message
    alert(`${product.name} added to quote cart!`);
  };

  // Get cart items count
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Fetch products from API with enhanced error handling and token refresh
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!isAuthenticated) {
          throw new Error('Please login to view products.');
        }

        console.log('Current role:', currentRole);
        console.log('Is authenticated:', isAuthenticated);

        const token = getToken();
        console.log('Token exists:', !!token);

        console.log('Fetching products...');

        const response = await fetchWithAuth(
          'http://optimus-india-njs-01.netbird.cloud:3006/products',
          {
            method: 'GET',
            signal: AbortSignal.timeout(30000)
          }
        );

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unable to read error response');
          console.error('Error response body:', errorText);
          
          if (response.status === 403) {
            throw new Error(`Access denied. Server response: ${errorText || 'You do not have permission to view products.'}`);
          } else if (response.status === 404) {
            throw new Error('Products API endpoint not found. Please contact support.');
          } else if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment and try again.');
          } else if (response.status >= 500) {
            throw new Error(`Server error (${response.status}). Please try again later or contact support.`);
          } else {
            throw new Error(`Failed to fetch products. Status: ${response.status}. ${errorText || ''}`);
          }
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Invalid response format. Expected JSON, got: ${contentType}`);
        }

        const data = await response.json();
        console.log('Products fetched successfully:', {
          role: data.role,
          productsCount: data.products?.length || 0,
          firstProduct: data.products?.[0]?.product_name || data.products?.[0]?.name || 'N/A',
          sampleProduct: data.products?.[0]
        });

        if (!data || !Array.isArray(data.products)) {
          console.error('Invalid response structure:', data);
          throw new Error('Invalid response format from server. Expected products array.');
        }

        if (data.products.length === 0) {
          console.log('No products found in response');
          setProducts([]);
          setError(null);
          return;
        }
        
        // Process products to flatten models into individual products
        const processedProducts = [];
        
        data.products.forEach(product => {
          if (!product) return;
          
          const brand = extractBrand(product);
          const discountRate = getDiscountRate(currentRole);
          const productName = product.name || product.product_name || 'Unnamed Product';
          
          if (product.models && product.models.length > 0) {
            product.models.forEach((model, index) => {
              if (!model) return;
              
              const modelPrice = model.msrp || model.price || product.msrp || product.price || 0;
              const modelName = model.name || `Model ${index + 1}`;
              
              processedProducts.push({
                id: `${product._id || product.id || `product-${index}`}-model-${index}`,
                parentId: product._id || product.id,
                name: `${productName} - ${modelName}`,
                description: model.description || product.description || '',
                sku: model.sku || product.sku || `${product._id || 'unknown'}-${index}`,
                brand: brand,
                category: product.category || 'Uncategorized',
                msrp: modelPrice,
                netPrice: calculateNetPrice(modelPrice, currentRole),
                discount: discountRate * 100,
                features: product.features || [],
                picture: model.picture || product.picture || product.product_image || '',
                duration: model.duration || '',
                isModel: true,
                modelName: modelName,
                parentProduct: product,
                parentDescription: product.description || '',
                extraFields: { ...product.extraFields, ...model.extraFields }
              });
            });
          } else {
            const productPrice = product.msrp || product.price || 0;
            processedProducts.push({
              id: product._id || product.id || `product-${Math.random()}`,
              parentId: null,
              name: productName,
              description: product.description || '',
              sku: product.sku || product['sku/model'] || product._id || 'unknown',
              brand: brand,
              category: product.category || 'Uncategorized',
              msrp: productPrice,
              netPrice: calculateNetPrice(productPrice, currentRole),
              discount: discountRate * 100,
              features: product.features || [],
              picture: product.picture || product.product_image || '',
              duration: '',
              isModel: false,
              parentProduct: null,
              extraFields: product.extraFields || {}
            });
          }
        });

        setProducts(processedProducts);
        setError(null);
        console.log('Processed products count:', processedProducts.length);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isAuthenticated && currentRole) {
      console.log('Starting product fetch...');
      fetchProducts();
    } else if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated');
      setError('Please login to view products.');
      setLoading(false);
    } else {
      console.log('Waiting for auth...', { authLoading, isAuthenticated, currentRole });
    }
  }, [currentRole, isAuthenticated, authLoading]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleExpanded = (productId) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Filter and search products - with null safety
  const filteredProducts = React.useMemo(() => {
    let filtered = products.filter(product => {
      const productName = (product.name || '').toLowerCase();
      const productDescription = (product.description || '').toLowerCase();
      const productBrand = (product.brand || '').toLowerCase();
      const productSku = (product.sku || '').toLowerCase();
      const searchTermLower = (searchTerm || '').toLowerCase();
      
      const matchesSearch = 
        productName.includes(searchTermLower) ||
        productDescription.includes(searchTermLower) ||
        productBrand.includes(searchTermLower) ||
        productSku.includes(searchTermLower);
      
      const matchesCategory = categoryFilter === 'all' || 
        (product.category || '').toLowerCase() === categoryFilter.toLowerCase();
      
      const matchesBrand = brandFilter === 'all' || 
        (product.brand || '').toLowerCase() === brandFilter.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesBrand;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price':
          return (a.msrp || 0) - (b.msrp || 0);
        case 'brand':
          return (a.brand || '').localeCompare(b.brand || '');
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'sku':
          return (a.sku || '').localeCompare(b.sku || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, brandFilter, sortBy]);

  // Get unique categories and brands for filters
  const categories = React.useMemo(() => {
    const cats = [...new Set(products.map(p => p.category || 'Uncategorized').filter(Boolean))];
    return ['all', ...cats];
  }, [products]);

  const brands = React.useMemo(() => {
    const brandList = [...new Set(products.map(p => p.brand || 'Other').filter(Boolean))];
    return ['all', ...brandList];
  }, [products]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Get role display name
  const getRoleDisplayName = (role) => {
    const actualLevel = getRoleMapping(role);
    const displayNames = {
      'beginner': 'Professional',
      'professional': 'Expert', 
      'expert': 'Master'
    };
    return displayNames[actualLevel] || actualLevel;
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <Header toggleSidebar={toggleSidebar} />
        <main className="pt-16">
          <div className="p-6">
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
              <p className="text-gray-600 mb-4 max-w-2xl mx-auto">{error}</p>
              <div className="space-x-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-[#405952] text-white rounded-lg hover:bg-[#2d3f38]"
                >
                  Retry
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                  }} 
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Re-login
                </button>
              </div>
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

      <main className="pt-16">
        {/* Page Header */}
        <div className="bg-gray-100 p-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <div className="mt-2 text-sm text-[#405952]">
                Your Level: <span className="font-semibold">{getRoleDisplayName(currentRole)}</span> 
                <span className="ml-2 text-gray-500">({getDiscountRate(currentRole) * 100}% discount)</span>
              </div>
            </div>
            
            {/* Quote Cart Button */}
            {getCartItemsCount() > 0 && (
              <div className="relative">
                <a
                  href="/request-quote"
                  className="bg-[#405952] text-white px-4 py-2 rounded-lg hover:bg-[#2d3f38] transition-colors flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Quote Cart
                  <span className="bg-white text-[#405952] rounded-full px-2 py-1 text-xs font-bold">
                    {getCartItemsCount()}
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="sticky top-16 z-30 bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto p-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Side - Product Image */}
                <div className="col-span-12 lg:col-span-3">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedProduct.name}</h2>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    {selectedProduct.picture ? (
                      <img 
                        src={selectedProduct.picture} 
                        alt={selectedProduct.name}
                        className="w-full h-32 object-contain mx-auto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-32 flex items-center justify-center"
                      style={{ display: selectedProduct.picture ? 'none' : 'flex' }}
                    >
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Center - Product Details */}
                <div className="col-span-12 lg:col-span-6">
                  <div className="mb-3 text-sm text-gray-600 space-y-1">
                    <div>SKU: <span className="text-gray-900 font-medium">{selectedProduct.sku}</span></div>
                    <div>Category: <span className="text-gray-900 font-medium">{selectedProduct.category}</span> | Brand: <span className="text-gray-900 font-medium">{selectedProduct.brand}</span></div>
                  </div>

                  {selectedProduct.description && (
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold mb-1">Description</h3>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{selectedProduct.description}</p>
                    </div>
                  )}

                  {Object.keys(selectedProduct.extraFields).length > 0 && (
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold mb-2">Additional Information</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {Object.entries(selectedProduct.extraFields).map(([key, value]) => {
                          if (key === 'brand' || !value || key === 'extraFields') return null;
                          
                          return (
                            <div key={key} className="flex">
                              <span className="font-medium text-gray-700 w-2/5 capitalize text-xs">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="text-gray-600 w-3/5 text-xs">
                                {typeof value === 'boolean' ? 
                                  (value ? 'Yes' : 'No') : 
                                  String(value)
                                }
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Pricing and Actions */}
                <div className="col-span-12 lg:col-span-3">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="text-sm font-semibold mb-3">Pricing Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">MSRP:</span>
                        <span className="font-semibold">${selectedProduct.msrp.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-semibold text-green-600">{selectedProduct.discount.toFixed(0)}%</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="text-sm text-gray-600">Your Price:</span>
                        <span className="text-lg font-bold text-[#405952]">${selectedProduct.netPrice.toFixed(2)}</span>
                      </div>
                      <div className="text-center text-xs text-gray-500">
                        You save: ${(selectedProduct.msrp - selectedProduct.netPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#405952] text-white rounded text-sm hover:bg-[#2d3f38] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Quote
                    </button>
                    <button
                      onClick={() => handleDownload(selectedProduct)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Datasheet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 pt-3">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="relative">
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand === 'all' ? 'All Brands' : brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="brand">Sort by Brand</option>
                  <option value="category">Sort by Category</option>
                  <option value="sku">Sort by SKU</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MSRP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Your Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProducts.map((product) => {
                    const isExpanded = expandedProducts.has(product.id);
                    const isSelected = selectedProduct?.id === product.id;
                    const isInCart = cartItems.some(item => item.id === product.id);
                    
                    return (
                      <React.Fragment key={product.id}>
                        <tr 
                          className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                          onClick={(e) => handleProductClick(product, e)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {product.picture ? (
                                  <img 
                                    className="h-10 w-10 rounded-lg object-cover" 
                                    src={product.picture} 
                                    alt={product.name}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center"
                                  style={{ display: product.picture ? 'none' : 'flex' }}
                                >
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  {product.name}
                                  {product.isModel && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Model
                                    </span>
                                  )}
                                  {isInCart && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      In Quote
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.description.length > 50 
                                    ? `${product.description.substring(0, 50)}...`
                                    : product.description
                                  }
                                </div>
                                {product.duration && (
                                  <div className="text-xs text-gray-400">
                                    Duration: {product.duration}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {product.brand}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${product.msrp.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {product.discount.toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#405952]">
                            ${product.netPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors ${
                                  isInCart 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-[#405952] hover:bg-[#2d3f38] text-white'
                                }`}
                                title={isInCart ? 'Add More' : 'Add to Quote'}
                              >
                                <Plus className="w-3 h-3" />
                                {isInCart ? 'Add More' : 'Add'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredProducts.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-[#405952] border-[#405952] text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Products;