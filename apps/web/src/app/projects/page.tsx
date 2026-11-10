import React from 'react';
import CorporateShell from '@/components/CorporateShell';
import ProjectsClientView from '@/components/ProjectsClientView';
import { CmsApi } from '@/lib/cms-api';
import '../corporate.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Our Projects & National Impact | Geospatial Works Bangladesh',
  description:
    'Explore 17 verified infrastructure projects across Bangladesh, including Bangladesh Railway surveys, DNCC bus terminals, and DTCA corridor work.',
};

export default async function ProjectsPage() {
  const [projects, sections] = await Promise.all([
    CmsApi.getProjects().catch(() => []),
    CmsApi.getSections('impact').catch(() => ({} as Record<string, any>)),
  ]);
  const wysiwyg = (sections as Record<string, any>)['full_page_wysiwyg']?.content;

  return (
    <CorporateShell>
      <main className="wsp-projects-main min-h-screen bg-white">
        <ProjectsClientView initialProjects={projects} wysiwyg={wysiwyg} />
      </main>
    </CorporateShell>
  );
}
