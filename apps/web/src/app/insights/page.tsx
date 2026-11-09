import CorporateShell from '@/components/CorporateShell';
import InsightsClientView from '@/components/InsightsClientView';
import '../corporate.css';

export const revalidate = 10;

export default function InsightsPage() {
  return (
    <CorporateShell>
      <main className="wsp-insights-main">
        <InsightsClientView />
      </main>
    </CorporateShell>
  );
}
