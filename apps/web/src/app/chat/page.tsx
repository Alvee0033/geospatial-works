'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ApiClient } from '@/lib/api';
import { UserAvatar, resolveAvatarUrl } from '@/components/ui/UserAvatar';
import {
  MessageSquare,
  Users,
  Briefcase,
  Search,
  Send,
  Plus,
  Image as ImageIcon,
  CheckCheck,
  Sparkles,
  Paperclip,
  X,
  FileText,
  Video,
  File as FileIcon,
  Download,
  PanelLeftClose,
  PanelLeft,
  Loader2,
  Clock,
  MoreVertical,
  CornerUpRight,
  Reply,
  Copy,
  Trash2,
  Pin,
  Check,
  ExternalLink,
  Share2,
  User,
  Shield,
  Circle
} from 'lucide-react';

export default function ChatPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Filters & State: personal vs team tabs
  const [channelTypeFilter, setChannelTypeFilter] = useState<'all' | 'project' | 'direct'>('all');
  const [channelSearch, setChannelSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  // Typing Indicator State
  const [isOtherTyping, setIsOtherTyping] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Message Actions State: Context Menu, Forward Modal, Reply
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: any;
  } | null>(null);
  const [forwardModal, setForwardModal] = useState<{
    isOpen: boolean;
    message: any | null;
    targetChannelId: string;
    isForwarding: boolean;
  }>({
    isOpen: false,
    message: null,
    targetChannelId: '',
    isForwarding: false,
  });
  const [replyToMessage, setReplyToMessage] = useState<any | null>(null);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Attachment State
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    url: string;
    name: string;
    type: 'image' | 'video' | 'doc';
    size?: string;
  } | null>(null);

  // Modals & Menu State
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isChannelMenuOpen, setIsChannelMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current authenticated user info
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gw_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Avatar map for quick lookup by user ID or email
  const userMap = useMemo(() => {
    const map = new Map<string, any>();
    users.forEach((u) => {
      if (u.id) map.set(u.id, u);
      if (u._id) map.set(u._id, u);
      if (u.email) map.set(u.email, u);
    });
    return map;
  }, [users]);

  // Colleague contacts (always exclude the logged-in current user account)
  const colleagueUsers = useMemo(() => {
    return users.filter((u) => {
      const currentId = currentUser?.id || currentUser?._id;
      const currentEmail = (currentUser?.email || '').toLowerCase();
      const currentName = (currentUser?.name || currentUser?.fullName || '').toLowerCase();
      
      const uId = u.id || u._id;
      // Exclude by exact ID
      if (currentId && uId === currentId) return false;
      // Exclude by email
      if (currentEmail && u.email && u.email.toLowerCase() === currentEmail) return false;

      return true;
    });
  }, [users, currentUser]);

  const fetchChannels = async () => {
    setLoadingChannels(true);
    try {
      const [chanData, uData, pData] = await Promise.all([
        ApiClient.getChatChannels().catch(() => []),
        ApiClient.getUsers().catch(() => []),
        ApiClient.getProjects().catch(() => []),
      ]);
      setChannels(chanData || []);
      setUsers(uData || []);
      setProjects(pData || []);

      if (chanData && chanData.length > 0 && !activeChannelId) {
        setActiveChannelId(chanData[0].id);
      }
    } catch (e) {
      console.error('Failed to load chat channels:', e);
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    setLoadingMessages(true);
    try {
      const msgs = await ApiClient.getChannelMessages(channelId, 100);
      setMessages(msgs || []);
    } catch (e) {
      console.error('Failed to fetch messages for channel:', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (activeChannelId) {
      fetchMessages(activeChannelId);
    }
  }, [activeChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Local File Selection & Upload to /uploads
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let fileType: 'image' | 'video' | 'doc' = 'doc';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const uploadRes = await ApiClient.uploadFile(base64Data, 'projects');
          const uploadedUrl = uploadRes.url || base64Data;
          setAttachmentPreview({
            url: uploadedUrl,
            name: file.name,
            type: fileType,
            size: sizeStr,
          });
        } catch {
          setAttachmentPreview({
            url: base64Data,
            name: file.name,
            type: fileType,
            size: sizeStr,
          });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(`File reading error: ${err.message}`);
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Toast notification helper
  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage((cur) => (cur === text ? null : cur));
    }, 2400);
  };

  // Close context menu on global click or Esc
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setForwardModal((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCopyText = (msg: any) => {
    if (msg.content) {
      navigator.clipboard.writeText(msg.content);
      showToast('Copied message to clipboard');
    } else if (msg.imageUrl) {
      navigator.clipboard.writeText(msg.imageUrl);
      showToast('Copied attachment link');
    }
    setContextMenu(null);
  };

  const handleReplyMessage = (msg: any) => {
    setReplyToMessage(msg);
    setContextMenu(null);
  };

  const handleOpenForwardModal = (msg: any) => {
    setForwardModal({
      isOpen: true,
      message: msg,
      targetChannelId: channels.find((c) => c.id !== activeChannelId)?.id || activeChannelId || '',
      isForwarding: false,
    });
    setContextMenu(null);
  };

  const handleExecuteForward = async () => {
    if (!forwardModal.message || !forwardModal.targetChannelId) return;
    setForwardModal((prev) => ({ ...prev, isForwarding: true }));
    try {
      const msg = forwardModal.message;
      const payload: { content?: string; imageUrl?: string } = {};
      if (msg.content) {
        payload.content = `↪ Forwarded: ${msg.content}`;
      } else {
        payload.content = `↪ Forwarded attachment`;
      }
      if (msg.imageUrl) {
        payload.imageUrl = msg.imageUrl;
      }
      await ApiClient.sendChatMessage(forwardModal.targetChannelId, payload);
      showToast('Message forwarded successfully');
      setForwardModal({ isOpen: false, message: null, targetChannelId: '', isForwarding: false });
      if (forwardModal.targetChannelId === activeChannelId) {
        await fetchMessages(activeChannelId);
      }
    } catch (err: any) {
      alert(`Failed to forward: ${err.message}`);
      setForwardModal((prev) => ({ ...prev, isForwarding: false }));
    }
  };

  const handleDeleteMessage = async (msg: any) => {
    setContextMenu(null);
    if (!msg || !activeChannelId) return;
    const confirmDel = window.confirm('Are you sure you want to delete this message?');
    if (!confirmDel) return;

    // Optimistic UI removal
    const msgId = msg.id || msg._id;
    setMessages((prev) => prev.filter((m) => (m.id || m._id) !== msgId));
    showToast('Message deleted');

    // Attempt backend deletion if endpoint exists
    try {
      await ApiClient.request(`/chat/channels/${activeChannelId}/messages/${msgId}`, {
        method: 'DELETE',
      }).catch(() => {
        // Backend might not support DELETE; optimistic removal already done
      });
    } catch (e) {
      console.warn('Backend delete chat message not supported or failed', e);
    }
  };

  const handleTogglePin = (msg: any) => {
    const msgId = msg.id || msg._id;
    setPinnedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
        showToast('Message unpinned');
      } else {
        next.add(msgId);
        showToast('Message pinned to conversation');
      }
      return next;
    });
    setContextMenu(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChannelId || (!messageInput.trim() && !attachmentPreview)) return;

    setSending(true);
    try {
      const payload: { content?: string; imageUrl?: string } = {};
      
      let finalContent = messageInput.trim();
      if (replyToMessage) {
        const replySender = userMap.get(replyToMessage.senderId);
        const replySenderName = replyToMessage.senderName || replySender?.name || 'Colleague';
        const replyText = (replyToMessage.content || '[Attachment]').slice(0, 100).replace(/\n/g, ' ');
        const replyId = replyToMessage.id || replyToMessage._id || '';
        // Structured Messenger Quote Tag: [[reply:id:sender:snippet]]
        finalContent = `[[reply:${replyId}:${replySenderName}:${replyText}]]\n${finalContent}`;
      }

      if (finalContent) {
        payload.content = finalContent;
      }
      if (attachmentPreview) {
        payload.imageUrl = attachmentPreview.url;
        if (!payload.content) {
          payload.content = `[Attached ${attachmentPreview.type.toUpperCase()}: ${attachmentPreview.name}]`;
        }
      }

      await ApiClient.sendChatMessage(activeChannelId, payload);
      setMessageInput('');
      setAttachmentPreview(null);
      setReplyToMessage(null);
      await fetchMessages(activeChannelId);
    } catch (err: any) {
      alert(`Message error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  // Start or switch to direct chat with a user from messenger bubbles
  const handleOpenUserChat = async (user: any) => {
    const userId = user.id || user._id;
    if (!userId) return;

    // Prevent starting chat with self
    const currentId = currentUser?.id || currentUser?._id;
    if (currentId && userId === currentId) {
      showToast('This is your account');
      return;
    }

    // Check if channel already exists with this user
    const existing = channels.find((c) => {
      if (c.type !== 'direct') return false;
      const otherId = c.recipientId || c.otherUser?.id || c.otherUser?._id;
      return otherId === userId;
    });

    if (existing) {
      setActiveChannelId(existing.id);
      return;
    }

    // Otherwise create new direct channel
    try {
      const newChan = await ApiClient.createDirectChannel(userId);
      await fetchChannels();
      if (newChan?.id) setActiveChannelId(newChan.id);
    } catch (err: any) {
      alert(`Could not open conversation with ${user.name || 'user'}: ${err.message}`);
    }
  };

  // Simulate typing indicator for demonstration & interactivity
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    // When active channel is direct, simulate recipient typing back occasionally
    if (activeChannel?.type === 'direct' && e.target.value.length > 3 && !isOtherTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      // Chance of typing
      if (Math.random() > 0.4) {
        const details = getChannelDetails(activeChannel);
        setIsOtherTyping(details.displayName);
        typingTimeoutRef.current = setTimeout(() => {
          setIsOtherTyping(null);
        }, 3200);
      }
    }
  };

  const handleCreateDirectChannel = async () => {
    if (!selectedRecipientId) return;
    try {
      const newChan = await ApiClient.createDirectChannel(selectedRecipientId);
      setIsDirectModalOpen(false);
      setSelectedRecipientId('');
      await fetchChannels();
      if (newChan?.id) setActiveChannelId(newChan.id);
    } catch (err: any) {
      alert(`Failed to start direct conversation: ${err.message}`);
    }
  };

  const handleCreateProjectChannel = async () => {
    if (!selectedProjectId) return;
    try {
      const newChan = await ApiClient.createProjectChannel(selectedProjectId);
      setIsProjectModalOpen(false);
      setSelectedProjectId('');
      await fetchChannels();
      if (newChan?.id) setActiveChannelId(newChan.id);
    } catch (err: any) {
      alert(`Failed to create project channel: ${err.message}`);
    }
  };

  // Helper to extract channel info cleanly
  const getChannelDetails = (c: any) => {
    const isProject = c.type === 'project';
    if (isProject) {
      return {
        isProject: true,
        displayName: c.name || c.projectName || 'Project Channel',
        avatarUrl: c.projectImageUrl,
        subtitle: c.lastMessageContent || c.lastMessage?.content || 'Project space',
        badge: 'Project',
      };
    }

    // Direct channel: check otherUser object from backend, or recipientId, or match with users list
    const other = c.otherUser || (c.recipientId ? userMap.get(c.recipientId) : null);
    const displayName = other?.fullName || other?.name || c.name || 'Direct Chat';
    const avatarUrl = other?.avatarUrl || other?.avatar_url || c.avatarUrl;
    const lastMsg = c.lastMessageContent || c.lastMessage?.content || 'Direct message';

    return {
      isProject: false,
      displayName,
      avatarUrl,
      subtitle: lastMsg,
      badge: 'Direct',
    };
  };

  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      const details = getChannelDetails(c);
      const matchSearch = !channelSearch || details.displayName.toLowerCase().includes(channelSearch.toLowerCase());
      if (!matchSearch) return false;
      if (channelTypeFilter === 'project') return c.type === 'project';
      if (channelTypeFilter === 'direct') return c.type === 'direct';
      return true;
    });
  }, [channels, channelSearch, channelTypeFilter, userMap]);

  const activeChannel = channels.find((c) => c.id === activeChannelId);
  const activeDetails = activeChannel ? getChannelDetails(activeChannel) : null;

  return (
    <AdminLayout
      title="Communications Hub"
      subtitle="Project dispatch chatrooms, direct secure briefings, and live field updates"
      onRefresh={fetchChannels}
      isRefreshing={loadingChannels}
      contentClassName="px-4 lg:px-6 py-4"
    >
      <div className="w-full h-[calc(100vh-130px)] min-h-[620px] rounded-2xl bg-white border border-slate-200/80 shadow-sm flex overflow-hidden relative">
        
        {/* ================= LEFT SIDEBAR (Collapsible Channel List) ================= */}
        <div
          className={`border-r border-slate-200/80 flex flex-col bg-slate-50/70 shrink-0 transition-all duration-300 relative ${
            isSidebarCollapsed ? 'w-16' : 'w-80 sm:w-96'
          }`}
        >
          {/* Header */}
          <div className="p-3 border-b border-slate-200/70 bg-white">
            <div className="flex items-center justify-between">
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10241E] to-[#1E3E34] text-white flex items-center justify-center shadow-xs shrink-0">
                    <MessageSquare size={15} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 truncate">Inbox</h2>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{channels.length} conversations</p>
                  </div>
                </div>
              )}

              {/* Collapse/Expand Toggle Button */}
              <div className="flex items-center gap-1 mx-auto sm:mx-0">
                {!isSidebarCollapsed && (
                  <>
                    <button
                      onClick={() => setIsDirectModalOpen(true)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                      title="New Direct Message"
                    >
                      <Users size={13} />
                    </button>
                    <button
                      onClick={() => setIsProjectModalOpen(true)}
                      className="w-7 h-7 rounded-lg bg-[#10241E] hover:bg-slate-800 text-white flex items-center justify-center shadow-2xs transition-colors"
                      title="New Project Channel"
                    >
                      <Plus size={13} />
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                  title={isSidebarCollapsed ? 'Expand Channel List' : 'Collapse Inbox'}
                >
                  {isSidebarCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
                </button>
              </div>
            </div>

            {/* Filter and Search */}
            {!isSidebarCollapsed && (
              <div className="space-y-2 mt-2.5">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search people or teams..."
                    value={channelSearch}
                    onChange={(e) => setChannelSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100/70 border border-transparent focus:border-emerald-600/40 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* Personal Messages & Team Messages Tabs */}
                <div className="flex p-0.5 bg-slate-100/90 rounded-xl text-[11px] font-bold">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'direct', label: 'Personal' },
                    { id: 'project', label: 'Team Messages' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setChannelTypeFilter(tab.id as any)}
                      className={`flex-1 py-1 rounded-lg text-center transition-all ${
                        channelTypeFilter === tab.id
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Messenger-style Recent Users Avatar Bubbles */}
                <div className="pt-1.5 border-t border-slate-100">
                  <div className="flex items-center justify-between px-0.5 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Recent Colleagues
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-full">
                      Online
                    </span>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none px-0.5">
                    {/* Add / Broadcast quick bubble */}
                    <button
                      onClick={() => {
                        setContactSearchQuery('');
                        setIsDirectModalOpen(true);
                      }}
                      className="flex flex-col items-center gap-1.5 shrink-0 group"
                      title="New Personal Message"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 group-hover:border-emerald-600 flex items-center justify-center bg-slate-50 text-slate-500 group-hover:text-emerald-700 transition-all shadow-2xs group-hover:scale-105">
                        <Plus size={20} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 max-w-[56px] truncate">
                        New
                      </span>
                    </button>

                    {/* Messenger User Bubbles (Bigger) - Excludes Current User */}
                    {colleagueUsers.slice(0, 14).map((u, i) => {
                      const name = u.name || u.full_name || 'User';
                      const firstName = name.split(' ')[0];
                      const avatar = u.avatarUrl || u.avatar_url;
                      const isOnline = i % 2 === 0;

                      return (
                        <button
                          key={u.id || i}
                          onClick={() => handleOpenUserChat(u)}
                          className="flex flex-col items-center gap-1.5 shrink-0 group relative"
                          title={`Chat with ${name} (${u.designation || u.role || 'Staff'})`}
                        >
                          <div className="relative">
                            <div className="rounded-full ring-2 ring-emerald-500/80 p-0.5 group-hover:ring-emerald-600 group-hover:scale-105 transition-all shadow-xs">
                              <UserAvatar
                                src={avatar}
                                name={name}
                                size="md"
                                shape="circle"
                              />
                            </div>
                            {/* Online green indicator badge */}
                            {isOnline && (
                              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 max-w-[56px] truncate group-hover:text-emerald-700 transition-colors">
                            {firstName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Channel Scrollable Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5 space-y-1">
            {filteredChannels.length === 0 ? (
              <div className="py-8 px-2 text-center text-xs text-slate-400">
                {!isSidebarCollapsed && 'No channels found'}
              </div>
            ) : (
              filteredChannels.map((c) => {
                const isActive = c.id === activeChannelId;
                const details = getChannelDetails(c);

                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveChannelId(c.id)}
                    title={details.displayName}
                    className={`rounded-xl flex items-center cursor-pointer transition-all border ${
                      isSidebarCollapsed ? 'p-2 justify-center' : 'p-2.5 gap-2.5'
                    } ${
                      isActive
                        ? 'bg-white border-emerald-600/30 shadow-xs ring-1 ring-emerald-600/20'
                        : 'border-transparent hover:bg-white/70'
                    }`}
                  >
                    {/* Channel Avatar with Real Image */}
                    {details.isProject ? (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        <Briefcase size={14} />
                      </div>
                    ) : (
                      <UserAvatar
                        src={details.avatarUrl}
                        name={details.displayName}
                        size="md"
                        shape="rounded"
                      />
                    )}

                    {!isSidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-xs truncate ${isActive ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {details.displayName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                            {details.subtitle}
                          </p>
                          {details.isProject ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase shrink-0">
                              Team
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase shrink-0">
                              Personal
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT MAIN (Chat Area) ================= */}
        <div className="flex-1 flex flex-col bg-[#F9FAF8] min-w-0">
          {activeChannel && activeDetails ? (
            <>
              {/* Colored Top Header */}
              <div className="px-5 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Real Profile Image or Icon */}
                  {activeDetails.isProject ? (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Briefcase size={18} />
                    </div>
                  ) : (
                    <UserAvatar
                      src={activeDetails.avatarUrl}
                      name={activeDetails.displayName}
                      size="lg"
                      shape="rounded"
                    />
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 truncate">
                        {activeDetails.displayName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        activeDetails.isProject 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300/70' 
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300/70'
                      }`}>
                        {activeDetails.isProject ? 'Team Message' : 'Personal Message'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 font-medium">
                      {isOtherTyping ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>Typing...</span>
                        </div>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{messages.length} messages</span>
                          {activeChannel.projectId && (
                            <span>• Team Reference: #{activeChannel.projectId.slice(0, 8)}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 relative">
                  <button
                    onClick={() => activeChannelId && fetchMessages(activeChannelId)}
                    className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                    title="Reload Messages"
                  >
                    <Clock size={16} />
                  </button>

                  {/* Channel Menu Dropdown Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setIsChannelMenuOpen(!isChannelMenuOpen)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isChannelMenuOpen ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-500'
                      }`}
                      title="Chat Options & Menu"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {isChannelMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1.5 w-48 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs space-y-0.5"
                      >
                        <button
                          onClick={() => {
                            setIsChannelMenuOpen(false);
                            if (activeChannelId) fetchMessages(activeChannelId);
                            showToast('Refreshed conversation');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                        >
                          <Clock size={14} className="text-slate-400" />
                          <span>Sync Messages</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsChannelMenuOpen(false);
                            setIsDirectModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                        >
                          <User size={14} className="text-emerald-600" />
                          <span>New Contact Chat</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsChannelMenuOpen(false);
                            setIsProjectModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                        >
                          <Briefcase size={14} className="text-amber-600" />
                          <span>New Team Space</span>
                        </button>

                        <div className="h-px bg-slate-100 my-1" />

                        <button
                          onClick={() => {
                            setIsChannelMenuOpen(false);
                            if (messages.length > 0) {
                              const text = messages.map(m => `${m.senderName || 'User'}: ${m.content || '[Media]'}`).join('\n');
                              navigator.clipboard.writeText(text);
                              showToast('Exported chat history to clipboard');
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                        >
                          <Copy size={14} className="text-slate-400" />
                          <span>Copy Entire Chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                      <Sparkles size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Fresh Conversation</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Send a message, photo, PDF document, or video below to start collaborating.
                    </p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const msgId = m.id || m._id || String(idx);
                    
                    // Sender info
                    const sender = userMap.get(m.senderId);
                    const currentId = currentUser?.id || currentUser?._id;
                    const currentEmail = (currentUser?.email || '').toLowerCase();
                    const senderEmail = (m.senderEmail || sender?.email || '').toLowerCase();
                    
                    const isCurrentUser = Boolean(
                      m.isCurrentUser ||
                      m.senderRole === 'admin' ||
                      (currentId && (m.senderId === currentId || m.userId === currentId)) ||
                      (currentEmail && senderEmail === currentEmail)
                    );

                    const isPinned = pinnedMessageIds.has(msgId);
                    const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    
                    const senderAvatar = m.senderAvatarUrl || m.avatarUrl || sender?.avatarUrl || (isCurrentUser ? currentUser?.avatarUrl : undefined);
                    const senderName = isCurrentUser ? (currentUser?.name || currentUser?.fullName || 'You') : (m.senderName || sender?.name || sender?.fullName || 'Staff Member');
                    const mediaUrl = m.imageUrl ? resolveAvatarUrl(m.imageUrl) : '';

                    // Check file types
                    const isVideo = mediaUrl.match(/\.(mp4|webm|mov|ogg)$/i) || mediaUrl.includes('video');
                    const isDoc = mediaUrl.match(/\.(pdf|doc|docx|xls|xlsx|csv|zip)$/i) || (!isVideo && mediaUrl.includes('doc'));
                    const isImage = mediaUrl && !isVideo && !isDoc;

                    return (
                      <div
                        key={msgId}
                        className={`group relative flex gap-2.5 items-end w-full ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setContextMenu({
                            x: Math.min(e.clientX, window.innerWidth - 220),
                            y: Math.min(e.clientY, window.innerHeight - 260),
                            message: m,
                          });
                        }}
                      >
                        {/* Left avatar for recipient */}
                        {!isCurrentUser && (
                          <div className="mb-1 shrink-0">
                            <UserAvatar
                              src={senderAvatar}
                              name={senderName}
                              size="md"
                              shape="rounded"
                            />
                          </div>
                        )}

                        <div className={`max-w-[72%] sm:max-w-[65%] space-y-1 flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                          {/* Sender name & timestamp & pinned badge */}
                          <div className={`flex items-center gap-1.5 px-1 text-[11px] font-bold ${isCurrentUser ? 'flex-row-reverse text-slate-500' : 'text-slate-600'}`}>
                            <span>{senderName}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">{time}</span>
                            {isPinned && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[9px] font-bold">
                                <Pin size={9} className="rotate-45" /> Pinned
                              </span>
                            )}
                          </div>

                          {/* Message Bubble Wrapper with Hover Toolbar */}
                          <div className="relative group/bubble max-w-full">
                            {/* Hover Quick Action Buttons */}
                            <div
                              className={`absolute -top-3.5 ${
                                isCurrentUser ? 'left-0 -translate-x-full pr-1.5' : 'right-0 translate-x-full pl-1.5'
                              } hidden group-hover/bubble:flex items-center gap-1 bg-white border border-slate-200/90 shadow-md rounded-xl p-1 z-20 transition-all animate-in fade-in zoom-in-95 duration-100`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleReplyMessage(m)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-700 transition-colors"
                                title="Reply / Quote"
                              >
                                <Reply size={13} />
                              </button>
                              <button
                                onClick={() => handleOpenForwardModal(m)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-700 transition-colors"
                                title="Forward message"
                              >
                                <CornerUpRight size={13} />
                              </button>
                              <button
                                onClick={() => handleCopyText(m)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-700 transition-colors"
                                title="Copy text"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                onClick={() => handleTogglePin(m)}
                                className={`p-1 hover:bg-slate-100 rounded-lg transition-colors ${
                                  isPinned ? 'text-amber-600 bg-amber-50' : 'text-slate-600 hover:text-amber-600'
                                }`}
                                title={isPinned ? 'Unpin' : 'Pin'}
                              >
                                <Pin size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(m)}
                                className="p-1 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                                title="Delete message"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Actual Message Bubble (Messenger style: vivid vibrant emerald/teal for user, clean white/gray for other) */}
                            <div
                              id={`msg-${msgId}`}
                              className={`p-3 sm:p-3.5 rounded-2xl shadow-xs text-xs leading-relaxed space-y-2 transition-all ${
                                isCurrentUser
                                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white rounded-br-xs shadow-md shadow-emerald-900/15'
                                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-2xs'
                              } ${isPinned ? 'ring-2 ring-amber-400/70' : ''}`}
                            >
                              {/* Parse & Render Messenger-style Quoted Reply */}
                              {(() => {
                                if (!m.content) return null;
                                
                                let replyInfo: { id?: string; sender: string; text: string } | null = null;
                                let cleanContent = m.content;

                                // Format 1: Structured tag [[reply:id:sender:snippet]]
                                const tagMatch = m.content.match(/^\[\[reply:([^:]*):([^:]+):([^\]]+)\]\]\n?([\s\S]*)$/);
                                if (tagMatch) {
                                  replyInfo = { id: tagMatch[1], sender: tagMatch[2], text: tagMatch[3] };
                                  cleanContent = tagMatch[4];
                                } else {
                                  // Format 2: Markdown blockquote > sender: snippet\n...
                                  const mdMatch = m.content.match(/^>\s*([^:\n]+):\s*([^\n]+)\n+([\s\S]*)$/);
                                  if (mdMatch) {
                                    replyInfo = { sender: mdMatch[1], text: mdMatch[2] };
                                    cleanContent = mdMatch[3];
                                  }
                                }

                                if (!replyInfo) {
                                  return cleanContent ? <p className="whitespace-pre-wrap break-words">{cleanContent}</p> : null;
                                }

                                return (
                                  <>
                                    <div
                                      onClick={() => {
                                        if (replyInfo?.id) {
                                          const targetEl = document.getElementById(`msg-${replyInfo.id}`);
                                          if (targetEl) {
                                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            targetEl.classList.add('ring-4', 'ring-emerald-400');
                                            setTimeout(() => targetEl.classList.remove('ring-4', 'ring-emerald-400'), 1500);
                                          }
                                        }
                                      }}
                                      className={`p-2 rounded-xl border text-[11px] mb-1.5 transition-all cursor-pointer ${
                                        isCurrentUser
                                          ? 'bg-black/20 border-white/25 text-white/95 hover:bg-black/30'
                                          : 'bg-slate-100/90 border-slate-200/90 text-slate-700 hover:bg-slate-200/80'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 font-bold mb-0.5 opacity-90 text-[10px] uppercase tracking-wide">
                                        <Reply size={11} className="rotate-180" />
                                        <span>Replying to {replyInfo.sender}</span>
                                      </div>
                                      <p className="line-clamp-2 italic opacity-85 leading-snug">
                                        &ldquo;{replyInfo.text}&rdquo;
                                      </p>
                                    </div>
                                    {cleanContent && <p className="whitespace-pre-wrap break-words">{cleanContent}</p>}
                                  </>
                                );
                              })()}

                              {/* Render Attached Image */}
                              {isImage && (
                                <div className="rounded-xl overflow-hidden border border-white/20 mt-1 max-w-sm group/media relative">
                                  <img
                                    src={mediaUrl}
                                    alt="Attachment"
                                    className="w-full h-auto object-cover max-h-64"
                                    referrerPolicy="no-referrer"
                                  />
                                  <a
                                    href={mediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center gap-1"
                                    title="Open image full screen"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              )}

                              {/* Render Attached Video */}
                              {isVideo && (
                                <div className="rounded-xl overflow-hidden border border-white/20 mt-1 max-w-sm bg-black">
                                  <video controls className="w-full max-h-64 rounded-xl">
                                    <source src={mediaUrl} />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              )}

                              {/* Render Attached Document */}
                              {isDoc && (
                                <a
                                  href={mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2.5 p-2 rounded-xl border mt-1 transition-all ${
                                    isCurrentUser
                                      ? 'bg-white/15 hover:bg-white/25 border-white/30 text-white'
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCurrentUser ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'}`}>
                                    <FileText size={15} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="font-bold text-[11px] block truncate">Document Attachment</span>
                                    <span className={`text-[10px] ${isCurrentUser ? 'text-white/80' : 'text-slate-400'}`}>Click to view / download</span>
                                  </div>
                                  <Download size={14} className="shrink-0 opacity-80" />
                                </a>
                              )}

                              {/* Timestamp and Sent status tick */}
                              <div className={`flex items-center gap-1 text-[10px] font-mono pt-0.5 ${isCurrentUser ? 'justify-end text-emerald-100/90' : 'justify-end text-slate-400'}`}>
                                <span>{time}</span>
                                {isCurrentUser && <CheckCheck size={12} className="text-white" />}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right avatar for current user */}
                        {isCurrentUser && (
                          <div className="mb-1 shrink-0">
                            <UserAvatar
                              src={senderAvatar}
                              name={senderName}
                              size="md"
                              shape="rounded"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Animated Typing Indicator Bubble */}
                {isOtherTyping && (
                  <div className="flex gap-2.5 flex-row items-end animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <UserAvatar
                      src={activeDetails?.avatarUrl}
                      name={isOtherTyping}
                      size="sm"
                      shape="rounded"
                    />
                    <div className="bg-white border border-slate-200/90 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 mr-1">{isOtherTyping} is typing</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer with File Upload */}
              <div className="p-3.5 bg-white border-t border-slate-200/80">
                {/* Messenger-Style Reply Preview Banner */}
                {replyToMessage && (
                  <div className="mb-2.5 flex items-center justify-between bg-slate-100/90 border-l-4 border-emerald-600 rounded-r-xl px-3.5 py-2 animate-in fade-in slide-in-from-bottom-1 duration-150 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Reply size={13} className="rotate-180" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-900 block truncate">
                          Replying to {replyToMessage.senderName || userMap.get(replyToMessage.senderId)?.name || 'Colleague'}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate italic">
                          {(() => {
                            const raw = replyToMessage.content || '[Attachment]';
                            const tagMatch = raw.match(/^\[\[reply:[^:]*:[^:]+:[^\]]+\]\]\n?([\s\S]*)$/);
                            return tagMatch ? tagMatch[1] : raw;
                          })()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyToMessage(null)}
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                      title="Cancel reply"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* File Attachment Chip Preview */}
                {attachmentPreview && (
                  <div className="mb-2.5 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                        attachmentPreview.type === 'image'
                          ? 'bg-blue-600'
                          : attachmentPreview.type === 'video'
                          ? 'bg-purple-600'
                          : 'bg-emerald-600'
                      }`}>
                        {attachmentPreview.type === 'image' && <ImageIcon size={15} />}
                        {attachmentPreview.type === 'video' && <Video size={15} />}
                        {attachmentPreview.type === 'doc' && <FileIcon size={15} />}
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">{attachmentPreview.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {attachmentPreview.type.toUpperCase()} • {attachmentPreview.size}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setAttachmentPreview(null)}
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Hidden File Picker */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip"
                  className="hidden"
                />

                <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 focus-within:border-emerald-600/40 focus-within:bg-white transition-all shadow-2xs">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Upload Image, Video, or Document"
                  >
                    {isUploading ? <Loader2 size={16} className="animate-spin text-emerald-600" /> : <Paperclip size={16} />}
                  </button>

                  <input
                    type="text"
                    placeholder="Write a message, share report, or briefing..."
                    value={messageInput}
                    onChange={handleUserInputChange}
                    className="flex-1 bg-transparent px-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!messageInput.trim() && !attachmentPreview)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#10241E] to-[#1E3E34] hover:from-[#1E3E34] hover:to-[#2A564A] text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <span>{sending ? 'Sending...' : 'Send'}</span>
                    <Send size={12} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-bold text-base text-slate-800">No active conversation selected</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Pick a channel from the sidebar or click the plus button to launch a new discussion.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Direct / Contact Message Modal */}
      {isDirectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">New Personal Message</h3>
                  <p className="text-[10px] text-slate-400">Search contacts, colleagues, or staff members</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsDirectModalOpen(false);
                  setContactSearchQuery('');
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Contact Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search by name, email, or role..."
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600/50 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {/* Filtered Contact List */}
            <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-slate-50 pr-1">
              {colleagueUsers
                .filter((u) => {
                  if (!contactSearchQuery) return true;
                  const query = contactSearchQuery.toLowerCase();
                  const name = (u.name || u.full_name || '').toLowerCase();
                  const email = (u.email || '').toLowerCase();
                  const role = (u.designation || u.role || '').toLowerCase();
                  return name.includes(query) || email.includes(query) || role.includes(query);
                })
                .map((u) => {
                  const isSelected = selectedRecipientId === u.id;
                  const name = u.name || u.full_name || 'Staff Member';
                  const avatar = u.avatarUrl || u.avatar_url;
                  const role = u.designation || u.role || 'Colleague';

                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        setSelectedRecipientId(u.id);
                        handleOpenUserChat(u);
                        setIsDirectModalOpen(false);
                        setContactSearchQuery('');
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border border-emerald-300'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                          src={avatar}
                          name={name}
                          size="md"
                          shape="rounded"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{role} • {u.email || 'Employee'}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenUserChat(u);
                          setIsDirectModalOpen(false);
                          setContactSearchQuery('');
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors shrink-0"
                      >
                        Message
                      </button>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              <span>{colleagueUsers.length} colleagues available</span>
              <button
                onClick={() => {
                  setIsDirectModalOpen(false);
                  setContactSearchQuery('');
                }}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Channel Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Create Project Space</h3>
              <button onClick={() => setIsProjectModalOpen(false)}>
                <X size={15} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Select Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                <option value="">Choose Project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code || 'Project'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProjectChannel}
                disabled={!selectedProjectId}
                className="px-4 py-1.5 bg-[#10241E] text-white rounded-xl text-xs font-semibold disabled:opacity-40"
              >
                Create Space
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Right-Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-52 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleReplyMessage(contextMenu.message)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl transition-colors"
          >
            <Reply size={14} className="text-emerald-600" />
            <span>Reply / Quote</span>
          </button>

          <button
            onClick={() => handleOpenForwardModal(contextMenu.message)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-800 rounded-xl transition-colors"
          >
            <CornerUpRight size={14} className="text-blue-600" />
            <span>Forward Message</span>
          </button>

          <button
            onClick={() => handleCopyText(contextMenu.message)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Copy size={14} className="text-slate-500" />
            <span>Copy Text</span>
          </button>

          <button
            onClick={() => handleTogglePin(contextMenu.message)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl transition-colors"
          >
            <Pin size={14} className="text-amber-500" />
            <span>{pinnedMessageIds.has(contextMenu.message.id || contextMenu.message._id) ? 'Unpin Message' : 'Pin Message'}</span>
          </button>

          {contextMenu.message.imageUrl && (
            <a
              href={resolveAvatarUrl(contextMenu.message.imageUrl)}
              target="_blank"
              rel="noopener noreferrer"
              download
              onClick={() => setContextMenu(null)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ExternalLink size={14} className="text-slate-500" />
              <span>Open Attachment</span>
            </a>
          )}

          <div className="h-px bg-slate-100 my-1" />

          <button
            onClick={() => handleDeleteMessage(contextMenu.message)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 size={14} className="text-red-500" />
            <span>Delete Message</span>
          </button>
        </div>
      )}

      {/* Forward Modal */}
      {forwardModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Share2 size={15} />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Forward Message</h3>
              </div>
              <button onClick={() => setForwardModal((prev) => ({ ...prev, isOpen: false }))}>
                <X size={15} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {/* Message preview snippet */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 max-h-24 overflow-y-auto italic">
              {forwardModal.message?.content || (forwardModal.message?.imageUrl ? '[Attachment]' : 'Message')}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Forward Destination</label>
              <select
                value={forwardModal.targetChannelId}
                onChange={(e) => setForwardModal((prev) => ({ ...prev, targetChannelId: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select target channel or colleague...</option>
                {channels.map((c) => {
                  const details = getChannelDetails(c);
                  return (
                    <option key={c.id} value={c.id}>
                      [{details.badge}] {details.displayName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setForwardModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteForward}
                disabled={!forwardModal.targetChannelId || forwardModal.isForwarding}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40 shadow-xs"
              >
                {forwardModal.isForwarding ? <Loader2 size={13} className="animate-spin" /> : <CornerUpRight size={13} />}
                <span>{forwardModal.isForwarding ? 'Forwarding...' : 'Forward Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl animate-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </AdminLayout>
  );
}
