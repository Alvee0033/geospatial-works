'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2, Send, AlertCircle, Loader2 } from 'lucide-react';
import { CmsApi } from '@/lib/cms-api';
import { usePublicContactInfo } from '@/hooks/use-public-contact-info';

interface CorporateContactFormProps {
  theme?: 'dark' | 'light';
  onSuccess?: () => void;
  className?: string;
}

export default function CorporateContactForm({
  theme = 'dark',
  onSuccess,
  className = '',
}: CorporateContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const contactInfo = usePublicContactInfo();

  const isDark = theme === 'dark';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(form);
    const firstName = String(formData.get('firstName') || '').trim();
    const lastName = String(formData.get('lastName') || '').trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const serviceType = String(formData.get('subject') || '').trim();
    const organization = String(formData.get('organization') || '').trim();
    const userMessage = String(formData.get('message') || '').trim();

    const fullMessage = organization
      ? `[Organization: ${organization}]\n${userMessage}`
      : userMessage;

    try {
      await CmsApi.submitInquiry({
        fullName,
        email,
        phone,
        serviceType,
        message: fullMessage,
      });
      setSubmitted(true);
      form.reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Submission failed:', err);
      const subject = `Geospatial Works inquiry: ${serviceType || 'Project'}`;
      const body = `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nOrganization: ${organization}\n\n${userMessage}`;
      if (contactInfo?.email) {
        window.location.href = `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setErrorMessage('Offline fallback: your inquiry draft opened in your email client.');
      } else {
        setErrorMessage('We could not send the inquiry or load the office email. Please try again shortly.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Consistent input styling classes
  const inputClass = isDark
    ? 'w-full px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] border border-white/10 focus:border-[#FB1D10] text-white placeholder-neutral-500 rounded-lg text-sm transition-all outline-none focus:ring-1 focus:ring-[#FB1D10]/50'
    : 'w-full px-4 py-3 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 focus:border-[#141212] text-neutral-900 placeholder-neutral-400 rounded-lg text-sm transition-all outline-none focus:ring-1 focus:ring-neutral-900/20';

  const labelClass = isDark
    ? 'block text-[11px] font-mono uppercase tracking-[0.14em] text-neutral-400 mb-1.5'
    : 'block text-[11px] font-mono uppercase tracking-[0.14em] text-neutral-600 mb-1.5';

  return (
    <div className={`w-full ${className}`}>
      {submitted ? (
        <div className={`p-8 rounded-xl border text-center space-y-4 ${
          isDark 
            ? 'bg-white/[0.02] border-emerald-500/30 text-white' 
            : 'bg-emerald-50/50 border-emerald-200 text-neutral-900'
        }`}>
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 size={26} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Inquiry Received</h3>
            <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Thank you. Our engineering team will review your specifications and follow up within one business day.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className={`text-xs font-mono tracking-wider underline hover:text-[#FB1D10] transition-colors ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}
          >
            Send another inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg flex items-center gap-2.5 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name *</label>
              <input
                name="firstName"
                type="text"
                required
                maxLength={80}
                placeholder="Rahim"
                autoComplete="given-name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input
                name="lastName"
                type="text"
                required
                maxLength={80}
                placeholder="Chowdhury"
                autoComplete="family-name"
                className={inputClass}
              />
            </div>
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Work Email *</label>
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                placeholder="rahim@company.com"
                autoComplete="email"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                name="phone"
                type="tel"
                maxLength={30}
                placeholder="+880 1700 000000"
                autoComplete="tel"
                className={inputClass}
              />
            </div>
          </div>

          {/* Organization & Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Organization / Client</label>
              <input
                name="organization"
                type="text"
                maxLength={120}
                placeholder="Ministry / Engineering Firm / Developer"
                autoComplete="organization"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Service Required *</label>
              <select
                name="subject"
                required
                defaultValue=""
                className={`${inputClass} cursor-pointer [&>option]:bg-[#141212] [&>option]:text-white`}
              >
                <option value="" disabled>Select service discipline</option>
                <option value="Topographic & Land Survey">Topographic & Land Survey</option>
                <option value="UAV Drone Mapping & Photogrammetry">UAV Drone Mapping & Photogrammetry</option>
                <option value="Hydrographic & Bathymetric Survey">Hydrographic & Bathymetric Survey</option>
                <option value="Feasibility, BOQ & Civil Design">Feasibility, BOQ & Civil Design</option>
                <option value="GIS Implementation & Remote Sensing">GIS Implementation & Remote Sensing</option>
                <option value="Other Technical Inquiry">Other Technical Inquiry</option>
              </select>
            </div>
          </div>

          {/* Message / Project Specs */}
          <div>
            <label className={labelClass}>Project Scope & Location *</label>
            <textarea
              name="message"
              required
              rows={4}
              minLength={10}
              maxLength={3000}
              placeholder="Outline project location, area/corridor length, accuracy requirements, or deliverables needed..."
              className={`${inputClass} resize-y min-h-[110px]`}
            />
          </div>

          {/* Submit Action */}
          <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#FB1D10] hover:bg-[#E0180C] text-white font-bold text-xs uppercase tracking-[0.14em] rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FB1D10]/20 hover:shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Submit Inquiry</span>
                </>
              )}
            </button>
            <span className={`text-[11px] font-mono ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
              Responses typically dispatched within 24 hours.
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
