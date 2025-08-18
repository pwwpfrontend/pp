import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would typically validate credentials with your backend
    // For now, we'll just redirect to dashboard
    console.log("Login attempt:", formData);
    
    // Redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Section - Login Form */}
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="max-w-sm w-full space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border rounded-md px-4 py-2 text-sm bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#405952]"
              required
            />

            {/* Password */}
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border rounded-md px-4 py-2 text-sm bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#405952]"
              required
            />

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleInputChange}
                className="h-4 w-4 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[#405952] text-white py-2 rounded-md text-sm font-medium hover:bg-[#30423f] transition"
            >
              Sign In
            </button>
          </form>

          {/* Apply Link */}
          <p className="text-center text-sm text-gray-600">
            New Partner?{" "}
            <Link
              to="/application"
              className="text-[#405952] font-medium hover:underline"
            >
              Apply Here
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Logo */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <img
            src="/logo192.png"
            alt="Partner Portal Logo"
            className="h-40 w-40 mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-800">
            PARTNER PORTAL
          </h3>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
