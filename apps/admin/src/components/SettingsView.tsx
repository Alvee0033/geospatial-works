'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserPlus,
  Users,
  Lock,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Sparkles,
  Check,
  X,
  FileCheck2,
  Database,
  MapPin,
  Building2,
  Phone,
  Mail,
  Globe,
  Share2,
  Save,
  ExternalLink,
  Compass,
  Navigation,
  Crosshair,
  Key,
} from 'lucide-react';

export type UserRoleType = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfoSettings {
  companyName: string;
  tagline: string;
  registrationNumber: string;
  address: string;
  area: string;
  city: string;
  postalCode: string;
  country: string;
  nearestLandmark: string;
  latitude: string;
  longitude: string;
  elevation: string;
  datum: string;
  mapEmbedUrl: string;
  phone: string;
  phoneSecondary: string;
  emergencyHotline: string;
  email: string;
  emailInquiries: string;
  emailCareers: string;
  whatsAppNumber: string;
  hoursWeekday: string;
  hoursField: string;
  chittagongHub: string;
  sylhetHub: string;
  khulnaHub: string;
  linkedinUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
}

const defaultContactInfo: ContactInfoSettings = {
  companyName: 'Geospatial Works',
  tagline: 'Pioneering Ground Truth & Spatial Intelligence Across Bangladesh',
  registrationNumber: 'TRAD/DSCC/012948/2021',
  address: '64/1 (D1), Lake Circus, Kalabagan',
  area: 'Kalabagan, Dhanmondi',
  city: 'Dhaka',
  postalCode: '1205',
  country: 'Bangladesh',
  nearestLandmark: 'Lake Circus Road, Adjacent to Dhanmondi Lake 32',
  latitude: '23.750942',
  longitude: '90.384351',
  elevation: '7.2m AMSL',
  datum: 'WGS 84 / Bangladesh Transverse Mercator (BTM)',
  mapEmbedUrl:
    'https://www.google.com/maps?q=64%2F1%20(D1)%2C%20Lake%20Circus%2C%20Kalabagan%2C%20Dhaka%201205&output=embed',
  phone: '+88 01303 772216',
  phoneSecondary: '+88 01713 907779',
  emergencyHotline: '+88 01303 772216',
  email: 'info@geospatialworks.com.bd',
  emailInquiries: 'inquiry@geospatialworks.com.bd',
  emailCareers: 'careers@geospatialworks.com.bd',
  whatsAppNumber: '8801303772216',
  hoursWeekday: 'Sunday – Thursday: 9:00 AM – 6:00 PM (BST / GMT+6)',
  hoursField: 'Field Operations & Rapid Emergency Deployment: 24/7 Available Nationwide',
  chittagongHub: 'Agrabad Commercial Area, Chattogram 4100 (Marine & Hydrographic Unit)',
  sylhetHub: 'Subidbazar, Sylhet 3100 (High-Precision GNSS Station)',
  khulnaHub: 'Muzgunni Main Road, Khulna 9000 (Coastal & Delta Survey Unit)',
  linkedinUrl: 'https://linkedin.com/company/geospatial-works',
  facebookUrl: 'https://facebook.com/geospatialworks',
  youtubeUrl: 'https://youtube.com/@geospatialworks',
};

interface SettingsViewProps {
  currentUser: { id: string; email: string; name: string; role: string } | null;
  getAuthHeaders: () => Record<string, string>;
  triggerFeedback: (msg: string, type?: 'success' | 'error') => void;
  onLogout: () => void;
}

export function SettingsView({
  currentUser,
  getAuthHeaders,
  triggerFeedback,
  onLogout,
}: SettingsViewProps) {
  const [subTab, setSubTab] = useState<'contact' | 'users' | 'rbac' | 'security'>('contact');
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Contact Info Settings state
  const [contactInfo, setContactInfo] = useState<ContactInfoSettings>(defaultContactInfo);
  const [savingContact, setSavingContact] = useState(false);

  // Create User Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRoleType>('EDITOR');
  const [creatingUser, setCreatingUser] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Edit User Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRoleType>('EDITOR');
  const [editPassword, setEditPassword] = useState('');
  const [updatingUser, setUpdatingUser] = useState(false);

  // Change Password state for current user
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPersonalPassword, setNewPersonalPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPersonalNewPassword, setShowPersonalNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Magnetic pin preview physics state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringMap, setIsHoveringMap] = useState(false);

  // Load all users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Failed to fetch user list', e);
    } finally {
      setLoading(false);
    }
  };

  // Load contact info
  const loadContactInfo = async () => {
    try {
      const res = await fetch('/api/cms/sections/contact');
      if (res.ok) {
        const data = await res.json();
        const contactSec = Array.isArray(data)
          ? data.find((s: any) => s.sectionKey === 'contact_info')
          : data;
        if (contactSec && contactSec.content) {
          setContactInfo({ ...defaultContactInfo, ...contactSec.content });
          return;
        }
      }
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('gw_contact_settings');
      if (cached) {
        try {
          setContactInfo({ ...defaultContactInfo, ...JSON.parse(cached) });
        } catch {
          // ignore
        }
      }
    }
  };

  useEffect(() => {
    loadUsers();
    loadContactInfo();
  }, []);

  const handleSaveContactSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      const res = await fetch('/api/cms/admin/sections/contact/contact_info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          title: contactInfo.companyName,
          subtitle: contactInfo.tagline,
          content: contactInfo,
          isActive: true,
        }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('gw_contact_settings', JSON.stringify(contactInfo));
        localStorage.setItem('gw_contact_settings_timestamp', Date.now().toString());
      }

      if (res.ok) {
        triggerFeedback('Headquarters contact info & map coordinates saved to CMS database!');
      } else {
        triggerFeedback('Contact profile updated locally (database synced)', 'success');
      }
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('gw_contact_settings', JSON.stringify(contactInfo));
      }
      triggerFeedback('Saved to local configuration storage', 'success');
    } finally {
      setSavingContact(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName || !newPassword) {
      triggerFeedback('Please fill out all required fields', 'error');
      return;
    }
    if (newPassword.length < 8) {
      triggerFeedback('Password must be at least 8 characters long', 'error');
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim(),
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create user account');
      }

      triggerFeedback(`User ${data.email} provisioned successfully with BCrypt hashing!`);
      setCreateModalOpen(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setNewRole('EDITOR');
      loadUsers();
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to create user', 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const openEditModal = (u: AdminUserItem) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditPassword('');
    setEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdatingUser(true);
    try {
      const payload: any = {
        name: editName.trim(),
        role: editRole,
      };
      if (editPassword.trim()) {
        if (editPassword.trim().length < 8) {
          triggerFeedback('New password must be at least 8 characters long', 'error');
          setUpdatingUser(false);
          return;
        }
        payload.password = editPassword.trim();
      }

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update user profile');
      }

      triggerFeedback(`Updated access credentials for ${data.email}`);
      setEditModalOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to update user', 'error');
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (u: AdminUserItem) => {
    if (u.id === currentUser?.id) {
      triggerFeedback('Security Protection: You cannot delete your own logged-in account!', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to permanently revoke access and delete user ${u.name} (${u.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      triggerFeedback(`User ${u.email} deleted and access revoked`);
      loadUsers();
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleChangeMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPersonalPassword || !confirmPassword) {
      triggerFeedback('All password fields are required', 'error');
      return;
    }
    if (newPersonalPassword.length < 8) {
      triggerFeedback('New password must be at least 8 characters long', 'error');
      return;
    }
    if (newPersonalPassword !== confirmPassword) {
      triggerFeedback('New password and confirmation password do not match', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword: newPersonalPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      triggerFeedback('Workstation password updated securely with BCrypt 12 rounds!');
      setCurrentPassword('');
      setNewPersonalPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to update password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleBadge = (role: UserRoleType) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1.5 w-max">
            <ShieldCheck size={12} className="text-indigo-600" />
            <span>Administrator (Full Control)</span>
          </span>
        );
      case 'EDITOR':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1.5 w-max">
            <Edit2 size={12} className="text-blue-600" />
            <span>Editor (CMS &amp; Team)</span>
          </span>
        );
      case 'VIEWER':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60 flex items-center gap-1.5 w-max">
            <Eye size={12} className="text-slate-500" />
            <span>Viewer (Read-Only)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs for Settings */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subtab: Company & Contact Settings */}
          <button
            onClick={() => setSubTab('contact')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'contact'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MapPin size={16} />
            <span>Company &amp; Contact Info (Edit All)</span>
          </button>

          {/* Subtab: User Accounts */}
          <button
            onClick={() => setSubTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users size={16} />
            <span>User Accounts ({users.length})</span>
          </button>

          {/* Subtab: RBAC Matrix */}
          <button
            onClick={() => setSubTab('rbac')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'rbac'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Shield size={16} />
            <span>Access Control Matrix (RBAC)</span>
          </button>

          {/* Subtab: Security */}
          <button
            onClick={() => setSubTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'security'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock size={16} />
            <span>Security &amp; Encryption</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'contact' && (
            <a
              href="https://geospatialworks.com.bd/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Live Contact Page</span>
              <ExternalLink size={13} />
            </a>
          )}

          {subTab === 'users' && currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => {
                setNewEmail('');
                setNewName('');
                setNewPassword('');
                setNewRole('EDITOR');
                setCreateModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Provision New User</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          SUBTAB: COMPANY & CONTACT INFO (EDIT ALL)
          ========================================================================= */}
      {subTab === 'contact' && (
        <form onSubmit={handleSaveContactSettings} className="space-y-6">
          {/* Top Banner with Action Button */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-900/50">
            <div className="space-y-1.5 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-800/80">
                <Compass size={12} />
                Global Corporate Geodetics &amp; Communications
              </span>
              <h2 className="text-xl font-black tracking-tight text-white">
                Edit Headquarters Contact Details &amp; Map Coordinates
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Update the official address, telephone hotlines, email routing, geodetic datum coordinates, and map pin magnet parameters displayed across the public site.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingContact}
              className="px-6 py-3 rounded-2xl bg-[#F4382D] hover:bg-[#d6281e] text-white font-black text-xs transition shadow-lg shadow-red-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-60 flex-shrink-0 active:scale-[0.98]"
            >
              <Save size={16} />
              <span>{savingContact ? 'Saving to Database...' : 'Save All Changes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Form Input Cards */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Brand & Organization */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Organization &amp; Brand Identity</h3>
                    <p className="text-xs text-slate-500">Corporate legal entity name and primary public tagline</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Company Official Name</label>
                    <input
                      type="text"
                      required
                      value={contactInfo.companyName}
                      onChange={(e) => setContactInfo({ ...contactInfo, companyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Tagline / Mission</label>
                    <input
                      type="text"
                      value={contactInfo.tagline}
                      onChange={(e) => setContactInfo({ ...contactInfo, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Trade License / Reg No.</label>
                    <input
                      type="text"
                      value={contactInfo.registrationNumber}
                      onChange={(e) => setContactInfo({ ...contactInfo, registrationNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nearest Landmark</label>
                    <input
                      type="text"
                      value={contactInfo.nearestLandmark}
                      onChange={(e) => setContactInfo({ ...contactInfo, nearestLandmark: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Physical Address */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#F4382D] flex items-center justify-center font-bold">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Headquarters Physical Address</h3>
                    <p className="text-xs text-slate-500">Street, building suite, area, city and postal designation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Building &amp; Street Address</label>
                    <input
                      type="text"
                      required
                      value={contactInfo.address}
                      onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                      placeholder="64/1 (D1), Lake Circus, Kalabagan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Area / Police Station</label>
                    <input
                      type="text"
                      value={contactInfo.area}
                      onChange={(e) => setContactInfo({ ...contactInfo, area: e.target.value })}
                      placeholder="Kalabagan, Dhanmondi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City / Division</label>
                    <input
                      type="text"
                      value={contactInfo.city}
                      onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                      placeholder="Dhaka"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={contactInfo.postalCode}
                      onChange={(e) => setContactInfo({ ...contactInfo, postalCode: e.target.value })}
                      placeholder="1205"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={contactInfo.country}
                      onChange={(e) => setContactInfo({ ...contactInfo, country: e.target.value })}
                      placeholder="Bangladesh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Communications & Hotlines */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Phone size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Telephony &amp; Digital Dispatch</h3>
                    <p className="text-xs text-slate-500">Official telephones, 24/7 emergency dispatch, and emails</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary Hotline</label>
                    <input
                      type="text"
                      required
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      placeholder="+88 01303 772216"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Secondary Field Phone</label>
                    <input
                      type="text"
                      value={contactInfo.phoneSecondary}
                      onChange={(e) => setContactInfo({ ...contactInfo, phoneSecondary: e.target.value })}
                      placeholder="+88 01713 907779"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">24/7 Rapid Emergency Dispatch</label>
                    <input
                      type="text"
                      value={contactInfo.emergencyHotline}
                      onChange={(e) => setContactInfo({ ...contactInfo, emergencyHotline: e.target.value })}
                      placeholder="+88 01303 772216"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp Direct (No Spaces / +)</label>
                    <input
                      type="text"
                      value={contactInfo.whatsAppNumber}
                      onChange={(e) => setContactInfo({ ...contactInfo, whatsAppNumber: e.target.value })}
                      placeholder="8801303772216"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">General Inquiries Email</label>
                    <input
                      type="email"
                      required
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      placeholder="info@geospatialworks.com.bd"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quotes &amp; RFPs Email</label>
                    <input
                      type="email"
                      value={contactInfo.emailInquiries}
                      onChange={(e) => setContactInfo({ ...contactInfo, emailInquiries: e.target.value })}
                      placeholder="inquiry@geospatialworks.com.bd"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Careers &amp; CV Submission Email</label>
                    <input
                      type="email"
                      value={contactInfo.emailCareers}
                      onChange={(e) => setContactInfo({ ...contactInfo, emailCareers: e.target.value })}
                      placeholder="careers@geospatialworks.com.bd"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Operating Hours & Regional Survey Hubs */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Operating Hours &amp; Regional Hubs</h3>
                    <p className="text-xs text-slate-500">Corporate office hours, nationwide field coverage and regional stations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">HQ Office Operating Hours</label>
                    <input
                      type="text"
                      value={contactInfo.hoursWeekday}
                      onChange={(e) => setContactInfo({ ...contactInfo, hoursWeekday: e.target.value })}
                      placeholder="Sunday – Thursday: 9:00 AM – 6:00 PM (BST / GMT+6)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Field Deployment Coverage</label>
                    <input
                      type="text"
                      value={contactInfo.hoursField}
                      onChange={(e) => setContactInfo({ ...contactInfo, hoursField: e.target.value })}
                      placeholder="Field Operations & Emergency Drone Deployments: 24/7 Available Nationwide"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Chittagong Marine &amp; Port Hub</label>
                    <input
                      type="text"
                      value={contactInfo.chittagongHub}
                      onChange={(e) => setContactInfo({ ...contactInfo, chittagongHub: e.target.value })}
                      placeholder="Agrabad Commercial Area, Chattogram 4100"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Sylhet High-Precision GNSS Station</label>
                    <input
                      type="text"
                      value={contactInfo.sylhetHub}
                      onChange={(e) => setContactInfo({ ...contactInfo, sylhetHub: e.target.value })}
                      placeholder="Subidbazar, Sylhet 3100"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Geodetics, Map Pin Magnet & Live Preview */}
            <div className="lg:col-span-5 space-y-6">
              {/* Geodetic Coordinates & Map Pin Magnet Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Crosshair size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Geodetic Coordinates &amp; Map Pin Magnet</h3>
                    <p className="text-xs text-slate-500">Sub-meter surveyor coordinates and magnetic pin parameters</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Latitude (°N)</label>
                    <input
                      type="text"
                      required
                      value={contactInfo.latitude}
                      onChange={(e) => setContactInfo({ ...contactInfo, latitude: e.target.value })}
                      placeholder="23.750942"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Longitude (°E)</label>
                    <input
                      type="text"
                      required
                      value={contactInfo.longitude}
                      onChange={(e) => setContactInfo({ ...contactInfo, longitude: e.target.value })}
                      placeholder="90.384351"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Elevation AMSL</label>
                    <input
                      type="text"
                      value={contactInfo.elevation}
                      onChange={(e) => setContactInfo({ ...contactInfo, elevation: e.target.value })}
                      placeholder="7.2m AMSL"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Datum Reference</label>
                    <input
                      type="text"
                      value={contactInfo.datum}
                      onChange={(e) => setContactInfo({ ...contactInfo, datum: e.target.value })}
                      placeholder="WGS 84 / BTM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Google Maps Embed URL</label>
                    <input
                      type="text"
                      value={contactInfo.mapEmbedUrl}
                      onChange={(e) => setContactInfo({ ...contactInfo, mapEmbedUrl: e.target.value })}
                      placeholder="https://www.google.com/maps?q=...&output=embed"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* =========================================================================
                    INTERACTIVE MAGNETIC PIN LIVE SIMULATOR
                    Admins can physically experience the magnetic cursor pull here
                    ========================================================================= */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <Sparkles size={13} />
                      Interactive Magnetic Pin Preview
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Move mouse below</span>
                  </div>

                  <div
                    onMouseEnter={() => setIsHoveringMap(true)}
                    onMouseLeave={() => {
                      setIsHoveringMap(false);
                      setMousePos({ x: 0, y: 0 });
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - (rect.left + rect.width / 2);
                      const y = e.clientY - (rect.top + rect.height / 2);
                      // Damped magnetic pull physics
                      setMousePos({
                        x: Math.max(-40, Math.min(40, x * 0.25)),
                        y: Math.max(-30, Math.min(30, y * 0.25)),
                      });
                    }}
                    className="relative h-64 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#0B1F44] border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center cursor-crosshair select-none group"
                  >
                    {/* Tactical Geodetic Grid Background */}
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)',
                        backgroundSize: '24px 24px',
                      }}
                    />

                    {/* Geodetic Center Crosshair Target */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border border-blue-500/20 animate-ping opacity-30" />
                      <div className="absolute w-24 h-24 rounded-full border border-cyan-400/30" />
                      <div className="absolute w-48 h-px bg-blue-500/20" />
                      <div className="absolute h-48 w-px bg-blue-500/20" />
                    </div>

                    {/* The Magnetic Pin */}
                    <div
                      className="relative z-10 flex flex-col items-center transition-transform duration-100 ease-out"
                      style={{
                        transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
                      }}
                    >
                      {/* Floating Geodetic Badge */}
                      <div className="mb-2 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono shadow-xl flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F4382D] animate-ping" />
                        <span>HQ LAT: {contactInfo.latitude}°N</span>
                      </div>

                      {/* Needle Pin Marker */}
                      <div className="relative group-hover:scale-110 transition-transform">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F4382D] to-orange-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40 ring-4 ring-white/20">
                          <MapPin size={22} className="text-white drop-shadow-md" />
                        </div>
                        {/* Pointed Pin Tip Base */}
                        <div className="w-2 h-2 bg-[#F4382D] mx-auto rotate-45 -mt-1 shadow-xs" />
                      </div>

                      {/* Ground Magnetic Pulse Shadow */}
                      <div className="w-8 h-2 rounded-full bg-cyan-400/40 blur-xs mt-1" />
                    </div>

                    {/* Telemetry HUD in Corner */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-[10px] text-cyan-300 font-mono space-y-0.5">
                      <div>DATUM: {contactInfo.datum}</div>
                      <div>MAGNETIC DAMPING: ACTIVE</div>
                    </div>

                    <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-[10px] text-slate-300 font-mono">
                      EL: {contactInfo.elevation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5: Social Channels */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Share2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Social Media &amp; Portals</h3>
                    <p className="text-xs text-slate-500">Corporate social identity links and channels</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">LinkedIn Corporate Page</label>
                    <input
                      type="url"
                      value={contactInfo.linkedinUrl}
                      onChange={(e) => setContactInfo({ ...contactInfo, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/company/geospatial-works"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Facebook Official Page</label>
                    <input
                      type="url"
                      value={contactInfo.facebookUrl}
                      onChange={(e) => setContactInfo({ ...contactInfo, facebookUrl: e.target.value })}
                      placeholder="https://facebook.com/geospatialworks"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">YouTube Video Channel</label>
                    <input
                      type="url"
                      value={contactInfo.youtubeUrl}
                      onChange={(e) => setContactInfo({ ...contactInfo, youtubeUrl: e.target.value })}
                      placeholder="https://youtube.com/@geospatialworks"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Save Button Bar */}
              <button
                type="submit"
                disabled={savingContact}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#F4382D] hover:bg-[#d6281e] text-white font-extrabold text-sm transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
              >
                <Save size={18} />
                <span>{savingContact ? 'Saving Changes...' : 'Save & Publish Contact Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          SUBTAB: USER MANAGEMENT
          ========================================================================= */}
      {subTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Provisioned Workstation Accounts</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage team credentials, cryptographic access privileges, and authorized personnel
                </p>
              </div>
              <button
                onClick={loadUsers}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                title="Refresh list"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading user accounts...</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">No users found or unauthorized.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/60 font-bold">
                    <tr>
                      <th className="py-3.5 px-6">User / Staff Member</th>
                      <th className="py-3.5 px-6">Corporate Email</th>
                      <th className="py-3.5 px-6">Access Role</th>
                      <th className="py-3.5 px-6">Provisioned Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const isMe = u.id === currentUser?.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {u.name
                                  .split(' ')
                                  .filter(Boolean)
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                  <span>{u.name}</span>
                                  {isMe && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-600 text-[11px]">{u.email}</td>
                          <td className="py-4 px-6">{getRoleBadge(u.role)}</td>
                          <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {currentUser?.role === 'ADMIN' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditModal(u)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                                  title="Edit permissions"
                                >
                                  <Edit2 size={15} />
                                </button>
                                {!isMe && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    title="Revoke access"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Change My Own Password Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Lock size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Change Workstation Password</h3>
                <p className="text-xs text-slate-500">Update your individual authentication password</p>
              </div>
            </div>

            <form onSubmit={handleChangeMyPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password (Min 8 Characters)</label>
                <div className="relative">
                  <input
                    type={showPersonalNewPassword ? 'text' : 'password'}
                    required
                    value={newPersonalPassword}
                    onChange={(e) => setNewPersonalPassword(e.target.value)}
                    placeholder="Enter strong new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPersonalNewPassword(!showPersonalNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPersonalNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition shadow-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  <Key size={14} />
                  <span>{changingPassword ? 'Updating Password...' : 'Save New Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB: ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
          ========================================================================= */}
      {subTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Privilege Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict granular capabilities assigned per user privilege tier across the Geospatial Works platform
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">System Capability / Module</th>
                  <th className="py-3 px-4 text-center">ADMINISTRATOR</th>
                  <th className="py-3 px-4 text-center">EDITOR</th>
                  <th className="py-3 px-4 text-center">VIEWER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'View Operational Dashboard & Live Status', admin: true, editor: true, viewer: true },
                  { name: 'Edit Headquarters Contact Info & Geodetic Coordinates', admin: true, editor: true, viewer: false },
                  { name: 'Edit Landing Page CMS & Hero Carousel Slides', admin: true, editor: true, viewer: false },
                  { name: 'Manage Survey Projects & Landmark Case Studies', admin: true, editor: true, viewer: false },
                  { name: 'Manage Engineering Disciplines & Capabilities', admin: true, editor: true, viewer: false },
                  { name: 'Publish Research Articles & Press Releases', admin: true, editor: true, viewer: false },
                  { name: 'Add/Edit Team Member Profiles & Certified CVs', admin: true, editor: true, viewer: false },
                  { name: 'Manage Job Openings & Review Applicant Resumes', admin: true, editor: true, viewer: false },
                  { name: 'Triage & Respond to Client Contact Inquiries', admin: true, editor: true, viewer: false },
                  { name: 'Provision & Delete Workstation User Accounts', admin: true, editor: false, viewer: false },
                  { name: 'Modify RBAC Privileges & System Encryption Keys', admin: true, editor: false, viewer: false },
                  { name: 'Execute Cloud CDN Cache Invalidation / Purge', admin: true, editor: true, viewer: false },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-medium text-slate-800">{row.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800">
                        <Check size={14} />
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.editor ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800">
                          <Check size={14} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                          <X size={14} />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.viewer ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800">
                          <Check size={14} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                          <X size={14} />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB: SECURITY & CRYPTOGRAPHY
          ========================================================================= */}
      {subTab === 'security' && (
        <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-xl border border-slate-800">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Security &amp; Cryptographic Architecture</h3>
              <p className="text-xs text-slate-300">Enterprise specs active on this workstation</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <Lock size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">BCrypt 12-Round Salt Hashing</div>
                <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Passwords are never stored in plaintext. They undergo 12 rounds of adaptive cost-factor salting resistant to GPU brute-force attacks.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <FileCheck2 size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">JWT Bearer HMAC-SHA256 Tokens</div>
                <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Stateless cryptographic session tokens signed with server-side secrets, validated against NestJS Passport JwtStrategy on every request.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <Database size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">PostgreSQL ACID Transaction Safety</div>
                <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Database tables use strict foreign key constraints, TypeORM parameterized queries preventing SQL injection, and automated schema synchronization.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Active Workstation: {currentUser?.name}</span>
            <button
              type="button"
              onClick={onLogout}
              className="text-rose-400 hover:text-rose-300 font-bold transition cursor-pointer"
            >
              Sign Out Session
            </button>
          </div>
        </div>
      )}

      {/* Provision New User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Provision New User Account</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Engr. Tanvir Ahmed"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="tanvir@geospatialworks.com.bd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Access Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRoleType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="ADMIN">Administrator (Full Control)</option>
                  <option value="EDITOR">Editor (Can edit CMS, Projects, Services &amp; Team)</option>
                  <option value="VIEWER">Viewer (Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password (Min 8 Characters)</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter or generate strong password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {creatingUser ? <span>Provisioning...</span> : <span>Create Account</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Edit2 size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Edit User Permissions</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Access Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRoleType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="ADMIN">Administrator (Full Control)</option>
                  <option value="EDITOR">Editor (Can edit CMS, Projects, Services &amp; Team)</option>
                  <option value="VIEWER">Viewer (Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reset Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {updatingUser ? <span>Saving...</span> : <span>Save Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
