'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  Link as LinkIcon,
  Building,
  UploadCloud,
  Check,
  FileCheck,
} from 'lucide-react';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
    type?: string;
  } | null;
  onSuccess?: () => void;
}

export function JobApplicationModal({ isOpen, onClose, job, onSuccess }: JobApplicationModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  // PDF file upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadedPdfName, setUploadedPdfName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file (e.g. resume.pdf).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 15MB limit.');
      return;
    }

    setPdfFile(file);
    setErrorMsg('');
    setUploadingPdf(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      setResumeUrl(data.url);
      setUploadedPdfName(file.name);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to upload PDF. You can also paste a Google Drive/Dropbox resume link below.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please fill out all mandatory contact fields (Full Name, Email, Phone).');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobPostId: job?.id || undefined,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          linkedInUrl: linkedInUrl.trim() || undefined,
          portfolioUrl: portfolioUrl.trim() || undefined,
          currentCompany: currentCompany.trim() || undefined,
          currentTitle: currentTitle.trim() || undefined,
          yearsOfExperience: yearsOfExperience.trim() || undefined,
          coverLetter: coverLetter.trim() || undefined,
          resumeUrl: resumeUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Unable to submit application right now. Please email us directly at careers@geospatialworks.com.bd');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setLinkedInUrl('');
    setPortfolioUrl('');
    setCurrentCompany('');
    setCurrentTitle('');
    setYearsOfExperience('');
    setCoverLetter('');
    setResumeUrl('');
    setPdfFile(null);
    setUploadedPdfName('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#FAFAFA]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#F4382D]">
              {job ? job.department : 'CAREER INITIATIVE'}
            </span>
            <h2 className="text-[19px] font-black text-[#141212] tracking-tight">
              {job ? `Apply: ${job.title}` : 'General Career Application'}
            </h2>
            {job && (
              <p className="text-[12px] text-neutral-500 mt-0.5">
                {job.location} • {job.type || 'Full-time'}
              </p>
            )}
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body or Success State */}
        {submitted ? (
          <div className="p-10 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-[22px] font-extrabold text-[#141212]">Application Received!</h3>
            <p className="text-[14px] text-neutral-600 max-w-md mx-auto leading-relaxed">
              Thank you for applying to <strong>{job?.title || 'Geospatial Works'}</strong>. Our engineering talent review committee will review your qualifications and contact you regarding the next technical round.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="wsp-btn wsp-btn-solid text-[13px] px-8 py-3 cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Direct PDF Upload Box */}
            <div className="p-4 bg-red-50/50 border border-dashed border-[#F4382D]/40 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-800 text-[12px] flex items-center gap-1.5">
                  <FileText size={15} className="text-[#F4382D]" />
                  <span>Attach Resume / CV (Direct PDF Upload)</span>
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">Max 15MB PDF</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPdf}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-300 hover:border-[#F4382D] text-neutral-800 font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <UploadCloud size={16} className="text-[#F4382D]" />
                  <span>{uploadingPdf ? 'Uploading PDF...' : 'Choose PDF File'}</span>
                </button>

                {uploadedPdfName ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <FileCheck size={14} />
                    <span className="truncate max-w-[240px]">{uploadedPdfName}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-neutral-500">
                    No file chosen (or provide cloud link below)
                  </span>
                )}
              </div>
            </div>

            {/* Row 1: Full Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 flex items-center gap-1">
                  <User size={13} className="text-[#F4382D]" />
                  <span>Full Legal Name <span className="text-[#F4382D]">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Engr. Tanvir Ahmed"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-neutral-800 text-[13px] font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 flex items-center gap-1">
                  <Mail size={13} className="text-[#F4382D]" />
                  <span>Email Address <span className="text-[#F4382D]">*</span></span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tanvir@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-neutral-800 text-[13px] font-medium"
                />
              </div>
            </div>

            {/* Row 2: Phone & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 flex items-center gap-1">
                  <Phone size={13} className="text-[#F4382D]" />
                  <span>Phone Number / WhatsApp <span className="text-[#F4382D]">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1712 345678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-neutral-800 text-[13px] font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 flex items-center gap-1">
                  <Briefcase size={13} className="text-[#F4382D]" />
                  <span>Total Relevant Experience</span>
                </label>
                <input
                  type="text"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  placeholder="e.g. 4 years (RTK / Total Station / UAV)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-neutral-800 text-[13px] font-medium"
                />
              </div>
            </div>

            {/* Row 3: Current Title & Current Employer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 flex items-center gap-1">
                  <Building size={13} className="text-[#F4382D]" />
                  <span>Current Designation / Title</span>
                </label>
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="e.g. Senior Surveyor / GIS Analyst"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-neutral-800 text-[13px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Current Organization / Firm</label>
                <input
                  type="text"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  placeholder="e.g. Infrastructure Solutions Ltd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-neutral-800 text-[13px]"
                />
              </div>
            </div>

            {/* Row 4: Links / Resume Backup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 flex items-center gap-1">
                  <LinkIcon size={13} className="text-[#F4382D]" />
                  <span>LinkedIn or Portfolio URL</span>
                </label>
                <input
                  type="url"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-neutral-800 text-[13px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 flex items-center gap-1">
                  <FileText size={13} className="text-[#F4382D]" />
                  <span>Cloud CV Link (Google Drive / Dropbox)</span>
                </label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/your-cv-link"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-neutral-800 text-[13px]"
                />
              </div>
            </div>

            {/* Statement / Cover Letter */}
            <div className="space-y-1.5">
              <label className="font-bold text-neutral-700 flex items-center justify-between">
                <span>Summary Statement &amp; Survey / Software Experience</span>
                <span className="text-neutral-400 font-normal">Optional</span>
              </label>
              <textarea
                rows={3}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Highlight your field instrument experience (RTK, Total Station, UAV, Sonar, GPR) or spatial software stack (Civil 3D, ArcGIS Pro, Pix4D, PostGIS)..."
                className="w-full p-3.5 rounded-xl border border-neutral-200 focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 outline-none text-neutral-800 text-[13px] leading-relaxed resize-none"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingPdf}
                className="wsp-btn wsp-btn-solid text-center text-[13px] py-2.5 px-6 flex items-center gap-2 cursor-pointer"
              >
                <Send size={14} />
                <span>
                  {uploadingPdf
                    ? 'Uploading Resume...'
                    : submitting
                    ? 'Submitting Application...'
                    : 'Submit Application'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
