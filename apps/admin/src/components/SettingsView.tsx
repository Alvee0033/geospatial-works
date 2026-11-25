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
  Plus,
} from 'lucide-react';
import { Button, PageHeader } from './ui';
import { InteractiveMapPicker } from './ui/InteractiveMapPicker';

export type UserRoleType = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  permissions?: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

const PERMISSION_MODULES = [
  { key: 'dashboard', label: 'Dashboard', description: 'View overview metrics and recent items' },
  { key: 'landing', label: 'Homepage', description: 'Edit hero slides, manifesto, and partners' },
  { key: 'projects', label: 'Projects', description: 'Create, edit, and delete portfolio projects' },
  { key: 'services', label: 'Services', description: 'Manage service offerings and capabilities' },
  { key: 'news', label: 'News & Articles', description: 'Publish and edit news and case studies' },
  { key: 'about', label: 'About Us', description: 'Edit company story, safety, and standards' },
  { key: 'team', label: 'Team & CVs', description: 'Manage team profiles and CV documents' },
  { key: 'careers', label: 'Careers', description: 'Manage job openings and applications' },
  { key: 'inquiries', label: 'Enquiries', description: 'View and update client enquiries' },
  { key: 'inbox', label: 'Messages', description: 'Read and reply in unified inbox' },
  { key: 'settings', label: 'Settings & Users', description: 'Manage contact info, users, and permissions' },
] as const;

function defaultPermissionsForRole(role: UserRoleType): Record<string, boolean> {
  if (role === 'ADMIN') {
    return Object.fromEntries(PERMISSION_MODULES.map((m) => [m.key, true]));
  }
  if (role === 'EDITOR') {
    return Object.fromEntries(PERMISSION_MODULES.map((m) => [m.key, m.key !== 'settings']));
  }
  return Object.fromEntries(
    PERMISSION_MODULES.map((m) => [m.key, m.key === 'dashboard' || m.key === 'inquiries'])
  );
}

export interface ContactInfoSettings {
  officeName: string;
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
  website: string;
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
  officeName: 'Corporate Office',
  companyName: 'Geospatial Works',
  tagline: 'Pioneering Ground Truth & Spatial Intelligence Across Bangladesh',
  registrationNumber: 'TRAD/DSCC/012948/2021',
  address: 'Plot 14, Road 02',
  area: 'Aram Housing, 40ft, Bosila, Mohammadpur',
  city: 'Dhaka',
  postalCode: '1207',
  country: 'Bangladesh',
  nearestLandmark: '',
  latitude: '',
  longitude: '',
  elevation: '7.2m AMSL',
  datum: 'WGS 84 / Bangladesh Transverse Mercator (BTM)',
  mapEmbedUrl:
    'https://www.google.com/maps?q=Plot%2014%2C%20Road%2002%2C%20Aram%20Housing%2C%2040ft%2C%20Bosila%2C%20Mohammadpur%2C%20Dhaka-1207&output=embed',
  phone: '+880 1713 90 77 79',
  phoneSecondary: '',
  emergencyHotline: '',
  email: 'md.geospatialworks@gmail.com',
  emailInquiries: 'md.geospatialworks@gmail.com',
  emailCareers: 'md.geospatialworks@gmail.com',
  website: 'https://www.geospatialworks.com.bd',
  whatsAppNumber: '8801713907779',
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
  const [selectedPermUserId, setSelectedPermUserId] = useState<string>('');
  const [permRole, setPermRole] = useState<UserRoleType>('EDITOR');
  const [permDraft, setPermDraft] = useState<Record<string, boolean>>(() => defaultPermissionsForRole('EDITOR'));
  const [savingPerms, setSavingPerms] = useState(false);
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
      if (!res.ok) throw new Error('Unable to load contact details from the database.');
      const data = await res.json();
      const contactSec = Array.isArray(data)
        ? data.find((s: any) => s.sectionKey === 'contact_info')
        : data?.contact_info || data;
      if (contactSec?.content) setContactInfo({ ...defaultContactInfo, ...contactSec.content });
    } catch (error) {
      console.error('Failed to load contact settings from CMS database', error);
      triggerFeedback('Could not load contact details from the database. Check the API connection.', 'error');
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

      if (res.ok) {
        triggerFeedback('Corporate office contact details saved to the database.');
      } else {
        const detail = await res.text().catch(() => '');
        throw new Error(detail || 'The database rejected the update.');
      }
    } catch (err: any) {
      triggerFeedback(err?.message || 'Could not save contact details to the database.', 'error');
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
      <div className="bg-white rounded-xl border border-slate-200 p-2 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'contact' as const, label: 'Contact & Office', icon: <MapPin size={14} /> },
            { id: 'users' as const, label: `Users (${users.length})`, icon: <Users size={14} /> },
            { id: 'rbac' as const, label: 'Permissions', icon: <Shield size={14} /> },
            { id: 'security' as const, label: 'Security', icon: <Lock size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pr-1">
          {subTab === 'contact' && (
            <a
              href="http://localhost:3001/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <span>View /contact</span>
              <ExternalLink size={12} className="text-slate-400" />
            </a>
          )}

          {subTab === 'users' && currentUser?.role === 'ADMIN' && (
            <Button
              size="sm"
              onClick={() => {
                setNewEmail('');
                setNewName('');
                setNewPassword('');
                setNewRole('EDITOR');
                setCreateModalOpen(true);
              }}
              icon={<UserPlus size={14} />}
            >
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* =========================================================================
          SUBTAB: COMPANY & CONTACT INFO (EDIT ALL)
          ========================================================================= */}
      {subTab === 'contact' && (
        <form onSubmit={handleSaveContactSettings} className="space-y-6">
          <PageHeader
            title="Contact & Office Details"
            description="Update your company address, phone numbers, email, and map embed shown on the website"
            actions={
              <Button type="submit" loading={savingContact} icon={<Save size={15} />}>
                Save Changes
              </Button>
            }
          />

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
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Office Name</label>
                    <input
                      type="text"
                      required
                      value={contactInfo.officeName}
                      onChange={(e) => setContactInfo({ ...contactInfo, officeName: e.target.value })}
                      placeholder="Corporate Office"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
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
                    <h3 className="text-sm font-extrabold text-slate-900">Corporate Office Address</h3>
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
                      placeholder="Plot 14, Road 02"
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
                      placeholder="+880 1713 90 77 79"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Secondary Field Phone</label>
                    <input
                      type="text"
                      value={contactInfo.phoneSecondary}
                      onChange={(e) => setContactInfo({ ...contactInfo, phoneSecondary: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">24/7 Rapid Emergency Dispatch</label>
                    <input
                      type="text"
                      value={contactInfo.emergencyHotline}
                      onChange={(e) => setContactInfo({ ...contactInfo, emergencyHotline: e.target.value })}
                      placeholder="Optional"
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
                      placeholder="md.geospatialworks@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quotes &amp; RFPs Email</label>
                    <input
                      type="email"
                      value={contactInfo.emailInquiries}
                      onChange={(e) => setContactInfo({ ...contactInfo, emailInquiries: e.target.value })}
                      placeholder="md.geospatialworks@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Careers &amp; CV Submission Email</label>
                    <input
                      type="email"
                      value={contactInfo.emailCareers}
                      onChange={(e) => setContactInfo({ ...contactInfo, emailCareers: e.target.value })}
                      placeholder="md.geospatialworks@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={contactInfo.website}
                      onChange={(e) => setContactInfo({ ...contactInfo, website: e.target.value })}
                      placeholder="https://www.geospatialworks.com.bd"
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

            {/* Right 5 Columns: Map Pin Selector, Map Links & Social Media */}
            <div className="lg:col-span-5 space-y-5">
              {/* Map Pin Location & Links */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Office Map &amp; Pin Location</h3>
                      <p className="text-xs text-slate-500">Tap on the map to set pin location</p>
                    </div>
                  </div>
                  <a
                    href={
                      contactInfo.latitude && contactInfo.longitude
                        ? `https://www.google.com/maps?q=${contactInfo.latitude},${contactInfo.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${contactInfo.address}, ${contactInfo.city}`
                          )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition shrink-0"
                  >
                    Open Google Maps <ExternalLink size={11} />
                  </a>
                </div>

                <InteractiveMapPicker
                  latitude={contactInfo.latitude}
                  longitude={contactInfo.longitude}
                  onChange={(lat, lng) =>
                    setContactInfo({
                      ...contactInfo,
                      latitude: lat,
                      longitude: lng,
                      mapEmbedUrl: `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`,
                    })
                  }
                />

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                    <input
                      type="text"
                      value={contactInfo.latitude}
                      onChange={(e) => setContactInfo({ ...contactInfo, latitude: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                    <input
                      type="text"
                      value={contactInfo.longitude}
                      onChange={(e) => setContactInfo({ ...contactInfo, longitude: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Google Maps Link</label>
                    <input
                      type="text"
                      value={contactInfo.mapEmbedUrl}
                      onChange={(e) => setContactInfo({ ...contactInfo, mapEmbedUrl: e.target.value })}
                      placeholder="https://www.google.com/maps?q=..."
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links with Add / Remove */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Share2 size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Social Media Links</h3>
                      <p className="text-xs text-slate-500">Add or remove company social channels</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      const current = (contactInfo as any).socialLinks || [
                        ...(contactInfo.linkedinUrl ? [{ platform: 'LinkedIn', url: contactInfo.linkedinUrl }] : []),
                        ...(contactInfo.facebookUrl ? [{ platform: 'Facebook', url: contactInfo.facebookUrl }] : []),
                        ...(contactInfo.youtubeUrl ? [{ platform: 'YouTube', url: contactInfo.youtubeUrl }] : []),
                      ];
                      setContactInfo({
                        ...contactInfo,
                        socialLinks: [...current, { platform: 'LinkedIn', url: '' }],
                      } as any);
                    }}
                    icon={<Plus size={13} />}
                  >
                    Add
                  </Button>
                </div>

                {(() => {
                  const list: { platform: string; url: string }[] = (contactInfo as any).socialLinks || [
                    { platform: 'LinkedIn', url: contactInfo.linkedinUrl || '' },
                    { platform: 'Facebook', url: contactInfo.facebookUrl || '' },
                    { platform: 'YouTube', url: contactInfo.youtubeUrl || '' },
                  ];

                  const updateList = (next: { platform: string; url: string }[]) => {
                    const linkedin = next.find((x) => x.platform.toLowerCase().includes('linkedin'))?.url || '';
                    const facebook = next.find((x) => x.platform.toLowerCase().includes('facebook'))?.url || '';
                    const youtube = next.find((x) => x.platform.toLowerCase().includes('youtube'))?.url || '';
                    setContactInfo({
                      ...contactInfo,
                      linkedinUrl: linkedin,
                      facebookUrl: facebook,
                      youtubeUrl: youtube,
                      socialLinks: next,
                    } as any);
                  };

                  return (
                    <div className="space-y-2.5">
                      {list.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No social links added. Click Add to create one.</p>
                      ) : (
                        list.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <select
                              value={item.platform}
                              onChange={(e) => {
                                const next = [...list];
                                next[idx] = { ...next[idx], platform: e.target.value };
                                updateList(next);
                              }}
                              className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shrink-0"
                            >
                              <option value="LinkedIn">LinkedIn</option>
                              <option value="Facebook">Facebook</option>
                              <option value="YouTube">YouTube</option>
                              <option value="Instagram">Instagram</option>
                              <option value="X / Twitter">X / Twitter</option>
                              <option value="WhatsApp">WhatsApp</option>
                              <option value="Website">Website</option>
                            </select>
                            <input
                              type="url"
                              value={item.url}
                              onChange={(e) => {
                                const next = [...list];
                                next[idx] = { ...next[idx], url: e.target.value };
                                updateList(next);
                              }}
                              placeholder="https://..."
                              className="flex-1 min-w-0 h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => updateList(list.filter((_, i) => i !== idx))}
                              className="h-9 w-9 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer shrink-0"
                              title="Remove social link"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })()}
              </div>

              <Button
                type="submit"
                loading={savingContact}
                className="w-full"
                size="lg"
                icon={<Save size={16} />}
              >
                Save Contact Settings
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          SUBTAB: USER MANAGEMENT
          ========================================================================= */}
      {subTab === 'users' && (
        <div className="space-y-6">
          <PageHeader
            title="Team Users"
            description="Manage admin panel accounts, roles, and access"
            actions={
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={loadUsers} loading={loading} icon={<RefreshCw size={13} />}>
                  Refresh
                </Button>
                {currentUser?.role === 'ADMIN' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setNewEmail('');
                      setNewName('');
                      setNewPassword('');
                      setNewRole('EDITOR');
                      setCreateModalOpen(true);
                    }}
                    icon={<UserPlus size={14} />}
                  >
                    Add User
                  </Button>
                )}
              </div>
            }
          />

          {/* Role Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Users', count: users.length, tone: 'text-slate-900' },
              { label: 'Administrators', count: users.filter((u) => u.role === 'ADMIN').length, tone: 'text-indigo-700' },
              { label: 'Editors', count: users.filter((u) => u.role === 'EDITOR').length, tone: 'text-emerald-700' },
              { label: 'Viewers', count: users.filter((u) => u.role === 'VIEWER').length, tone: 'text-slate-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-2xs">
                <p className="text-[11px] font-semibold text-slate-500">{s.label}</p>
                <p className={`text-xl font-bold tabular-nums mt-0.5 ${s.tone}`}>{s.count}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading user accounts...</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-3 px-5">User</th>
                      <th className="py-3 px-5">Email</th>
                      <th className="py-3 px-5">Role</th>
                      <th className="py-3 px-5">Added</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const isMe = u.id === currentUser?.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {u.name
                                  .split(' ')
                                  .filter(Boolean)
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-semibold text-slate-900 truncate">{u.name}</span>
                                {isMe && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600">{u.email}</td>
                          <td className="py-3.5 px-5">{getRoleBadge(u.role)}</td>
                          <td className="py-3.5 px-5 text-slate-500 tabular-nums">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            {currentUser?.role === 'ADMIN' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => openEditModal(u)}
                                  icon={<Edit2 size={12} />}
                                >
                                  Edit
                                </Button>
                                {!isMe && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                    onClick={() => handleDeleteUser(u)}
                                    icon={<Trash2 size={13} />}
                                  >
                                    Remove
                                  </Button>
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
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition shadow-2xs flex items-center gap-2 disabled:opacity-60 cursor-pointer"
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
      {subTab === 'rbac' && (() => {
        const activePermUser = users.find((u) => u.id === selectedPermUserId) || users[0] || null;
        const effectivePerms =
          selectedPermUserId && activePermUser?.id === selectedPermUserId
            ? permDraft
            : activePermUser?.permissions || defaultPermissionsForRole(activePermUser?.role || 'EDITOR');
        const effectiveRole =
          selectedPermUserId && activePermUser?.id === selectedPermUserId
            ? permRole
            : activePermUser?.role || 'EDITOR';

        const selectUserForPerms = (userId: string) => {
          const u = users.find((x) => x.id === userId);
          setSelectedPermUserId(userId);
          if (u) {
            setPermRole(u.role);
            setPermDraft(u.permissions || defaultPermissionsForRole(u.role));
          }
        };

        const applyRolePreset = (role: UserRoleType) => {
          if (activePermUser && selectedPermUserId !== activePermUser.id) {
            setSelectedPermUserId(activePermUser.id);
          }
          setPermRole(role);
          setPermDraft(defaultPermissionsForRole(role));
        };

        const togglePerm = (key: string) => {
          const base = activePermUser && selectedPermUserId !== activePermUser.id
            ? activePermUser.permissions || defaultPermissionsForRole(activePermUser.role)
            : permDraft;
          if (activePermUser && selectedPermUserId !== activePermUser.id) {
            setSelectedPermUserId(activePermUser.id);
            setPermRole(activePermUser.role);
          }
          setPermDraft({ ...base, [key]: !base[key] });
        };

        const saveUserPermissions = async () => {
          if (!activePermUser) return;
          setSavingPerms(true);
          try {
            const res = await fetch(`/api/users/${activePermUser.id}`, {
              method: 'PATCH',
              headers: getAuthHeaders(),
              body: JSON.stringify({ role: effectiveRole, permissions: effectivePerms }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Failed to update permissions');
            triggerFeedback(`Saved permissions for ${activePermUser.name}.`);
            await loadUsers();
          } catch (err: any) {
            triggerFeedback(err?.message || 'Could not save permissions.', 'error');
          } finally {
            setSavingPerms(false);
          }
        };

        return (
          <div className="space-y-5">
            <PageHeader
              title="User Permissions"
              description="Select a user to configure their role and module access"
              actions={
                <Button
                  onClick={saveUserPermissions}
                  loading={savingPerms}
                  disabled={!activePermUser || currentUser?.role !== 'ADMIN'}
                  icon={<Save size={14} />}
                >
                  Save Permissions
                </Button>
              }
            />

            {users.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No users available.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left: User Picker */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select User</h4>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                    {users.map((u) => {
                      const isSelected = activePermUser?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => selectUserForPerms(u.id)}
                          className={`w-full px-4 py-3 text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                            isSelected ? 'bg-indigo-50/80 border-l-2 border-l-indigo-600' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Selected User Role & Module Toggles */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-5">
                  {activePermUser && (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{activePermUser.name}</h3>
                          <p className="text-xs text-slate-500">{activePermUser.email}</p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                          {(['ADMIN', 'EDITOR', 'VIEWER'] as UserRoleType[]).map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => applyRolePreset(role)}
                              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                                effectiveRole === role
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {role === 'ADMIN' ? 'Admin' : role === 'EDITOR' ? 'Editor' : 'Viewer'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PERMISSION_MODULES.map((mod) => {
                          const enabled = Boolean(effectivePerms[mod.key]);
                          return (
                            <button
                              key={mod.key}
                              type="button"
                              onClick={() => togglePerm(mod.key)}
                              className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                                enabled
                                  ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300'
                                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900">{mod.label}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{mod.description}</p>
                              </div>
                              <span
                                className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                                  enabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                                }`}
                              >
                                <span className="w-4 h-4 rounded-full bg-white shadow-2xs" />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* =========================================================================
          SUBTAB: SECURITY & CRYPTOGRAPHY
          ========================================================================= */}
      {subTab === 'security' && (
        <div className="bg-white rounded-xl p-6 text-slate-900 space-y-5 shadow-2xs border border-slate-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security &amp; Authentication</h3>
              <p className="text-xs text-slate-500">Active session and database protection settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <Lock size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Password Hashing</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Passwords are stored using BCrypt adaptive hashing (12 rounds).
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <FileCheck2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Signed Session Tokens</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Admin API requests are authenticated with signed JWT bearer tokens.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <Database size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">PostgreSQL Storage</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Parameterized queries and relational constraints protect all CMS data.
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
