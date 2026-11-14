'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardView } from '../components/DashboardView';
import { ProjectsView, ProjectItem } from '../components/ProjectsView';
import { ProjectModal } from '../components/ProjectModal';
import { ServicesView } from '../components/ServicesView';
import { ServiceModal, ServiceItem } from '../components/ServiceModal';
import { NewsView } from '../components/NewsView';
import { NewsModal, ArticleItem, ARTICLE_CATEGORIES } from '../components/NewsModal';
import { AboutView } from '../components/AboutView';
import { AboutSectionDrawer, PageSectionItem } from '../components/AboutSectionDrawer';
import { TeamMemberDrawer, TeamMemberItem, TEAM_CATEGORIES, EducationEntry, ExperienceEntry } from '../components/TeamMemberDrawer';
import { TeamView } from '../components/TeamView';
import { CareersView, ApplicationItem } from '../components/CareersView';
import { JobDrawer, JobPostItem } from '../components/JobModal';
import { LandingPageView, HeroSlideItem, EquipmentItem } from '../components/LandingPageView';
import { LeadsView, InquiryItem, InquiryStatus } from '../components/LeadsView';
import { SettingsView } from '../components/SettingsView';
import { LoginPage } from '../components/LoginPage';
import { AdminTab } from '../components/Sidebar';
import { MediaPickerModal } from '../components/MediaPickerModal';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

const API_BASE = '/api';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);
  const [sections, setSections] = useState<Record<string, PageSectionItem>>({});
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [jobs, setJobs] = useState<JobPostItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoadErrors, setDataLoadErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [revalidating, setRevalidating] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [seedingProjectCaseStudies, setSeedingProjectCaseStudies] = useState(false);

  // Job Modal & Edit state
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPostItem | null>(null);

  // Project Modal & Edit state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  // Service Modal & Edit state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // News Modal & Edit state
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);

  // Media Picker state
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTargetCallback, setMediaTargetCallback] = useState<((url: string) => void) | null>(null);

  // Project Form Fields
  const [projTitle, setProjTitle] = useState('');
  const [projSlug, setProjSlug] = useState('');
  const [projClient, setProjClient] = useState('');
  const [projCategory, setProjCategory] = useState('');
  const [projLocation, setProjLocation] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projDeliverables, setProjDeliverables] = useState('');
  const [projDetails, setProjDetails] = useState({ overview: '', challenges: '', approach: '', results: '', toolsUsed: '', timeline: '' });
  const [projImageUrl, setProjImageUrl] = useState('/inner/bridge-aerial.webp');
  const [projIsMilestone, setProjIsMilestone] = useState(false);
  const [projIsActive, setProjIsActive] = useState(true);

  // Service Form Fields
  const [svcTitle, setSvcTitle] = useState('');
  const [svcSlug, setSvcSlug] = useState('');
  const [svcCategory, setSvcCategory] = useState('SURVEY & GEODATA');
  const [svcDescription, setSvcDescription] = useState('');
  const [svcFeatures, setSvcFeatures] = useState('');
  const [svcLead, setSvcLead] = useState('');
  const [svcEquipment, setSvcEquipment] = useState('');
  const [svcStandards, setSvcStandards] = useState('');
  const [svcBenefits, setSvcBenefits] = useState('');
  const [svcImageUrl, setSvcImageUrl] = useState('/real-media/service-topographic-uav.png');
  const [svcSortOrder, setSvcSortOrder] = useState(1);
  const [svcIsActive, setSvcIsActive] = useState(true);

  // Article Form Fields
  const [artTitle, setArtTitle] = useState('');
  const [artSlug, setArtSlug] = useState('');
  const [artCategory, setArtCategory] = useState(ARTICLE_CATEGORIES[0]);
  const [artPublishDate, setArtPublishDate] = useState('');
  const [artAuthor, setArtAuthor] = useState('Geospatial Works Technical Team');
  const [artSummary, setArtSummary] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artImageUrl, setArtImageUrl] = useState('');
  const [artIsPublished, setArtIsPublished] = useState(true);

  // About Section Drawer state
  const [aboutDrawerOpen, setAboutDrawerOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSectionItem | null>(null);
  const [secTitle, setSecTitle] = useState('');
  const [secSubtitle, setSecSubtitle] = useState('');
  const [secDescription, setSecDescription] = useState('');
  const [secVision, setSecVision] = useState('');
  const [secMission, setSecMission] = useState('');
  const [secExtra1, setSecExtra1] = useState('');
  const [secExtra2, setSecExtra2] = useState('');
  const [extraLabel1, setExtraLabel1] = useState<string | undefined>();
  const [extraLabel2, setExtraLabel2] = useState<string | undefined>();
  const [secSaving, setSecSaving] = useState(false);

  // Team Member Drawer state
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMemberItem | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamRole, setTeamRole] = useState('');
  const [teamCategory, setTeamCategory] = useState(TEAM_CATEGORIES[0]);
  const [teamCredentials, setTeamCredentials] = useState('');
  const [teamBio, setTeamBio] = useState('');
  const [teamImage, setTeamImage] = useState('/team/delwar-hossain.png');
  const [teamEmail, setTeamEmail] = useState('');
  const [teamPhone, setTeamPhone] = useState('');
  const [teamSortOrder, setTeamSortOrder] = useState(1);
  const [teamIsActive, setTeamIsActive] = useState(true);
  const [teamCvSummary, setTeamCvSummary] = useState('');
  const [teamEducation, setTeamEducation] = useState<EducationEntry[]>([]);
  const [teamRegistrations, setTeamRegistrations] = useState<string[]>([]);
  const [teamSoftware, setTeamSoftware] = useState<string[]>([]);
  const [teamExperience, setTeamExperience] = useState<ExperienceEntry[]>([]);

  const triggerFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const getAuthHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('gw_admin_jwt') || sessionStorage.getItem('gw_admin_jwt');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Persistent Tab Synchronization
  const handleSetActiveTab = (tab: AdminTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gw_admin_active_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    }
  };

  // Restore active tab from URL or localStorage on initial mount & handle browser back/forward
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const validTabs: AdminTab[] = [
        'dashboard',
        'landing',
        'projects',
        'services',
        'news',
        'about',
        'team',
        'careers',
        'inquiries',
        'settings',
      ];
      const searchParams = new URLSearchParams(window.location.search);
      const urlTab = searchParams.get('tab') as AdminTab | null;
      const storedTab = localStorage.getItem('gw_admin_active_tab') as AdminTab | null;

      const chosenTab =
        urlTab && validTabs.includes(urlTab)
          ? urlTab
          : storedTab && validTabs.includes(storedTab)
          ? storedTab
          : 'dashboard';

      setActiveTab(chosenTab);
      // Ensure URL reflects the active tab so refresh stays on this tab
      const url = new URL(window.location.href);
      url.searchParams.set('tab', chosenTab);
      window.history.replaceState(null, '', url.toString());

      const handlePopState = () => {
        const params = new URLSearchParams(window.location.search);
        const popTab = params.get('tab') as AdminTab | null;
        if (popTab && validTabs.includes(popTab)) {
          setActiveTab(popTab);
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Secure Authentication Verification
  useEffect(() => {
    const verifyAuthSession = async () => {
      try {
        let token = null;
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('gw_admin_jwt') || sessionStorage.getItem('gw_admin_jwt');
        }

        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          setIsAuthenticated(true);
          loadAllData();
        } else {
          // Token expired or invalid
          if (typeof window !== 'undefined') {
            localStorage.removeItem('gw_admin_jwt');
            localStorage.removeItem('gw_admin_user');
            sessionStorage.removeItem('gw_admin_jwt');
            sessionStorage.removeItem('gw_admin_user');
          }
          setIsAuthenticated(false);
          setLoading(false);
        }
      } catch (err) {
        console.error('Session authentication error', err);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    verifyAuthSession();
  }, []);

  const handleLoginSuccess = (token: string, user: { id: string; email: string; name: string; role: string }) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    triggerFeedback(`Welcome, ${user.name}! Authenticated as ${user.role}.`);
    loadAllData();
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gw_admin_jwt');
      localStorage.removeItem('gw_admin_user');
      sessionStorage.removeItem('gw_admin_jwt');
      sessionStorage.removeItem('gw_admin_user');
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    triggerFeedback('You have been signed out securely.');
  };

  const loadAllData = async () => {
    setLoading(true);
    const headers = getAuthHeaders();
    const resources: Array<{
      label: string;
      url: string;
      headers: Record<string, string>;
      apply: (value: unknown) => void;
    }> = [
      { label: 'Projects', url: `${API_BASE}/projects/admin/all`, headers, apply: (value) => setProjects(value as ProjectItem[]) },
      { label: 'Services', url: `${API_BASE}/services/admin/all`, headers, apply: (value) => setServices(value as ServiceItem[]) },
      { label: 'News', url: `${API_BASE}/articles/admin/all`, headers, apply: (value) => setArticles(value as ArticleItem[]) },
      { label: 'Team', url: `${API_BASE}/team/admin/all`, headers, apply: (value) => setTeamMembers(value as TeamMemberItem[]) },
      {
        label: 'Page content',
        url: `${API_BASE}/cms/admin/sections`,
        headers,
        apply: (value) => {
          const sectionMap: Record<string, PageSectionItem> = {};
          (value as PageSectionItem[]).forEach((section) => {
            sectionMap[`${section.pageKey}:${section.sectionKey}`] = section;
          });
          setSections(sectionMap);
        },
      },
      { label: 'Job posts', url: `${API_BASE}/careers/admin/jobs`, headers, apply: (value) => setJobs(value as JobPostItem[]) },
      { label: 'Applications', url: `${API_BASE}/careers/admin/applications`, headers, apply: (value) => setApplications(value as ApplicationItem[]) },
      { label: 'Hero slides', url: `${API_BASE}/cms/admin/hero-slides`, headers, apply: (value) => setHeroSlides(value as HeroSlideItem[]) },
      { label: 'Equipment', url: `${API_BASE}/fleet/equipment`, headers: { 'Content-Type': 'application/json' }, apply: (value) => setEquipment(value as EquipmentItem[]) },
      { label: 'Enquiries', url: `${API_BASE}/contact/admin/inquiries`, headers, apply: (value) => setInquiries(value as InquiryItem[]) },
    ];

    const results = await Promise.allSettled(
      resources.map(async ({ label, url, headers: requestHeaders }) => {
        const response = await fetch(url, { headers: requestHeaders });
        if (!response.ok) throw new Error(`${label} (${response.status})`);
        return response.json() as Promise<unknown>;
      })
    );
    const errors: string[] = [];
    results.forEach((result, index) => {
      const resource = resources[index];
      if (result.status === 'rejected') {
        errors.push(result.reason instanceof Error ? result.reason.message : `${resource.label} could not be loaded`);
        return;
      }
      resource.apply(result.value);
    });
    setDataLoadErrors(errors);
    if (errors.length) console.error('Admin data load failures:', errors);
    setLoading(false);
  };

  const handlePurgeCache = async () => {
    setRevalidating(true);
    try {
      const res = await fetch('/site-revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: 'all' }),
      });
      if (res.ok) {
        triggerFeedback('⚡ Static cache purged! Live site refreshed.');
      } else {
        triggerFeedback('Purge completed with code ' + res.status, 'error');
      }
    } catch (e: any) {
      triggerFeedback('Error purging cache: ' + e.message, 'error');
    } finally {
      setRevalidating(false);
    }
  };

  // --- Project Handlers ---
  const openCreateProjectModal = () => {
    setEditingProject(null);
    setProjTitle('');
    setProjSlug('');
    setProjClient('');
    setProjCategory(services[0]?.title || 'Topographic & Land Survey');
    setProjLocation('Dhaka Division');
    setProjDescription('');
    setProjDeliverables('');
    setProjDetails({ overview: '', challenges: '', approach: '', results: '', toolsUsed: '', timeline: '' });
    setProjImageUrl('/inner/bridge-aerial.webp');
    setProjIsMilestone(true);
    setProjIsActive(true);
    setProjectModalOpen(true);
  };

  const openEditProjectModal = (proj: ProjectItem) => {
    setEditingProject(proj);
    setProjTitle(proj.title);
    setProjSlug(proj.slug);
    setProjClient(proj.client);
    setProjCategory(proj.category);
    setProjLocation(proj.location || '');
    setProjDescription(proj.description);
    setProjDeliverables(proj.deliverables || '');
    setProjDetails({ overview: proj.details?.overview || '', challenges: (proj.details?.challenges || []).join('\n'), approach: (proj.details?.approach || []).join('\n'), results: (proj.details?.results || []).join('\n'), toolsUsed: (proj.details?.toolsUsed || []).join('\n'), timeline: proj.details?.timeline || '' });
    setProjImageUrl(proj.imageUrl || '/inner/bridge-aerial.webp');
    setProjIsMilestone(proj.isMilestone);
    setProjIsActive(proj.isActive !== false);
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) {
      triggerFeedback('Project title is required', 'error');
      return;
    }

    const slug =
      projSlug.trim() ||
      projTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const payload = {
      title: projTitle.trim(),
      slug: slug,
      client: projClient.trim(),
      category: projCategory || (services[0]?.title ?? 'Topographic & Land Survey'),
      location: projLocation.trim(),
      description: projDescription.trim(),
      deliverables: projDeliverables.trim(),
      details: { ...(editingProject?.details || {}), overview: projDetails.overview.trim(), challenges: projDetails.challenges.split('\n').map(v => v.trim()).filter(Boolean), approach: projDetails.approach.split('\n').map(v => v.trim()).filter(Boolean), results: projDetails.results.split('\n').map(v => v.trim()).filter(Boolean), toolsUsed: projDetails.toolsUsed.split('\n').map(v => v.trim()).filter(Boolean), timeline: projDetails.timeline.trim() },
      imageUrl: projImageUrl.trim(),
      isMilestone: projIsMilestone,
      isActive: projIsActive,
      sortOrder: editingProject ? editingProject.sortOrder : projects.length + 1,
    };

    try {
      let res;
      if (editingProject) {
        res = await fetch(`${API_BASE}/projects/admin/${editingProject.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/projects/admin`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        triggerFeedback(editingProject ? 'Project updated!' : 'New project created!');
        setProjectModalOpen(false);
        loadAllData();
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: 'all' }),
        }).catch(() => {});
      } else {
        const err = await res.json().catch(() => ({}));
        triggerFeedback(err.message || 'Error saving project', 'error');
      }
    } catch (e: any) {
      triggerFeedback('Request failed: ' + e.message, 'error');
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/projects/admin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        triggerFeedback('Project removed.');
        loadAllData();
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: 'all' }),
        }).catch(() => {});
      }
    } catch {
      triggerFeedback('Error deleting project', 'error');
    }
  };

  const handleToggleMilestone = async (proj: ProjectItem, desiredState?: boolean) => {
    const updated = desiredState ?? !proj.isMilestone;
    try {
      const res = await fetch(`${API_BASE}/projects/admin/${proj.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...proj, isMilestone: updated }),
      });
      if (res.ok) {
        setProjects((prev) => prev.map((p) => (p.id === proj.id ? { ...p, isMilestone: updated } : p)));
        triggerFeedback(updated ? 'Featured as National Landmark!' : 'Removed from Featured.');
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: 'all' }),
        }).catch(() => {});
      }
    } catch {
      triggerFeedback('Error toggling milestone', 'error');
    }
  };

  // --- Service Handlers ---
  const openCreateServiceModal = () => {
    setEditingService(null);
    setSvcTitle('');
    setSvcSlug('');
    setSvcCategory('SURVEY & GEODATA');
    setSvcDescription('');
    setSvcFeatures('');
    setSvcLead('');
    setSvcEquipment('');
    setSvcStandards('');
    setSvcBenefits('');
    setSvcImageUrl('/real-media/service-topographic-uav.png');
    setSvcSortOrder(services.length + 1);
    setSvcIsActive(true);
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (svc: ServiceItem) => {
    setEditingService(svc);
    setSvcTitle(svc.title);
    setSvcSlug(svc.slug);
    setSvcCategory(svc.category);
    setSvcDescription(svc.description);
    setSvcFeatures((svc.features || []).join('\n'));
    setSvcLead(svc.details?.lead || '');
    setSvcEquipment((svc.details?.equipment || []).join('\n'));
    setSvcStandards((svc.details?.standards || []).join('\n'));
    setSvcBenefits((svc.details?.benefits || []).join('\n'));
    setSvcImageUrl(svc.imageUrl || '/real-media/service-topographic-uav.png');
    setSvcSortOrder(svc.sortOrder);
    setSvcIsActive(svc.isActive);
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!svcTitle.trim()) {
      triggerFeedback('Service title is required', 'error');
      return;
    }

    const slug =
      svcSlug.trim() ||
      svcTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const featuresArray = svcFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      title: svcTitle.trim(),
      slug: slug,
      category: svcCategory.trim(),
      description: svcDescription.trim(),
      features: featuresArray,
      details: { lead: svcLead.trim(), equipment: svcEquipment.split('\n').map(v => v.trim()).filter(Boolean), standards: svcStandards.split('\n').map(v => v.trim()).filter(Boolean), benefits: svcBenefits.split('\n').map(v => v.trim()).filter(Boolean) },
      imageUrl: svcImageUrl.trim(),
      sortOrder: Number(svcSortOrder) || 1,
      isActive: svcIsActive,
    };

    try {
      let res;
      if (editingService) {
        res = await fetch(`${API_BASE}/services/admin/${editingService.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/services/admin`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        triggerFeedback(editingService ? 'Service discipline updated!' : 'New service published!');
        setServiceModalOpen(false);
        loadAllData();
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: 'all' }),
        }).catch(() => {});
      } else {
        const err = await res.json().catch(() => ({}));
        triggerFeedback(err.message || 'Error saving service', 'error');
      }
    } catch (e: any) {
      triggerFeedback('Request failed: ' + e.message, 'error');
    }
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/services/admin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        triggerFeedback('Service deleted.');
        loadAllData();
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: 'all' }),
        }).catch(() => {});
      }
    } catch {
      triggerFeedback('Error deleting service', 'error');
    }
  };

  const handleToggleServiceActive = async (svc: ServiceItem, desiredState?: boolean) => {
    const updated = desiredState ?? !svc.isActive;
    try {
      const res = await fetch(`${API_BASE}/services/admin/${svc.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...svc, isActive: updated }),
      });
      if (res.ok) {
        setServices((prev) => prev.map((s) => (s.id === svc.id ? { ...s, isActive: updated } : s)));
        triggerFeedback(updated ? 'Service set to Active!' : 'Service set to Draft.');
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: 'all' }),
        }).catch(() => {});
      }
    } catch {
      triggerFeedback('Error updating service status', 'error');
    }
  };

  // --- News / Article Handlers ---
  const openCreateNewsModal = () => {
    setEditingArticle(null);
    setArtTitle('');
    setArtSlug('');
    setArtCategory(ARTICLE_CATEGORIES[0]);
    setArtPublishDate(new Date().toISOString().split('T')[0]);
    setArtAuthor('Geospatial Works Technical Team');
    setArtSummary('');
    setArtContent('');
    setArtImageUrl('');
    setArtIsPublished(true);
    setNewsModalOpen(true);
  };

  const openEditNewsModal = (art: ArticleItem) => {
    setEditingArticle(art);
    setArtTitle(art.title);
    setArtSlug(art.slug);
    setArtCategory(art.category);
    setArtPublishDate(art.publishDate || '');
    setArtAuthor(art.author || '');
    setArtSummary(art.summary);
    setArtContent(art.content || '');
    setArtImageUrl(art.imageUrl || '');
    setArtIsPublished(art.isPublished);
    setNewsModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim()) {
      triggerFeedback('Article title is required', 'error');
      return;
    }

    const slug =
      artSlug.trim() ||
      artTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const payload = {
      title: artTitle.trim(),
      slug: slug,
      category: artCategory.trim(),
      publishDate: artPublishDate || new Date().toISOString().split('T')[0],
      author: artAuthor.trim(),
      summary: artSummary.trim(),
      content: artContent.trim(),
      imageUrl: artImageUrl.trim(),
      isPublished: artIsPublished,
      sortOrder: editingArticle ? editingArticle.sortOrder : articles.length + 1,
    };

    try {
      let res;
      if (editingArticle) {
        res = await fetch(`${API_BASE}/articles/admin/${editingArticle.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/articles/admin`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        triggerFeedback(editingArticle ? 'Article updated!' : 'New article published!');
        setNewsModalOpen(false);
        loadAllData();
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: 'all' }),
        }).catch(() => {});
      } else {
        const err = await res.json().catch(() => ({}));
        triggerFeedback(err.message || 'Error saving article', 'error');
      }
    } catch (e: any) {
      triggerFeedback('Request failed: ' + e.message, 'error');
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/articles/admin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        triggerFeedback('Article removed.');
        loadAllData();
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: 'all' }),
        }).catch(() => {});
      }
    } catch {
      triggerFeedback('Error deleting article', 'error');
    }
  };

  const handleToggleArticlePublished = async (art: ArticleItem) => {
    const updated = !art.isPublished;
    try {
      const res = await fetch(`${API_BASE}/articles/admin/${art.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...art, isPublished: updated }),
      });
      if (res.ok) {
        setArticles((prev) => prev.map((a) => (a.id === art.id ? { ...a, isPublished: updated } : a)));
        triggerFeedback(updated ? 'Article set to Published!' : 'Article set to Draft.');
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: 'all' }),
        }).catch(() => {});
      }
    } catch {
      triggerFeedback('Error updating article status', 'error');
    }
  };

  const handleSeedProjectCaseStudies = async () => {
    if (!confirm('Create case studies from active project records and move the nine starter demo articles to drafts? Existing article records will be kept.')) return;
    setSeedingProjectCaseStudies(true);
    try {
      const res = await fetch(`${API_BASE}/articles/admin/seed-project-case-studies`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || 'Could not create project case studies');
      triggerFeedback(`Added ${result.created} project case studies and moved ${result.hiddenDemoArticles} demo articles to drafts.`);
      await loadAllData();
      fetch('/site-revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: 'all' }),
      }).catch(() => {});
    } catch (error: any) {
      triggerFeedback(error.message || 'Could not create project case studies', 'error');
    } finally {
      setSeedingProjectCaseStudies(false);
    }
  };

  // --- About Page Section Handlers ---
  const openEditSectionDrawer = (section: PageSectionItem) => {
    setEditingSection(section);
    setSecTitle(section.title || '');
    setSecSubtitle(section.subtitle || '');
    setSecDescription(section.content?.description || section.content?.intro || '');
    setSecVision(section.content?.vision || '');
    setSecMission(section.content?.mission || '');

    // Configure contextual extra fields based on sectionKey
    if (section.sectionKey === 'hardware_compute') {
      setExtraLabel1('Computing & NAS Workstations');
      setSecExtra1(section.content?.computeSummary || '');
      setExtraLabel2('UAV Drone Fleet Summary');
      setSecExtra2(section.content?.droneFleetSummary || '');
    } else if (section.sectionKey === 'zero_harm_commitments') {
      setExtraLabel1('Zero-Harm Safety Protocol');
      setSecExtra1(section.content?.zeroHarm || '');
      setExtraLabel2('Sovereign Geodata Security');
      setSecExtra2(section.content?.dataSecurity || '');
    } else if (section.sectionKey === 'geodetic_tolerances') {
      setExtraLabel1('Vertical Datum Tolerance (PWD/SOB)');
      setSecExtra1(section.content?.vertical || '');
      setExtraLabel2('Bathymetry Depth Tolerance (IHO S-44)');
      setSecExtra2(section.content?.bathymetry || '');
    } else {
      setExtraLabel1(undefined);
      setSecExtra1('');
      setExtraLabel2(undefined);
      setSecExtra2('');
    }

    setAboutDrawerOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    setSecSaving(true);

    try {
      const updatedContent: Record<string, any> = {
        ...editingSection.content,
        description: secDescription,
        intro: secDescription,
      };

      if (secVision) updatedContent.vision = secVision;
      if (secMission) updatedContent.mission = secMission;
      if (editingSection.sectionKey === 'hardware_compute') {
        if (secExtra1) updatedContent.computeSummary = secExtra1;
        if (secExtra2) updatedContent.droneFleetSummary = secExtra2;
      } else if (editingSection.sectionKey === 'zero_harm_commitments') {
        if (secExtra1) updatedContent.zeroHarm = secExtra1;
        if (secExtra2) updatedContent.dataSecurity = secExtra2;
      } else if (editingSection.sectionKey === 'geodetic_tolerances') {
        if (secExtra1) updatedContent.vertical = secExtra1;
        if (secExtra2) updatedContent.bathymetry = secExtra2;
      }

      const payload = {
        title: secTitle,
        subtitle: secSubtitle,
        content: updatedContent,
      };

      const res = await fetch(
        `${API_BASE}/cms/admin/sections/${editingSection.pageKey}/${editingSection.sectionKey}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        const saved = await res.json();
        setSections((prev) => ({
          ...prev,
          [`${editingSection.pageKey}:${editingSection.sectionKey}`]: saved,
        }));
        triggerFeedback('⚡ Page content updated! Live public route refreshed.');
        setAboutDrawerOpen(false);
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: 'all' }),
        }).catch(() => {});
      } else {
        triggerFeedback('Error saving section (status ' + res.status + ')', 'error');
      }
    } catch (err: any) {
      triggerFeedback('Error saving section: ' + err.message, 'error');
    } finally {
      setSecSaving(false);
    }
  };

  // --- Team Member Handlers ---
  const openCreateTeamDrawer = () => {
    setEditingTeamMember(null);
    setTeamName("");
    setTeamRole("");
    setTeamCategory(TEAM_CATEGORIES[0]);
    setTeamCredentials("");
    setTeamBio("");
    setTeamImage("/team-photos/delwar_hossain.jpg");
    setTeamEmail("");
    setTeamPhone("");
    setTeamSortOrder(teamMembers.length + 1);
    setTeamIsActive(true);
    setTeamCvSummary("");
    setTeamEducation([]);
    setTeamRegistrations([]);
    setTeamSoftware([]);
    setTeamExperience([]);
    setTeamDrawerOpen(true);
  };

  const openEditTeamDrawer = (m: TeamMemberItem) => {
    setEditingTeamMember(m);
    setTeamName(m.name);
    setTeamRole(m.role);
    setTeamCategory(m.category);
    setTeamCredentials(m.credentials || "");
    setTeamBio(m.bio || "");
    setTeamImage(m.image || "/team-photos/delwar_hossain.jpg");
    setTeamEmail(m.email || "");
    setTeamPhone(m.phone || "");
    setTeamSortOrder(m.sortOrder || 1);
    setTeamIsActive(m.isActive ?? true);
    setTeamCvSummary(m.structuredCv?.summary || m.bio || "");
    setTeamEducation(m.structuredCv?.education ? [...m.structuredCv.education] : []);
    setTeamRegistrations(m.structuredCv?.registrations ? [...m.structuredCv.registrations] : []);
    setTeamSoftware(m.structuredCv?.software ? [...m.structuredCv.software] : []);
    setTeamExperience(m.structuredCv?.experience ? [...m.structuredCv.experience] : []);
    setTeamDrawerOpen(true);
  };

  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamRole.trim()) {
      triggerFeedback("Name and role are required", "error");
      return;
    }

    const payload = {
      name: teamName.trim(),
      slug: teamName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      role: teamRole.trim(),
      category: teamCategory,
      credentials: teamCredentials.trim(),
      bio: teamBio.trim(),
      image: teamImage.trim(),
      email: teamEmail.trim() || null,
      phone: teamPhone.trim() || null,
      sortOrder: Number(teamSortOrder) || 1,
      isActive: teamIsActive,
      structuredCv: {
        summary: teamCvSummary.trim() || teamBio.trim(),
        education: teamEducation.filter((ed) => ed.degree && ed.degree.trim()),
        registrations: teamRegistrations.filter((r) => r && r.trim()),
        software: teamSoftware.filter((s) => s && s.trim()),
        experience: teamExperience.filter((exp) => (exp.role && exp.role.trim()) || (exp.company && exp.company.trim())),
      },
    };

    try {
      const url = editingTeamMember?.id
        ? `${API_BASE}/team/admin/${editingTeamMember.id}`
        : `${API_BASE}/team/admin`;
      const method = editingTeamMember?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        triggerFeedback(editingTeamMember ? "Team member & CV updated!" : "New team member & CV created!");
        setTeamDrawerOpen(false);
        loadAllData();
        fetch("/site-revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "all" }),
        }).catch(() => {});
      } else {
        const err = await res.json().catch(() => ({}));
        triggerFeedback(err.message || "Error saving team member", "error");
      }
    } catch (err: any) {
      triggerFeedback("Error saving team member: " + err.message, "error");
    }
  };

  const handleDeleteTeamMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the leadership team?`)) return;
    try {
      const res = await fetch(`${API_BASE}/team/admin/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        triggerFeedback(`Removed ${name} from leadership directory.`);
        loadAllData();
        fetch("/site-revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "all" }),
        }).catch(() => {});
      } else {
        triggerFeedback("Error deleting team member", "error");
      }
    } catch {
      triggerFeedback("Error deleting team member", "error");
    }
  };

  // ===================== CAREERS & JOB CRUD =====================
  const openCreateJobModal = () => {
    setEditingJob(null);
    setJobModalOpen(true);
  };

  const openEditJobModal = (job: JobPostItem) => {
    setEditingJob(job);
    setJobModalOpen(true);
  };

  const handleSaveJob = async (jobData: Partial<JobPostItem>) => {
    try {
      const url = editingJob
        ? `${API_BASE}/careers/admin/jobs/${editingJob.id}`
        : `${API_BASE}/careers/admin/jobs`;
      const method = editingJob ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData),
      });

      if (res.ok) {
        triggerFeedback(
          editingJob ? 'Career opening updated successfully.' : 'New career opening published.'
        );
        loadAllData();
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/career' }),
        }).catch(() => {});
      } else {
        triggerFeedback('Error saving career position', 'error');
      }
    } catch {
      triggerFeedback('Error saving career position', 'error');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to remove this job opening? Associated applications will remain for candidate history.')) return;
    try {
      const res = await fetch(`${API_BASE}/careers/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        triggerFeedback('Job opening removed.');
        loadAllData();
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/career' }),
        }).catch(() => {});
      }
    } catch {
      triggerFeedback('Error deleting job position', 'error');
    }
  };

  const handleUpdateAppStatus = async (
    id: string,
    status: ApplicationItem['status'],
    internalNotes?: string
  ) => {
    try {
      const res = await fetch(`${API_BASE}/careers/admin/applications/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, internalNotes }),
      });
      if (res.ok) {
        triggerFeedback('Application status updated.');
        loadAllData();
      } else {
        triggerFeedback('Failed to update application', 'error');
      }
    } catch {
      triggerFeedback('Failed to update application', 'error');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Permanently delete this candidate application record?')) return;
    try {
      const res = await fetch(`${API_BASE}/careers/admin/applications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        triggerFeedback('Candidate application record deleted.');
        loadAllData();
      }
    } catch {
      triggerFeedback('Failed to delete application', 'error');
    }
  };

  // --- Inquiry & Lead Handlers ---
  const handleUpdateInquiryStatus = async (
    id: string,
    status: InquiryStatus,
    internalNotes?: string
  ) => {
    // Optimistic local state update
    setInquiries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, internalNotes: internalNotes !== undefined ? internalNotes : item.internalNotes } : item
      )
    );
    try {
      const res = await fetch(`${API_BASE}/contact/admin/inquiries/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, internalNotes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)));
        triggerFeedback('Lead status updated successfully');
      } else {
        triggerFeedback('Failed to update status on server', 'error');
        loadAllData();
      }
    } catch (e: any) {
      triggerFeedback('Network error updating status: ' + e.message, 'error');
      loadAllData();
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    setInquiries((prev) => prev.filter((item) => item.id !== id));
    try {
      const res = await fetch(`${API_BASE}/contact/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        triggerFeedback('Lead inquiry removed.');
      } else {
        triggerFeedback('Failed to delete inquiry on server', 'error');
        loadAllData();
      }
    } catch (e: any) {
      triggerFeedback('Network error deleting inquiry: ' + e.message, 'error');
      loadAllData();
    }
  };

  const handleCreateInquiry = async (data: {
    fullName: string;
    email: string;
    phone?: string;
    serviceType?: string;
    message: string;
    organization?: string;
  }) => {
    const fullMessage = data.organization
      ? `[Organization: ${data.organization}]\n${data.message}`
      : data.message;

    const res = await fetch(`${API_BASE}/contact/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        serviceType: data.serviceType,
        message: fullMessage,
      }),
    });
    if (res.ok) {
      triggerFeedback('Inbound lead logged successfully');
      loadAllData();
    } else {
      throw new Error('Failed to create inquiry');
    }
  };

  const handleSaveWysiwygSection = async (
    pageKey: string,
    sectionKey: string,
    title: string,
    subtitle: string,
    content: Record<string, any>
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/cms/admin/sections/${pageKey}/${sectionKey}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, subtitle, content }),
      });
      if (res.ok) {
        const saved = await res.json();
        setSections((prev) => ({
          ...prev,
          [`${pageKey}:${sectionKey}`]: saved,
        }));
        fetch('/site-revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: 'all' }),
        }).catch(() => {});
        return true;
      }
    } catch (err) {
      console.error('Error saving wysiwyg section', err);
    }
    return false;
  };

  if (isAuthenticated === null) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-800 select-none">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-3" />
        <div className="text-sm font-medium text-slate-600">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      {/* 1. Modular Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        projectsCount={projects.length}
        servicesCount={services.length}
        articlesCount={articles.length}
        teamCount={teamMembers.length}
        jobsCount={jobs.length}
        applicationsCount={applications.length}
        inquiriesCount={inquiries.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Canvas */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Dynamic Header */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCreateProjectModal={openCreateProjectModal}
          onOpenCreateServiceModal={openCreateServiceModal}
          onOpenCreateNewsModal={openCreateNewsModal}
          onOpenCreateTeamModal={openCreateTeamDrawer}
          onOpenCreateJobModal={openCreateJobModal}
          onRefreshData={loadAllData}
          loading={loading}
          onPurgeCache={handlePurgeCache}
          revalidating={revalidating}
        />

        {/* Floating Notification */}
        {feedback && (
          <div
            className={`fixed top-24 right-8 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold text-white animate-in slide-in-from-top-4 duration-200 ${
              feedback.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Views */}
        <main className="flex-1 overflow-y-auto p-8">
          {dataLoadErrors.length > 0 && (
            <div role="alert" className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Some content could not be loaded from the admin API.</p>
                <p className="mt-1 text-xs text-amber-800">{dataLoadErrors.join(' · ')}</p>
              </div>
              <button type="button" onClick={loadAllData} disabled={loading} className="shrink-0 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-amber-100 disabled:opacity-50">
                {loading ? 'Refreshing…' : 'Retry loading'}
              </button>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <DashboardView
              projects={projects}
              inquiriesCount={inquiries.length}
              servicesCount={services.length}
              articlesCount={articles.length}
              teamCount={teamMembers.length}
              onNavigateToProjects={() => setActiveTab('projects')}
              onNavigateToInquiries={() => handleSetActiveTab('inquiries')}
              onOpenCreateModal={openCreateProjectModal}
            />
          )}

          {activeTab === 'landing' && (
            <LandingPageView
              getAuthHeaders={getAuthHeaders}
              heroSlides={heroSlides}
              services={services}
              projects={projects}
              equipment={equipment}
              articles={articles}
              teamMembers={teamMembers}
              sections={sections}
              onOpenMediaPicker={(callback) => {
                setMediaTargetCallback(() => (url: string) => callback(url));
                setMediaModalOpen(true);
              }}
              onSaveHeroSlide={async (slide) => {
                const token = getAuthHeaders();
                const isUpdate = !!slide.id;
                const url = isUpdate ? `${API_BASE}/cms/admin/hero-slides/${slide.id}` : `${API_BASE}/cms/admin/hero-slides`;
                const method = isUpdate ? 'PUT' : 'POST';
                const res = await fetch(url, {
                  method,
                  headers: token,
                  body: JSON.stringify(slide),
                });
                if (res.ok) {
                  const savedSlide = await res.json();
                  setHeroSlides((current) =>
                    isUpdate
                      ? current.map((item) => item.id === savedSlide.id ? savedSlide : item)
                      : [...current, savedSlide]
                  );
                  return true;
                } else {
                  triggerFeedback('Failed to save hero slide. Check the API and try again.', 'error');
                  return false;
                }
              }}
              onDeleteHeroSlide={async (id) => {
                const res = await fetch(`${API_BASE}/cms/admin/hero-slides/${id}`, {
                  method: 'DELETE',
                  headers: getAuthHeaders(),
                });
                if (res.ok) {
                  setHeroSlides((current) => current.filter((slide) => slide.id !== id));
                  triggerFeedback('Hero slide deleted.');
                } else {
                  triggerFeedback('Failed to delete hero slide', 'error');
                }
              }}
              onUpdateSection={async (pageKey, sectionKey, data) => {
                const success = await handleSaveWysiwygSection(
                  pageKey,
                  sectionKey,
                  data.title || '',
                  data.subtitle || '',
                  data.content || {}
                );
                return success;
              }}
              onToggleServiceActive={async (id, active) => {
                const svc = services.find((s) => s.id === id);
                if (svc) {
                  await handleToggleServiceActive(svc, active);
                }
              }}
              onToggleProjectMilestone={async (id, isMilestone) => {
                const proj = projects.find((p) => p.id === id);
                if (proj) {
                  await handleToggleMilestone(proj, isMilestone);
                }
              }}
              onRefresh={loadAllData}
              triggerFeedback={triggerFeedback}
            />
          )}

          {activeTab === 'team' && (
            <TeamView
              teamMembers={teamMembers}
              loading={loading}
              searchQuery={searchQuery}
              onOpenCreateDrawer={openCreateTeamDrawer}
              onOpenEditDrawer={openEditTeamDrawer}
              onDeleteMember={handleDeleteTeamMember}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              services={services}
              loading={loading}
              searchQuery={searchQuery}
              onOpenCreateModal={openCreateProjectModal}
              onOpenEditModal={openEditProjectModal}
              onDeleteProject={handleDeleteProject}
              onToggleMilestone={handleToggleMilestone}
            />
          )}

          {activeTab === 'services' && (
            <ServicesView
              services={services}
              loading={loading}
              searchQuery={searchQuery}
              onOpenCreateModal={openCreateServiceModal}
              onOpenEditModal={openEditServiceModal}
              onDeleteService={handleDeleteService}
              onToggleActive={handleToggleServiceActive}
            />
          )}

          {activeTab === 'news' && (
            <NewsView
              articles={articles}
              loading={loading}
              searchQuery={searchQuery}
              onOpenCreateModal={openCreateNewsModal}
              onOpenEditModal={openEditNewsModal}
              onDeleteArticle={handleDeleteArticle}
              onTogglePublished={handleToggleArticlePublished}
              onSeedProjectCaseStudies={handleSeedProjectCaseStudies}
              seedingProjectCaseStudies={seedingProjectCaseStudies}
            />
          )}

          {activeTab === 'about' && (
            <AboutView
              sections={sections}
              teamMembers={teamMembers}
              projects={projects}
              services={services}
              loading={loading}
              searchQuery={searchQuery}
              onOpenEditSectionDrawer={openEditSectionDrawer}
              onOpenCreateTeamDrawer={openCreateTeamDrawer}
              onOpenEditTeamDrawer={openEditTeamDrawer}
              onDeleteTeamMember={handleDeleteTeamMember}
              onNavigateToProjects={() => setActiveTab('projects')}
              onSaveWysiwygSection={handleSaveWysiwygSection}
              onOpenMediaPicker={(callback) => {
                setMediaTargetCallback(() => (url: string) => callback(url));
                setMediaModalOpen(true);
              }}
              triggerFeedback={triggerFeedback}
            />
          )}

          {activeTab === 'careers' && (
            <CareersView
              jobs={jobs}
              applications={applications}
              onAddJob={openCreateJobModal}
              onEditJob={openEditJobModal}
              onDeleteJob={handleDeleteJob}
              onUpdateAppStatus={handleUpdateAppStatus}
              onDeleteApp={handleDeleteApplication}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'inquiries' && (
            <LeadsView
              inquiries={inquiries}
              loading={loading}
              onUpdateStatus={handleUpdateInquiryStatus}
              onDeleteInquiry={handleDeleteInquiry}
              onRefresh={loadAllData}
              triggerFeedback={triggerFeedback}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              getAuthHeaders={getAuthHeaders}
              triggerFeedback={triggerFeedback}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={handleSaveProject}
        isEditing={!!editingProject}
        services={services}
        formTitle={projTitle}
        setFormTitle={setProjTitle}
        formSlug={projSlug}
        setFormSlug={setProjSlug}
        formClient={projClient}
        setFormClient={setProjClient}
        formCategory={projCategory}
        setFormCategory={setProjCategory}
        formLocation={projLocation}
        setFormLocation={setProjLocation}
        formDescription={projDescription}
        setFormDescription={setProjDescription}
        formDeliverables={projDeliverables}
        setFormDeliverables={setProjDeliverables}
        detailFields={projDetails}
        onDetailChange={(field, value) => setProjDetails((current) => ({ ...current, [field]: value }))}
        formImageUrl={projImageUrl}
        setFormImageUrl={setProjImageUrl}
        formIsMilestone={projIsMilestone}
        setFormIsMilestone={setProjIsMilestone}
        formIsActive={projIsActive}
        setFormIsActive={setProjIsActive}
        onOpenMediaPicker={() => {
          setMediaTargetCallback(() => (url: string) => setProjImageUrl(url));
          setMediaModalOpen(true);
        }}
      />

      {/* Service Modal */}
      <ServiceModal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        onSubmit={handleSaveService}
        isEditing={!!editingService}
        formTitle={svcTitle}
        setFormTitle={setSvcTitle}
        formSlug={svcSlug}
        setFormSlug={setSvcSlug}
        formCategory={svcCategory}
        setFormCategory={setSvcCategory}
        formDescription={svcDescription}
        setFormDescription={setSvcDescription}
        formFeatures={svcFeatures}
        setFormFeatures={setSvcFeatures}
        formLead={svcLead}
        setFormLead={setSvcLead}
        formEquipment={svcEquipment}
        setFormEquipment={setSvcEquipment}
        formStandards={svcStandards}
        setFormStandards={setSvcStandards}
        formBenefits={svcBenefits}
        setFormBenefits={setSvcBenefits}
        formImageUrl={svcImageUrl}
        setFormImageUrl={setSvcImageUrl}
        formSortOrder={svcSortOrder}
        setFormSortOrder={setSvcSortOrder}
        formIsActive={svcIsActive}
        setFormIsActive={setSvcIsActive}
        onOpenMediaPicker={() => {
          setMediaTargetCallback(() => (url: string) => setSvcImageUrl(url));
          setMediaModalOpen(true);
        }}
      />

      {/* News Modal */}
      <NewsModal
        isOpen={newsModalOpen}
        onClose={() => setNewsModalOpen(false)}
        onSubmit={handleSaveArticle}
        isEditing={!!editingArticle}
        formTitle={artTitle}
        setFormTitle={setArtTitle}
        formSlug={artSlug}
        setFormSlug={setArtSlug}
        formCategory={artCategory}
        setFormCategory={setArtCategory}
        formPublishDate={artPublishDate}
        setFormPublishDate={setArtPublishDate}
        formAuthor={artAuthor}
        setFormAuthor={setArtAuthor}
        formSummary={artSummary}
        setFormSummary={setArtSummary}
        formContent={artContent}
        setFormContent={setArtContent}
        formImageUrl={artImageUrl}
        setFormImageUrl={setArtImageUrl}
        formIsPublished={artIsPublished}
        setFormIsPublished={setArtIsPublished}
        onOpenMediaPicker={() => {
          setMediaTargetCallback(() => (url: string) => setArtImageUrl(url));
          setMediaModalOpen(true);
        }}
      />

      {/* About Page Section Drawer */}
      <AboutSectionDrawer
        isOpen={aboutDrawerOpen}
        onClose={() => setAboutDrawerOpen(false)}
        onSubmit={handleSaveSection}
        section={editingSection}
        formTitle={secTitle}
        setFormTitle={setSecTitle}
        formSubtitle={secSubtitle}
        setFormSubtitle={setSecSubtitle}
        formDescription={secDescription}
        setFormDescription={setSecDescription}
        formVision={secVision}
        setFormVision={setSecVision}
        formMission={secMission}
        setFormMission={setSecMission}
        formExtraField1={secExtra1}
        setFormExtraField1={setSecExtra1}
        formExtraField2={secExtra2}
        setFormExtraField2={setSecExtra2}
        extraField1Label={extraLabel1}
        extraField2Label={extraLabel2}
        isSaving={secSaving}
      />

      {/* Team Member Drawer */}
      <TeamMemberDrawer
        isOpen={teamDrawerOpen}
        onClose={() => setTeamDrawerOpen(false)}
        onSubmit={handleSaveTeamMember}
        isEditing={!!editingTeamMember}
        formName={teamName}
        setFormName={setTeamName}
        formRole={teamRole}
        setFormRole={setTeamRole}
        formCategory={teamCategory}
        setFormCategory={setTeamCategory}
        formCredentials={teamCredentials}
        setFormCredentials={setTeamCredentials}
        formBio={teamBio}
        setFormBio={setTeamBio}
        formImage={teamImage}
        setFormImage={setTeamImage}
        formEmail={teamEmail}
        setFormEmail={setTeamEmail}
        formPhone={teamPhone}
        setFormPhone={setTeamPhone}
        formSortOrder={teamSortOrder}
        setFormSortOrder={setTeamSortOrder}
        formIsActive={teamIsActive}
        setFormIsActive={setTeamIsActive}
        formCvSummary={teamCvSummary}
        setFormCvSummary={setTeamCvSummary}
        formEducation={teamEducation}
        setFormEducation={setTeamEducation}
        formRegistrations={teamRegistrations}
        setFormRegistrations={setTeamRegistrations}
        formSoftware={teamSoftware}
        setFormSoftware={setTeamSoftware}
        formExperience={teamExperience}
        setFormExperience={setTeamExperience}
        onOpenMediaPicker={() => {
          setMediaTargetCallback(() => (url: string) => setTeamImage(url));
          setMediaModalOpen(true);
        }}
      />

      {/* Media Picker */}
      <MediaPickerModal
        getAuthHeaders={getAuthHeaders}
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(url) => {
          if (mediaTargetCallback) mediaTargetCallback(url);
          setMediaModalOpen(false);
        }}
      />

      {/* Careers Job Drawer */}
      <JobDrawer
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        onSave={handleSaveJob}
        initialData={editingJob}
      />
    </div>
  );
}
