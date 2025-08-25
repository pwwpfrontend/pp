import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { MessageSquare, Mail, Phone, Clock, HelpCircle, Send } from 'lucide-react';

const Support = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual support ticket submission
    alert('Support ticket submitted! We will get back to you soon.');
    setMessage('');
    setSubject('');
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
            <h1 className="text-3xl font-bold text-gray-900">Support</h1>
            <p className="text-gray-600">Get help and support for your partnership needs</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <HelpCircle className="w-6 h-6 mr-2 text-[#405952]" />
                Contact Information
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email Support</h3>
                    <p className="text-gray-600">support@partnership-portal.com</p>
                    <p className="text-sm text-gray-500">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone Support</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 9 AM - 6 PM EST</p>
              </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday</p>
                    <p className="text-sm text-gray-500">9:00 AM - 6:00 PM EST</p>
              </div>
                </div>
              </div>
            </div>

            {/* Support Ticket Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-[#405952]" />
                Submit Support Ticket
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                    placeholder="Brief description of your issue"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#405952] focus:border-transparent"
                    placeholder="Please describe your issue in detail..."
                  />
          </div>

                <button
                  type="submit"
                  className="w-full bg-[#405952] text-white px-4 py-2 rounded-md hover:bg-[#2d3f38] transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ticket
                </button>
              </form>
                    </div>
                  </div>
                  
          {/* FAQ Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">How do I access my partner pricing?</h3>
                <p className="text-gray-600">Your partner pricing is automatically applied when you view products. The prices shown are already calculated with your partnership discount.</p>
                  </div>
                  
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Can I request a quote for multiple products?</h3>
                <p className="text-gray-600">Yes! Expert and Master level partners can create quotes with multiple products. Navigate to the Quotes section to get started.</p>
                  </div>
                  
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">How do I update my company information?</h3>
                <p className="text-gray-600">Contact our support team to update your company information, contact details, or partnership level.</p>
                  </div>
                  
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">What are the different partnership levels?</h3>
                <p className="text-gray-600">We offer three partnership levels: Professional (Level 1), Expert (Level 2), and Master (Level 3), each with increasing benefits and discounts.</p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;