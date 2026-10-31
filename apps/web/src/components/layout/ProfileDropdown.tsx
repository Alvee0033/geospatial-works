'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ApiClient } from '@/lib/api';
import { 
  User, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Check, 
  Camera, 
  Upload,
  X,
  Mail,
  Phone,
  Briefcase,
  Loader2
} from 'lucide-react';

interface ProfileDropdownProps {
  currentUser: any;
  onUserUpdate?: (updatedUser: any) => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ currentUser, onUserUpdate }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Edit form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || currentUser.fullName || 'Admin User');
      setEmail(currentUser.email || 'admin@gw.com');
      setPhone(currentUser.phone || currentUser.phoneNumber || '+880 1711-000000');
      setAvatarUrl(currentUser.avatarUrl || currentUser.avatar_url || '');
    }
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    ApiClient.clearToken();
    router.push('/login');
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB.');
      return;
    }

    setErrorMsg(null);
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUri = reader.result as string;
          // Set preview immediately
          setAvatarUrl(dataUri);

          // Upload to backend
          const uploadRes = await ApiClient.uploadFile(dataUri, 'avatars');
          if (uploadRes?.url) {
            setAvatarUrl(uploadRes.url);
          }
        } catch (uploadErr: any) {
          console.error('Failed to upload image file to backend, using local preview:', uploadErr);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      setErrorMsg('Failed to process image file.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMsg(null);

    try {
      const updated = {
        ...currentUser,
        name,
        fullName: name,
        email,
        phone,
        avatarUrl,
      };

      // Persist locally for instant hydration
      localStorage.setItem('gw_user', JSON.stringify(updated));

      // Attempt updating on server if user ID exists
      if (currentUser?.id) {
        await ApiClient.updateUser(currentUser.id, {
          name,
          email,
          phone,
          avatarUrl,
        }).catch(() => null);
      }

      if (onUserUpdate) {
        onUserUpdate(updated);
      }

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsSettingsOpen(false);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to save profile', err);
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3 py-1 text-left rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
        aria-label="User profile settings menu"
      >
        <div className="relative">
          <UserAvatar
            src={avatarUrl || currentUser?.avatarUrl || currentUser?.avatar_url}
            name={name || currentUser?.name || currentUser?.fullName || 'Admin'}
            size="sm"
            shape="circle"
          />
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div className="hidden md:block text-left pr-1">
          <p className="text-[11px] font-bold leading-tight text-slate-900 truncate max-w-[110px]">
            {name || 'GW Admin'}
          </p>
          <p className="text-[10px] text-slate-400 capitalize">
            {(currentUser?.role || 'admin').replace('_', ' ')}
          </p>
        </div>
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-emerald-100 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">{name || 'Admin User'}</p>
            <p className="text-[11px] text-slate-500 truncate">{email || 'admin@gw.com'}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span className="capitalize">{currentUser?.role || 'Administrator'}</span>
            </div>
          </div>

          <div className="py-1 text-xs text-slate-700">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsSettingsOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-emerald-50/70 hover:text-emerald-900 transition-colors text-left"
            >
              <User size={15} className="text-emerald-600" />
              <span>Edit Profile & Avatar</span>
            </button>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 hover:bg-emerald-50/70 hover:text-emerald-900 transition-colors"
            >
              <Settings size={15} className="text-emerald-600" />
              <span>System Preferences</span>
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Edit Profile & Settings */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Profile Settings</h3>
                <p className="text-xs text-slate-500">Update your profile picture and personal information</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              {/* Photo Upload Section */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer shrink-0"
                  title="Click to choose a photo"
                >
                  <UserAvatar
                    src={avatarUrl}
                    name={name || 'Admin'}
                    size="lg"
                    shape="circle"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploading ? (
                      <Loader2 size={18} className="text-white animate-spin" />
                    ) : (
                      <Camera size={18} className="text-white" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800">Profile Picture</p>
                  <p className="text-[11px] text-slate-500 mb-2">PNG, JPG, or WEBP up to 5MB</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-[11px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-emerald-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} className="text-emerald-600" />
                          <span>Upload Photo</span>
                        </>
                      )}
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-2 py-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Role Display */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  System Role
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <Briefcase size={14} className="text-slate-400" />
                  <span className="capitalize font-semibold">{currentUser?.role || 'Administrator'}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">Managed by Organization</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {savedSuccess ? (
                    <>
                      <Check size={14} />
                      <span>Saved!</span>
                    </>
                  ) : saving ? (
                    <span>Saving...</span>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
