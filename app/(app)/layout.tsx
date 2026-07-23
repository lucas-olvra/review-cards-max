import Link from 'next/link';
import { PageTransition } from '@/components/PageTransition';
import { WhatsNewModal } from '@/components/WhatsNewModal';
import { HeaderNav } from '@/components/HeaderNav';
import { getUnseenChangelog } from '@/lib/actions/changelog';
import { accent } from '@/lib/ui';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const unseenChangelog = await getUnseenChangelog();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '14px 26px',
          background: 'rgba(245,243,238,.82)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(0,0,0,.07)',
        }}
      >
        <Link href="/sections" style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: '#161616',
              display: 'grid',
              placeItems: 'center',
              boxShadow: `0 2px 0 ${accent}`,
            }}
          >
            <i className="ph-fill ph-cards-three" style={{ color: '#fff', fontSize: 19 }} />
          </div>
          <span className="rcp-font-display" style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-.02em', color: '#161616' }}>
            Review<span style={{ color: accent }}>Cards</span>
          </span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <WhatsNewModal initialEntries={unseenChangelog} />
          <HeaderNav />
        </nav>
      </header>
      <main style={{ flex: 1 }}>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
