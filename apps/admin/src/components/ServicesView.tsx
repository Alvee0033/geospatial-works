'use client';

import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { ServiceItem } from './ServiceModal';

interface ServicesViewProps {
  services: ServiceItem[];
  loading: boolean;
  searchQuery: string;
  onOpenCreateModal: () => void;
  onOpenEditModal: (s: ServiceItem) => void;
  onDeleteService: (id: string, title: string) => void;
  onToggleActive: (s: ServiceItem) => void;
}

export function ServicesView({
  services,
  loading,
  searchQuery,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteService,
  onToggleActive,
}: ServicesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const set = new Set(services.map((s) => s.category));
    return ['All', ...Array.from(set)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.features || []).some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [services, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat === 'All' ? `All Services (${services.length})` : cat}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition shadow-2xs self-end sm:self-auto cursor-pointer"
        >
          <Plus size={14} /> Add Service
        </button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw size={24} className="animate-spin text-indigo-600" />
          <span className="text-xs font-semibold">Loading services from PostgreSQL...</span>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 space-y-3">
          <Sliders size={36} className="mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No services found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No engineering services matched your filter. Click "+ Add Service" to add one.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            + Add Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Image Header */}
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                  <img
                    src={svc.imageUrl || '/real-media/service-topographic-uav.png'}
                    alt={svc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/real-media/service-topographic-uav.png';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/95 text-indigo-700 shadow-sm backdrop-blur-xs">
                      {svc.category}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleActive(svc)}
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm backdrop-blur-xs ${
                      svc.isActive
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {svc.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    <span>{svc.isActive ? 'Active' : 'Draft'}</span>
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                    {svc.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {svc.description}
                  </p>

                  {svc.features && svc.features.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Capabilities:
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {svc.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 truncate">/{svc.slug}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenEditModal(svc)}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                  >
                    <Edit2 size={12} /> Edit
                  </button>

                  <button
                    onClick={() => onDeleteService(svc.id, svc.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Service"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

