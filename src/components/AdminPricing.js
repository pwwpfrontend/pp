import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { 
  Settings, 
  DollarSign, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Shield,
  User,
  Crown,
  Building
} from 'lucide-react';
import { 
  getBrandDiscounts, 
  updateBrandDiscounts, 
  getAllBrandOverrides, 
  resetBrandOverrides,
  setDefaultDiscounts,
  getDefaultDiscounts
} from '../lib/pricing';

const AdminPricing = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brandOverrides, setBrandOverrides] = useState({});
  const [newBrand, setNewBrand] = useState('');
  const [showAddBrand, setShowAddBrand] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Load existing brand overrides
  useEffect(() => {
    const overrides = getAllBrandOverrides();
    setBrandOverrides(overrides);
  }, []);

  // Default discount rates
  const [defaultDiscounts, setDefaultDiscountsState] = useState({
    level1: 10, // Professional - 10%
    level2: 20, // Expert - 20%
    level3: 30, // Master - 30%
  });

  // Load existing default discounts
  useEffect(() => {
    const storedDefaults = getDefaultDiscounts();
    setDefaultDiscountsState(storedDefaults);
  }, []);

  // Handle default discount changes
  const handleDefaultDiscountChange = (role, value) => {
    setDefaultDiscountsState(prev => ({
      ...prev,
      [role]: Math.max(0, Math.min(100, parseInt(value) || 0))
    }));
  };

  // Handle brand discount changes
  const handleBrandDiscountChange = (brand, role, value) => {
    setBrandOverrides(prev => ({
      ...prev,
      [brand]: {
        ...prev[brand],
        [role]: Math.max(0, Math.min(100, parseInt(value) || 0))
      }
    }));
  };

  // Add new brand
  const handleAddBrand = () => {
    if (newBrand.trim() && !brandOverrides[newBrand.trim()]) {
      const brandName = newBrand.trim();
      setBrandOverrides(prev => ({
        ...prev,
        [brandName]: {
          level1: 10,
          level2: 20,
          level3: 30
        }
      }));
      setNewBrand('');
      setShowAddBrand(false);
    }
  };

  // Remove brand override
  const handleRemoveBrand = (brand) => {
    if (window.confirm(`Are you sure you want to remove the custom pricing for ${brand}?`)) {
      const newOverrides = { ...brandOverrides };
      delete newOverrides[brand];
      setBrandOverrides(newOverrides);
    }
  };

  // Save all pricing configurations
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Save brand overrides
      Object.entries(brandOverrides).forEach(([brand, discounts]) => {
        updateBrandDiscounts(brand, discounts);
      });

      // Save default discounts
      setDefaultDiscounts(defaultDiscounts);
      
      alert('Pricing configuration saved successfully!');
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Failed to save pricing configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all pricing to defaults? This action cannot be undone.')) {
      resetBrandOverrides();
      setBrandOverrides({});
      setDefaultDiscountsState({
        level1: 10,
        level2: 20,
        level3: 30
      });
    }
  };

  // Role display names
  const roleNames = {
    level1: 'Professional',
    level2: 'Expert', 
    level3: 'Master'
  };

  // Role icons
  const roleIcons = {
    level1: Shield,
    level2: User,
    level3: Crown
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
              <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="bg-[#405952] text-white px-6 py-2 rounded-lg hover:bg-[#2d3f38] transition-colors flex items-center disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save All'}
                </button>
              </div>
            </div>
            <p className="text-gray-600">Configure discount rates for different partnership levels and brand-specific overrides</p>
          </div>

          {/* Default Discount Rates */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Default Discount Rates</h2>
              <p className="text-gray-600 mb-4">These are the standard discount rates applied to all products unless overridden by brand-specific pricing.</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(defaultDiscounts).map(([role, discount]) => {
                  const IconComponent = roleIcons[role];
                  return (
                    <div key={role} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <IconComponent className="w-5 h-5 text-[#405952] mr-2" />
                        <h3 className="font-medium text-gray-900">{roleNames[role]}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discount}
                          onChange={(e) => handleDefaultDiscountChange(role, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                        />
                        <span className="text-gray-600 font-medium">%</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Standard discount for {roleNames[role]} partners
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Brand-Specific Overrides */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Brand-Specific Pricing</h2>
                  <p className="text-gray-600">Override default discount rates for specific brands or product lines.</p>
                </div>
                <button
                  onClick={() => setShowAddBrand(true)}
                  className="bg-[#405952] text-white px-4 py-2 rounded-lg hover:bg-[#2d3f38] transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Brand
                </button>
              </div>
            </div>

            {/* Add New Brand Modal */}
            {showAddBrand && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Enter brand name (e.g., Humly, Cisco)"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                  />
                  <button
                    onClick={handleAddBrand}
                    disabled={!newBrand.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddBrand(false);
                      setNewBrand('');
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Brand Overrides List */}
            <div className="p-6">
              {Object.keys(brandOverrides).length === 0 ? (
                <div className="text-center py-8">
                  <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">No brand-specific pricing configured</p>
                  <p className="text-sm text-gray-500">Click "Add Brand" to create custom pricing for specific brands</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(brandOverrides).map(([brand, discounts]) => (
                    <div key={brand} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Building className="w-5 h-5 text-[#405952] mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">{brand}</h3>
                        </div>
                        <button
                          onClick={() => handleRemoveBrand(brand)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Remove brand override"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(discounts).map(([role, discount]) => {
                          const IconComponent = roleIcons[role];
                          return (
                            <div key={role} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <IconComponent className="w-4 h-4 text-[#405952] mr-2" />
                                <span className="text-sm font-medium text-gray-700">{roleNames[role]}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={discount}
                                  onChange={(e) => handleBrandDiscountChange(brand, role, e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                                />
                                <span className="text-gray-600 text-sm">%</span>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {discount > defaultDiscounts[role] ? (
                                  <span className="text-green-600">↑ Higher than default</span>
                                ) : discount < defaultDiscounts[role] ? (
                                  <span className="text-red-600">↓ Lower than default</span>
                                ) : (
                                  <span className="text-gray-500">Same as default</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">How Pricing Works</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Default rates</strong> apply to all products unless overridden</li>
                  <li>• <strong>Brand overrides</strong> allow custom pricing for specific brands</li>
                  <li>• <strong>Net Price</strong> = MSRP × (1 - discount percentage)</li>
                  <li>• <strong>Professional (Level 1)</strong>: Standard discount rate</li>
                  <li>• <strong>Expert (Level 2)</strong>: Higher discount rate</li>
                  <li>• <strong>Master (Level 3)</strong>: Highest discount rate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPricing;