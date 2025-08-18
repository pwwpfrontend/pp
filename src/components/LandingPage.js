import React from "react";
import { Percent, Headphones, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white font-sans text-gray-800">
      {/* Header */}
      <header className="w-full border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img
              src="/logo192.png"
              alt="Partner Portal Logo"
              className="h-10 w-10"
            />
            <span className="font-medium text-sm">
              Power Workplace Partner Portal
            </span>
          </div>
          <Link to="/login">
  <button className="px-4 py-2 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200">
    Partner Login
  </button>
</Link>
        </div>
      </header>


{/* Hero Section */}
<section className="py-16">
  <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 items-center justify-center gap-10 text-center">
    {/* Left: Logo + text */}
    <div className="flex flex-col items-center">
      <img
        src="/logo192.png"
        alt="Partner Portal Icon"
        className="h-40 w-42"
      />
      <h3 className="text-lg font-medium text-gray-700">PARTNER PORTAL</h3>
    </div>

    {/* Right: Headings + Button */}
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-extrabold mb-2">Welcome to</h1>
      <h2 className="text-3xl font-extrabold mb-4">Partner Portal</h2>
      <p className="text-gray-600 max-w-md mb-6">
        Access exclusive pricing for PointGrab, MileSight, Humly, Eptura,
        and ThingsBoard products.
      </p>
      <button
        onClick={() => navigate("/application")}
        className="bg-[#405952] text-white px-6 py-2 rounded-md font-medium hover:bg-[#30423f] transition"
      >
        Apply for Partnership
      </button>
    </div>
  </div>
</section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h3 className="font-semibold mb-2">Benefits of Partnership</h3>
        <h2 className="text-2xl font-extrabold mb-8">
          Maximize Your Success with Power Workplace
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="border rounded-lg p-6 text-left">
            <Percent className="h-6 w-6 mb-3 text-[#405952]" />
            <h4 className="font-semibold mb-2">Tiered Discounts</h4>
            <p className="text-gray-600 text-sm">
              Unlock increasing discounts based on your partnership level,
              maximizing your profitability.
            </p>
          </div>
          {/* Card 2 */}
          <div className="border rounded-lg p-6 text-left">
            <Headphones className="h-6 w-6 mb-3 text-[#405952]" />
            <h4 className="font-semibold mb-2">Technical Support</h4>
            <p className="text-gray-600 text-sm">
              Receive dedicated technical support from our expert team to ensure
              seamless implementations.
            </p>
          </div>
          {/* Card 3 */}
          <div className="border rounded-lg p-6 text-left">
            <Package className="h-6 w-6 mb-3 text-[#405952]" />
            <h4 className="font-semibold mb-2">Product Access</h4>
            <p className="text-gray-600 text-sm">
              Gain access to a wide range of products and solutions to meet your
              clients' diverse needs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#privacy" className="hover:text-gray-700">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-gray-700">
              Terms of Service
            </a>
            <a href="#contact" className="hover:text-gray-700">
              Contact Us
            </a>
          </div>
          <div className="text-center">
            © 2024 Power Workplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
