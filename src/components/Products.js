import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Package, Search, Filter, Download, FileText, Edit, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

// Mock user data - replace with actual user context/authentication
const mockUser = {
  role: 'Professional', // Professional, Expert, Master, Admin
  name: 'Optimus'
};

// Mock API functions - replace with actual API calls
const apiService = {
  async getAllProducts() {
    try {
      const response = await fetch('https://njs-01.optimuslab.space/webhook/all_products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // Return mock data for development
      return mockProducts;
    }
  },

  async addProduct(productData) {
    // Mock implementation
    console.log('Adding product:', productData);
    return { success: true, message: 'Product added successfully' };
  },

  async editProduct(id, productData) {
    // Mock implementation
    console.log('Editing product:', id, productData);
    return { success: true, message: 'Product updated successfully' };
  },

  async deleteProduct(id) {
    // Mock implementation
    console.log('Deleting product:', id);
    return { success: true, message: 'Product deleted successfully' };
  }
};

// Mock products data for development
const mockProducts = [
  {
    id: 1,
    name: "AIQ Sensor Pro",
    description: "Advanced air quality monitoring sensor with IoT connectivity and real-time data transmission capabilities for industrial applications.",
    category: "Hardware",
    sku: "AIQ-001",
    image: null,
    price: null,
    rolePrices: {
      "Professional": 299,
      "Expert": 279,
      "Master": 259,
      "msrp": 349
    },
    models: [
      {
        sku: "AIQ-001-BASIC",
        name: "Basic Model",
        duration: "1 Year",
        prices: {
          "Professional": 299,
          "Expert": 279,
          "Master": 259
        }
      },
      {
        sku: "AIQ-001-PREMIUM",
        name: "Premium Model",
        duration: "2 Years",
        prices: {
          "Professional": 399,
          "Expert": 379,
          "Master": 359
        }
      }
    ]
  },
  {
    id: 2,
    name: "Cloud Storage Enterprise",
    description: "Scalable cloud storage solution with enterprise-grade security and compliance features.",
    category: "License",
    sku: "CS-002",
    image: "cloud_storage.jpg",
    price: 199,
    rolePrices: null,
    models: []
  },
  {
    id: 3,
    name: "Extended Warranty Package",
    description: "Comprehensive warranty coverage for all hardware products with 24/7 support and rapid replacement service.",
    category: "Warranty",
    sku: "WP-003",
    image: null,
    price: 99,
    rolePrices: null,
    models: []
  },
  {
    id: 4,
    name: "AIQ Sensor Pro", // Duplicate for testing
    description: "Advanced air quality monitoring sensor with IoT connectivity.",
    category: "Hardware",
    sku: "AIQ-001-DUP",
    image: null,
    price: null,
    rolePrices: {
      "Professional": 299,
      "Expert": 279,
      "Master": 259,
      "msrp": 349
    },
    models: []
  }
];

const Products = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const [expandedModels, setExpandedModels] = useState(new Set());

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const getPriceForRole = (product) => {
    if (product.price !== null && product.price !== undefined) {
      return product.price;
    }
    
    if (product.rolePrices && typeof product.rolePrices === 'object') {
      if (mockUser.role === 'Admin') {
        return product.rolePrices.msrp || 'Multiple Prices';
      }
      return product.rolePrices[mockUser.role] || 'Price on Request';
    }
    
    return 'Price on Request';
  };

  const getPriceDisplay = (product) => {
    const price = getPriceForRole(product);
    
    if (price === 'Price on Request') return price;
    if (price === 'Multiple Prices') return 'Multiple Prices';
    
    return `$${price}`;
  };

  const toggleDescription = (productId) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedDescriptions(newExpanded);
  };

  const toggleModels = (productId) => {
    const newExpanded = new Set(expandedModels);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedModels(newExpanded);
  };

  const filteredProducts = products.filter(product => {
    if (!product || !product.name || !product.sku) {
      return false;
    }
    
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesRole = roleFilter === 'all' || 
                       (product.rolePrices && product.rolePrices[roleFilter]);
    
    return matchesSearch && matchesCategory && matchesRole;
  });

  const categories = products && products.length > 0 ? [...new Set(products.map(p => p.category).filter(Boolean))] : [];
  const roles = ['Professional', 'Expert', 'Master'];

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const isDuplicate = (product) => {
    if (!products || !Array.isArray(products) || products.length === 0) {
      return false;
    }
    return products.filter(p => p.name === product.name).length > 1;
  };

  const ProductCard = ({ product }) => {
    // Safety check for product object
    if (!product || !product.id || !product.name) {
      return null;
    }
    
    const priceDisplay = getPriceDisplay(product);
    const hasModels = product.models && Array.isArray(product.models) && product.models.length > 0;
    const isDescriptionExpanded = expandedDescriptions.has(product.id);
    const isModelsExpanded = expandedModels.has(product.id);

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Product Image */}
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <Package className="w-16 h-16 mx-auto mb-2" />
              <div className="text-sm">No Image</div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          {/* Header with duplicate warning */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex-1">{product.name}</h3>
            {isDuplicate(product) && mockUser.role === 'Admin' && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Duplicate
              </span>
            )}
          </div>

          {/* SKU */}
          <p className="text-sm text-gray-500 mb-3">SKU: {product.sku}</p>

          {/* Description */}
          <div className="mb-4">
            <p className={`text-gray-600 ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
              {product.description}
            </p>
            <button
              onClick={() => toggleDescription(product.id)}
              className="text-[#405952] text-sm hover:underline mt-1 flex items-center"
            >
              {isDescriptionExpanded ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Show more
                </>
              )}
            </button>
          </div>

          {/* Category */}
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {product.category}
            </span>
          </div>

          {/* Price Section */}
          <div className="mb-4">
            <div className="text-2xl font-bold text-gray-900">
              {priceDisplay}
            </div>
            {mockUser.role === 'Admin' && product.rolePrices && (
              <div className="mt-2 text-sm text-gray-600">
                <div>MSRP: ${product.rolePrices.msrp}</div>
                <div>Professional: ${product.rolePrices.Professional}</div>
                <div>Expert: ${product.rolePrices.Expert}</div>
                <div>Master: ${product.rolePrices.Master}</div>
              </div>
            )}
          </div>

          {/* Models Section */}
          {hasModels && (
            <div className="mb-4">
              <button
                onClick={() => toggleModels(product.id)}
                className="text-[#405952] text-sm hover:underline flex items-center"
              >
                {isModelsExpanded ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Hide Models
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Show Models
                  </>
                )} ({product.models.length})
              </button>
              
              {isModelsExpanded && (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        {mockUser.role === 'Admin' && (
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {product.models.map((model, index) => {
                        // Safety check for model object
                        if (!model || !model.sku || !model.name) {
                          return null;
                        }
                        
                        return (
                          <tr key={index}>
                            <td className="px-3 py-2 text-gray-900">{model.sku}</td>
                            <td className="px-3 py-2 text-gray-900">{model.name}</td>
                            <td className="px-3 py-2 text-gray-600">{model.duration}</td>
                            <td className="px-3 py-2 text-gray-900">
                              ${model.prices && model.prices[mockUser.role] ? model.prices[mockUser.role] : 'N/A'}
                            </td>
                            {mockUser.role === 'Admin' && (
                              <td className="px-3 py-2">
                                <button 
                                  onClick={() => window.location.href = `/edit-product/${product.id}`}
                                  className="text-blue-600 hover:text-blue-800 text-xs mr-2 flex items-center"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </button>
                                <button className="text-red-600 hover:text-red-800 text-xs flex items-center">
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Admin Actions */}
          {mockUser.role === 'Admin' && (
            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button 
                onClick={() => window.location.href = `/edit-product/${product.id}`}
                className="flex-1 bg-[#405952] text-white px-3 py-2 rounded-md text-sm hover:bg-[#2d3f38] transition-colors flex items-center justify-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button 
                onClick={() => handleDeleteProduct(product.id)}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CatalogTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Catalogs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <Download className="w-16 h-16 mx-auto mb-3 text-[#405952]" />
            <h3 className="font-medium text-gray-900 mb-2">Milesight IoT Product Catalog</h3>
            <p className="text-gray-600 text-sm mb-3">Complete product catalog with specifications and pricing</p>
            <button className="bg-[#405952] text-white px-4 py-2 rounded-md hover:bg-[#2d3f38] transition-colors flex items-center mx-auto">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <Download className="w-16 h-16 mx-auto mb-3 text-[#405952]" />
            <h3 className="font-medium text-gray-900 mb-2">Humly Price List</h3>
            <p className="text-gray-600 text-sm mb-3">Current pricing for all Humly products and services</p>
            <button className="bg-[#405952] text-white px-4 py-2 rounded-md hover:bg-[#2d3f38] transition-colors flex items-center mx-auto">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Preview</h3>
        <div className="h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">PDF Viewer - Select a document to preview</p>
          </div>
        </div>
      </div>
    </div>
  );

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
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              {mockUser.role === 'Admin' && (
                <button 
                  onClick={() => window.location.href = '/add-product'}
                  className="bg-[#405952] text-white px-4 py-2 rounded-md hover:bg-[#2d3f38] transition-colors flex items-center"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add Product
                </button>
              )}
            </div>
            <p className="text-gray-600">Manage and view all available products in your partnership portfolio</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'products'
                      ? 'border-[#405952] text-[#405952]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  All Products
                </button>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'catalog'
                      ? 'border-[#405952] text-[#405952]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Catalog & Price Lists
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'products' ? (
                <>
                  {/* Filters and Search */}
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search products by name or SKU..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                        >
                          <option value="all">All Categories</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      {mockUser.role === 'Admin' && (
                        <div className="relative">
                          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                          >
                            <option value="all">All Roles</option>
                            {roles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Products Grid */}
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#405952] mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading products...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No products found matching your criteria</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <CatalogTab />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
