'use client';
import React from 'react';
import { X, Cpu, ShieldCheck, Activity, Layers } from 'lucide-react';

const ServiceDetailsModal = ({ card, onClose }: { card: any, onClose: any }) => {
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[#0d1610] border border-green-500/30 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden text-white p-6 md:p-8">
        {/* Glowing Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#20bc2e]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors text-white"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#20bc2e]/20 border border-[#20bc2e]/40 flex items-center justify-center text-[#20bc2e]">
            {card.icon}
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#20bc2e]">
              SERVICE DETAILS // {card.code}
            </span>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">{card.title}</h3>
          </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-6 border-b border-gray-800 pb-4">
          {card.description}
        </p>

        {/* Grid Specs in Plain English */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-[#20bc2e] text-xs font-semibold mb-1">
              <Cpu size={14} />
              <span>Equipment & Technology</span>
            </div>
            <p className="text-white text-sm font-medium">{card.specs.instrumentation}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-[#20bc2e] text-xs font-semibold mb-1">
              <ShieldCheck size={14} />
              <span>Accuracy & Precision</span>
            </div>
            <p className="text-white text-sm font-medium">{card.specs.accuracy}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-[#20bc2e] text-xs font-semibold mb-1">
              <Activity size={14} />
              <span>Official Standards</span>
            </div>
            <p className="text-white text-sm font-medium">{card.specs.standards}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-[#20bc2e] text-xs font-semibold mb-1">
              <Layers size={14} />
              <span>Key Deliverables</span>
            </div>
            <p className="text-white text-sm font-medium">{card.specs.deliverables}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
          <span className="text-xs text-gray-500 font-mono">SOB Network Tied • ISO Certified</span>
          <button 
            onClick={() => {
              onClose();
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#20bc2e] hover:bg-[#1ca829] text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-lg shadow-green-500/20"
          >
            Inquire About This Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
