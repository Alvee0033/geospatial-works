import Link from 'next/link';
import { ArrowUpRight, Check, Compass, Layers3, MapPinned, Ruler } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { InteriorCta, InteriorHeading, InteriorHero } from '@/components/InteriorDesign';
import { insights, projects } from '@/lib/corporate-data';
import '../corporate.css';
import '../interior.css';

const experience = [
  'Measuring land and recording the features that matter to a project.',
  'Taking aerial photos that show a whole site clearly.',
  'Checking land, boundary, and water information against what is on the ground.',
  'Making maps that clients can read, share, and use.',
];

const commitments = [
  'Take care with every measurement and map.',
  'Explain our findings in clear language.',
  'Work closely with the people who know the site.',
  'Deliver information that is useful after the survey is done.',
];

const approach = [
  { number: '01', title: 'Listen', text: 'We learn about your site, your questions, and the decisions you need to make.' },
  { number: '02', title: 'Measure', text: 'Our team collects the right photos and measurements, then checks them carefully.' },
  { number: '03', title: 'Make it clear', text: 'We bring the information together in maps and plans your team can use.' },
];

const strengths = [
  { title: 'Knowledge of Bangladesh', text: 'Local conditions matter. We look at the land, water, and people around each site.', icon: MapPinned },
  { title: 'Field work and maps together', text: 'The team that gathers information works closely with the team that makes the maps.', icon: Layers3 },
  { title: 'Careful checks', text: 'We review measurements and compare sources before we share a result.', icon: Ruler },
  { title: 'A useful end result', text: 'We focus on the map, plan, or answer you need for the next step.', icon: Compass },
];

export default function AboutPage() {
  return <CorporateShell><main className="interior-page interior-about">
    <InteriorHero eyebrow="ABOUT GEOSPATIAL WORKS" title="About Us" description="We help people understand land and make better plans for it." image="/inner/banner-about.webp" mobileImage="/inner/river-aerial.webp" imageAlt="Aerial view of a river and green floodplain" action={{ label: 'Learn about us', href: '#who-we-are' }} />

    <section className="interior-section interior-about-intro reveal" id="who-we-are"><div className="interior-shell interior-about-intro-grid">
      <div className="interior-about-intro-copy"><span className="interior-kicker">ABOUT US</span><h2>Clear maps start with knowing the place.</h2><h3>Who we are</h3><p>Geospatial Works is a Bangladesh-based team that surveys land, takes aerial photos, and makes maps. We help people see what is on a site and understand what it means for their plans.</p><p>Our work connects time in the field with careful map making. We record land levels, boundaries, roads, buildings, rivers, and other details, then turn that information into plans people can use.</p>
        <h3>What we do</h3><p>We support work on land, water, and the built environment. A project may need a ground survey, drone photos, a map made from existing records, or a clear view of how a place has changed. We choose the work that answers the real question.</p>
        <div className="interior-about-experience"><h3>Our experience includes</h3><ul>{experience.map(item => <li key={item}><Check size={18} aria-hidden="true" />{item}</li>)}</ul></div>
        <h3>Our purpose</h3><p>To give people trustworthy information about places, so they can plan and work with more confidence.</p><div className="interior-about-actions"><Link className="interior-action" href="/contact">Work with us <ArrowUpRight size={17} aria-hidden="true" /></Link><Link className="interior-text-link" href="/services">Our services <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      </div>
      <div className="interior-about-intro-media"><div className="interior-photo"><img src="/inner/field-surveyor.webp" alt="Surveyor measuring a site beside open land" loading="lazy" /></div><div className="interior-photo"><img src="/inner/field-team.webp" alt="Survey team planning field work together" loading="lazy" /></div></div>
    </div></section>

    <section className="interior-about-commitment reveal"><div className="interior-shell interior-about-commitment-grid"><div className="interior-about-commitment-photo"><img src="/inner/wetland-aerial.webp" alt="River landscape seen from above" loading="lazy" /></div><div><span className="interior-kicker">OUR COMMITMENT</span><h2>Work you can build on.</h2><p>We want every project to leave people with a clearer picture of the place they are working with.</p><ul>{commitments.map(item => <li key={item}><span aria-hidden="true">↗</span>{item}</li>)}</ul><Link className="interior-text-link" href="/team">Meet the team <ArrowUpRight size={18} aria-hidden="true" /></Link></div></div></section>

    <section className="interior-section interior-soft reveal"><div className="interior-shell interior-about-approach"><div><span className="interior-kicker">OUR APPROACH</span><h2>How we work</h2><p>From the first conversation to the final map, each step helps answer a practical question.</p><Link className="interior-text-link" href="/contact">Tell us about your project <ArrowUpRight size={18} aria-hidden="true" /></Link></div><div className="interior-about-steps">{approach.map(item => <article key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></div></section>

    <section className="interior-section reveal"><div className="interior-shell"><InteriorHeading number="01" eyebrow="WHY WORK WITH US" title="What makes our work useful" description="Good information is accurate, easy to understand, and ready for the next step." /><div className="interior-about-strengths">{strengths.map(({title,text,icon:Icon}) => <article key={title}><Icon size={27} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section className="interior-section interior-soft reveal"><div className="interior-shell"><InteriorHeading number="02" eyebrow="OUR WORK" title="Places we have worked on" href="/projects" linkText="All projects" /><div className="interior-image-strip">{projects.slice(0,3).map(project => <Link href={`/projects/${project.slug}`} key={project.slug}><img src={project.image} alt="" loading="lazy" /><span>{project.category}</span><strong>{project.title}</strong></Link>)}</div></div></section>

    <section className="interior-section reveal"><div className="interior-shell"><InteriorHeading number="03" eyebrow="ARTICLES" title="Learn more about the work" description="Plain-English guides to the places we survey and the maps we make." href="/insights" linkText="All articles" /><div className="interior-about-articles">{insights.slice(0,3).map(item => <Link href={`/insights/${item.slug}`} key={item.slug}><img src={item.image} alt="" loading="lazy" /><div><span className="interior-kicker">{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><span className="interior-text-link">Read article <ArrowUpRight size={17} aria-hidden="true" /></span></div></Link>)}</div></div></section>

    <InteriorCta title="Need a clearer picture of your site?" description="Tell us what you need to learn about the land or water you are working with." image="/inner/river-aerial.webp" />
  </main></CorporateShell>;
}
