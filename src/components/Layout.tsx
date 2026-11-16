import { useStore } from '../store/useStore';
import { LayoutDashboard, BookOpen, Map, Clock, Orbit, Settings, GitGraph, Search, Globe } from 'lucide-react';
import type { Page } from '../types';

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { page: 'encyclopedia', label: 'Encyclopedia', icon: <BookOpen size={18} /> },
  { page: 'map', label: 'World Map', icon: <Map size={18} /> },
  { page: 'timeline', label: 'Timeline', icon: <Clock size={18} /> },
  { page: 'orrery', label: 'Orrery', icon: <Orbit size={18} /> },
  { page: 'graph', label: 'Knowledge Graph', icon: <GitGraph size={18} /> },
  { page: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export function Layout() {
  const { currentPage, setPage, selectedUniverseId, universes, setSearchOpen, setSelectedEntry, setEditingEntry } = useStore();
  const universe = universes.find(u => u.id === selectedUniverseId);

  return (
    <aside className="w-56 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <Globe size={16} className="text-indigo-400" />
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">World Builder</span>
        </div>
        <div className="text-sm font-medium text-zinc-300 truncate">{universe?.name || 'No Universe'}</div>
      </div>

      <nav className="flex-1 py-2 px-2">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => { setPage(item.page); setSelectedEntry(null); setEditingEntry(null); }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-sm transition-colors mb-0.5 ${
              currentPage === item.page
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-zinc-800">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
        >
          <Search size={16} />
          Search...
          <span className="ml-auto text-xs text-zinc-600">⌘K</span>
        </button>
      </div>
    </aside>
  );
}
