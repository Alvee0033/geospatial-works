import { Mail, MapPin, Phone } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import ContactForm from '@/components/CorporateContactForm';
import { InteriorHero } from '@/components/InteriorDesign';
import '../corporate.css';
import '../interior.css';

export default function ContactPage() {
  return <CorporateShell><main className="interior-page interior-contact">
    <InteriorHero eyebrow="GET IN TOUCH" title="Contact" description="Tell us about your site, survey, or map needs." image="/inner/banner-contact.webp" mobileImage="/inner/wetland-aerial.webp" imageAlt="Aerial river and wetland landscape" dark />
    <section className="interior-section reveal"><div className="interior-shell interior-contact-grid"><div><span className="interior-kicker">PROJECT ENQUIRY</span><h2>Send us a message.</h2><p>Share a few details and review your enquiry in your email app before sending it.</p><ContactForm /></div><aside><span className="interior-kicker">OTHER WAYS TO REACH US</span><h2>Get in touch.</h2><div className="interior-contact-method"><Mail size={20} /><div><strong>Email</strong><a href="mailto:info@geospatialworks.com.bd">info@geospatialworks.com.bd</a></div></div><div className="interior-contact-method"><Phone size={20} /><div><strong>Phone</strong><a href="tel:+8801303772216">+88 01303 772216</a><a href="tel:+8801713907779">+88 01713 907779</a></div></div><div className="interior-contact-method"><MapPin size={20} /><div><strong>Visit us</strong><p>64/1 (D1), Lake Circus, Kalabagan, Dhaka 1205, Bangladesh</p></div></div><div className="interior-contact-photo"><img src="/inner/river-aerial.webp" alt="Bangladesh river landscape" loading="lazy" /><span>BASED IN DHAKA / WORKING ACROSS BANGLADESH</span></div></aside></div></section>
    <section className="interior-section interior-soft reveal"><div className="interior-shell"><span className="interior-kicker">FIND OUR OFFICE</span><h2 className="interior-checklist-title">Visit us in Dhaka</h2><div className="interior-map"><iframe title="Map showing Geospatial Works office in Kalabagan, Dhaka" src="https://www.google.com/maps?q=64%2F1%20(D1)%2C%20Lake%20Circus%2C%20Kalabagan%2C%20Dhaka%201205&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div><strong>Geospatial Works</strong><p>64/1 (D1), Lake Circus<br />Kalabagan, Dhaka 1205</p><a href="https://www.google.com/maps/search/?api=1&query=64%2F1%20(D1)%2C%20Lake%20Circus%2C%20Kalabagan%2C%20Dhaka%201205" target="_blank" rel="noopener noreferrer">Open directions ↗</a></div></div></div></section>
  </main></CorporateShell>;
}
