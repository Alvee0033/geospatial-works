'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import ScrollEffects from '@/components/ScrollEffects';

const navigation = [
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services', children: [['Topographic Survey', '/services/topographic-survey'], ['Drone Mapping', '/services/uav-mapping'], ['GIS Solutions', '/services/gis-solutions'], ['All Services', '/services']] },
  { label: 'Projects', href: '/projects' },
  { label: 'Our Team', href: '/team' },
  { label: 'Insights', href: '/insights' },
  { label: 'Our Innovations', href: '/our-innovations' },
  { label: 'Careers', href: '/career' },
] as const;

export default function CorporateShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const showFooterCta = pathname !== '/team' && pathname !== '/projects' && !pathname.startsWith('/projects/');

  useEffect(() => {
    const header = document.querySelector('.corporate-header');
    if (!header) return;

    const updateFloatingState = () => header.classList.toggle('is-floating', window.scrollY > 28);
    updateFloatingState();
    window.addEventListener('scroll', updateFloatingState, { passive: true });
    return () => window.removeEventListener('scroll', updateFloatingState);
  }, []);

  return <div className="corporate-site">
    <header className="corporate-header">
      <div className="corporate-header-inner">
        <Link href="/" className="corporate-logo" aria-label="Geospatial Works home" onClick={() => setMenuOpen(false)}>
          <img src="/logo.png" alt="" width="48" height="48" />
          <span>GEOSPATIAL <strong>WORKS</strong></span>
        </Link>
        <nav className={menuOpen ? 'corporate-nav is-open' : 'corporate-nav'} aria-label="Main navigation">
          {navigation.map(item => item.href === '/services' ? <div className={`corporate-nav-item corporate-services-item${servicesOpen ? ' services-open' : ''}`} key={item.href} onMouseEnter={() => { if (window.matchMedia('(min-width: 1101px) and (hover: hover)').matches) setServicesOpen(true); }} onMouseLeave={() => { if (window.matchMedia('(min-width: 1101px) and (hover: hover)').matches) setServicesOpen(false); }}><Link href={item.href} onClick={() => setMenuOpen(false)} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}<ChevronDown size={12} aria-hidden="true" /></Link><button type="button" className="corporate-submenu-toggle" aria-label="Toggle Services submenu" aria-expanded={servicesOpen} onClick={() => setServicesOpen(value => !value)}><ChevronDown size={16}/></button><div className="corporate-dropdown">{item.children.map(([label, href]) => <Link key={`${label}-${href}`} href={href} onClick={() => { setMenuOpen(false); setServicesOpen(false); }}>{label}<ArrowUpRight size={13} /></Link>)}</div></div> : <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>)}
          <Link className="corporate-mobile-contact" href="/contact" onClick={() => setMenuOpen(false)}>Contact Us <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </nav>
        <Link className="corporate-contact-link" href="/contact" aria-current={pathname === '/contact' ? 'page' : undefined}><span>Contact Us</span><span className="corporate-contact-icon"><ArrowUpRight size={17} aria-hidden="true" /></span></Link>
        <button className="corporate-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
    </header>
    {children}
    <ScrollEffects />
    {showFooterCta && <section className="corporate-cta">
      <div className="corporate-container corporate-cta-inner">
        <div><span className="corporate-eyebrow">WORK WITH US</span><h2>Have a project in mind?<br />Let’s map the way forward.</h2></div>
        <Link href="/contact" className="corporate-button corporate-button-orange">Start a Conversation <ArrowUpRight size={17} /></Link>
      </div>
    </section>}
    <footer className="corporate-footer">
      <div className="corporate-container corporate-footer-grid">
        <div><Link href="/" className="corporate-logo corporate-logo-light"><img src="/logo.png" alt="" width="48" height="48" /><span>GEOSPATIAL <strong>WORKS</strong></span></Link><p>Surveying, mapping, GIS, and spatial insight for better decisions across Bangladesh.</p></div>
        <div><h3>Explore</h3><div className="corporate-footer-links">{navigation.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href="/contact">Contact</Link></div></div>
        <div><h3>Contact</h3><a href="tel:+8801303772216"><Phone size={15} /> +88 01303 772216</a><a href="mailto:info@geospatialworks.com.bd"><Mail size={15} /> info@geospatialworks.com.bd</a><p className="corporate-address"><MapPin size={15} /> 64/1 (D1), Lake Circus, Kalabagan, Dhaka 1205, Bangladesh</p></div>
      </div>
      <div className="corporate-container corporate-footer-bottom">© {new Date().getFullYear()} Geospatial Works. All rights reserved.</div>
    </footer>
  </div>;
}
