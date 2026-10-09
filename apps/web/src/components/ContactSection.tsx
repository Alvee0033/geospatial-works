'use client';
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, X, MessageSquarePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

const ContactSection = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Topographical Survey',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsMobileFormOpen(false);
      setFormData({ name: '', email: '', phone: '', service: 'Topographical Survey', message: '' });
    }, 3000);
  };

  const formElement = (isModal: boolean) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Full Name</label>
          <input 
            type="text" 
            required
            placeholder="Alvee Rahman"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-gray-50/60 border border-gray-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#20bc2e]/30 focus:border-[#20bc2e] transition-all text-gray-900"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Phone Number</label>
          <input 
            type="tel" 
            required
            placeholder="+88 017XX XXXXXX"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full bg-gray-50/60 border border-gray-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#20bc2e]/30 focus:border-[#20bc2e] transition-all text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Email Address</label>
          <input 
            type="email" 
            required
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full bg-gray-50/60 border border-gray-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#20bc2e]/30 focus:border-[#20bc2e] transition-all text-gray-900"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Required Service</label>
          <select 
            value={formData.service}
            onChange={(e) => setFormData({...formData, service: e.target.value})}
            className="w-full bg-gray-50/60 border border-gray-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#20bc2e]/30 focus:border-[#20bc2e] transition-all text-gray-700"
          >
            <option>Topographical Survey</option>
            <option>UAV Drone Aerial Survey</option>
            <option>Mouza & Boundary Survey</option>
            <option>Bathymetric Hydro Survey</option>
            <option>Satellite Remote Sensing</option>
            <option>GIS Mapping & Databases</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Project Message</label>
        <textarea 
          rows={isModal ? 3 : 4}
          required
          placeholder="Provide details about your project scope, location, and required accuracy datum..."
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full bg-gray-50/60 border border-gray-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#20bc2e]/30 focus:border-[#20bc2e] transition-all text-gray-900"
        ></textarea>
      </div>

      <button 
        type="submit"
        className="w-full inline-flex items-center justify-center space-x-2 bg-[#20bc2e] hover:bg-[#1a9d25] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Send Inquiry</span>
      </button>
    </form>
  );

  return (
    <section id="contact" className="w-full relative bg-transparent py-24 md:py-32 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal variant="fade">
          <div className="mb-16 text-center flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-[2px] bg-[#20bc2e] rounded-full"></div>
              <span className="text-[#20bc2e] font-bold text-xs md:text-sm tracking-[0.2em] uppercase">Get In Touch</span>
              <div className="w-10 h-[2px] bg-[#20bc2e] rounded-full"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              Contact Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20bc2e] to-[#127a1b]">Expert Team</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base font-normal max-w-xl mx-auto leading-relaxed">
              Consult with our licensed surveyors to request a quotation or coordinate field operations.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Info & Inquiry Form (Desktop Only) / Floating Trigger (Mobile Only) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            
            {/* Desktop form wrapper */}
            <div className="hidden lg:block h-full">
              <ScrollReveal variant="slide-up" className="h-full">
                <div className="bg-white/95 backdrop-blur-md rounded-[2.2rem] p-10 border border-gray-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full relative overflow-hidden">
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Send Us a Message</h3>
                    
                    {formSubmitted ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl flex flex-col items-center text-center animate-fade-in mb-6">
                        <CheckCircle2 className="w-12 h-12 text-[#20bc2e] mb-3 animate-bounce" />
                        <h4 className="font-extrabold text-lg mb-1">Inquiry Submitted Successfully!</h4>
                        <p className="text-xs text-emerald-700">Our geospatial consultation representative will contact you within 24 hours.</p>
                      </div>
                    ) : (
                      formElement(false)
                    )}
                  </div>

                  {/* Micro Info Contacts */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 mt-6 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-[#20bc2e]" />
                      <div className="text-[11px]">
                        <p className="font-bold text-gray-800">Phone Hotline</p>
                        <p>+88 01303 772216</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-[#20bc2e]" />
                      <div className="text-[11px]">
                        <p className="font-bold text-gray-800">Official Email</p>
                        <p>info@geospatialworks.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#20bc2e]" />
                      <div className="text-[11px]">
                        <p className="font-bold text-gray-800">Working Hours</p>
                        <p>Sat - Thu: 9 AM - 6 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Mobile Trigger Button instead of inline form */}
            <div className="block lg:hidden">
              <ScrollReveal variant="slide-up">
                <div className="bg-[#f4faf6] border border-[#20bc2e]/30 rounded-[2.2rem] p-8 shadow-[0_12px_30px_rgba(32,188,46,0.05)] text-center flex flex-col items-center relative overflow-hidden">
                  {/* Internal soft green ambient glow */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-[#20bc2e]/10 blur-2xl rounded-full pointer-events-none" />
                  
                  <h3 className="text-2xl font-black text-gray-950 mb-2 relative z-10">Have a Custom Project?</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-6 relative z-10 max-w-sm">
                    Connect with our technical surveyor team directly to set up grid controls, mapping datums, or coordinate volume reports.
                  </p>
                  
                  <button
                    onClick={() => setIsMobileFormOpen(true)}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-800 via-[#20bc2e] to-green-700 bg-[size:200%] hover:bg-right text-white font-extrabold text-xs uppercase tracking-widest shadow-[0_12px_30px_rgba(32,188,46,0.22)] active:scale-98 transition-all duration-500 flex items-center justify-center space-x-2.5 cursor-pointer relative z-10 animate-shimmer"
                  >
                    <MessageSquarePlus size={14} className="text-white" />
                    <span>Launch Project Inquiry</span>
                  </button>
                </div>
              </ScrollReveal>
            </div>

          </div>

          {/* Right Column: Address Details & Live Google Map */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Address Details Card */}
            <ScrollReveal variant="slide-up" delay={0.1}>
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-gray-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-[#20bc2e]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 mb-1">Corporate HQ Address</h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal mb-1">
                    64/1 (D1), Lake Circus, Kalabagan, Dhaka 1205, Bangladesh
                  </p>
                  <p className="text-[10px] font-mono text-emerald-600 font-bold">
                    Coordinates: 23.7430° N, 90.3789° E
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Google Map Container with Neon Glow */}
            <ScrollReveal variant="slide-up" delay={0.2} className="flex-grow h-full min-h-[250px]">
              <div className="relative rounded-[2rem] overflow-hidden border border-gray-200/80 shadow-lg h-full group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#20bc2e] to-[#0f6c17] rounded-[2.1rem] blur-xl opacity-[0.05] group-hover:opacity-20 transition-all duration-500 pointer-events-none" />
                
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.122822361661!2d90.3789467!3d23.7430034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b0e87d4681%3A0xe9bf8d4cf7b6bc30!2sLake%20Circus%20Rd%2C%20Dhaka%201205!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, minHeight: '250px' }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full object-cover filter grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                  title="Geospatial Works HQ Location Google Map"
                ></iframe>
              </div>
            </ScrollReveal>

          </div>

        </div>

      </div>

      {/* Mobile Bottom Sheet Popup Modal */}
      <AnimatePresence>
        {isMobileFormOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFormOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Sheet Card */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 w-full max-w-lg bg-[#f4faf6] rounded-t-[2.5rem] p-6 pb-8 border-t-[3px] border-[#20bc2e] shadow-[0_-15px_40px_rgba(32,188,46,0.1)] flex flex-col"
            >
              {/* Top notch indicator */}
              <div className="w-12 h-1 bg-emerald-900/10 rounded-full mx-auto mb-5" />

              {/* Close Button */}
              <button 
                onClick={() => setIsMobileFormOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white border border-[#20bc2e]/30 flex items-center justify-center text-[#20bc2e] hover:text-green-700 transition-colors cursor-pointer shadow-sm"
              >
                <X size={14} />
              </button>

              <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-950 to-emerald-800 mb-1 tracking-tight">Project Inquiry</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-5">
                Send details to request survey quotations.
              </p>

              {formSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl flex flex-col items-center text-center animate-fade-in my-4">
                  <CheckCircle2 className="w-12 h-12 text-[#20bc2e] mb-3 animate-bounce" />
                  <h4 className="font-extrabold text-lg mb-1">Submitted Successfully!</h4>
                  <p className="text-xs text-emerald-700">We will contact you within 24 hours.</p>
                </div>
              ) : (
                formElement(true)
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ContactSection;
