import { useStore } from '../store/useStore';
import { BookOpen, Users, MapPin, Clock, Globe, Plus, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { entries, categories, relationships, timelineEvents, celestialBodies, maps, selectedUniverseId, universes, setSelectedEntry, setEditingEntry, createEntry, setPage } = useStore();
  const universe = universes.find(u => u.id === selectedUniverseId);
  const uniEntries = entries.filter(e => e.universeId === selectedUniverseId);
  const uniRels = relationships.filter(r => r.universeId === selectedUniverseId);
  const uniEvents = timelineEvents.filter(e => e.universeId === selectedUniverseId);
  const uniBodies = celestialBodies.filter(b => b.universeId === selectedUniverseId);

  const recentEntries = [...uniEntries].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8);
  const catCounts = categories.filter(c => c.universeId === selectedUniverseId).map(c => ({
    ...c,
    count: uniEntries.filter(e => e.categoryId === c.id).length,
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  const handleQuickCreate = () => {
    const id = createEntry({ name: 'New Entry' });
    setEditingEntry(id);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">{universe?.name || 'Dashboard'}</h1>
        <p className="text-sm text-zinc-500 mt-1">{universe?.description || 'Your worldbuilding universe'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Entries', value: uniEntries.length, icon: <BookOpen size={14} />, color: 'text-indigo-400' },
          { label: 'Characters', value: uniEntries.filter(e => categories.find(c => c.id === e.categoryId)?.name === 'Characters').length, icon: <Users size={14} />, color: 'text-violet-400' },
          { label: 'Locations', value: uniEntries.filter(e => ['Cities', 'Settlements', 'Geographical Locations'].includes(categories.find(c => c.id === e.categoryId)?.name || '')).length, icon: <MapPin size={14} />, color: 'text-emerald-400' },
          { label: 'Events', value: uniEvents.length, icon: <Clock size={14} />, color: 'text-amber-400' },
          { label: 'Bodies', value: uniBodies.length, icon: <Globe size={14} />, color: 'text-blue-400' },
          { label: 'Relations', value: uniRels.length, icon: <TrendingUp size={14} />, color: 'text-rose-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
            <div className={`flex items-center gap-1.5 ${stat.color} mb-1`}>
              {stat.icon}
              <span className="text-xs text-zinc-500">{stat.label}</span>
            </div>
            <div className="text-lg font-semibold text-zinc-100">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent entries */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Recently Modified</h2>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {recentEntries.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">No entries yet. Create your first entry!</div>
            )}
            {recentEntries.map(entry => {
              const cat = categories.find(c => c.id === entry.categoryId);
              return (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/30 transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat?.color || '#6b7280' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-200 truncate">{entry.name}</div>
                    <div className="text-xs text-zinc-500">{cat?.name || 'Uncategorized'}</div>
                  </div>
                  <span className="text-xs text-zinc-600">{new Date(entry.updatedAt).toLocaleDateString()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-300">Categories</h2>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {catCounts.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">No entries yet</div>
            )}
            {catCounts.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-zinc-300 flex-1">{cat.name}</span>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex gap-2 flex-wrap">
        <button onClick={handleQuickCreate} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded transition-colors">
          <Plus size={14} /> New Entry
        </button>
        <button onClick={() => setPage('map')} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded transition-colors">
          <MapPin size={14} /> Open Map
        </button>
        <button onClick={() => setPage('timeline')} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded transition-colors">
          <Clock size={14} /> Open Timeline
        </button>
        <button onClick={() => setPage('orrery')} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded transition-colors">
          <Globe size={14} /> Open Orrery
        </button>
      </div>
    </div>
  );
}
