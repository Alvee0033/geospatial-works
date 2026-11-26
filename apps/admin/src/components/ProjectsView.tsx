'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, Edit2, MapPin, Award, LayoutGrid, List, FolderKanban, RefreshCw, Plus } from 'lucide-react';
import { ServiceItem } from './ServiceModal';
import { Button, Badge, Card, PageHeader, SearchFilterBar, EmptyState } from './ui';

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

export function ProjectsView({
  projects,
  loading,
  searchQuery,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteProject,
  onToggleMilestone,
}: ProjectsViewProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const query = (localSearch || searchQuery).trim().toLowerCase();

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesQuery =
          !query ||
          p.title.toLowerCase().includes(query) ||
          p.client.toLowerCase().includes(query) ||
          (p.location || '').toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query);
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  }, [projects, selectedCategory, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects & Portfolio"
        description={`${projects.length} total engineering & geospatial projects`}
        actions={
          <Button onClick={onOpenCreateModal} icon={<Plus size={15} />}>
            Add Project
          </Button>
        }
      />

      <SearchFilterBar
        search={localSearch}
        onSearchChange={setLocalSearch}
        searchPlaceholder="Search projects by title, client, location, or category..."
        filters={categories.map((c) => ({
          label: c,
          value: c,
          count: c === 'All' ? projects.length : projects.filter((p) => p.category === c).length,
        }))}
        activeFilter={selectedCategory}
        onFilterChange={setSelectedCategory}
        rightSlot={
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <RefreshCw size={24} className="animate-spin mr-2" />
          <span className="text-sm font-medium">Loading projects...</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={22} />}
          title="No projects found"
          description="Adjust your search filter or add a new project."
          action={
            <Button onClick={onOpenCreateModal} icon={<Plus size={15} />}>
              Add Project
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <Card key={project.id} padding="none" className="flex flex-col overflow-hidden hover:border-indigo-300 transition">
              {project.imageUrl ? (
                <div className="aspect-video bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-300">
                  <FolderKanban size={28} />
                </div>
              )}

              <div onClick={() => onOpenEditModal(project)} className="p-5 flex-1 flex flex-col gap-3 cursor-pointer">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="brand">{project.category}</Badge>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMilestone(project);
                    }}
                    className="cursor-pointer"
                    title="Toggle milestone status"
                  >
                    <Badge variant={project.isMilestone ? 'warning' : 'neutral'}>
                      <Award size={11} />
                      {project.isMilestone ? 'Milestone' : 'Standard'}
                    </Badge>
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{project.title}</h3>
                  <p className="text-xs font-medium text-indigo-600 mt-0.5 line-clamp-1">{project.client}</p>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{project.description}</p>
                </div>

                {project.location && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin size={12} className="shrink-0 text-slate-400" />
                    <span className="truncate">{project.location}</span>
                  </div>
                )}
              </div>

              <div className="px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditModal(project);
                  }}
                  icon={<Edit2 size={13} />}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id, project.title);
                  }}
                  icon={<Trash2 size={13} />}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filtered.map((project) => (
              <div key={project.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                    {project.imageUrl ? (
                      <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <FolderKanban size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{project.title}</h3>
                      <Badge variant="brand">{project.category}</Badge>
                      {project.isMilestone && <Badge variant="warning">Milestone</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {project.client}
                      {project.location ? ` · ${project.location}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => onOpenEditModal(project)} icon={<Edit2 size={13} />}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => onDeleteProject(project.id, project.title)}
                    icon={<Trash2 size={13} />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
