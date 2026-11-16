import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { BookOpen, Users, MapPin, Clock, Globe, Plus, TrendingUp, GitGraph, Sparkles, ArrowRight } from 'lucide-react';

export function Dashboard() {
  const { entries, categories, relationships, timelineEvents, celestialBodies, maps, selectedUniverseId, universes, setSelectedEntry, setEditingEntry, createEntry, setPage } = useStore();
  const universe = universes.find(u => u.id === selectedUniverseId);
  const uniEntries = entries.filter(e => e.universeId === selectedUniverseId);
  const uniRels = relationships.filter(r => r.universeId === selectedUniverseId);
  const uniEvents = timelineEvents.filter(e => e.universeId === selectedUniverseId);
  const uniBodies = celestialBodies.filter(b => b.universeId === selectedUniverseId);
  const uniMaps = maps.filter(m => m.universeId === selectedUniverseId);

  const [animatedCounts, setAnimatedCounts] = useState({ entries: 0, characters: 0, locations: 0, events: 0, bodies: 0, relations: 0 });

  const recentEntries = [...uniEntries].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8);
  const recentCreated = [...uniEntries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const catCounts = categories.filter(c => c.universeId === selectedUniverseId).map(c => ({
    ...c,
    count: uniEntries.filter(e => e.categoryId === c.id).length,
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  // Animate counters on mount
  useEffect(() => {
    const targets = {
      entries: uniEntries.length,
      characters: uniEntries.filter(e => categories.find(c => c.id === e.categoryId)?.name === 'Characters').length,
      locations: uniEntries.filter(e => ['Cities', 'Settlements', 'Geographical Locations'].includes(categories.find(c => c.id === e.categoryId)?.name || '')).length,
      events: uniEvents.length,
      bodies: uniBodies.length,
      relations: uniRels.length,
    };

    const duration = 800;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedCounts({
        entries: Math.round(targets.entries * eased),
        characters: Math.round(targets.characters * eased),
        locations: Math.round(targets.locations * eased),
        events: Math.round(targets.events * eased),
        bodies: Math.round(targets.bodies * eased),
        relations: Math.round(targets.relations * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [uniEntries.length, uniEvents.length, uniBodies.length, uniRels.length, categories]);

  const handleQuickCreate = () => {
    const id = createEntry({ name: 'New Entry' });
    setEditingEntry(id);
  };

  const maxCatCount = Math.max(...catCounts.map(c => c.count), 1);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">{universe?.name || 'Dashboard'}</h1>
        <p className="text-sm text-zinc-500 mt-1">{universe?.description || 'Your worldbuilding universe'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Entries', value: animatedCounts.entries, icon: <BookOpen size={14} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10', page: 'encyclopedia' as const },
          { label: 'Characters', value: animatedCounts.characters, icon: <Users size={14} />, color: 'text-violet-400', bg: 'bg-violet-500/10', page: 'encyclopedia' as const },
          { label: 'Locations', value: animatedCounts.locations, icon: <MapPin size={14} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', page: 'map' as const },
          { label: 'Events', value: animatedCounts.events, icon: <Clock size={14} />, color: 'text-amber-400', bg: 'bg-amber-500/10', page: 'timeline' as const },
          { label: 'Bodies', value: animatedCounts.bodies, icon: <Globe size={14} />, color: 'text-blue-400', bg: 'bg-blue-500/10', page: 'orrery' as const },
          { label: 'Relations', value: animatedCounts.relations, icon: <TrendingUp size={14} />, color: 'text-rose-400', bg: 'bg-rose-500/10', page: 'graph' as const },
        ].map(stat => (
          <button
            key={stat.label}
            onClick={() => setPage(stat.page)}
            className={`${stat.bg} border border-zinc-800 rounded-lg p-3 text-left hover:border-zinc-700 transition-all hover:scale-[1.02] active:scale-[0.98]`}
          >
            <div className={`flex items-center gap-1.5 ${stat.color} mb-1`}>
              {stat.icon}
              <span className="text-xs text-zinc-500">{stat.label}</span>
            </div>
            <div className="text-lg font-semibold text-zinc-100">{stat.value}</div>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Category chart */}
        <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Categories</h2>
            <button onClick={() => setPage('encyclopedia')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight size={10} />
            </button>
          </div>
          <div className="p-4 space-y-2.5">
            {catCounts.length === 0 && (
              <div className="text-xs text-zinc-500 text-center py-4">No entries yet</div>
            )}
            {catCounts.slice(0, 8).map(cat => (
              <div key={cat.id} className="group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-zinc-300 flex-1 truncate">{cat.name}</span>
                  <span className="text-xs text-zinc-500">{cat.count}</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(cat.count / maxCatCount) * 100}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent entries */}
        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Recently Modified</h2>
            <button onClick={() => setPage('encyclopedia')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight size={10} />
            </button>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {recentEntries.length === 0 && (
              <div className="px-4 py-8 text-center">
                <Sparkles size={20} className="mx-auto mb-2 text-zinc-600" />
                <p className="text-sm text-zinc-500">No entries yet. Create your first entry!</p>
                <button onClick={handleQuickCreate} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">Create one →</button>
              </div>
            )}
            {recentEntries.map(entry => {
              const cat = categories.find(c => c.id === entry.categoryId);
              return (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/30 transition-colors text-left"
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat?.color || '#6b7280' }} />
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
      </div>

      {/* Quick actions & recently created */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Quick actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-300">Quick Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            <button onClick={handleQuickCreate} className="flex items-center gap-2 px-3 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs rounded transition-colors">
              <Plus size={14} /> New Entry
            </button>
            <button onClick={() => setPage('map')} className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors">
              <MapPin size={14} /> Open Map
            </button>
            <button onClick={() => setPage('timeline')} className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors">
              <Clock size={14} /> Timeline
            </button>
            <button onClick={() => setPage('orrery')} className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors">
              <Globe size={14} /> Orrery
            </button>
            <button onClick={() => setPage('graph')} className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors">
              <GitGraph size={14} /> Knowledge Graph
            </button>
            <button onClick={() => setPage('settings')} className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors">
              <Sparkles size={14} /> Settings
            </button>
          </div>
        </div>

        {/* Recently created */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-300">Recently Created</h2>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {recentCreated.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">No entries yet</div>
            )}
            {recentCreated.map(entry => {
              const cat = categories.find(c => c.id === entry.categoryId);
              return (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry.id)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-800/30 transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat?.color || '#6b7280' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-zinc-300 truncate">{entry.name}</div>
                  </div>
                  <span className="text-[10px] text-zinc-600">{new Date(entry.createdAt).toLocaleDateString()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
