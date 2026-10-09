import React from 'react';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#06170a] text-white pt-20 pb-8 px-6 md:px-12 text-xs relative border-t border-emerald-900/40">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-16 border-b border-white/10">
          {/* Company Bio */}
          <div className="lg:col-span-5">
            <div className="flex items-center space-x-3 mb-5">
              <img 
                src="/logo.png" 
                alt="Geospatial Works Logo" 
                width={64}
                height={64}
                loading="lazy"
                decoding="async"
                className="w-12 h-12 md:w-16 md:h-16 object-contain" 
              />
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-white text-lg tracking-tight">Geospatial Works</span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Empowering Decisions with Precision</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md">
              Leading geospatial consultancy offering expert services in digital surveying, mapping, GIS solutions, and remote sensing in Bangladesh.
            </p>
            <div className="flex items-center space-x-3">
              <a href="https://geospatialworks.com.bd" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-gray-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://geospatialworks.com.bd" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-gray-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="mailto:info@geospatialworks.com.bd" aria-label="Email" className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-gray-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-sm text-white mb-4">Our Services</h4>
              <ul className="space-y-2.5 text-gray-300">
                <li><a href="#expertise" className="hover:text-emerald-400 transition-colors">Digital Surveying</a></li>
                <li><a href="#expertise" className="hover:text-emerald-400 transition-colors">UAV Drone Mapping</a></li>
                <li><a href="#expertise" className="hover:text-emerald-400 transition-colors">Topographic Surveys</a></li>
                <li><a href="#expertise" className="hover:text-emerald-400 transition-colors">Bathymetry Surveys</a></li>
                <li><a href="#expertise" className="hover:text-emerald-400 transition-colors">GIS Development</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm text-white mb-4">Remote Sensing</h4>
              <ul className="space-y-2.5 text-gray-300">
                <li><a href="#expertise" className="hover:text-emerald-400 transition-colors">Satellite Processing</a></li>
                <li><a href="#expertise" className="hover:text-emerald-400 transition-colors">Image Classification</a></li>
                <li><a href="#expertise" className="hover:text-emerald-400 transition-colors">Change Detection</a></li>
                <li><a href="#expertise" className="hover:text-emerald-400 transition-colors">Land Cover Mapping</a></li>
              </ul>
            </div>
          </div>

          {/* Real Contact Info */}
          <div className="lg:col-span-4 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-white mb-4 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dhaka Office Address</span>
              </h4>
              <p className="text-gray-300 text-xs leading-relaxed mb-4">
                64/1 (D1), Lake Circus, Kalabagan,<br />Dhaka 1205, Bangladesh
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2 text-gray-300 text-xs">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">+88 01303 772216 / +88 01713 907779</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 text-xs">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>info@geospatialworks.com.bd</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-xs gap-4">
          <p>© {new Date().getFullYear()} Geospatial Works. All rights reserved.</p>
          <a href="https://geospatialworks.com.bd" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-emerald-400 hover:underline">
            <span>Official Website: geospatialworks.com.bd</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
