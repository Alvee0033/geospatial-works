"use client";

import React, { useState } from 'react';
import { 
  Bot, 
  Save, 
  Check, 
  Plus, 
  Trash2,
  Brain,
  SlidersHorizontal,
  MessageSquare
} from 'lucide-react';

interface QuickChip {
  id: string;
  label: string;
  query: string;
}

export default function AISettingsAdmin() {
  const [saveToast, setSaveToast] = useState(false);
  const [temperature, setTemperature] = useState(0.5);

  const [quickChips, setQuickChips] = useState<QuickChip[]>([
    { id: '1', label: 'Call Us', query: 'I want to call your team directly.' },
    { id: '2', label: 'Email Support', query: 'How can I email support?' },
    { id: '3', label: 'Business Hours', query: 'What are your business hours?' },
    { id: '4', label: 'WebGIS Services', query: 'Tell me about your Custom WebGIS Development.' }
  ]);

  const [newChipLabel, setNewChipLabel] = useState('');
  const [newChipQuery, setNewChipQuery] = useState('');

  const [systemPrompt, setSystemPrompt] = useState(`You are the AI Support Assistant for Geospatial Works.
Voice & Rules:
- Keep answers brief, direct, and formatted (1-2 sentences or clean bullet points).
- Provide accurate information on Topographical Survey, UAV Drone Mapping, Mouza Digitizing, Valuation, and WebGIS.
- Provide WhatsApp (+8801303772216) and Email (info@geospatialworks.com) when requested.`);

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleAddChip = () => {
    if (!newChipLabel || !newChipQuery) return;
    setQuickChips([...quickChips, { id: `${Date.now()}`, label: newChipLabel, query: newChipQuery }]);
    setNewChipLabel('');
    setNewChipQuery('');
  };

  const handleDeleteChip = (id: string) => {
    setQuickChips(quickChips.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-gray-800 flex items-center space-x-2 text-xs font-bold animate-in fade-in duration-300">
          <Check size={16} className="text-emerald-400" />
          <span>AI Assistant Instructions Saved!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Assistant Settings</h1>
          <p className="text-xs text-gray-500 mt-1">Configure AI behavior, custom instructions, and quick action buttons.</p>
        </div>

        <button 
          onClick={handleSave}
          className="flex items-center space-x-2 px-4.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <Save size={15} />
          <span>Save Settings</span>
        </button>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Total Conversations</span>
          <div className="text-2xl font-bold text-gray-900">142</div>
          <span className="text-[11px] font-medium text-emerald-700">+18% this month</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Auto-Resolved</span>
          <div className="text-2xl font-bold text-emerald-700">89.4%</div>
          <span className="text-[11px] font-medium text-gray-500">Handled by AI</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Response Speed</span>
          <div className="text-2xl font-bold text-gray-900">0.38s</div>
          <span className="text-[11px] font-medium text-gray-500">Instant answers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Human Transfers</span>
          <div className="text-2xl font-bold text-gray-900">15</div>
          <span className="text-[11px] font-medium text-gray-500">Connected to team</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Custom Instructions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Brain size={18} className="text-gray-700" />
              <h3 className="font-bold text-gray-900 text-sm">Custom Instructions for AI Assistant</h3>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Knowledge & Behavior Prompt</label>
              <textarea
                rows={7}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 leading-relaxed focus:bg-white focus:border-emerald-600 outline-none transition-all resize-none"
              />
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-gray-700 block mb-1">Creativity vs Precision ({temperature})</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <MessageSquare size={18} className="text-gray-700" />
              <h3 className="font-bold text-gray-900 text-sm">Quick Suggestion Buttons</h3>
            </div>

            <div className="space-y-2">
              {quickChips.map((chip) => (
                <div key={chip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <div>
                    <span className="font-bold text-gray-900">{chip.label}</span>
                    <span className="text-gray-500 block text-[11px] mt-0.5">{chip.query}</span>
                  </div>
                  <button onClick={() => handleDeleteChip(chip.id)} className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Chip */}
            <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newChipLabel}
                onChange={(e) => setNewChipLabel(e.target.value)}
                placeholder="Button Label..."
                className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-medium"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChipQuery}
                  onChange={(e) => setNewChipQuery(e.target.value)}
                  placeholder="Query Text..."
                  className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-medium"
                />
                <button
                  onClick={handleAddChip}
                  className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:bg-emerald-800 transition-colors shrink-0"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Website Sync Status</h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-emerald-900">
                <span className="font-semibold">Hero & Overview Page</span>
                <span className="text-[10px] font-bold text-emerald-800">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-emerald-900">
                <span className="font-semibold">Core Services</span>
                <span className="text-[10px] font-bold text-emerald-800">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-emerald-900">
                <span className="font-semibold">About Us</span>
                <span className="text-[10px] font-bold text-emerald-800">Active</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
