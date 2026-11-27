'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, X } from 'lucide-react';

export interface OrderItem {
  id: string;
  title: string;
  sortOrder: number;
}

interface DisplayOrderPickerProps {
  items: OrderItem[];
  currentId?: string;
  currentTitle: string;
  position: number;
  onChange: (position: number) => void;
}

export function DisplayOrderPicker({ items, currentId, currentTitle, position, onChange }: DisplayOrderPickerProps) {
  const [open, setOpen] = useState(false);
  const others = [...items].filter((item) => item.id !== currentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  const selectedPosition = Math.max(1, Math.min(position || others.length + 1, others.length + 1));
  const rows = others.map((item) => ({ ...item, selected: false }));
  rows.splice(selectedPosition - 1, 0, { id: currentId || 'new-item', title: currentTitle.trim() || 'New item', sortOrder: selectedPosition, selected: true });

  return <>
    <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-blue-400 hover:bg-blue-50/40">
      <span className="flex min-w-0 items-center gap-2"><GripVertical size={16} className="shrink-0 text-blue-600" /><span className="truncate">Position {selectedPosition} of {rows.length}</span></span>
      <span className="text-xs font-medium text-blue-700">Change order</span>
    </button>
    {open && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-label="Change display order" className="flex max-h-[min(80vh,700px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div><h3 className="text-lg font-bold text-slate-950">Display order</h3><p className="mt-1 text-sm text-slate-500">Drag the highlighted item, or use its arrows. The order is saved with this form.</p></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close order picker" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-3 sm:p-4">
          <ol className="space-y-1.5">
            {rows.map((row, index) => <li key={row.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer.getData('text/plain') === 'selected-item') onChange(index + 1); }} className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 ${row.selected ? 'border-blue-500 bg-blue-50 text-blue-950' : 'border-slate-200 bg-white text-slate-700'}`}>
              <span className="w-5 shrink-0 text-center text-xs font-bold text-slate-400">{index + 1}</span>
              <span draggable={row.selected} onDragStart={(event) => { if (row.selected) event.dataTransfer.setData('text/plain', 'selected-item'); }} className={row.selected ? 'cursor-grab text-blue-600 active:cursor-grabbing' : 'text-slate-300'} aria-hidden="true"><GripVertical size={18} /></span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.title}</span>
              {row.selected && <div className="flex gap-1"><button type="button" onClick={() => onChange(Math.max(1, selectedPosition - 1))} disabled={selectedPosition === 1} aria-label="Move up" className="rounded-md p-1.5 hover:bg-blue-100 disabled:opacity-30"><ArrowUp size={16} /></button><button type="button" onClick={() => onChange(Math.min(rows.length, selectedPosition + 1))} disabled={selectedPosition === rows.length} aria-label="Move down" className="rounded-md p-1.5 hover:bg-blue-100 disabled:opacity-30"><ArrowDown size={16} /></button></div>}
            </li>)}
          </ol>
        </div>
        <div className="border-t border-slate-200 p-4 text-right"><button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Done</button></div>
      </div>
    </div>}
  </>;
}
