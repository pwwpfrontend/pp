import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { FileText, Plus, Search, Filter, Clock, DollarSign, Package, User, Send, Building } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { getNetPrice } from '../lib/pricing';
import useAuth from '../hooks/useAuth';

const RequestQuote = () => {
  const { currentRole } = useAuth();
  const { products } = useProducts();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    requirements: ''
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter products based on search
  const filteredProducts = products.filter(product => {
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Add product to quote
  const addToQuote = (product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setSelectedProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  // Remove product from quote
  const removeFromQuote = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Update product quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromQuote(productId);
    } else {
      setSelectedProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, quantity } : p
      ));
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (getNetPrice(product.msrp, currentRole, product.brand) * product.quantity);
    }, 0);
  };

  // Handle customer info change
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit quote request
  const handleSubmitQuote = (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      alert('Please add at least one product to your quote.');
      return;
    }
    
    const quoteData = {
      customerInfo,
      products: selectedProducts,
      total: calculateTotal(),
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    console.log('Quote submitted:', quoteData);
    alert('Quote request submitted successfully! We will contact you soon.');
    
    // Reset form
    setSelectedProducts([]);
    setCustomerInfo({
      name: '',
      email: '',
      company: '',
      phone: '',
      requirements: ''
    });
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
            <h1 className="text-3xl font-bold text-gray-900">Request Quote</h1>
            <p className="text-gray-600">Select products and submit your quote request</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Selection */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Available Products</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Package className="w-5 h-5 text-[#405952]" />
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            <span className="text-sm text-gray-500">({product.brand})</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>SKU: {product.sku}</span>
                            <span>Category: {product.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-[#405952]">${getNetPrice(product.msrp, currentRole, product.brand).toFixed(2)}</div>
                            <div className="text-sm text-gray-500">per unit</div>
                          </div>
                          <button
                            onClick={() => addToQuote(product)}
                            className="bg-[#405952] text-white px-4 py-2 rounded-lg hover:bg-[#2d3f38] transition-colors flex items-center"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quote Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quote Summary</h2>
                
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No products selected</p>
                    <p className="text-sm text-gray-500">Add products from the list to create your quote</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {selectedProducts.map(product => (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <button
                              onClick={() => removeFromQuote(product.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">${getNetPrice(product.msrp, currentRole, product.brand).toFixed(2)} × {product.quantity}</span>
                            <span className="font-semibold">${(getNetPrice(product.msrp, currentRole, product.brand) * product.quantity).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => updateQuantity(product.id, product.quantity - 1)}
                              className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium">{product.quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, product.quantity + 1)}
                              className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-[#405952]">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Customer Information Form */}
                    <form onSubmit={handleSubmitQuote} className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Customer Information</h3>
                      
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={customerInfo.name}
                        onChange={handleCustomerInfoChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                      />
                      
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={customerInfo.email}
                        onChange={handleCustomerInfoChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                      />
                      
                      <input
                        type="text"
                        name="company"
                        placeholder="Company Name"
                        value={customerInfo.company}
                        onChange={handleCustomerInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                      />
                      
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={customerInfo.phone}
                        onChange={handleCustomerInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                      />
                      
                      <textarea
                        name="requirements"
                        placeholder="Additional Requirements (optional)"
                        value={customerInfo.requirements}
                        onChange={handleCustomerInfoChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                      />

                      <button
                        type="submit"
                        className="w-full bg-[#405952] text-white py-3 rounded-lg hover:bg-[#2d3f38] transition-colors flex items-center justify-center"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Quote Request
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestQuote;
