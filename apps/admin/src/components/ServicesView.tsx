'use client';

import React, { useState, useMemo } from 'react';
import { Sliders, Plus, Trash2, Edit2, RefreshCw, Layers } from 'lucide-react';
import { ServiceItem } from './ServiceModal';
import { Button, Badge, Card, PageHeader, SearchFilterBar, EmptyState } from './ui';

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
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const query = (localSearch || searchQuery).trim().toLowerCase();

  const categories = useMemo(() => {
    const set = new Set(services.map((s) => s.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [services]);

  const filtered = useMemo(() => {
    return services
      .filter((s) => {
        const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
        const matchesQuery =
          !query ||
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query);
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  }, [services, selectedCategory, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services & Capabilities"
        description={`${services.length} engineering & geospatial service offerings`}
        actions={
          <Button onClick={onOpenCreateModal} icon={<Plus size={15} />}>
            Add Service
          </Button>
        }
      />

      <SearchFilterBar
        search={localSearch}
        onSearchChange={setLocalSearch}
        searchPlaceholder="Search services by title, category, or description..."
        filters={categories.map((c) => ({
          label: c,
          value: c,
          count: c === 'All' ? services.length : services.filter((s) => s.category === c).length,
        }))}
        activeFilter={selectedCategory}
        onFilterChange={setSelectedCategory}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <RefreshCw size={24} className="animate-spin mr-2" />
          <span className="text-sm font-medium">Loading services...</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Sliders size={22} />}
          title="No services found"
          description="Adjust your search filter or create a new service offering."
          action={
            <Button onClick={onOpenCreateModal} icon={<Plus size={15} />}>
              Add Service
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((service) => (
            <Card key={service.id} padding="none" className="flex flex-col overflow-hidden hover:border-indigo-300 transition">
              <div onClick={() => onOpenEditModal(service)} className="cursor-pointer">
                {service.imageUrl ? (
                  <div className="aspect-video bg-slate-100 overflow-hidden border-b border-slate-100">
                    <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-300">
                    <Layers size={28} />
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="brand">{service.category}</Badge>
                  <button
                    type="button"
                    onClick={() => onToggleActive(service)}
                    className="cursor-pointer"
                    title="Toggle active status"
                  >
                    <Badge variant={service.isActive ? 'success' : 'neutral'}>
                      {service.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{service.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400">Order #{service.sortOrder ?? 0}</span>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => onOpenEditModal(service)} icon={<Edit2 size={13} />}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => onDeleteService(service.id, service.title)}
                      icon={<Trash2 size={13} />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
