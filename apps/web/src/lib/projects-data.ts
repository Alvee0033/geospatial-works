import rawProjects from '@/data/projects.json';

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  client: string;
  category: string;
  disciplines: string[];
  sector: string;
  location: string;
  timeline: string;
  featured: boolean;
  imageUrl?: string;
  isMilestone?: boolean;
  images: string[];
  description: string;
  overview?: string;
  challenges?: string[];
  approach?: string[];
  results?: string[];
  toolsUsed?: string[];
  deliverables?: string[] | string;
}

export const projectsData: ProjectItem[] = rawProjects as ProjectItem[];
export const ALL_PROJECTS: ProjectItem[] = projectsData;
export default projectsData;

export function getProjectBySlug(slug: string): ProjectItem | undefined {
  return projectsData.find((p) => p.slug === slug || p.id === slug);
}

export function getAllProjectSlugs(): string[] {
  return projectsData.map((p) => p.slug);
}
