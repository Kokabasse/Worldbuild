import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Search, X } from 'lucide-react';

export function SearchModal() {
  const { entries, categories, setSearchOpen, setSelectedEntry, setPage } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  const results = query.trim()
    ? entries.filter(e =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.description.toLowerCase().includes(query.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 20)
    : [];

  const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name || 'Unknown';
  const getCategoryColor = (catId: string) => categories.find(c => c.id === catId)?.color || '#6b7280';

  const openEntry = (id: string) => {
    setSelectedEntry(id);
    setSearchOpen(false);
    setPage('encyclopedia');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
          <Search size={16} className="text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search entries..."
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none"
          />
          <button onClick={() => setSearchOpen(false)} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-80 overflow-auto">
          {query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-zinc-500">No results found</div>
          )}
          {results.map(entry => (
            <button
              key={entry.id}
              onClick={() => openEntry(entry.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 transition-colors text-left"
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(entry.categoryId) }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-200 truncate">{entry.name}</div>
                <div className="text-xs text-zinc-500">{getCategoryName(entry.categoryId)}</div>
              </div>
            </button>
          ))}
          {!query && (
            <div className="px-4 py-8 text-center text-sm text-zinc-500">Type to search entries</div>
          )}
        </div>
      </div>
    </div>
  );
}
