"use client";

import React, { useState, useRef } from 'react';
import { 
  Save, 
  Eye, 
  Check, 
  Layers, 
  Compass, 
  Info, 
  Phone, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Video, 
  Image as ImageIcon,
  X,
  FileCheck
} from 'lucide-react';

interface ExpertiseItem {
  id: number;
  title: string;
  category: string;
  description: string;
  instrumentation: string;
  image: string;
  tags: string[];
}

const initialExpertiseItems: ExpertiseItem[] = [
  { id: 1, title: 'Topographical Survey', category: 'digital-surveying', description: 'Accurate 3D terrain and elevation mapping for land development and construction planning.', instrumentation: 'Total Station & RTK GNSS Receiver', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800', tags: ['3D Terrain', 'Elevation Maps', 'CAD Ready'] },
  { id: 2, title: 'UAV Drone Aerial Survey', category: 'digital-surveying', description: 'High-resolution aerial photography, 3D surface models, and large-area drone mapping.', instrumentation: 'UAV Drones & High-Res Camera Sensors', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800', tags: ['Aerial Photos', '3D Models', 'Drone Mapping'] },
  { id: 3, title: 'Mouza & Boundary Survey', category: 'mapping-gis', description: 'Digital Mouza map conversion and exact land boundary verification for legal peace of mind.', instrumentation: 'Calibrated Map Digitizers & GNSS Boundary Pins', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800', tags: ['Mouza Maps', 'Boundary Limits', 'Legal Verification'] },
  { id: 4, title: 'Bathymetric Hydro Survey', category: 'digital-surveying', description: 'Underwater depth mapping and waterbed profiling for rivers, lakes, and coastal projects.', instrumentation: 'Hydrographic Echo Sounder & GPS Vessel', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800', tags: ['Underwater Depth', 'River Channels', 'Dredging Volume'] },
];

export default function PageEditorAdmin() {
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'services' | 'contact'>('hero');
  const [saveToast, setSaveToast] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // File Upload State for Hero Video & Photo
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const servicePhotoInputRef = useRef<HTMLInputElement>(null);

  const [heroForm, setHeroForm] = useState({
    headline: 'High-Precision GIS Surveying & Spatial Analytics in Bangladesh',
    subheadline: 'Sub-centimeter topographical surveying, UAV drone photogrammetry, and certified land valuation aligned with the Survey of Bangladesh (SOB) Geodetic Network.',
    primaryCtaText: 'Get Free Consultation',
    secondaryCtaText: 'Explore Core Services',
    videoFileName: 'hero-survey-background.mp4',
    photoFileName: 'hero-surveyor-cover.jpg',
    videoPreview: 'https://cdn.pixabay.com/video/2021/04/12/70891-537446549_large.mp4',
    photoPreview: '/about_surveyor_arch.png'
  });

  const [aboutForm, setAboutForm] = useState({
    title: 'Transforming Bangladesh’s Terrain with Precise Geospatial Consultancy',
    body: 'Geospatial Works is a leading consultancy specializing in high-quality geospatial services using ArcGIS, QGIS, RTK GNSS, Total Stations, and UAV Drones across all 64 districts.',
    projectStat: '50+'
  });

  const [contactForm, setContactForm] = useState({
    phone: '+8801303772216',
    email: 'info@geospatialworks.com',
    hours: 'Monday – Friday, 9:00 AM – 6:00 PM (EST)',
    address: 'House #12, Road #04, Block #B, Banani, Dhaka-1213, Bangladesh'
  });

  const [expertiseItems, setExpertiseItems] = useState<ExpertiseItem[]>(initialExpertiseItems);
  const [editingService, setEditingService] = useState<ExpertiseItem | null>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroForm(prev => ({
        ...prev,
        videoFileName: file.name,
        videoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroForm(prev => ({
        ...prev,
        photoFileName: file.name,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleServicePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingService) {
      const newUrl = URL.createObjectURL(file);
      setEditingService({ ...editingService, image: newUrl });
    }
  };

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleAddService = () => {
    const newItem: ExpertiseItem = {
      id: Date.now(),
      title: 'New Service Name',
      category: 'digital-surveying',
      description: 'Service description details...',
      instrumentation: 'Total Station & RTK GNSS',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      tags: ['New Spec']
    };
    setExpertiseItems([...expertiseItems, newItem]);
    setEditingService(newItem);
  };

  const handleDeleteService = (id: number) => {
    setExpertiseItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-gray-800 flex items-center space-x-2 text-xs font-bold animate-in fade-in duration-300">
          <Check size={16} className="text-emerald-400" />
          <span>Page Changes Saved & Updated!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Website Page Editor</h1>
          <p className="text-xs text-gray-500 mt-1">Update hero media, text, core services, and contact information.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setPreviewOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-colors border border-gray-200 cursor-pointer"
          >
            <Eye size={15} />
            <span>Preview</span>
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center space-x-2 px-4.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Save size={15} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Section Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'hero' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          <Layers size={15} />
          <span>Hero Section Media & Text</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'about' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          <Info size={15} />
          <span>About Section</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'services' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          <Compass size={15} />
          <span>Core Services ({expertiseItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'contact' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          <Phone size={15} />
          <span>Footer & Contact Details</span>
        </button>
      </div>

      {/* Tab 1: Hero Section */}
      {activeTab === 'hero' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Hero Text & Media File Uploads</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Main Headline</label>
              <input
                type="text"
                value={heroForm.headline}
                onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition-all font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Sub-headline</label>
              <textarea
                rows={3}
                value={heroForm.subheadline}
                onChange={(e) => setHeroForm({ ...heroForm, subheadline: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition-all resize-none"
              />
            </div>

            {/* Direct File Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              
              {/* Hero Video Upload */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
                <div className="flex items-center space-x-2">
                  <Video size={18} className="text-emerald-700" />
                  <span className="text-xs font-bold text-gray-900">Background Video File Upload</span>
                </div>
                
                <p className="text-[11px] text-gray-500">Upload a background video (.mp4 or .webm file).</p>
                
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  accept="video/mp4,video/webm"
                  className="hidden"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-mono text-gray-700 truncate max-w-[180px]">
                    {heroForm.videoFileName}
                  </span>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-900 text-xs font-semibold rounded-xl border border-gray-200 transition-colors shadow-2xs"
                  >
                    <Upload size={13} />
                    <span>Upload Video File</span>
                  </button>
                </div>
              </div>

              {/* Hero Photo Upload */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
                <div className="flex items-center space-x-2">
                  <ImageIcon size={18} className="text-emerald-700" />
                  <span className="text-xs font-bold text-gray-900">Cover Photo File Upload</span>
                </div>
                
                <p className="text-[11px] text-gray-500">Upload a high-resolution hero photo (.png, .jpeg).</p>
                
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-mono text-gray-700 truncate max-w-[180px]">
                    {heroForm.photoFileName}
                  </span>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-900 text-xs font-semibold rounded-xl border border-gray-200 transition-colors shadow-2xs"
                  >
                    <Upload size={13} />
                    <span>Upload Photo File</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab 2: About Section */}
      {activeTab === 'about' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">About Us Copy</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Section Title</label>
              <input
                type="text"
                value={aboutForm.title}
                onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition-all font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Main Description</label>
              <textarea
                rows={4}
                value={aboutForm.body}
                onChange={(e) => setAboutForm({ ...aboutForm, body: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Completed Projects Count</label>
              <input
                type="text"
                value={aboutForm.projectStat}
                onChange={(e) => setAboutForm({ ...aboutForm, projectStat: e.target.value })}
                className="w-32 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold focus:bg-white focus:border-emerald-600 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Services Section */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm">Services List ({expertiseItems.length})</h3>
            <button
              onClick={handleAddService}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expertiseItems.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3 relative group">
                <div className="flex justify-between items-start">
                  <div className="flex space-x-3 items-center">
                    <img src={item.image} alt={item.title} className="w-10 h-10 rounded-xl object-cover border border-gray-200" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                      <span className="text-[11px] text-gray-500">{item.instrumentation}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingService(item)}
                      className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteService(item.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Contact */}
      {activeTab === 'contact' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Contact Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Phone / WhatsApp</label>
              <input
                type="text"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:bg-white focus:border-emerald-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Support Email</label>
              <input
                type="text"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:bg-white focus:border-emerald-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Office Address</label>
            <input
              type="text"
              value={contactForm.address}
              onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Operating Hours</label>
            <input
              type="text"
              value={contactForm.hours}
              onChange={(e) => setContactForm({ ...contactForm, hours: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Service Edit Modal with File Upload */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Edit Service Item</h3>
              <button onClick={() => setEditingService(null)} className="p-1 text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Service Title</label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Service Photo File Upload</label>
                <input
                  type="file"
                  ref={servicePhotoInputRef}
                  onChange={handleServicePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center space-x-3">
                  <img src={editingService.image} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => servicePhotoInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl border border-gray-200 transition-colors flex items-center space-x-1.5"
                  >
                    <Upload size={13} />
                    <span>Upload Cover Image File</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Equipment / Spec</label>
                <input
                  type="text"
                  value={editingService.instrumentation}
                  onChange={(e) => setEditingService({ ...editingService, instrumentation: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2">
              <button onClick={() => setEditingService(null)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl">Cancel</button>
              <button 
                onClick={() => {
                  setExpertiseItems(prev => prev.map(item => item.id === editingService.id ? editingService : item));
                  setEditingService(null);
                }} 
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl"
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">Preview</h3>
              <button onClick={() => setPreviewOpen(false)} className="p-1 rounded-lg text-gray-500 hover:text-gray-700"><X size={18} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <h1 className="text-xl font-bold text-gray-900">{heroForm.headline}</h1>
              <p className="text-xs text-gray-600">{heroForm.subheadline}</p>
              <div className="flex gap-2">
                <span className="px-3.5 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-xl">{heroForm.primaryCtaText}</span>
                <span className="px-3.5 py-1.5 bg-gray-100 text-gray-800 text-xs font-semibold rounded-xl border border-gray-200">{heroForm.secondaryCtaText}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
