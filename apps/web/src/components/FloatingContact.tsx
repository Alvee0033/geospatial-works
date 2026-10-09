'use client';
import React, { useState } from 'react';
import { MessageSquareText, Phone, Mail, X, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SupportChatbot from './SupportChatbot';

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const contactOptions = [
    {
      id: 'support',
      icon: <Headset size={18} />,
      label: 'Online Support',
      href: '#chat',
      bg: 'bg-emerald-700 hover:bg-emerald-800',
    },
    {
      id: 'phone',
      icon: <Phone size={18} />,
      label: 'Call Us',
      href: 'tel:+8801303772216',
      bg: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'whatsapp',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.739-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97-1.861-1.867-4.333-2.897-6.977-2.898-5.443 0-9.87 4.373-9.875 9.803-.002 1.812.481 3.582 1.4 5.16l-.992 3.626 3.74-.973zm8.397-5.32c-.3-.15-1.776-.877-2.05-.976-.275-.1-.476-.15-.676.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.485-.892-.793-1.493-1.771-1.668-2.07-.175-.3-.018-.463.13-.61.134-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.625-.926-2.225-.244-.589-.493-.51-.676-.519-.174-.01-.374-.012-.574-.012-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.11 3.22 5.11 4.52.714.31 1.27.496 1.703.633.717.228 1.37.196 1.885.119.575-.087 1.776-.726 2.025-1.427.25-.7.25-1.3.175-1.426-.075-.125-.275-.2-.575-.35z" />
        </svg>
      ),
      label: 'WhatsApp',
      href: 'https://wa.me/8801303772216',
      bg: 'bg-[#25D366] hover:bg-[#20ba56]',
    },
    {
      id: 'email',
      icon: <Mail size={18} />,
      label: 'Email Us',
      href: 'mailto:info@geospatialworks.com',
      bg: 'bg-red-500 hover:bg-red-600',
    },
  ];

  return (
    <div 
      className="fixed right-5 sm:right-8 z-[999] flex flex-col items-center pointer-events-auto select-none"
      style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      
      {/* Speed Dial Menu Options */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-center space-y-3.5 mb-3.5">
            {contactOptions.map((opt, idx) => (
              <motion.a
                key={opt.id}
                href={opt.href}
                target={opt.href.startsWith('http') ? '_blank' : undefined}
                rel={opt.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  if (opt.href === '#chat') {
                    e.preventDefault();
                    setIsOpen(false);
                    setIsChatOpen(true);
                  } else if (opt.href.startsWith('#')) {
                    e.preventDefault();
                    setIsOpen(false);
                    document.getElementById(opt.href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ delay: (contactOptions.length - 1 - idx) * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center w-11 h-11 ${opt.bg} text-white rounded-full shadow-lg border border-white/10 relative group/btn`}
                aria-label={opt.label}
              >
                {opt.icon}
                
                {/* Text Label on Hover */}
                <span className="absolute right-14 px-2.5 py-1 bg-gray-900/90 text-white text-[10px] font-bold rounded-md shadow-md opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {opt.label}
                </span>
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-[#20bc2e] hover:bg-[#1fa92a] text-white rounded-full shadow-[0_10px_30px_rgba(32,188,46,0.35)] cursor-pointer border border-[#20bc2e]/30 group relative"
        aria-label="Toggle Contact Menu"
      >
        {/* Pulsing visual ring - hidden when open */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full border-2 border-[#20bc2e] pointer-events-none animate-ping opacity-25 group-hover:animate-none" />
        )}
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="flex items-center justify-center"
        >
          {isOpen ? <X size={22} /> : <MessageSquareText size={24} />}
        </motion.div>
      </motion.button>

      {/* AI Support Chatbot */}
      <SupportChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default FloatingContact;
