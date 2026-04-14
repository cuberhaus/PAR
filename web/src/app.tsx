import { useCallback, useState } from 'preact/hooks';
import { Overview } from './pages/Overview';
import { MandelbrotPage } from './pages/MandelbrotPage';
import { HeatPage } from './pages/HeatPage';
import { SortPage } from './pages/SortPage';
import { PiPage } from './pages/PiPage';
import { SpeedupPage } from './pages/SpeedupPage';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'mandelbrot', label: 'Mandelbrot' },
  { id: 'heat', label: 'Heat Eq.' },
  { id: 'sort', label: 'Multi-Sort' },
  { id: 'pi', label: 'Pi' },
  { id: 'speedup', label: 'Speedup' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function App() {
  const [tab, setTab] = useState<TabId>('overview');
  const navigate = useCallback((id: string) => setTab(id as TabId), []);

  return (
    <>
      <nav class="nav-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            class={`nav-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && <Overview onNavigate={navigate} />}
      {tab === 'mandelbrot' && <MandelbrotPage />}
      {tab === 'heat' && <HeatPage />}
      {tab === 'sort' && <SortPage />}
      {tab === 'pi' && <PiPage />}
      {tab === 'speedup' && <SpeedupPage />}
    </>
  );
}
