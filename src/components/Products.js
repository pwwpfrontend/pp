import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { 
  Package, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Download,
  FileText,
  Edit,
  Trash2,
  User,
  Shield,
  Crown
} from 'lucide-react';

// Mock user data - replace with actual user context/authentication
const mockUser = {
  role: 'Professional', // Professional, Expert, Master
  name: 'Optimus'
};

// Role-based pricing logic
const getRoleBasedPrice = (model, userRole) => {
  if (!model) return '—';
  
  const standardReseller = model['Standard Reseller'];
  const valueAddReseller = model['Value Add Reseller'];
  const msrp = model.msrp;
  
  // Convert string numbers to actual numbers
  const standard = typeof standardReseller === 'string' ? parseFloat(standardReseller) : standardReseller;
  const valueAdd = typeof valueAddReseller === 'string' ? parseFloat(valueAddReseller) : valueAddReseller;
  const msrpValue = typeof msrp === 'string' ? parseFloat(msrp) : msrp;
  
  switch (userRole) {
    case 'Professional':
      if (standard !== null && !isNaN(standard)) return standard;
      if (msrpValue !== null && !isNaN(msrpValue)) return msrpValue * 0.9; // 10% off
      return '—';
      
    case 'Expert':
      if (standard !== null && !isNaN(standard) && valueAdd !== null && !isNaN(valueAdd)) {
        return (standard + valueAdd) / 2; // Average of both
      }
      if (standard !== null && !isNaN(standard)) return standard;
      if (valueAdd !== null && !isNaN(valueAdd)) return valueAdd;
      if (msrpValue !== null && !isNaN(msrpValue)) return msrpValue * 0.85; // 15% off
      return '—';
      
    case 'Master':
      if (valueAdd !== null && !isNaN(valueAdd)) return valueAdd;
      if (msrpValue !== null && !isNaN(msrpValue)) return msrpValue * 0.8; // 20% off
      return '—';
      
    default:
      return '—';
  }
};

// Data normalization function
const normalizeProductData = (rawData) => {
  if (!Array.isArray(rawData)) return [];
  
  return rawData.map(item => {
    // Normalize keys and handle null values
    const normalized = {
      _id: item._id || item.id || '',
      name: item.name || '—',
      description: item.description || '—',
      picture: item.picture || '/default_image.svg',
      category: item.category || 'Unknown',
      group_id: item.group_id || null,
      price: item.price !== null && item.price !== undefined ? 
        (typeof item.price === 'string' ? parseFloat(item.price) : item.price) : null,
      models: []
    };
    
    // Handle models - parse if stringified JSON
    if (item.models && Array.isArray(item.models)) {
      normalized.models = item.models.map(model => {
        if (typeof model === 'string') {
          try {
            return JSON.parse(model);
          } catch {
            return { name: model, price: null };
          }
        }
        
        // Normalize model data
        const normalizedModel = {
          id: model.id || model.sku || '',
          name: model.name || '—',
          description: model.description || '—',
          picture: model.picture || '/default_image.svg',
          sku: model.sku || '',
          duration: model.duration || '',
          price: model.price !== null && model.price !== undefined ? 
            (typeof model.price === 'string' ? parseFloat(model.price) : model.price) : null,
          ac: model.ac || null
        };
        
        // Add pricing fields if they exist
        if (model['Standard Reseller'] !== undefined) {
          normalizedModel['Standard Reseller'] = typeof model['Standard Reseller'] === 'string' ? 
            parseFloat(model['Standard Reseller']) : model['Standard Reseller'];
        }
        if (model['Value Add Reseller'] !== undefined) {
          normalizedModel['Value Add Reseller'] = typeof model['Value Add Reseller'] === 'string' ? 
            parseFloat(model['Value Add Reseller']) : model['Value Add Reseller'];
        }
        if (model.msrp !== undefined) {
          normalizedModel.msrp = typeof model.msrp === 'string' ? 
            parseFloat(model.msrp) : model.msrp;
        }
        
        return normalizedModel;
      });
    }
    
    return normalized;
  });
};

// Separate products into hardware and license categories
const categorizeProducts = (products) => {
  const hardware = [];
  const license = [];
  
  products.forEach(product => {
    // Check if it's a license/warranty product
    if (product.category === 'License' || product.category === 'Warranty' || 
        (product.models && product.models.some(m => m.sku && m['Standard Reseller']))) {
      license.push(product);
    } else {
      // Hardware products have top-level price OR models with name/description/price
      if (product.price !== null || 
          (product.models && product.models.some(m => m.name && m.description && m.price !== null))) {
        hardware.push(product);
      }
    }
  });
  
  return { hardware, license };
};

const Products = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [expandedModels, setExpandedModels] = useState(new Set());
  const [expandedLicense, setExpandedLicense] = useState(new Set());
  const [rolePreview, setRolePreview] = useState(mockUser.role);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://njs-01.optimuslab.space/webhook/all_products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const normalizedData = normalizeProductData(data);
      setProducts(normalizedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Categorize products
  const { hardware, license } = useMemo(() => categorizeProducts(products), [products]);

  // Filter and search products
  const filteredHardware = useMemo(() => {
    let filtered = hardware.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.models && product.models.some(m => 
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      const matchesCategory = categoryFilter === 'all' || 
        (categoryFilter === 'Hardware' && product.category !== 'License' && product.category !== 'Warranty') ||
        (categoryFilter === 'License' && product.category === 'License') ||
        (categoryFilter === 'Warranty' && product.category === 'Warranty');
      
      return matchesSearch && matchesCategory;
    });

    // Sort hardware products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceA - priceB;
        default:
          return 0;
      }
    });

    return filtered;
  }, [hardware, searchTerm, categoryFilter, sortBy]);

  const filteredLicense = useMemo(() => {
    let filtered = license.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.models && product.models.some(m => 
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      const matchesCategory = categoryFilter === 'all' || 
        (categoryFilter === 'Hardware' && product.category !== 'License' && product.category !== 'Warranty') ||
        (categoryFilter === 'License' && product.category === 'License') ||
        (categoryFilter === 'Warranty' && product.category === 'Warranty');
      
      return matchesSearch && matchesCategory;
    });

    // Sort license products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'group_id':
          const groupA = parseFloat(a.group_id) || 0;
          const groupB = parseFloat(b.group_id) || 0;
          return groupA - groupB;
        case 'msrp':
          const msrpA = a.models?.[0]?.msrp || 0;
          const msrpB = b.models?.[0]?.msrp || 0;
          return msrpA - msrpB;
        default:
          return 0;
      }
    });

    return filtered;
  }, [license, searchTerm, categoryFilter, sortBy]);

  // Toggle model expansion
  const toggleModels = (productId) => {
    const newExpanded = new Set(expandedModels);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedModels(newExpanded);
  };

  // Toggle license expansion
  const toggleLicense = (productId) => {
    const newExpanded = new Set(expandedLicense);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedLicense(newExpanded);
  };

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Hardware Product Card
  const HardwareProductCard = ({ product }) => {
    const isModelsExpanded = expandedModels.has(product._id);
    const hasModels = product.models && product.models.length > 0;

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Product Image */}
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          {product.picture && product.picture !== '/default_image.svg' ? (
            <img 
              src={product.picture} 
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = '/default_image.jpeg';
              }}
            />
          ) : (
            <div className="text-gray-400 text-center">
              <img src="/default_image.svg" alt="No Image" className="w-16 h-16 mx-auto mb-2" />
              <div className="text-sm">No Image</div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{product.name}</h3>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Price */}
          <div className="mb-4">
            <div className="text-2xl font-bold text-gray-900">
              {product.price ? `$${product.price}` : '—'}
            </div>
          </div>

          {/* Models Button */}
          {hasModels && (
            <button
              onClick={() => toggleModels(product._id)}
              className="w-full bg-[#405952] text-white px-4 py-2 rounded-md hover:bg-[#2d3f38] transition-colors flex items-center justify-center"
            >
              {isModelsExpanded ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Models
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  View Models
                </>
              )}
            </button>
          )}

          {/* Models Table */}
          {isModelsExpanded && hasModels && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Model Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {product.models.map((model, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-gray-900">{model.name}</td>
                      <td className="px-3 py-2 text-gray-600">{model.description}</td>
                      <td className="px-3 py-2 text-gray-900">
                        {model.price ? `$${model.price}` : '—'}
                      </td>
                      <td className="px-3 py-2">
                        {model.picture && model.picture !== '/default_image.svg' ? (
                          <img 
                            src={model.picture} 
                            alt={model.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = '/default_image.svg';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <img src="/default_image.svg" alt="No Image" className="w-6 h-6" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Admin Actions Placeholder */}
          {/* TODO: Add admin-only CRUD buttons here */}
        </div>
      </div>
    );
  };

  // License Product Accordion
  const LicenseProductAccordion = ({ product }) => {
    const isExpanded = expandedLicense.has(product._id);
    const hasModels = product.models && product.models.length > 0;

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => toggleLicense(product._id)}
          className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {product.group_id ? `${product.group_id} — ` : ''}{product.name}
              </h3>
              <p className="text-gray-600 text-sm mt-1">{product.description}</p>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </button>

        {/* Models Table */}
        {isExpanded && hasModels && (
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">MSRP</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard Reseller</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value Add Reseller</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Your Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {product.models.map((model, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-gray-900 font-mono">{model.sku}</td>
                      <td className="px-3 py-2 text-gray-900">{model.name}</td>
                      <td className="px-3 py-2 text-gray-600">{model.duration}</td>
                      <td className="px-3 py-2 text-gray-900">
                        {model.msrp ? `$${model.msrp}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-900">
                        {model['Standard Reseller'] ? `$${model['Standard Reseller']}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-900">
                        {model['Value Add Reseller'] ? `$${model['Value Add Reseller']}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-900 font-semibold">
                        {getRoleBasedPrice(model, rolePreview) !== '—' ? 
                          `$${getRoleBasedPrice(model, rolePreview)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin Actions Placeholder */}
        {/* TODO: Add admin-only CRUD buttons here */}
      </div>
    );
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
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
              {/* TODO: Add admin-only Add Product button here */}
            </div>
            <p className="text-gray-600">Browse and manage all available products in your partnership portfolio</p>
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
                  Products
                </button>
                <button
                  onClick={() => setActiveTab('license')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'license'
                      ? 'border-[#405952] text-[#405952]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  License
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Filters and Search */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products by name, SKU, or model name..."
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
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="Hardware">Hardware</option>
                      <option value="License">License</option>
                      <option value="Warranty">Warranty</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                    >
                      {activeTab === 'products' ? (
                        <>
                          <option value="name">Sort by Name</option>
                          <option value="price">Sort by Price</option>
                        </>
                      ) : (
                        <>
                          <option value="group_id">Sort by Group ID</option>
                          <option value="msrp">Sort by MSRP</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Role Preview */}
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={rolePreview}
                      onChange={(e) => setRolePreview(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent appearance-none"
                    >
                      <option value="Professional">
                        <Shield className="w-4 h-4 mr-2" />
                        Professional
                      </option>
                      <option value="Expert">
                        <User className="w-4 h-4 mr-2" />
                        Expert
                      </option>
                      <option value="Master">
                        <Crown className="w-4 h-4 mr-2" />
                        Master
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Content */}
              {loading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="bg-[#405952] text-white px-4 py-2 rounded-md hover:bg-[#2d3f38] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : activeTab === 'products' ? (
                // Products Tab (Hardware)
                <div>
                  {filteredHardware.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No hardware products found matching your criteria</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredHardware.map(product => (
                        <HardwareProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // License Tab
                <div>
                  {filteredLicense.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No license products found matching your criteria</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredLicense.map(product => (
                        <LicenseProductAccordion key={product._id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
