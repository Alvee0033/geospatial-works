'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  FileText,
  Layers,
  Building2,
  Image as ImageIcon,
  Target,
  Wrench,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ServiceItem } from './ServiceModal';
import { MediaAssetField } from './MediaAssetField';
import { DisplayOrderPicker, OrderItem } from './DisplayOrderPicker';
import { Button, Input, Textarea, FormField, Badge, Card, LineListInput, TimelineRangeInput } from './ui';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  services: ServiceItem[];
  orderItems: OrderItem[];
  currentId?: string;
  formTitle: string;
  setFormTitle: (v: string) => void;
  formSlug: string;
  setFormSlug: (v: string) => void;
  formClient: string;
  setFormClient: (v: string) => void;
  formCategory: string;
  setFormCategory: (v: string) => void;
  formLocation: string;
  setFormLocation: (v: string) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
  formDeliverables: string;
  setFormDeliverables: (v: string) => void;
  detailFields: {
    overview: string;
    challenges: string;
    approach: string;
    results: string;
    toolsUsed: string;
    timeline: string;
  };
  onDetailChange: (field: keyof ProjectModalProps['detailFields'], value: string) => void;
  formImageUrl: string;
  setFormImageUrl: (v: string) => void;
  formIsMilestone: boolean;
  setFormIsMilestone: (v: boolean) => void;
  formIsActive: boolean;
  setFormIsActive: (v: boolean) => void;
  formSortOrder: number;
  setFormSortOrder: (v: number) => void;
  onOpenMediaPicker: () => void;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  services,
  orderItems,
  currentId,
  formTitle,
  setFormTitle,
  formSlug,
  setFormSlug,
  formClient,
  setFormClient,
  formCategory,
  setFormCategory,
  formLocation,
  setFormLocation,
  formDescription,
  setFormDescription,
  formDeliverables,
  setFormDeliverables,
  detailFields,
  onDetailChange,
  formImageUrl,
  setFormImageUrl,
  formIsMilestone,
  setFormIsMilestone,
  formIsActive,
  setFormIsActive,
  formSortOrder,
  setFormSortOrder,
  onOpenMediaPicker,
}: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic');

  if (!isOpen) return null;

  const serviceOptions = services.map((service) => service.title);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-3xl bg-slate-50 shadow-2xl flex flex-col h-full border-l border-slate-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-white shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="brand">{isEditing ? 'Edit Project' : 'New Project'}</Badge>
                <Badge variant={formIsActive ? 'success' : 'neutral'}>
                  {formIsActive ? 'Published' : 'Hidden'}
                </Badge>
                {formIsMilestone && <Badge variant="warning">Milestone</Badge>}
              </div>
              <h3 className="text-base font-bold text-slate-900 truncate">
                {formTitle || (isEditing ? 'Update Project' : 'Create New Project')}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center border-b border-slate-200 px-6 bg-white gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                activeTab === 'basic'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers size={14} />
              <span>1. Basic Information &amp; Media</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText size={14} />
              <span>2. Case Study &amp; Details Page</span>
            </button>
          </div>

          {/* Scrollable Form Cards */}
          <form id="project-form" onSubmit={onSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {activeTab === 'basic' ? (
              <>
                <Card padding="md" className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Building2 size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Identity &amp; Attribution</h4>
                      <p className="text-[11px] text-slate-500">Title, client authority, location, and URL routing</p>
                    </div>
                  </div>

                  <FormField label="Project Title" required>
                    <Input
                      required
                      placeholder="Enter project title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Client / Authority" required>
                      <Input
                        required
                        placeholder="Enter client name"
                        value={formClient}
                        onChange={(e) => setFormClient(e.target.value)}
                      />
                    </FormField>

                    <FormField label="Location / District">
                      <Input
                        placeholder="e.g. Dhaka, Bangladesh"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                      />
                    </FormField>

                    <FormField label="Project Category" required hint="Choose an existing service or enter a category">
                      <Input required list="project-service-categories" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="Enter a category" />
                      <datalist id="project-service-categories">{serviceOptions.map((option) => <option key={option} value={option} />)}</datalist>
                    </FormField>

                    <FormField label="URL Slug" hint="Auto-generated if blank">
                      <Input
                        placeholder="project-url-slug"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </FormField>
                    <FormField label="Display order">
                      <DisplayOrderPicker items={orderItems} currentId={currentId} currentTitle={formTitle} position={formSortOrder} onChange={setFormSortOrder} />
                    </FormField>
                  </div>
                </Card>

                <Card padding="md" className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FileText size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Scope Summary &amp; Deliverables</h4>
                      <p className="text-[11px] text-slate-500">Shown on portfolio cards and the top summary</p>
                    </div>
                  </div>

                  <FormField label="Project Description">
                    <Textarea
                      rows={4}
                      placeholder="Write a clear summary of project objectives and scope..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Key Deliverables" hint="Add deliverables shown as tags">
                    <LineListInput
                      value={formDeliverables}
                      onChange={setFormDeliverables}
                      separator=","
                      pillMode
                      placeholder="Type a deliverable and press Enter..."
                      addLabel="Add"
                    />
                  </FormField>
                </Card>

                <Card padding="md" className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ImageIcon size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Cover Media</h4>
                      <p className="text-[11px] text-slate-500">Primary image for cards and case study hero</p>
                    </div>
                  </div>

                  <MediaAssetField
                    label="Project Cover Photo"
                    value={formImageUrl}
                    onChoose={onOpenMediaPicker}
                    onRemove={() => setFormImageUrl('')}
                  />
                </Card>
              </>
            ) : (
              <>
                <Card padding="md" className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Clock size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Overview &amp; Timeline</h4>
                      <p className="text-[11px] text-slate-500">Header narrative and execution schedule on the project page</p>
                    </div>
                  </div>

                  <FormField label="Execution Timeline">
                    <TimelineRangeInput
                      value={detailFields.timeline}
                      onChange={(v) => onDetailChange('timeline', v)}
                    />
                  </FormField>

                  <FormField label="Detailed Project Overview">
                    <Textarea
                      rows={4}
                      placeholder="Provide the detailed project background, site context, and technical goals..."
                      value={detailFields.overview}
                      onChange={(e) => onDetailChange('overview', e.target.value)}
                    />
                  </FormField>
                </Card>

                <Card padding="md" className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Target size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Challenges &amp; Methodology</h4>
                      <p className="text-[11px] text-slate-500">Site constraints and how our engineering team solved them</p>
                    </div>
                  </div>

                  <FormField label="Key Challenges">
                    <LineListInput
                      value={detailFields.challenges}
                      onChange={(v) => onDetailChange('challenges', v)}
                      placeholder="Add a project challenge..."
                      addLabel="Add Challenge"
                    />
                  </FormField>

                  <FormField label="Technical Approach">
                    <LineListInput
                      value={detailFields.approach}
                      onChange={(v) => onDetailChange('approach', v)}
                      placeholder="Add a methodology step..."
                      addLabel="Add Step"
                    />
                  </FormField>
                </Card>

                <Card padding="md" className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Outcomes &amp; Software / Equipment</h4>
                      <p className="text-[11px] text-slate-500">Verified results and tools deployed for delivery</p>
                    </div>
                  </div>

                  <FormField label="Verified Results &amp; Outcomes">
                    <LineListInput
                      value={detailFields.results}
                      onChange={(v) => onDetailChange('results', v)}
                      placeholder="Add a project outcome..."
                      addLabel="Add Result"
                    />
                  </FormField>

                  <FormField label="Tools &amp; Instruments Used">
                    <LineListInput
                      value={detailFields.toolsUsed}
                      onChange={(v) => onDetailChange('toolsUsed', v)}
                      pillMode
                      placeholder="Add a tool or instrument..."
                      addLabel="Add Tool"
                    />
                  </FormField>
                </Card>
              </>
            )}
          </form>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                />
                Visible on site
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsMilestone}
                  onChange={(e) => setFormIsMilestone(e.target.checked)}
                  className="rounded text-amber-600 w-4 h-4 cursor-pointer"
                />
                Milestone project
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" form="project-form" icon={<Check size={14} />}>
                {isEditing ? 'Save Changes' : 'Create Project'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
