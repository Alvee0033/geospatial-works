'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, Check, Headset, Menu, X, ArrowRight, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ConsultationModal from '@/components/ConsultationModal';

const Navbar = () => {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState({ code: 'EN', name: 'English', label: 'English', flag: '🇬🇧' });
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: 'EN', name: 'English', label: 'English', flag: '🇬🇧' },
    { code: 'BN', name: 'BN', label: 'বাংলা', flag: '🇧🇩' }
  ];

  const navItems = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'about', label: 'About Us', href: '/about' },
    { id: 'expertise', label: 'Our Expertise', href: '/expertise' },
    { id: 'blog', label: 'Blog', href: '/blog' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        (scrolled && !mobileMenuOpen) ? 'pt-3 px-4 md:px-8' : 'pt-0 px-0 md:px-6'
      }`}>
        <nav
          className={`pointer-events-auto flex items-center justify-between relative z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            (scrolled && !mobileMenuOpen)
              ? 'w-full max-w-[1020px] bg-[#f4faf6]/40 backdrop-blur-3xl border border-[#20bc2e]/20 shadow-[0_8px_32px_rgba(32,188,46,0.15),inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_1px_rgba(32,188,46,0.1)] py-0.5 px-6 rounded-[2.5rem] translate-y-1'
              : 'w-full max-w-[1440px] bg-transparent py-4 px-6 md:px-12 rounded-b-3xl border-b border-transparent'
          }`}
        >
          <Link 
            href="/"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <img 
              src="/logo.png" 
              alt="Logo" 
              width={64}
              height={64}
              fetchPriority="high"
              decoding="async"
              className="w-12 h-12 md:w-16 md:h-16 object-contain transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm md:text-base tracking-tight text-gray-900">
                Geospatial Works
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 text-xs md:text-[14px] font-medium">
            {navItems.map((item) => {
              const isActive = (item.id === 'home' && pathname === '/') || 
                               (item.id === 'about' && pathname === '/about') ||
                               (item.id === 'expertise' && pathname === '/expertise') ||
                               (item.id === 'blog' && pathname === '/blog');
              return (
                <Link
                  key={item.id}
                  href={item.id === 'home' && isHome ? "#home" : item.href}
                  onClick={(e) => {
                    if (item.id === 'home' && isHome) {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`relative px-4 py-2 font-semibold transition-all duration-300 rounded-full hover:scale-102 flex items-center justify-center ${
                    isActive ? 'text-white' : 'text-gray-700 hover:text-[#20bc2e]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-[#20bc2e] rounded-full -z-10 shadow-sm shadow-green-500/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            
            {/* Get Consultation Button (Desktop & Tablet) */}
            <button 
              onClick={() => setIsConsultationOpen(true)}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-300 text-xs font-semibold tracking-wide shadow-md hover:shadow-lg hover:scale-105 bg-[#122417] text-white border-green-900/40 hover:bg-[#1b3623] hover:border-green-600/50 cursor-pointer"
            >
              <Headset size={14} className="text-[#20bc2e]" />
              <span>Get Consultation</span>
            </button>

            {/* Language Selector Dropdown (Desktop & Tablet) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 border rounded-full px-3 py-1.5 transition-all duration-300 text-xs font-medium shadow-sm hover:shadow border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                <span className="text-sm">{currentLang.flag}</span>
                <span className="font-semibold text-xs">{currentLang.label}</span>
                <ChevronDown size={13} className={`text-gray-500 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-green-50/80 transition-colors ${
                        currentLang.code === lang.code ? 'font-bold text-[#20bc2e]' : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span className="text-sm">{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {currentLang.code === lang.code && <Check size={14} className="text-[#20bc2e]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stunning Mobile Menu Toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full bg-transparent text-gray-900 active:scale-95 transition-all cursor-pointer relative z-50"
              aria-label="Toggle Menu"
            >
              <motion.div animate={{ rotate: mobileMenuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                {mobileMenuOpen ? <X size={20} className="text-gray-900" /> : <Menu size={20} className="text-gray-900" />}
              </motion.div>
            </button>

          </div>
        </nav>
      </header>

      {/* Stunning Full-width Mobile Dropdown Menu (Underneath the Navbar) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 w-full bg-white/98 backdrop-blur-3xl border-b border-gray-100 shadow-[0_25px_50px_rgba(0,0,0,0.08)] pt-28 pb-8 px-6 lg:hidden z-40 pointer-events-auto"
          >
            <div className="w-full flex flex-col space-y-6 max-w-xl mx-auto">
              
              {/* Menu items */}
              <div className="flex flex-col space-y-3">
                <span className="text-[9px] font-black text-[#127a1b] uppercase tracking-widest border-b border-emerald-500/10 pb-2 mb-1">Navigation</span>
                
                {navItems.map((item) => {
                  const isActive = (item.id === 'home' && pathname === '/') || 
                                   (item.id === 'about' && pathname === '/about') ||
                                   (item.id === 'expertise' && pathname === '/expertise') ||
                                   (item.id === 'blog' && pathname === '/blog');
                  return (
                    <Link
                      key={item.id}
                      href={item.id === 'home' && isHome ? "#home" : item.href}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (item.id === 'home' && isHome) {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={`group flex items-center justify-between text-base font-black transition-all py-2.5 px-4 rounded-xl relative overflow-hidden ${
                        isActive ? 'text-[#127a1b]' : 'text-gray-900 hover:text-[#20bc2e]'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activePillMobile"
                          className="absolute inset-0 bg-gradient-to-r from-[#f4faf6] to-[#f4faf6]/10 border-l-[3px] border-[#20bc2e] rounded-xl -z-10"
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                      <ArrowRight size={14} className={`transition-all transform relative z-10 ${
                        isActive ? 'opacity-100 translate-x-0 text-[#20bc2e]' : 'opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 text-[#20bc2e]'
                      }`} />
                    </Link>
                  );
                })}

                <Link
                  href="/#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center justify-between text-base font-black text-gray-900 hover:text-[#20bc2e] transition-colors py-2.5 px-4"
                >
                  <span>Contact</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-[#20bc2e] transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                </Link>
              </div>

              {/* Dropdown Footer Area */}
              <div className="space-y-4 pt-5 border-t border-emerald-500/10">
                {/* Get Consultation Button (Mobile) */}
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsConsultationOpen(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-green-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  <Headset size={14} />
                  <span>Get Consultation</span>
                </button>

                {/* Mobile language selector */}
                <div className="flex items-center justify-between bg-white border border-emerald-500/10 rounded-xl p-3.5 shadow-[0_4px_15px_rgba(0,0,0,0.01)]">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Globe size={12} className="text-[#20bc2e]" />
                    Language
                  </span>
                  <div className="flex space-x-1.5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setCurrentLang(lang)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                          currentLang.code === lang.code
                            ? 'bg-emerald-800 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {lang.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/15 backdrop-blur-[2px] z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Reusable Consultation Form Popup Modal */}
      <ConsultationModal 
        isOpen={isConsultationOpen} 
        onClose={() => setIsConsultationOpen(false)} 
      />
    </>
  );
};

export default Navbar;
