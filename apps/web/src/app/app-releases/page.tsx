'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ApiClient } from '@/lib/api';
import { 
  Smartphone, 
  Upload, 
  Download, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  ExternalLink,
  Plus,
  X,
  FileCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface AppRelease {
  id: string;
  versionName: string;
  buildNumber: number;
  releaseNotes?: string;
  downloadUrl?: string;
  fileSizeBytes?: number;
  isLatest: boolean;
  createdAt: string;
  createdByName?: string;
}

export default function AppReleasesPage() {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form State
  const [versionName, setVersionName] = useState('');
  const [buildNumber, setBuildNumber] = useState(1);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileSizeBytes, setFileSizeBytes] = useState(28500000);
  const [isLatest, setIsLatest] = useState(true);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getAppReleases();
      setReleases(data || []);
    } catch {
      // If error or empty, try latest
      try {
        const latest = await ApiClient.getLatestAppRelease();
        if (latest && latest.id !== 'default') {
          setReleases([latest]);
        }
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReleases();
  }, []);

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionName.trim()) return;
    setSubmitting(true);

    try {
      await ApiClient.createAppRelease({
        versionName: versionName.trim(),
        buildNumber: Number(buildNumber) || 1,
        releaseNotes: releaseNotes.trim() || undefined,
        downloadUrl: downloadUrl.trim() || undefined,
        fileSizeBytes: Number(fileSizeBytes) || 28500000,
        isLatest,
      });
      setToast(`Release ${versionName} published successfully! Public download link updated.`);
      setTimeout(() => setToast(null), 6000);
      setIsModalOpen(false);
      // Reset form
      setVersionName('');
      setReleaseNotes('');
      setDownloadUrl('');
      await fetchReleases();
    } catch (err: any) {
      alert(`Error publishing release: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, version: string) => {
    if (!confirm(`Are you sure you want to delete release ${version}?`)) return;
    try {
      await ApiClient.deleteAppRelease(id);
      await fetchReleases();
    } catch (err: any) {
      alert(`Error deleting release: ${err.message}`);
    }
  };

  const latestRelease = releases.find((r) => r.isLatest) || releases[0];

  const formatSize = (bytes?: number) => {
    if (!bytes) return '28.5 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminLayout
      title="Mobile App Releases"
      subtitle="Manage APK builds, version rollouts, changelogs, and public distribution"
      onRefresh={fetchReleases}
      isRefreshing={loading}
      contentClassName="px-4 lg:px-6 py-4"
    >
      {toast && (
        <div role="status" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{toast}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-sm">✕</button>
        </div>
      )}

      <div className="w-full space-y-4">
        {/* Active Version Highlight Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0D1117] text-white flex items-center justify-center shadow-xs">
                <Smartphone size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {latestRelease ? `Geospatial Works ${latestRelease.versionName}` : 'Geospatial Works Mobile'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Release
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Build #{latestRelease?.buildNumber || 1} &bull; {formatSize(latestRelease?.fileSizeBytes)} &bull; Android APK
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/download"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
              >
                <span>View Public Page</span>
                <ExternalLink size={13} />
              </Link>
              <a
                href="/api/v1/app-releases/download-latest"
                download
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0D1117] hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-all"
              >
                <Download size={13} />
                <span>Test Download</span>
              </a>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all"
              >
                <Plus size={14} />
                <span>Publish New Release</span>
              </button>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">Latest Release Notes</h4>
              <p className="text-slate-600 leading-relaxed">
                {latestRelease?.releaseNotes || 'Production-ready field app with geofenced check-in, expenses submission, and project chat.'}
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1 text-slate-600">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">Distribution Details</h4>
              <p><strong>Permanent Download URL:</strong> <code className="bg-white px-1.5 py-0.5 rounded border text-[11px]">/api/v1/app-releases/download-latest</code></p>
              <p><strong>Public Landing Page:</strong> <code className="bg-white px-1.5 py-0.5 rounded border text-[11px]">/download</code></p>
              <p><strong>Automatic Email Delivery:</strong> Enabled upon admin employee approval.</p>
            </div>
          </div>
        </div>

        {/* Release History Table */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Release Version History</h3>
              <p className="text-[11px] text-slate-400">All deployed mobile application builds and distribution links</p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {releases.length} {releases.length === 1 ? 'Build' : 'Builds'}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200/90 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Version & Build</th>
                  <th className="py-2.5 px-3.5">Release Notes</th>
                  <th className="py-2.5 px-3.5">Package Size</th>
                  <th className="py-2.5 px-3.5">Published Date</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {releases.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 font-mono">
                      <span>{r.versionName}</span>
                      <span className="text-slate-400 font-normal ml-1.5 text-[11px]">(Build {r.buildNumber})</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 max-w-xs truncate">
                      {r.releaseNotes || 'No notes provided'}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-600">
                      {formatSize(r.fileSizeBytes)}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 text-[11px]">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-2.5 px-3.5">
                      {r.isLatest ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Latest
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      {r.id !== 'default' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id, r.versionName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Release"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {releases.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No app releases recorded yet. Click "Publish New Release" above to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Publish Release Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Smartphone size={16} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Publish Mobile App Release</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRelease} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Version String *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. v1.1.0"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Build Number *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={buildNumber}
                    onChange={(e) => setBuildNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Size (MB)</label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={28.5}
                    onChange={(e) => setFileSizeBytes(Math.round(Number(e.target.value) * 1024 * 1024))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Direct APK URL (Optional)</label>
                <input
                  type="url"
                  placeholder="Leave empty to use server default APK stream"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Release Notes / Changelog</label>
                <textarea
                  rows={3}
                  placeholder="List key fixes and features in this release..."
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isLatest}
                  onChange={(e) => setIsLatest(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                />
                <span className="font-semibold">Mark as active production release</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Publishing…' : 'Publish Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
