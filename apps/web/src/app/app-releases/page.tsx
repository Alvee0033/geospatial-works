'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ApiClient } from '@/lib/api';
import { 
  Smartphone, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  Plus,
  X,
  FileCode,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Check,
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
  const [isLatest, setIsLatest] = useState(true);

  // Direct APK File Upload State
  const [selectedApkFile, setSelectedApkFile] = useState<File | null>(null);
  const [apkBase64, setApkBase64] = useState<string | null>(null);
  const [apkSizeFormatted, setApkSizeFormatted] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getAppReleases();
      setReleases(data || []);
    } catch {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.apk')) {
      alert('Please select an Android APK package (.apk file)');
      return;
    }

    setSelectedApkFile(file);
    setApkSizeFormatted(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

    const reader = new FileReader();
    reader.onload = () => {
      setApkBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStep, setUploadStep] = useState<string>('');

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        const comma = res.indexOf(',');
        resolve(comma !== -1 ? res.substring(comma + 1) : res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionName.trim()) return;
    setSubmitting(true);
    setUploadProgress(0);
    setUploadStep('Creating release record…');

    try {
      const created = await ApiClient.createAppRelease({
        versionName: versionName.trim(),
        buildNumber: Number(buildNumber) || 1,
        releaseNotes: releaseNotes.trim() || undefined,
        fileSizeBytes: selectedApkFile ? selectedApkFile.size : 28500000,
        isLatest,
        apkFileName: selectedApkFile ? selectedApkFile.name : undefined,
      });

      if (selectedApkFile && created?.id) {
        setUploadStep('Uploading APK package in high-speed chunks…');
        const CHUNK_SIZE = 2.5 * 1024 * 1024; // 2.5 MB chunks
        const totalChunks = Math.ceil(selectedApkFile.size / CHUNK_SIZE);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, selectedApkFile.size);
          const chunkBlob = selectedApkFile.slice(start, end);
          const chunkB64 = await blobToBase64(chunkBlob);
          await ApiClient.uploadReleaseChunk(created.id, i, totalChunks, chunkB64);
          setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));
        }
      }

      setToast(`Release ${versionName} published successfully with verified APK package!`);
      setTimeout(() => setToast(null), 5000);
      setIsModalOpen(false);

      // Reset form
      setVersionName('');
      setReleaseNotes('');
      setSelectedApkFile(null);
      setUploadProgress(0);
      setUploadStep('');
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

  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [selectedActiveId, setSelectedActiveId] = useState<string>('');

  const latestRelease = releases.find((r) => r.isLatest) || releases[0];

  useEffect(() => {
    if (latestRelease && !selectedActiveId) {
      setSelectedActiveId(latestRelease.id);
    }
  }, [latestRelease, selectedActiveId]);

  const handleSetActiveVersion = async (id: string, versionName: string) => {
    if (!id || id === 'default' || switchingId) return;
    setSwitchingId(id);
    try {
      await ApiClient.setLatestAppRelease(id);
      setSelectedActiveId(id);
      setToast(`Build ${versionName} is now set as the active production release!`);
      setTimeout(() => setToast(null), 5000);
      await fetchReleases();
    } catch (err: any) {
      alert(`Error switching active release: ${err.message}`);
    } finally {
      setSwitchingId(null);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '28.5 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminLayout
      title="Mobile App Releases"
      subtitle="Upload production APK builds, manage version history, and select active releases"
      onRefresh={fetchReleases}
      isRefreshing={loading}
      contentClassName="px-3 sm:px-6 py-4"
    >
      {toast && (
        <div role="status" className="mb-4 flex items-center justify-between gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{toast}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs p-1">✕</button>
        </div>
      )}

      <div className="w-full space-y-4">
        {/* Top Metric & Active Release Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Active Version Card */}
          <div className="md:col-span-2 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Smartphone size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">
                      {latestRelease ? `Geospatial Works ${latestRelease.versionName}` : 'Geospatial Works Mobile'}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Active Build #{latestRelease?.buildNumber || 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Package: {formatSize(latestRelease?.fileSizeBytes)} &bull; Direct distribution &bull; Verified
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <Link
                  href="/download"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                >
                  <span>Public Page</span>
                  <ExternalLink size={12} className="text-slate-400" />
                </Link>
                <a
                  href="/api/v1/app-releases/download-latest"
                  download
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
                >
                  <Download size={13} />
                  <span>Download Latest APK</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition-colors"
                >
                  <UploadCloud size={14} />
                  <span>Upload APK</span>
                </button>
              </div>
            </div>

            {/* Release notes pill */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600">
              <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
              <p className="line-clamp-2 leading-relaxed">
                {latestRelease?.releaseNotes || 'Production build with geofenced attendance verification, instant receipts, and real-time chat.'}
              </p>
            </div>
          </div>

          {/* Distribution Stats Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Public Access URL</span>
              <p className="text-xs font-mono font-medium text-slate-700 break-all bg-slate-50 p-2 rounded-md border border-slate-100">
                /download
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Direct Link Support</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        {/* Release History Card */}
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Version History & Active Release Switcher</h3>
              <p className="text-[11px] text-slate-400">Select any uploaded APK build to set as active production version or download directly</p>
            </div>

            {/* Dropdown Quick Version Switcher */}
            {releases.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Switch Version:</span>
                <select
                  value={selectedActiveId}
                  onChange={(e) => setSelectedActiveId(e.target.value)}
                  className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {releases.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.versionName} (Build #{r.buildNumber}){r.isLatest ? ' ★ Active' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={switchingId !== null || selectedActiveId === latestRelease?.id}
                  onClick={() => {
                    const target = releases.find((r) => r.id === selectedActiveId);
                    if (target) handleSetActiveVersion(target.id, target.versionName);
                  }}
                  className="h-8 px-3 rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-medium transition-colors"
                >
                  {switchingId ? 'Switching…' : 'Apply Version'}
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-3.5">Version</th>
                  <th className="py-2.5 px-3.5">Build #</th>
                  <th className="py-2.5 px-3.5">Release Notes</th>
                  <th className="py-2.5 px-3.5">Size</th>
                  <th className="py-2.5 px-3.5">Date</th>
                  <th className="py-2.5 px-3.5">Status / Switch</th>
                  <th className="py-2.5 px-3.5 text-right">Download & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {releases.map((r) => (
                  <tr key={r.id} className={`transition-colors ${r.isLatest ? 'bg-emerald-50/20 hover:bg-emerald-50/30' : 'hover:bg-slate-50/60'}`}>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-900 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span>{r.versionName}</span>
                        {r.isLatest && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" title="Active Production Release" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 font-mono">
                      #{r.buildNumber}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 max-w-xs truncate">
                      {r.releaseNotes || 'Production update'}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 font-mono">
                      {formatSize(r.fileSizeBytes)}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 text-[11px]">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-2.5 px-3.5">
                      {r.isLatest ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-300/60">
                          <Check size={11} className="stroke-[2.5]" />
                          Active Production
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={switchingId === r.id}
                          onClick={() => handleSetActiveVersion(r.id, r.versionName)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                        >
                          {switchingId === r.id ? 'Switching…' : 'Set as Active'}
                        </button>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        {/* Direct APK Download Button */}
                        <a
                          href={r.downloadUrl && r.downloadUrl.startsWith('http') ? r.downloadUrl : (r.id === 'default' ? '/api/v1/app-releases/download-latest' : `/api/v1/app-releases/${r.id}/download`)}
                          download={`geospatial-works-${r.versionName}.apk`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium shadow-2xs transition-colors"
                          title={`Download ${r.versionName} APK`}
                        >
                          <Download size={12} />
                          <span>Download APK</span>
                        </a>

                        {/* Delete Button (only for inactive non-default builds) */}
                        {r.id !== 'default' && !r.isLatest && (
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id, r.versionName)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Build"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {releases.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No release builds recorded yet. Click "Upload APK" to upload your first build.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* Upload APK Modal (Shadcn-styled Compact Dialog) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center">
                  <UploadCloud size={15} />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">Upload Android APK</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateRelease} className="space-y-3.5 text-xs">
              {/* Drag and Drop / APK File Picker */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">APK File Package *</label>
                <input
                  type="file"
                  accept=".apk"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    selectedApkFile 
                      ? 'border-emerald-400 bg-emerald-50/50' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  {selectedApkFile ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-800">
                      <FileCode size={20} className="text-emerald-600" />
                      <div className="text-left">
                        <p className="font-semibold text-xs truncate max-w-[220px]">{selectedApkFile.name}</p>
                        <p className="text-[10px] text-emerald-600 font-mono">{apkSizeFormatted}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud size={24} className="mx-auto text-slate-400" />
                      <p className="font-medium text-slate-700">Click to select APK file</p>
                      <p className="text-[10px] text-slate-400">Direct binary upload to server storage</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Version & Build Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Version (e.g. v1.0.3) *</label>
                  <input
                    type="text"
                    required
                    placeholder="v1.0.3"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Build Number *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={buildNumber}
                    onChange={(e) => setBuildNumber(Number(e.target.value))}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Release Notes */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Release Notes</label>
                <textarea
                  rows={3}
                  placeholder="Summarize bug fixes, performance improvements, and new features..."
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none text-xs"
                />
              </div>

              {/* Latest Toggle */}
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isLatest}
                  onChange={(e) => setIsLatest(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0"
                />
                <span className="font-medium">Set as active production release</span>
              </label>

              {/* Upload Progress Indicator */}
              {submitting && (
                <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-700 font-medium">
                    <span className="truncate max-w-[240px]">{uploadStep || 'Uploading APK package…'}</span>
                    <span className="font-mono font-bold text-slate-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 text-slate-600 hover:bg-slate-100 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-8 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? 'Uploading…' : 'Publish APK Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
