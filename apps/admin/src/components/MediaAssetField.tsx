'use client';

import { ImagePlus, Trash2 } from 'lucide-react';

interface MediaAssetFieldProps {
  label: string;
  value?: string;
  onChoose: () => void;
  onRemove?: () => void;
  aspect?: 'landscape' | 'portrait' | 'square';
}

const aspectClasses = { landscape: 'aspect-[16/7]', portrait: 'aspect-[4/5]', square: 'aspect-square' };

export function MediaAssetField({ label, value, onChoose, onRemove, aspect = 'landscape' }: MediaAssetFieldProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-800">{label}</legend>
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
        <div className={`relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white sm:w-40 ${aspectClasses[aspect]}`}>
          {value ? <img src={value} alt="Selected media preview" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 grid place-items-center text-slate-300"><ImagePlus size={24} /></div>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800">{value ? 'Image selected' : 'No image selected'}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Choose an image from your library or upload one. The preview shows the selected image.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={onChoose} className="inline-flex items-center gap-2 rounded-lg bg-[#1D5EC8] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#164ea8]"><ImagePlus size={14} />{value ? 'Change image' : 'Choose image'}</button>
            {value && onRemove && <button type="button" onClick={onRemove} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"><Trash2 size={14} />Remove</button>}
          </div>
        </div>
      </div>
    </fieldset>
  );
}
