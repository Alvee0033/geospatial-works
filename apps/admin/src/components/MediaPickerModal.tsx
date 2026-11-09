'use client';

import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, RefreshCw, Folder } from 'lucide-react';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

export function MediaPickerModal({ isOpen, onClose, onSelect, title = 'Select or Upload Image' }: MediaPickerModalProps) {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [library, setLibrary] = useState<{ uploaded: any[]; stock: any[] }>({ uploaded: [], stock: [] });
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  const fetchLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const res = await fetch('/api/media/library');
      if (res.ok) {
        setLibrary(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLibrary();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
      }
      const data = await res.json();
      onSelect(data.url);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-[#252D3E] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{title}</h3>
              <p className="text-[11px] text-slate-300">Choose from media library or upload new high-resolution photo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-4">
          <button
            onClick={() => setTab('library')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              tab === 'library'
                ? 'border-[#252D3E] text-[#252D3E]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Folder size={14} /> Media Library & Stock Assets
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              tab === 'upload'
                ? 'border-[#252D3E] text-[#252D3E]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload size={14} /> Upload New File
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {tab === 'upload' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 hover:border-[#252D3E] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-blue-50/30 group">
                <Upload size={36} className="text-slate-400 group-hover:text-[#252D3E] transition mb-2" />
                <span className="text-sm font-bold text-slate-800">Click or drag image to upload</span>
                <span className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP, or SVG up to 15MB</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>

              {uploading && (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600">
                  <RefreshCw size={14} className="animate-spin" /> Uploading image to storage...
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {uploadError}
                </div>
              )}
            </div>
          )}

          {tab === 'library' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Assets</span>
                <button
                  onClick={fetchLibrary}
                  disabled={loadingLibrary}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <RefreshCw size={12} className={loadingLibrary ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>

              {library.stock.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">High-Res Brand Imagery</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {library.stock.map((item) => (
                      <div
                        key={item.url}
                        onClick={() => {
                          onSelect(item.url);
                          onClose();
                        }}
                        className="group relative border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-[#252D3E] transition aspect-video bg-slate-100 shadow-sm"
                      >
                        <img src={item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                          Select Image
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {library.uploaded.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">Uploaded Images</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {library.uploaded.map((item) => (
                      <div
                        key={item.url}
                        onClick={() => {
                          onSelect(item.url);
                          onClose();
                        }}
                        className="group relative border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-[#252D3E] transition aspect-video bg-slate-100 shadow-sm"
                      >
                        <img src={item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                          Select Image
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
