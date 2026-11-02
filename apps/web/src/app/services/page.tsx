import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { InteriorCta, InteriorHeading, InteriorHero } from '@/components/InteriorDesign';
import { services } from '@/lib/corporate-data';
import '../corporate.css';
import '../interior.css';

const process = [
  ['01', 'Understand', 'Agree on the site, objectives, and required outputs.'],
  ['02', 'Collect', 'Capture accurate ground and aerial data.'],
  ['03', 'Process', 'Organize observations into usable spatial information.'],
  ['04', 'Deliver', 'Provide maps, models, and practical findings.'],
];

export default function ServicesPage() {
  return <CorporateShell><main className="interior-page">
    <InteriorHero eyebrow="WHAT WE DO" title="Services" description="We measure land, make maps, and give you clear information about your site." image="/inner/banner-services.webp" mobileImage="/inner/field-surveyor.webp" imageAlt="Surveyor at work with a total station" dark action={{ label: 'Discuss a project', href: '/contact' }} />
    <section className="interior-section reveal"><div className="interior-shell"><InteriorHeading number="01" eyebrow="GEOSPATIAL SOLUTIONS" title="From the ground to a clearer picture." description="Each service is tailored to the location, project goals, and decisions it needs to support." /><div className="interior-service-grid">{services.map((service, index) => <Link href={`/services/${service.slug}`} className="interior-service-card" key={service.slug}><div className="interior-card-image"><img src={service.image} alt="" loading="lazy" /></div><div className="interior-service-copy"><span>{String(index + 1).padStart(2, '0')} / {service.category}</span><h3>{service.title}</h3><p>{service.description}</p><ArrowUpRight size={20} aria-hidden="true" /></div></Link>)}</div></div></section>
    <section className="interior-section interior-soft reveal"><div className="interior-shell"><InteriorHeading number="02" eyebrow="HOW WE WORK" title="From data to decisions." /><div className="interior-process">{process.map(([number,title,text]) => <div key={number}><b>{number}</b><h3>{title}</h3><p>{text}</p></div>)}</div></div></section>
    <InteriorCta title="Let’s map what your project needs." image="/inner/drone-fields.webp" />
  </main></CorporateShell>;
}
