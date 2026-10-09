"use client";

import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  Key, 
  Bell,
  X,
  UserPlus
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Support Lead' | 'Content Editor' | 'Survey Manager';
  status: 'active' | 'pending';
}

const initialTeam: TeamMember[] = [
  { id: 'usr-1', name: 'Alvee (Lead Admin)', email: 'admin@geospatialworks.com', role: 'Super Admin', status: 'active' },
  { id: 'usr-2', name: 'Tanvir Ahmed', email: 'tanvir@geospatialworks.com', role: 'Survey Manager', status: 'active' },
  { id: 'usr-3', name: 'Nasrin Sultana', email: 'support@geospatialworks.com', role: 'Support Lead', status: 'active' },
];

export default function SettingsAdmin() {
  const [activeTab, setActiveTab] = useState<'security' | 'team' | 'contact' | 'notifications'>('security');
  const [saveToast, setSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Settings updated successfully!');

  // Password Change Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  // Contact Info Form
  const [contactForm, setContactForm] = useState({
    phone: '+8801303772216',
    email: 'info@geospatialworks.com',
    emergencyPhone: '+8801700001122',
    address: 'House #12, Road #04, Block #B, Banani, Dhaka-1213, Bangladesh',
    hours: 'Monday – Friday, 9:00 AM – 6:00 PM (EST)'
  });

  // Team Members State
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Support Lead' as TeamMember['role']
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailLeads: true,
    whatsAppAlerts: true,
    aiEscalationAlerts: true,
    weeklyReport: false
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Password updated successfully!');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    const created: TeamMember = {
      id: `usr-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'active'
    };

    setTeam([...team, created]);
    setAddMemberOpen(false);
    setNewMember({ name: '', email: '', role: 'Support Lead' });
    showToast('Team member added!');
  };

  const handleRemoveMember = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
    showToast('Team member removed.');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-gray-800 flex items-center space-x-2 text-xs font-bold animate-in fade-in duration-300">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Settings & Contact Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage user passwords, admin staff accounts, company contact details, and notifications.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'security' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          <Lock size={15} />
          <span>Password & Security</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'team' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          <User size={15} />
          <span>Team Accounts ({team.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'contact' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          <Phone size={15} />
          <span>Contact Information</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'notifications' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          <Bell size={15} />
          <span>Alert Notifications</span>
        </button>
      </div>

      {/* Tab 1: Password & Security */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6 max-w-2xl">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <Key size={18} className="text-gray-700" />
            <h3 className="font-bold text-gray-900 text-sm">Change Admin Password</h3>
          </div>

          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">New Password (Min 8 characters)</label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Team Accounts Management */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Staff & Admin Accounts</h3>
              <p className="text-xs text-gray-500">Manage team members who have access to the Admin Panel.</p>
            </div>

            <button
              onClick={() => setAddMemberOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {team.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{member.name}</td>
                    <td className="py-3.5 px-4 text-gray-600">{member.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {member.role !== 'Super Admin' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Contact Information */}
      {activeTab === 'contact' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5 max-w-3xl">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Company Contact Information</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Primary Phone / WhatsApp</label>
                <input
                  type="text"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:bg-white focus:border-emerald-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Emergency Hotline Phone</label>
                <input
                  type="text"
                  value={contactForm.emergencyPhone}
                  onChange={(e) => setContactForm({ ...contactForm, emergencyPhone: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:bg-white focus:border-emerald-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Official Support Email</label>
              <input
                type="text"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:bg-white focus:border-emerald-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Office Physical Address</label>
              <input
                type="text"
                value={contactForm.address}
                onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Operating Business Hours</label>
              <input
                type="text"
                value={contactForm.hours}
                onChange={(e) => setContactForm({ ...contactForm, hours: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => showToast('Contact Information Saved!')}
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Save size={15} />
                <span>Save Contact Details</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5 max-w-2xl">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Notification Preferences</h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="font-bold text-gray-900 block">Email Alerts for New Leads</span>
                <span className="text-gray-500 text-[11px]">Receive instant email when a customer submits a lead form.</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailLeads}
                onChange={(e) => setNotifications({ ...notifications, emailLeads: e.target.checked })}
                className="w-4 h-4 accent-emerald-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="font-bold text-gray-900 block">WhatsApp Instant Alerts</span>
                <span className="text-gray-500 text-[11px]">Receive phone notifications when incoming WhatsApp support messages arrive.</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.whatsAppAlerts}
                onChange={(e) => setNotifications({ ...notifications, whatsAppAlerts: e.target.checked })}
                className="w-4 h-4 accent-emerald-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="font-bold text-gray-900 block">AI Human Escalation Alerts</span>
                <span className="text-gray-500 text-[11px]">Get alerted when AI Chatbot requests human intervention.</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.aiEscalationAlerts}
                onChange={(e) => setNotifications({ ...notifications, aiEscalationAlerts: e.target.checked })}
                className="w-4 h-4 accent-emerald-700 cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => showToast('Notification Preferences Saved!')}
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Save size={15} />
                <span>Save Notification Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {addMemberOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddMember} className="bg-white w-full max-w-md rounded-2xl p-6 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Add New Staff Member</h3>
              <button type="button" onClick={() => setAddMemberOpen(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g. Arif Hossain"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="arif@geospatialworks.com"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Assign Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as TeamMember['role'] })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-emerald-600"
                >
                  <option value="Support Lead">Support Lead</option>
                  <option value="Survey Manager">Survey Manager</option>
                  <option value="Content Editor">Content Editor</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2">
              <button type="button" onClick={() => setAddMemberOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl">Add Member</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
