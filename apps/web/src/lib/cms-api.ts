const API_BASE = typeof window === 'undefined'
  ? (process.env.BACKEND_INTERNAL_URL ? `${process.env.BACKEND_INTERNAL_URL}/api/v1` : 'https://gw-api.203.96.190.78.sslip.io/api/v1')
  : (process.env.NEXT_PUBLIC_API_BASE_URL || '/api');

export interface HeroSlideData {
  id: string;
  eyebrow: string;
  heading: string;
  description: string;
  imageUrl: string;
  primaryActionText: string;
  primaryActionHref: string;
  secondaryActionText: string;
  secondaryActionHref: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PageSectionData {
  id: string;
  pageKey: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  content: Record<string, any>;
  isActive: boolean;
}

export interface ServiceData {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  features?: string[];
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: string;
  location?: string;
  description: string;
  deliverables?: string;
  imageUrl?: string;
  isMilestone: boolean;
  sortOrder: number;
}

export interface PartnerData {
  id: string;
  name: string;
  logoUrl: string;
  category?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface LandingPageResponse {
  heroSlides: HeroSlideData[];
  sections: Record<string, PageSectionData>;
}

export const CmsApi = {
  async getLandingPage(): Promise<LandingPageResponse> {
    try {
      const res = await fetch(`${API_BASE}/cms/landing-page`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API fetch failed, falling back to static cache:', err);
      return {
        heroSlides: [
          {
            id: '1',
            eyebrow: 'GEOSPATIAL WORKS BANGLADESH',
            heading: 'WHERE ENGINEERING MEETS PRECISION',
            description: 'Integrated engineering, geospatial, and precision surveying consultancy delivering technical solutions for national infrastructure, spatial planning, and delta resource management.',
            imageUrl: '/real-media/hero-corridor-infrastructure.jpg',
            primaryActionText: 'Explore our services',
            primaryActionHref: '/services',
            secondaryActionText: 'Get in Touch',
            secondaryActionHref: '/contact',
            sortOrder: 1,
            isActive: true,
          },
          {
            id: '2',
            eyebrow: 'PRECISION • INNOVATION • SUSTAINABILITY',
            heading: 'CONNECTING SPATIAL DATA TO ENGINEERING DESIGN',
            description: 'From high-density UAV photogrammetry and RTK GNSS observations to civil structural engineering and GIS digital twins across 35+ national landmarks.',
            imageUrl: '/real-media/hero-geospatial-landscape.jpg',
            primaryActionText: 'View verified projects',
            primaryActionHref: '/projects',
            secondaryActionText: 'Get in Touch',
            secondaryActionHref: '/contact',
            sortOrder: 2,
            isActive: true,
          },
          {
            id: '3',
            eyebrow: 'SOB BENCHMARK COMPLIANCE',
            heading: 'FROM FIELD DATA ACQUISITION TO 3D VISUALIZATION',
            description: 'Supporting national highways, railway bypasses, inter-district bus terminals, sanitary landfills, and agricultural irrigation networks across all divisions of Bangladesh.',
            imageUrl: '/real-media/project-dncc-gulshan-link-road.jpg',
            primaryActionText: 'Connect with our team',
            primaryActionHref: '/contact',
            secondaryActionText: 'Get in Touch',
            secondaryActionHref: '/contact',
            sortOrder: 3,
            isActive: true,
          },
        ],
        sections: {},
      };
    }
  },

  async getServices(): Promise<ServiceData[]> {
    try {
      const res = await fetch(`${API_BASE}/services`, { next: { revalidate: 30 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch services from API:', err);
      return [];
    }
  },

  async getProjects(milestonesOnly = false): Promise<ProjectData[]> {
    try {
      const res = await fetch(`${API_BASE}/projects?milestonesOnly=${milestonesOnly}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch projects from API:', err);
      return [];
    }
  },

  async getProject(slug: string): Promise<ProjectData | null> {
    try {
      const res = await fetch(`${API_BASE}/projects/${slug}`, { next: { revalidate: 30 } });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`Failed to fetch project ${slug} from API:`, err);
      return null;
    }
  },

  async getPartners(): Promise<PartnerData[]> {
    try {
      const res = await fetch(`${API_BASE}/fleet/partners`, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch partners from API:', err);
      return [];
    }
  },

  async getSections(pageKey: string): Promise<Record<string, PageSectionData>> {
    try {
      const res = await fetch(`${API_BASE}/cms/sections/${pageKey}`, { next: { revalidate: 10 } });
      if (!res.ok) return {};
      const sections: PageSectionData[] = await res.json();
      return sections.reduce((acc, s) => {
        acc[s.sectionKey] = s;
        return acc;
      }, {} as Record<string, PageSectionData>);
    } catch (err) {
      console.warn(`Failed to fetch sections for ${pageKey}:`, err);
      return {};
    }
  },

  async submitInquiry(data: { fullName: string; email: string; phone?: string; serviceType?: string; message: string }) {
    const res = await fetch(`${API_BASE}/contact/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Submission failed');
    return await res.json();
  },

  // Authenticated Admin Methods
  async adminUpdateSlide(id: string, data: Partial<HeroSlideData>, token: string) {
    const res = await fetch(`${API_BASE}/cms/admin/hero-slides/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Update slide failed');
    return await res.json();
  },

  async adminCreateSlide(data: Partial<HeroSlideData>, token: string) {
    const res = await fetch(`${API_BASE}/cms/admin/hero-slides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Create slide failed');
    return await res.json();
  },

  async adminDeleteSlide(id: string, token: string) {
    const res = await fetch(`${API_BASE}/cms/admin/hero-slides/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Delete slide failed');
    return await res.json();
  },

  async adminUpdateSection(pageKey: string, sectionKey: string, data: Partial<PageSectionData>, token: string) {
    const res = await fetch(`${API_BASE}/cms/admin/sections/${pageKey}/${sectionKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Update section failed');
    return await res.json();
  },
};

