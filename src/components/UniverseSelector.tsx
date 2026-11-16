import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Globe, Plus, Trash2, Upload, Download } from 'lucide-react';

export function UniverseSelector() {
  const { universes, createUniverse, deleteUniverse, selectUniverse, importUniverse } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      createUniverse(name.trim(), desc.trim());
      setName('');
      setDesc('');
      setShowCreate(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          importUniverse(ev.target?.result as string);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = (id: string) => {
    const data = useStore.getState().exportUniverse(id);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `universe-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-8">
          <Globe size={28} className="text-indigo-400" />
          <h1 className="text-2xl font-semibold text-zinc-100">World Builder</h1>
        </div>
        <p className="text-zinc-400 mb-8 text-sm">Select a universe to begin, or create a new one.</p>

        <div className="grid gap-3 mb-6">
          {universes.map(u => (
            <div key={u.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-4 group hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Globe size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-200">{u.name}</div>
                <div className="text-xs text-zinc-500 truncate">{u.description || 'No description'}</div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleExport(u.id)} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200" title="Export">
                  <Download size={14} />
                </button>
                <button onClick={() => { if (confirm('Delete this universe and all its data?')) deleteUniverse(u.id); }} className="p-1.5 rounded hover:bg-red-900/30 text-zinc-400 hover:text-red-400" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
              <button onClick={() => selectUniverse(u.id)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded transition-colors">
                Open
              </button>
            </div>
          ))}
        </div>

        {showCreate ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Universe name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={handleCreate} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded transition-colors">Create</button>
              <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">
              <Plus size={16} /> New Universe
            </button>
            <button onClick={handleImport} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">
              <Upload size={16} /> Import Universe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
