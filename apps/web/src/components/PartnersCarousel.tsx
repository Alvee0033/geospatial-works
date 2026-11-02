import { partners } from '@/lib/corporate-data';

function PartnerList({ duplicate = false }: { duplicate?: boolean }) {
  return <ul className="reference-partners-grid" aria-hidden={duplicate || undefined}>
    {partners.map(partner => <li key={partner.name}>
      <div className="reference-partner-logo"><img src={partner.image} alt={duplicate ? '' : `${partner.name} logo`} loading="lazy" /></div>
      <span>{partner.name}</span>
    </li>)}
  </ul>;
}

export default function PartnersCarousel() {
  return <div className="reference-partners-marquee" aria-label="Partner organizations">
    <div className="reference-partners-track">
      <PartnerList />
      <PartnerList duplicate />
    </div>
  </div>;
}
