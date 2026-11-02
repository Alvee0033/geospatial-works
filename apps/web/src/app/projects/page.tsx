import CorporateShell from '@/components/CorporateShell';
import { ProjectListing } from '@/components/CorporateListings';
import { InteriorCta, InteriorHero } from '@/components/InteriorDesign';
import '../corporate.css';
import '../interior.css';

export default function ProjectsPage() {
  return <CorporateShell><main className="interior-page interior-projects">
    <InteriorHero eyebrow="OUR WORK" title="Projects" description="See where our surveys and maps have helped teams understand a place." image="/inner/banner-projects.webp" mobileImage="/inner/bridge-aerial.webp" imageAlt="Aerial view of a bridge crossing a river" />
    <section className="interior-section reveal"><div className="interior-shell"><ProjectListing /></div></section>
    <InteriorCta title="Have a place you need to understand?" />
  </main></CorporateShell>;
}
