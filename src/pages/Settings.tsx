import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Download, Upload, Plus, Trash2, Globe, BookOpen, Link2 } from 'lucide-react';

export function Settings() {
  const { universes, selectedUniverseId, categories, relationshipTypes, updateUniverse, deleteUniverse, createCategory, deleteCategory, createRelationshipType, exportUniverse, importUniverse, selectUniverse } = useStore();
  const universe = universes.find(u => u.id === selectedUniverseId);
  const uniCats = categories.filter(c => c.universeId === selectedUniverseId);
  const uniRelTypes = relationshipTypes.filter(r => r.universeId === selectedUniverseId);

  const [tab, setTab] = useState<'general' | 'categories' | 'relationships' | 'data'>('general');
  const [editName, setEditName] = useState(universe?.name || '');
  const [editDesc, setEditDesc] = useState(universe?.description || '');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6b7280');
  const [newRelName, setNewRelName] = useState('');
  const [newRelReverse, setNewRelReverse] = useState('');

  const handleSaveUniverse = () => {
    if (universe && editName.trim()) {
      updateUniverse(universe.id, { name: editName.trim(), description: editDesc.trim() });
    }
  };

  const handleExport = () => {
    if (!selectedUniverseId) return;
    const data = exportUniverse(selectedUniverseId);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${universe?.name || 'universe'}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => importUniverse(ev.target?.result as string);
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-full flex">
      {/* Tabs */}
      <div className="w-44 border-r border-zinc-800 bg-zinc-900/50 p-2 shrink-0">
        {[
          { id: 'general', label: 'General', icon: <Globe size={14} /> },
          { id: 'categories', label: 'Categories', icon: <BookOpen size={14} /> },
          { id: 'relationships', label: 'Relationships', icon: <Link2 size={14} /> },
          { id: 'data', label: 'Data', icon: <Download size={14} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors mb-0.5 ${tab === t.id ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-xl">
          {tab === 'general' && (
            <div className="space-y-4">
              <h2 className="text-base font-medium text-zinc-200">Universe Settings</h2>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
              <button onClick={handleSaveUniverse} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded">Save Changes</button>

              <div className="border-t border-zinc-800 pt-4 mt-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-2">Switch Universe</h3>
                <div className="space-y-1">
                  {universes.map(u => (
                    <button
                      key={u.id}
                      onClick={() => selectUniverse(u.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${u.id === selectedUniverseId ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
                    >
                      {u.name} {u.id === selectedUniverseId && <span className="text-xs text-indigo-400">(active)</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 mt-4">
                <button onClick={() => { if (confirm('Delete this universe and ALL its data? This cannot be undone.')) { deleteUniverse(selectedUniverseId!); } }} className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm rounded border border-red-900/50">
                  Delete Universe
                </button>
              </div>
            </div>
          )}

          {tab === 'categories' && (
            <div className="space-y-4">
              <h2 className="text-base font-medium text-zinc-200">Entry Categories</h2>
              <div className="space-y-1">
                {uniCats.map(cat => (
                  <div key={cat.id} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded group">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-zinc-300 flex-1">{cat.name}</span>
                    {cat.isBuiltIn && <span className="text-[10px] text-zinc-600">built-in</span>}
                    {!cat.isBuiltIn && (
                      <button onClick={() => { if (confirm('Delete this category?')) deleteCategory(cat.id); }} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400"><Trash2 size={12} /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-800 pt-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-2">Add Custom Category</h3>
                <div className="flex gap-2">
                  <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name" className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500" />
                  <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-zinc-800 border border-zinc-700" />
                  <button onClick={() => { if (newCatName.trim()) { createCategory({ name: newCatName.trim(), color: newCatColor }); setNewCatName(''); } }} className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded">Add</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'relationships' && (
            <div className="space-y-4">
              <h2 className="text-base font-medium text-zinc-200">Relationship Types</h2>
              <div className="space-y-1">
                {uniRelTypes.map(rt => (
                  <div key={rt.id} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rt.color }} />
                    <span className="text-sm text-zinc-300">{rt.name}</span>
                    <span className="text-xs text-zinc-600">↔</span>
                    <span className="text-sm text-zinc-400">{rt.reverseName}</span>
                    {rt.isBuiltIn && <span className="text-[10px] text-zinc-600 ml-auto">built-in</span>}
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-800 pt-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-2">Add Custom Relationship Type</h3>
                <div className="flex gap-2">
                  <input value={newRelName} onChange={e => setNewRelName(e.target.value)} placeholder="Forward name (e.g. 'Commands')" className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500" />
                  <input value={newRelReverse} onChange={e => setNewRelReverse(e.target.value)} placeholder="Reverse name (e.g. 'Commanded by')" className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500" />
                  <button onClick={() => { if (newRelName.trim() && newRelReverse.trim()) { createRelationshipType({ name: newRelName.trim(), reverseName: newRelReverse.trim() }); setNewRelName(''); setNewRelReverse(''); } }} className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded">Add</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'data' && (
            <div className="space-y-4">
              <h2 className="text-base font-medium text-zinc-200">Data Management</h2>
              <div className="space-y-3">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-zinc-300 mb-1">Export Universe</h3>
                  <p className="text-xs text-zinc-500 mb-3">Download all data as a JSON file for backup or transfer.</p>
                  <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded">
                    <Download size={12} /> Export
                  </button>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-zinc-300 mb-1">Import Universe</h3>
                  <p className="text-xs text-zinc-500 mb-3">Load a previously exported universe JSON file.</p>
                  <button onClick={handleImport} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded">
                    <Upload size={12} /> Import
                  </button>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-zinc-300 mb-1">Storage Info</h3>
                  <div className="text-xs text-zinc-500 space-y-1">
                    <div>Entries: {useStore.getState().entries.filter(e => e.universeId === selectedUniverseId).length}</div>
                    <div>Relationships: {useStore.getState().relationships.filter(r => r.universeId === selectedUniverseId).length}</div>
                    <div>Maps: {useStore.getState().maps.filter(m => m.universeId === selectedUniverseId).length}</div>
                    <div>Timeline Events: {useStore.getState().timelineEvents.filter(e => e.universeId === selectedUniverseId).length}</div>
                    <div>Celestial Bodies: {useStore.getState().celestialBodies.filter(b => b.universeId === selectedUniverseId).length}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
