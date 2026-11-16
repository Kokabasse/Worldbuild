import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Encyclopedia } from './pages/Encyclopedia';
import { EntryDetail } from './pages/EntryDetail';
import { EntryEditor } from './pages/EntryEditor';
import { WorldMap } from './pages/WorldMap';
import { Timeline } from './pages/Timeline';
import { Orrery } from './pages/Orrery';
import { Settings } from './pages/Settings';
import { KnowledgeGraph } from './pages/KnowledgeGraph';
import { SearchModal } from './components/SearchModal';
import { UniverseSelector } from './components/UniverseSelector';

export default function App() {
  const { currentPage, selectedEntryId, editingEntryId, selectedUniverseId, searchOpen } = useStore();

  if (!selectedUniverseId) {
    return <UniverseSelector />;
  }

  const renderPage = () => {
    if (editingEntryId) return <EntryEditor />;
    if (selectedEntryId) return <EntryDetail />;
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'encyclopedia': return <Encyclopedia />;
      case 'map': return <WorldMap />;
      case 'timeline': return <Timeline />;
      case 'orrery': return <Orrery />;
      case 'settings': return <Settings />;
      case 'graph': return <KnowledgeGraph />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex bg-zinc-950 text-zinc-200 overflow-hidden">
      <Layout />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
      {searchOpen && <SearchModal />}
    </div>
  );
}
