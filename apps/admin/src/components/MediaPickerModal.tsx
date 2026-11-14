'use client';

import React, { useEffect, useState } from 'react';
import { ImagePlus, RefreshCw, Upload, X } from 'lucide-react';

interface MediaItem { url: string; name?: string; alt?: string; }
interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  getAuthHeaders: () => Record<string, string>;
}

export function MediaPickerModal({ isOpen, onClose, onSelect, getAuthHeaders, title = 'Choose an image' }: MediaPickerModalProps) {
  const [view, setView] = useState<'library' | 'upload'>('library');
  const [library, setLibrary] = useState<{ uploaded: MediaItem[]; stock: MediaItem[] }>({ uploaded: [], stock: [] });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchLibrary = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/media/library', { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Could not load images. Please try again.');
      const result = await response.json();
      setLibrary({ uploaded: Array.isArray(result.uploaded) ? result.uploaded : [], stock: Array.isArray(result.stock) ? result.stock : [] });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load images. Please try again.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (isOpen) { setView('library'); void fetchLibrary(); setError(''); } }, [isOpen]);

  if (!isOpen) return null;

  const uploadFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Choose an image file.'); return; }
    if (file.size > 15 * 1024 * 1024) { setError('The image must be smaller than 15 MB.'); return; }
    setUploading(true); setError('');
    const body = new FormData(); body.append('file', file);
    try {
      const response = await fetch('/api/media/upload', { method: 'POST', headers: { Authorization: getAuthHeaders().Authorization || '' }, body });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(typeof result?.message === 'string' ? result.message : 'Upload failed. Please try again.');
      }
      const result = await response.json();
      if (!result.url) throw new Error('The image uploaded, but no image link was returned.');
      onSelect(result.url); onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Upload failed. Please try again.'); }
    finally { setUploading(false); }
  };

  const allItems = [...library.uploaded, ...library.stock];
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="media-picker-title" className="flex max-h-[min(86vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3.5 sm:px-5">
          <div><h2 id="media-picker-title" className="text-base font-semibold text-slate-950">{title}</h2><p className="mt-0.5 text-xs text-slate-500">Choose an existing image or upload one.</p></div>
          <button type="button" aria-label="Close image picker" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </header>
        <nav aria-label="Image options" className="flex gap-1 border-b border-slate-200 px-4 sm:px-5">
          {([{ key: 'library', label: 'Image library' }, { key: 'upload', label: 'Upload image' }] as const).map((item) => <button type="button" key={item.key} onClick={() => { setView(item.key); setError(''); }} className={`border-b-2 px-3 py-3 text-sm font-medium transition ${view === item.key ? 'border-blue-700 text-blue-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{item.label}</button>)}
        </nav>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {error && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X size={15} /></button></div>}
          {view === 'upload' ? <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void uploadFile(event.dataTransfer.files[0]); }} className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm"><Upload size={21} /></span>
            <span className="mt-4 text-sm font-semibold text-slate-900">{uploading ? 'Uploading image…' : 'Choose an image or drop it here'}</span>
            <span className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP or SVG · up to 15 MB</span>
            {uploading && <RefreshCw size={16} className="mt-4 animate-spin text-blue-700" />}
            <input type="file" accept="image/*" disabled={uploading} onChange={(event) => { void uploadFile(event.target.files?.[0]); event.currentTarget.value = ''; }} className="sr-only" />
          </label> : <>
            <div className="mb-4 flex items-center justify-between gap-3"><p className="text-sm text-slate-600">{loading ? 'Loading images…' : `${allItems.length} ${allItems.length === 1 ? 'image' : 'images'}`}</p><button type="button" onClick={() => void fetchLibrary()} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={13} className={loading ? 'animate-spin' : ''} />Refresh</button></div>
            {loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-slate-100" />)}</div> : allItems.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {allItems.map((item, index) => <button type="button" key={`${item.url}-${index}`} onClick={() => { onSelect(item.url); onClose(); }} className="group overflow-hidden rounded-lg border border-slate-200 text-left transition hover:border-blue-400 hover:ring-2 hover:ring-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <span className="block aspect-[4/3] overflow-hidden bg-slate-100"><img src={item.url} alt={item.alt || item.name || ''} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /></span>
                <span className="block truncate px-2.5 py-2 text-xs text-slate-600">{item.name || item.url.split('/').pop() || 'Image'}</span>
              </button>)}
            </div> : <div className="rounded-xl border border-dashed border-slate-200 py-14 text-center"><ImagePlus size={22} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-800">No images yet</p><p className="mt-1 text-xs text-slate-500">Upload an image to add it to the library.</p><button type="button" onClick={() => setView('upload')} className="mt-4 rounded-lg bg-[#1D5EC8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800">Upload image</button></div>}
          </>}
        </div>
      </section>
    </div>
  );
}
