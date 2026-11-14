'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Trash2,
  Edit2,
  MapPin,
  Award,
  LayoutGrid,
  List,
  FolderKanban,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ServiceItem } from './ServiceModal';

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: string;
  location?: string;
  description: string;
  deliverables?: string;
  imageUrl?: string;
  isMilestone: boolean;
  sortOrder: number;
  isActive?: boolean;
  details?: { overview?: string; challenges?: string[]; approach?: string[]; results?: string[]; toolsUsed?: string[]; timeline?: string };
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectsViewProps {
  projects: ProjectItem[];
  services: ServiceItem[];
  loading: boolean;
  searchQuery: string;
  onOpenCreateModal: () => void;
  onOpenEditModal: (p: ProjectItem) => void;
  onDeleteProject: (id: string, title: string) => void;
  onToggleMilestone: (p: ProjectItem) => void;
}

// Semantic matching function to link project categories to service titles
export function matchesServiceOrCategory(projectCategory: string, filterName: string): boolean {
  if (filterName === 'All') return true;
  const pCat = (projectCategory || '').trim().toLowerCase();
  const fName = (filterName || '').trim().toLowerCase();

  if (pCat === fName) return true;
  if (pCat.includes(fName) || fName.includes(pCat)) return true;

  if (fName.includes('uav') || fName.includes('drone')) {
    return pCat.includes('uav') || pCat.includes('drone') || pCat.includes('photogrammetry');
  }
  if (fName.includes('hydrographic') || fName.includes('bathymetric') || fName.includes('water')) {
    return (
      pCat.includes('hydrographic') ||
      pCat.includes('water') ||
      pCat.includes('bathymetric') ||
      pCat.includes('river') ||
      pCat.includes('marine') ||
      pCat.includes('port')
    );
  }
  if (fName.includes('topographic') || fName.includes('land')) {
    return (
      pCat.includes('topographic') ||
      pCat.includes('land') ||
      pCat.includes('geodesy') ||
      pCat.includes('survey') ||
      pCat.includes('road')
    );
  }
  if (fName.includes('civil') || fName.includes('design') || fName.includes('feasibility')) {
    return (
      pCat.includes('civil') ||
      pCat.includes('design') ||
      pCat.includes('transit') ||
      pCat.includes('infrastructure') ||
      pCat.includes('bridge') ||
      pCat.includes('building') ||
      pCat.includes('architectural')
    );
  }
  if (fName.includes('gis')) {
    return pCat.includes('gis') || pCat.includes('spatial') || pCat.includes('network');
  }
  if (fName.includes('environmental') || fName.includes('coastal')) {
    return (
      pCat.includes('environmental') ||
      pCat.includes('coastal') ||
      pCat.includes('structural') ||
      pCat.includes('landfill')
    );
  }
  return false;
}

export function ProjectsView({
  projects,
  services,
  loading,
  searchQuery,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteProject,
  onToggleMilestone,
}: ProjectsViewProps) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [onlyMilestones, setOnlyMilestones] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic filter list based on live services and existing project categories
  const filterOptions = useMemo(() => {
    const list = ['All'];
    services.forEach((s) => {
      if (s.title && !list.includes(s.title)) list.push(s.title);
    });
    projects.forEach((p) => {
      if (p.category) {
        const alreadyCovered = list.some((item) => item !== 'All' && matchesServiceOrCategory(p.category, item));
        if (!alreadyCovered && !list.includes(p.category)) {
          list.push(p.category);
        }
      }
    });
    return list;
  }, [services, projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = matchesServiceOrCategory(p.category, selectedFilter);
      const matchesMilestone = !onlyMilestones || p.isMilestone;

      return matchesSearch && matchesCategory && matchesMilestone;
    });
  }, [projects, searchQuery, selectedFilter, onlyMilestones]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Side-Scrollable Clean Filter Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2.5">
        {/* Left Scroll Arrow */}
        <button
          onClick={scrollLeft}
          className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-500 hover:text-slate-800 transition flex-shrink-0 flex items-center justify-center shadow-2xs"
          title="Scroll left"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Scrollable Pills Container */}
        <div
          ref={scrollContainerRef}
          onWheel={(e) => {
            if (scrollContainerRef.current && e.deltaY !== 0) {
              scrollContainerRef.current.scrollLeft += e.deltaY;
            }
          }}
          className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 scroll-smooth flex-1 min-w-0"
        >
          {filterOptions.map((opt) => {
            const isSelected = selectedFilter === opt;
            const count =
              opt === 'All'
                ? projects.length
                : projects.filter((p) => matchesServiceOrCategory(p.category, opt)).length;

            return (
              <button
                key={opt}
                onClick={() => setSelectedFilter(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>{opt}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={scrollRight}
          className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-500 hover:text-slate-800 transition flex-shrink-0 flex items-center justify-center shadow-2xs"
          title="Scroll right"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>

        {/* Right Controls: Landmarks Toggle & View Mode */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200/80 flex-shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={onlyMilestones}
              onChange={(e) => setOnlyMilestones(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0"
            />
            <span>Landmarks</span>
          </label>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid / Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw size={24} className="animate-spin text-indigo-600" />
          <span className="text-xs font-semibold">Loading projects from PostgreSQL...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 space-y-3">
          <FolderKanban size={36} className="mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No projects found in this category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try selecting "All" or click "+ New Project" to add one under this discipline.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            + Add Project
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={p.imageUrl || '/inner/bridge-aerial.webp'}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/inner/bridge-aerial.webp';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs">
                      {p.category.split('&')[0].trim()}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleMilestone(p)}
                    className={`absolute top-3 right-3 p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm backdrop-blur-xs ${
                      p.isMilestone
                        ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                        : 'bg-white/90 text-slate-400 hover:text-amber-500 hover:bg-white'
                    }`}
                    title={p.isMilestone ? 'National Landmark (Click to toggle)' : 'Mark as National Landmark'}
                  >
                    <Award size={14} className={p.isMilestone ? 'fill-current' : ''} />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600">
                    <MapPin size={13} />
                    <span>{p.location || 'Bangladesh'}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2 leading-snug">
                    {p.title}
                  </h3>

                  <div className="text-xs font-medium text-slate-500">
                    <span className="font-semibold text-slate-700">Client:</span> {p.client}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {p.description}
                  </p>

                  {p.deliverables && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-600 block mb-0.5">Deliverables:</span>
                      <span className="line-clamp-2">{p.deliverables}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 truncate">/{p.slug}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenEditModal(p)}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                  >
                    <Edit2 size={12} /> Edit
                  </button>

                  <button
                    onClick={() => onDeleteProject(p.id, p.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Project"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-5">Project Landmark</th>
                  <th className="py-3 px-4">Client Authority</th>
                  <th className="py-3 px-4">Service Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Landmark</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl || '/inner/bridge-aerial.webp'}
                          alt=""
                          className="w-12 h-10 object-cover rounded-lg flex-shrink-0 bg-slate-100 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 truncate max-w-xs">{p.title}</h4>
                          <span className="font-mono text-[10px] text-slate-400">/{p.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 max-w-xs truncate">{p.client}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">{p.location || 'National'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onToggleMilestone(p)}
                        className={`p-1.5 rounded-lg transition ${
                          p.isMilestone ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <Award size={16} className={p.isMilestone ? 'fill-current' : ''} />
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => onOpenEditModal(p)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 text-indigo-600 font-bold rounded-lg border border-slate-200 text-xs shadow-2xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteProject(p.id, p.title)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
