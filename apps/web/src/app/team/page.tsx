import CorporateShell from '@/components/CorporateShell';
import TeamClientView from '@/components/TeamClientView';
import '../corporate.css';

export const revalidate = 10;

export const metadata = {
  title: 'Leadership & Senior Surveyors | Geospatial Works Bangladesh',
  description:
    'Meet the veteran civil engineers, licensed architects, and geodetic surveying specialists delivering national infrastructure projects across Bangladesh.',
};

export default function TeamPage() {
  return (
    <CorporateShell>
      <main className="wsp-team-main">
        <TeamClientView />
      </main>
    </CorporateShell>
  );
}
