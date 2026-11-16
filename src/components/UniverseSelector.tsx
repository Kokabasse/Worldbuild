import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Globe, Plus, Trash2, Upload, Download, Sparkles } from 'lucide-react';

export function UniverseSelector() {
  const { universes, createUniverse, deleteUniverse, selectUniverse, importUniverse } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const loadDemo = () => {
    const uniId = createUniverse('Aethermere', 'A world of floating continents, ancient magic, and warring kingdoms.');
    const store = useStore.getState();
    const cats = store.categories.filter(c => c.universeId === uniId);
    const getCat = (n: string) => cats.find(c => c.name === n)?.id || '';

    // Create sample entries
    const nationId = store.createEntry({ name: 'Kingdom of Valdris', categoryId: getCat('Nations'), description: 'A powerful kingdom ruling the central continent, known for its iron discipline and vast armies.', content: 'The Kingdom of Valdris has stood for over a thousand years, its throne passed through the bloodline of the first king, Aldric the Unifier. The kingdom controls the fertile plains of the Heartlands and the strategic mountain passes to the east.', tags: ['major power', 'monarchy'], universeId: uniId });
    const charId1 = store.createEntry({ name: 'Queen Elara Valdris', categoryId: getCat('Characters'), description: 'The current ruler of Valdris, known for her wisdom and strategic mind.', content: 'Queen Elara ascended the throne after the mysterious death of her father. She is considered one of the most capable rulers in the history of the kingdom, though whispers of her use of forbidden magic persist in the court.', tags: ['ruler', 'magic user'], universeId: uniId });
    const charId2 = store.createEntry({ name: 'Theron Ashford', categoryId: getCat('Characters'), description: 'A legendary knight and commander of the Valdris Royal Guard.', tags: ['military', 'loyalist'], universeId: uniId });
    const cityId = store.createEntry({ name: 'Silverhaven', categoryId: getCat('Cities'), description: 'The capital city of Valdris, built around the Great Crystal Spire.', content: 'Silverhaven is a magnificent city of white stone and blue crystal, its towers reaching toward the sky. The Great Crystal Spire at its center is said to be a fragment of a fallen star, and it pulses with arcane energy that protects the city from harm.', tags: ['capital', 'magical'], universeId: uniId });
    const factionId = store.createEntry({ name: 'The Arcane Order', categoryId: getCat('Factions'), description: 'An ancient organization of mages dedicated to preserving magical knowledge.', tags: ['magic', 'secret'], universeId: uniId });
    const religionId = store.createEntry({ name: 'Cult of the Eternal Flame', categoryId: getCat('Religions'), description: 'A faith centered around the worship of an undying flame said to be the breath of creation itself.', tags: ['fire', 'creation'], universeId: uniId });
    const eventId = store.createTimelineEvent({ name: 'The Unification Wars', description: 'A series of conflicts that led to the founding of the Kingdom of Valdris.', startDate: '-1000', endDate: '-995', associatedEntries: [nationId], universeId: uniId });
    const event2Id = store.createTimelineEvent({ name: 'Rise of Queen Elara', description: 'Elara ascends the throne under mysterious circumstances.', startDate: '1042', associatedEntries: [charId1, nationId], universeId: uniId });

    // Create relationships
    const relTypes = store.relationshipTypes.filter(r => r.universeId === uniId);
    const ruledBy = relTypes.find(r => r.name === 'Ruled by');
    const locatedIn = relTypes.find(r => r.name === 'Located in');
    const memberOf = relTypes.find(r => r.name === 'Member of');
    const foundedBy = relTypes.find(r => r.name === 'Founded by');

    if (ruledBy) {
      store.createRelationship({ sourceId: nationId, targetId: charId1, type: ruledBy.name, reverseType: ruledBy.reverseName, universeId: uniId });
    }
    if (locatedIn) {
      store.createRelationship({ sourceId: cityId, targetId: nationId, type: locatedIn.name, reverseType: locatedIn.reverseName, universeId: uniId });
    }
    if (memberOf) {
      store.createRelationship({ sourceId: charId2, targetId: factionId, type: memberOf.name, reverseType: memberOf.reverseName, universeId: uniId });
    }

    // Add map markers
    const map = store.maps.find(m => m.universeId === uniId);
    if (map) {
      store.addMapMarker(map.id, { id: crypto.randomUUID(), x: 200, y: 150, type: 'capital', entryId: cityId, label: 'Silverhaven', layerId: map.layers[0].id, icon: 'circle' });
      store.addMapMarker(map.id, { id: crypto.randomUUID(), x: 350, y: 200, type: 'city', entryId: null, label: 'Ironhold', layerId: map.layers[0].id, icon: 'circle' });
      store.addMapMarker(map.id, { id: crypto.randomUUID(), x: 100, y: 300, type: 'ruins', entryId: null, label: 'Ancient Ruins', layerId: map.layers[0].id, icon: 'circle' });
    }

    // Add celestial bodies
    store.createCelestialBody({ name: 'Aethon', type: 'star', color: '#fbbf24', diameter: 50, universeId: uniId, description: 'The central star of the Aethermere system, slightly larger and brighter than Sol.' });
    const planetId = store.createCelestialBody({ name: 'Aethermere', type: 'planet', parentId: '', color: '#3b82f6', diameter: 20, orbitalDistance: 150, orbitalPeriod: 365, universeId: uniId, description: 'The homeworld — a blue-green planet with floating continents held aloft by arcane forces.', atmosphere: 'Nitrogen-Oxygen with trace magical particles', temperature: 'Temperate' });
    store.createCelestialBody({ name: 'Lunara', type: 'moon', parentId: planetId, color: '#94a3b8', diameter: 5, orbitalDistance: 30, orbitalPeriod: 28, universeId: uniId, description: 'The primary moon of Aethermere, its surface covered in crystalline formations.' });
    store.createCelestialBody({ name: 'Pyrathis', type: 'planet', parentId: '', color: '#ef4444', diameter: 15, orbitalDistance: 250, orbitalPeriod: 680, universeId: uniId, description: 'A volcanic world shrouded in perpetual ash clouds.' });

    selectUniverse(uniId);
  };

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
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">
              <Plus size={16} /> New Universe
            </button>
            <button onClick={handleImport} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">
              <Upload size={16} /> Import Universe
            </button>
            {universes.length === 0 && (
              <button onClick={loadDemo} className="flex items-center gap-2 px-3 py-2 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 text-sm rounded-lg transition-colors">
                <Sparkles size={16} /> Load Demo Universe
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
