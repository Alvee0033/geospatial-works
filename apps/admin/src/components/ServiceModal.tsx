'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Sliders,
  FileText,
  Image as ImageIcon,
  Wrench,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { MediaAssetField } from './MediaAssetField';
import { Button, Input, Textarea, FormField, Badge, Card, LineListInput } from './ui';

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  details?: { lead?: string; equipment?: string[]; standards?: string[]; benefits?: string[]; overviewTitle?: string; equipmentTitle?: string; benefitsTitle?: string; standardsTitle?: string };
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  formTitle: string;
  setFormTitle: (v: string) => void;
  formSlug: string;
  setFormSlug: (v: string) => void;
  formCategory: string;
  setFormCategory: (v: string) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
  formFeatures: string;
  setFormFeatures: (v: string) => void;
  formLead: string;
  setFormLead: (v: string) => void;
  formEquipment: string;
  setFormEquipment: (v: string) => void;
  formStandards: string;
  setFormStandards: (v: string) => void;
  formBenefits: string;
  setFormBenefits: (v: string) => void;
  formHeadings: { overviewTitle: string; equipmentTitle: string; benefitsTitle: string; standardsTitle: string };
  onHeadingChange: (field: keyof ServiceModalProps['formHeadings'], value: string) => void;
  formImageUrl: string;
  setFormImageUrl: (v: string) => void;
  formSortOrder: number;
  setFormSortOrder: (v: number) => void;
  formIsActive: boolean;
  setFormIsActive: (v: boolean) => void;
  onOpenMediaPicker: () => void;
}

export function ServiceModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formTitle,
  setFormTitle,
  formSlug,
  setFormSlug,
  formCategory,
  setFormCategory,
  formDescription,
  setFormDescription,
  formFeatures,
  setFormFeatures,
  formLead,
  setFormLead,
  formEquipment,
  setFormEquipment,
  formStandards,
  setFormStandards,
  formBenefits,
  setFormBenefits,
  formHeadings,
  onHeadingChange,
  formImageUrl,
  setFormImageUrl,
  formSortOrder,
  setFormSortOrder,
  formIsActive,
  setFormIsActive,
  onOpenMediaPicker,
}: ServiceModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic');

  if (!isOpen) return null;

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
                <Badge variant="brand">{isEditing ? 'Edit Service' : 'New Service'}</Badge>
                <Badge variant={formIsActive ? 'success' : 'neutral'}>
                  {formIsActive ? 'Active' : 'Hidden'}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 truncate">
                {formTitle || (isEditing ? 'Edit Service' : 'Add New Service')}
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
              <Sliders size={14} />
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
              <span>2. Specifications &amp; Details Page</span>
            </button>
          </div>

          {/* Scrollable Form Cards */}
          <form id="service-form" onSubmit={onSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {activeTab === 'basic' ? (
              <>
                <Card padding="md" className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Sliders size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Service Identity</h4>
                      <p className="text-[11px] text-slate-500">Title, category grouping, display order, and slug</p>
                    </div>
                  </div>

                  <FormField label="Service Title" required>
                    <Input
                      required
                      placeholder="Enter service title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField label="Category" required>
                      <Input
                        required
                        placeholder="e.g. Geospatial & GIS"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      />
                    </FormField>

                    <FormField label="URL Slug" hint="Auto-generated if empty">
                      <Input
                        placeholder="service-url-slug"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </FormField>

                    <FormField label="Display Order">
                      <Input
                        type="number"
                        value={formSortOrder}
                        onChange={(e) => setFormSortOrder(Number(e.target.value) || 0)}
                      />
                    </FormField>
                  </div>
                </Card>

                <Card padding="md" className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Sparkles size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Overview &amp; Deliverables</h4>
                      <p className="text-[11px] text-slate-500">Summary paragraph and key service features</p>
                    </div>
                  </div>

                  <FormField label="Service Overview">
                    <Textarea
                      rows={4}
                      placeholder="Write a concise overview of this service..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Key Capabilities &amp; Features">
                    <LineListInput
                      value={formFeatures}
                      onChange={setFormFeatures}
                      placeholder="Add a capability or deliverable..."
                      addLabel="Add Feature"
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
                      <p className="text-[11px] text-slate-500">Primary visual shown on cards and the service page</p>
                    </div>
                  </div>

                  <MediaAssetField
                    label="Service Cover Photo"
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
                      <FileText size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Details Page Introduction</h4>
                      <p className="text-[11px] text-slate-500">Opening lead statement on `/services/[slug]`</p>
                    </div>
                  </div>

                  <FormField label="Introduction Statement">
                    <Textarea
                      rows={4}
                      placeholder="Write an introduction for the service details page..."
                      value={formLead}
                      onChange={(e) => setFormLead(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Overview heading" hint="Heading above the service description">
                    <Input value={formHeadings.overviewTitle} onChange={(e) => onHeadingChange('overviewTitle', e.target.value)} placeholder="Service overview" />
                  </FormField>
                </Card>

                <Card padding="md" className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Wrench size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Equipment &amp; Standards</h4>
                      <p className="text-[11px] text-slate-500">Hardware deployed and regulatory standards followed</p>
                    </div>
                  </div>

                  <FormField label="Equipment &amp; Instruments">
                    <LineListInput
                      value={formEquipment}
                      onChange={setFormEquipment}
                      pillMode
                      placeholder="Add an instrument or system..."
                      addLabel="Add Item"
                    />
                  </FormField>
                  <FormField label="Equipment heading"><Input value={formHeadings.equipmentTitle} onChange={(e) => onHeadingChange('equipmentTitle', e.target.value)} placeholder="Equipment we use" /></FormField>

                  <FormField label="Standards &amp; Compliance">
                    <LineListInput
                      value={formStandards}
                      onChange={setFormStandards}
                      placeholder="Add a standard or guideline..."
                      addLabel="Add Standard"
                    />
                  </FormField>
                  <FormField label="Standards heading"><Input value={formHeadings.standardsTitle} onChange={(e) => onHeadingChange('standardsTitle', e.target.value)} placeholder="Our standards" /></FormField>
                </Card>

                <Card padding="md" className="space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Client Outcomes &amp; Benefits</h4>
                      <p className="text-[11px] text-slate-500">Key value delivered to project stakeholders</p>
                    </div>
                  </div>

                  <FormField label="Client Benefits">
                    <LineListInput
                      value={formBenefits}
                      onChange={setFormBenefits}
                      placeholder="Add a client benefit..."
                      addLabel="Add Benefit"
                    />
                  </FormField>
                  <FormField label="Benefits heading"><Input value={formHeadings.benefitsTitle} onChange={(e) => onHeadingChange('benefitsTitle', e.target.value)} placeholder="Why work with us" /></FormField>
                </Card>
              </>
            )}
          </form>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
              />
              Visible on website
            </label>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" form="service-form" icon={<Check size={14} />}>
                {isEditing ? 'Save Changes' : 'Create Service'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
