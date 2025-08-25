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
  X
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Products = () => {
  const { currentRole } = useAuth();
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
  const itemsPerPage = 10;

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

  // Extract brand from various data fields
  const extractBrand = (product) => {
    // Check extraFields first
    if (product.extraFields?.brand) {
      return product.extraFields.brand;
    }
    
    // Check nested extraFields
    if (product.extraFields?.extraFields?.brand) {
      return product.extraFields.extraFields.brand;
    }
    
    // Check product name for known brands
    const productName = product.name.toLowerCase();
    if (productName.includes('humly')) return 'Humly';
    if (productName.includes('milesight')) return 'Milesight';
    if (productName.includes('supernet')) return 'SuperNet';
    if (productName.includes('acmecorp')) return 'AcmeCorp';
    
    // Default fallback
    return 'Other';
  };

  // Handle product selection
  const handleProductClick = (product, event) => {
    // Prevent triggering when clicking on buttons
    if (event.target.closest('button')) {
      return;
    }
    
    setSelectedProduct(selectedProduct?.id === product.id ? null : product);
    
    // Auto-scroll to top when a product is selected
    if (selectedProduct?.id !== product.id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle download
  const handleDownload = (product) => {
    // For demo purposes, create a simple text file with product info
    // In real implementation, you would fetch the actual PDF/Excel from API
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

  // Handle add to cart/list
  const handleAddProduct = (product) => {
    // Implement your add to cart/list logic here
    console.log('Adding product:', product);
    // For now, just show an alert
    alert(`Added ${product.name} to your list!`);
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // First, login to get a fresh token
        const loginResponse = await fetch('http://optimus-india-njs-01.netbird.cloud:3006/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: "level3@example.com",
            password: "level3pass"
          })
        });

        if (!loginResponse.ok) {
          throw new Error(`Login failed! status: ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        
        if (!loginData.token) {
          throw new Error('No token received from login');
        }

        const token = loginData.token;
        console.log('Login successful, token received');

        // Now fetch products with the fresh token
        const response = await fetch('http://optimus-india-njs-01.netbird.cloud:3006/products', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Products fetched successfully:', data);
        
        // Process products to flatten models into individual products
        const processedProducts = [];
        
        data.products.forEach(product => {
          const brand = extractBrand(product);
          const discountRate = getDiscountRate(currentRole);

          if (product.models && product.models.length > 0) {
            // Product has models - create separate entries for each model
            product.models.forEach((model, index) => {
              const modelPrice = model.msrp || model.price || product.price || 0;
              processedProducts.push({
                id: `${product._id}-model-${index}`,
                parentId: product._id,
                name: `${product.name} - ${model.name}`,
                description: model.description || product.description || '', // Use model description first, then parent
                sku: model.sku || `${product._id}-${index}`,
                brand: brand,
                category: product.category || 'Uncategorized',
                msrp: modelPrice,
                netPrice: calculateNetPrice(modelPrice, currentRole),
                discount: discountRate * 100,
                features: product.features || [],
                picture: model.picture || product.picture || '',
                duration: model.duration || '',
                isModel: true,
                modelName: model.name,
                parentProduct: product,
                parentDescription: product.description || '',
                extraFields: { ...product.extraFields, ...model.extraFields }
              });
            });
          } else {
            // Product without models
            const productPrice = product.msrp || product.price || 0;
            processedProducts.push({
              id: product._id,
              parentId: null,
              name: product.name,
              description: product.description || '',
              sku: product.sku || product._id,
              brand: brand,
              category: product.category || 'Uncategorized',
              msrp: productPrice,
              netPrice: calculateNetPrice(productPrice, currentRole),
              discount: discountRate * 100,
              features: product.features || [],
              picture: product.picture || '',
              duration: '',
              isModel: false,
              parentProduct: null,
              extraFields: product.extraFields || {}
            });
          }
        });

        setProducts(processedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentRole]);

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

  // Filter and search products
  const filteredProducts = React.useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || 
        product.category.toLowerCase() === categoryFilter.toLowerCase();
      
      const matchesBrand = brandFilter === 'all' || 
        product.brand.toLowerCase() === brandFilter.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesBrand;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.msrp - b.msrp;
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'sku':
          return a.sku.localeCompare(b.sku);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, brandFilter, sortBy]);

  // Get unique categories and brands for filters
  const categories = React.useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return ['all', ...cats];
  }, [products]);

  const brands = React.useMemo(() => {
    const brandList = [...new Set(products.map(p => p.brand))];
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
              <p className="text-gray-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-[#405952] text-white rounded-lg hover:bg-[#2d3f38]"
              >
                Retry
              </button>
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
        {/* Page Header - Always at top */}
        <div className="bg-gray-100 p-6 pb-3">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <div className="mt-2 text-sm text-[#405952]">
            Your Level: <span className="font-semibold">{getRoleDisplayName(currentRole)}</span> 
            <span className="ml-2 text-gray-500">({getDiscountRate(currentRole) * 100}% discount)</span>
          </div>
        </div>

        {/* Product Detail Modal - Positioned below header and made sticky */}
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
                  {/* SKU, Category, Brand */}
                  <div className="mb-3 text-sm text-gray-600 space-y-1">
                    <div>SKU: <span className="text-gray-900 font-medium">{selectedProduct.sku}</span></div>
                    <div>Category: <span className="text-gray-900 font-medium">{selectedProduct.category}</span> | Brand: <span className="text-gray-900 font-medium">{selectedProduct.brand}</span></div>
                  </div>

                  {/* Description */}
                  {selectedProduct.description && (
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold mb-1">Description</h3>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{selectedProduct.description}</p>
                    </div>
                  )}

                  {/* Additional Information - Two Columns */}
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
                  {/* Pricing Breakdown */}
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

                  {/* Action Button */}
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
                                  handleAddProduct(product);
                                }}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-[#405952] hover:bg-[#2d3f38] text-white rounded transition-colors"
                                title="Add to Cart"
                              >
                                <Plus className="w-3 h-3" />
                                Add
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