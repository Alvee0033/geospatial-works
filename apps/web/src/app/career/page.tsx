import CorporateShell from '@/components/CorporateShell';
import CareerListings from '@/components/CareerListings';
import { InteriorHeading, InteriorHero } from '@/components/InteriorDesign';
import '../corporate.css';
import '../interior.css';

export default function CareerPage() {
  return <CorporateShell><main className="interior-page interior-career">
    <InteriorHero eyebrow="WORK WITH US" title="Careers" description="Join a team that measures land, takes aerial photos, and makes useful maps." image="/inner/banner-career.webp" mobileImage="/inner/field-team.webp" imageAlt="Field team working with survey instruments" action={{ label: 'Explore roles', href: '#roles' }} />
    <section className="interior-section interior-soft reveal" id="roles"><div className="interior-shell"><InteriorHeading number="01" eyebrow="CAREER AREAS" title="Explore roles at Geospatial Works" description="See the work our teams do and send a general application for future opportunities." /><CareerListings /></div></section>
    <section className="interior-section reveal"><div className="interior-shell"><InteriorHeading number="02" eyebrow="LIFE AT WORK" title="In the field and at the desk." /><div className="interior-image-strip"><div><img src="/inner/field-team.webp" alt="Field team reviewing plans" loading="lazy" /><strong>Work together</strong></div><div><img src="/inner/drone-fields.webp" alt="Drone surveying a landscape" loading="lazy" /><strong>Explore places</strong></div><div><img src="/inner/gis-analyst.webp" alt="Map work on monitors" loading="lazy" /><strong>Make clear maps</strong></div></div></div></section>
  </main></CorporateShell>;
}
