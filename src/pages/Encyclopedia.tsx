import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, Filter, Grid3X3, List } from 'lucide-react';

export function Encyclopedia() {
  const { entries, categories, selectedUniverseId, setSelectedEntry, setEditingEntry, createEntry } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'created'>('updated');

  const uniEntries = entries.filter(e => e.universeId === selectedUniverseId);
  const uniCats = categories.filter(c => c.universeId === selectedUniverseId);

  const filtered = useMemo(() => {
    let result = uniEntries;
    if (selectedCat !== 'all') result = result.filter(e => e.categoryId === selectedCat);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q)));
    }
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [uniEntries, selectedCat, search, sortBy]);

  const handleNewEntry = () => {
    const id = createEntry({ name: 'New Entry', categoryId: selectedCat !== 'all' ? selectedCat : uniCats[0]?.id || '' });
    setEditingEntry(id);
  };

  return (
    <div className="h-full flex">
      {/* Category sidebar */}
      <div className="w-48 border-r border-zinc-800 bg-zinc-900/50 overflow-auto shrink-0">
        <div className="p-3">
          <button onClick={handleNewEntry} className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors">
            <Plus size={12} /> New Entry
          </button>
        </div>
        <div className="px-2 pb-2">
          <button
            onClick={() => setSelectedCat('all')}
            className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${selectedCat === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
          >
            All Entries <span className="text-zinc-600 ml-1">{uniEntries.length}</span>
          </button>
          {uniCats.map(cat => {
            const count = uniEntries.filter(e => e.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded text-xs transition-colors ${selectedCat === cat.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="flex-1 truncate">{cat.name}</span>
                <span className="text-zinc-600">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter entries..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="bg-zinc-800 border border-zinc-700/50 rounded text-xs text-zinc-300 px-2 py-1.5 focus:outline-none">
            <option value="updated">Last Modified</option>
            <option value="created">Date Created</option>
            <option value="name">Name</option>
          </select>
          <div className="flex border border-zinc-700/50 rounded overflow-hidden">
            <button onClick={() => setViewMode('list')} className={`p-1.5 ${viewMode === 'list' ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}><List size={14} /></button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 ${viewMode === 'grid' ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}><Grid3X3 size={14} /></button>
          </div>
          <span className="text-xs text-zinc-500">{filtered.length} entries</span>
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <Filter size={24} className="mb-2 opacity-50" />
              <p className="text-sm">No entries found</p>
              <button onClick={handleNewEntry} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">Create one</button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="divide-y divide-zinc-800/50">
              {filtered.map(entry => {
                const cat = categories.find(c => c.id === entry.categoryId);
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry.id)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/30 transition-colors text-left"
                  >
                    <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: cat?.color || '#6b7280' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-200 truncate">{entry.name}</div>
                      <div className="text-xs text-zinc-500 truncate">{entry.description || cat?.name || 'No description'}</div>
                    </div>
                    {entry.tags.length > 0 && (
                      <div className="hidden md:flex gap-1">
                        {entry.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-zinc-600 shrink-0">{new Date(entry.updatedAt).toLocaleDateString()}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
              {filtered.map(entry => {
                const cat = categories.find(c => c.id === entry.categoryId);
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry.id)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color || '#6b7280' }} />
                      <span className="text-[10px] text-zinc-500">{cat?.name}</span>
                    </div>
                    <div className="text-sm font-medium text-zinc-200 truncate">{entry.name}</div>
                    <div className="text-xs text-zinc-500 truncate mt-0.5">{entry.description || 'No description'}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
