import CorporateShell from '@/components/CorporateShell';
import WspLandingView from '@/components/WspLandingView';
import { CmsApi } from '@/lib/cms-api';
import './corporate.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const [landingData, services, projects] = await Promise.all([
    CmsApi.getLandingPage().catch(() => ({ heroSlides: [], sections: {} })),
    CmsApi.getServices().catch(() => []),
    CmsApi.getProjects(true).catch(() => []), // Milestone projects
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
        />
      </main>
    </CorporateShell>
  );
}
