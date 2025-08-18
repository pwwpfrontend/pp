import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PartnerApplication = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // track form step
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    businessType: "",
    contactName: "",
    email: "",
    phone: "",
    position: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);
  const handlePrevious = () => setStep(step - 1);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Application submitted successfully!");
    navigate("/");
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      {/* Header */}
      <header className="w-full border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center space-x-2">
          <img src="/logo192.png" alt="Partner Portal Logo" className="h-8 w-8" />
          <span className="font-medium text-sm">Power Workplace Partner Portal</span>
        </div>
      </header>

      {/* Form Section */}
      <section className="max-w-2xl mx-auto px-6 py-12">
        {step === 1 && (
          <>
            <h2 className="text-center text-2xl font-bold mb-10">Partner Application</h2>
            <form className="space-y-6">
              {/* Company Name */}
              <div>
                <label className="block mb-2 text-sm font-medium">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                  className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#405952]"
                />
              </div>

              {/* Company Address */}
              <div>
                <label className="block mb-2 text-sm font-medium">Company Address</label>
                <input
                  type="text"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  placeholder="Enter your company address"
                  className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#405952]"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block mb-2 text-sm font-medium">Business Type</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#405952]"
                >
                  <option value="">Select business type</option>
                  <option value="reseller">Reseller</option>
                  <option value="integrator">System Integrator</option>
                  <option value="consultant">Consultant</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#405952] text-white rounded-md text-sm font-medium hover:bg-[#30423f]"
                >
                  Next
                </button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-center text-2xl font-bold mb-10">Contact Information</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Contact Name */}
              <div>
                <label className="block mb-2 text-sm font-medium">Contact Person's Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#405952]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#405952]"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block mb-2 text-sm font-medium">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#405952]"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block mb-2 text-sm font-medium">Position in Company</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Enter your position"
                  className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#405952]"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-5 py-2 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#405952] text-white rounded-md text-sm font-medium hover:bg-[#30423f]"
                >
                  Submit
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
};

export default PartnerApplication;
