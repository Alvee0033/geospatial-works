'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Land & Boundary Surveying',
    location: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
          {/* Dark backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Bottom Sheet on Mobile, Centered Modal Card on Desktop */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-lg bg-white text-gray-900 rounded-t-[2.5rem] sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-t-[3px] sm:border border-[#20bc2e] sm:border-gray-100 z-10 my-0 sm:my-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Top drag handle notch for Mobile */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 block sm:hidden" />

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {submitted ? (
              <div className="py-8 sm:py-10 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-[#20bc2e] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Request Received!</h3>
                <p className="text-gray-600 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name || 'Valued Client'}</strong>. Our team will review your inquiry and contact you shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Header */}
                <div className="space-y-1 pr-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Get a Free Consultation</h2>
                  <p className="text-gray-500 text-xs">
                    Fill out the form below and our land survey experts will get back to you.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  
                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 block">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#20bc2e] focus:bg-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none text-gray-900 transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 block">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="01700-000000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#20bc2e] focus:bg-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none text-gray-900 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Email & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 block">Email Address</label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#20bc2e] focus:bg-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none text-gray-900 transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 block">Location / District</label>
                      <input
                        type="text"
                        placeholder="Dhaka, Gazipur, etc."
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#20bc2e] focus:bg-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none text-gray-900 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Service Dropdown */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">Select Service</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#20bc2e] focus:bg-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none text-gray-900 transition-all cursor-pointer"
                    >
                      <option value="Land & Boundary Surveying">Land & Boundary Surveying</option>
                      <option value="Drone / UAV Mapping">Drone / UAV Mapping</option>
                      <option value="Mouza Map Georeferencing">Mouza Map Georeferencing (CS, SA, RS, BS)</option>
                      <option value="River / Bathymetric Survey">River / Bathymetric Survey</option>
                      <option value="Land Valuation Report">Land Valuation Report</option>
                      <option value="GIS Mapping & Database">GIS Mapping & Database</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">Project Details / Message</label>
                    <textarea
                      rows={2}
                      placeholder="Describe your land survey or project requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#20bc2e] focus:bg-white text-xs sm:text-sm p-3 rounded-xl outline-none text-gray-900 transition-all resize-none placeholder:text-gray-400"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#20bc2e] hover:bg-[#1ba829] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer active:scale-98 mt-1"
                  >
                    Submit Request
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
