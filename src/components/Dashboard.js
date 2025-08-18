import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { BarChart3, Users, DollarSign, TrendingUp, Activity, Clock, FileText } from 'lucide-react';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} />

      <main className="pt-16">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-8">This is the dashboard page with the new Header and Sidebar components.</p>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Partners</p>
                  <p className="text-2xl font-semibold text-gray-900">1,234</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">$45,678</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Growth</p>
                  <p className="text-2xl font-semibold text-gray-900">+12.5%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Deals</p>
                  <p className="text-2xl font-semibold text-gray-900">89</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart and Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart Placeholder */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-[#405952]" />
                Performance Overview
              </h3>
              <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Chart visualization will be displayed here</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#405952]" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New partner application received</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Quote approved for TechCorp</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Product catalog updated</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Support ticket resolved</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#405952]" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-[#405952]" />
                  <div>
                    <p className="font-medium text-gray-900">Add Partner</p>
                    <p className="text-sm text-gray-500">Register new partnership</p>
                  </div>
                </div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-3 text-[#405952]" />
                  <div>
                    <p className="font-medium text-gray-900">Create Quote</p>
                    <p className="text-sm text-gray-500">Generate new quote</p>
                  </div>
                </div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 mr-3 text-[#405952]" />
                  <div>
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-500">Access analytics</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
