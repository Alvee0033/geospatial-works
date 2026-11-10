import CorporateShell from '@/components/CorporateShell';
import WspLandingView from '@/components/WspLandingView';
import { CmsApi } from '@/lib/cms-api';
import './corporate.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const [landingData, services, projects, articles, teamMembers] = await Promise.all([
    CmsApi.getLandingPage().catch(() => ({ heroSlides: [], sections: {} })),
    CmsApi.getServices().catch(() => []),
    CmsApi.getProjects(true).catch(() => []), // Milestone projects
    CmsApi.getArticles().catch(() => []),
    CmsApi.getTeamMembers().catch(() => []),
  ]);

  const { heroSlides, sections } = landingData || { heroSlides: [], sections: {} };

  return (
    <CorporateShell>
      <main className="wsp-main-container">
        <WspLandingView
          heroSlides={heroSlides}
          services={services}
          projects={projects}
          sections={sections}
          articles={articles}
          teamMembers={teamMembers}
        />
      </main>
    </CorporateShell>
  );
}
