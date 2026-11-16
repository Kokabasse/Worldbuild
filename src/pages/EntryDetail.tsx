import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, Edit3, Trash2, Link2, Tag, Calendar } from 'lucide-react';

export function EntryDetail() {
  const { entries, categories, relationships, relationshipTypes, selectedEntryId, setSelectedEntry, setEditingEntry, deleteEntry, createRelationship, setPage } = useStore();
  const [showRelForm, setShowRelForm] = useState(false);
  const [relTarget, setRelTarget] = useState('');
  const [relType, setRelType] = useState('');

  const entry = entries.find(e => e.id === selectedEntryId);
  if (!entry) return <div className="p-6 text-zinc-500">Entry not found</div>;

  const category = categories.find(c => c.id === entry.categoryId);
  const uniRels = relationships.filter(r => r.universeId === entry.universeId);
  const uniRelTypes = relationshipTypes.filter(r => r.universeId === entry.universeId);
  const uniEntries = entries.filter(e => e.universeId === entry.universeId && e.id !== entry.id);

  const outgoingRels = uniRels.filter(r => r.sourceId === entry.id);
  const incomingRels = uniRels.filter(r => r.targetId === entry.id);

  const handleDelete = () => {
    if (confirm('Delete this entry? All relationships will be removed.')) {
      deleteEntry(entry.id);
      setSelectedEntry(null);
    }
  };

  const handleAddRel = () => {
    if (relTarget && relType) {
      const rt = uniRelTypes.find(r => r.id === relType);
      if (rt) {
        createRelationship({ sourceId: entry.id, targetId: relTarget, type: rt.name, reverseType: rt.reverseName, universeId: entry.universeId });
        setShowRelForm(false);
        setRelTarget('');
        setRelType('');
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
        <button onClick={() => setSelectedEntry(null)} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-0.5">
            <button onClick={() => { setSelectedEntry(null); setPage('encyclopedia'); }} className="hover:text-zinc-300 transition-colors">Encyclopedia</button>
            <span>/</span>
            <span className="text-zinc-600">{category?.name || 'Uncategorized'}</span>
            <span>/</span>
            <span className="text-zinc-400">{entry.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category?.color || '#6b7280' }} />
            <h1 className="text-sm font-semibold text-zinc-100 truncate">{entry.name}</h1>
          </div>
        </div>
        <button onClick={() => setEditingEntry(entry.id)} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200" title="Edit">
          <Edit3 size={14} />
        </button>
        <button onClick={handleDelete} className="p-1.5 rounded hover:bg-red-900/30 text-zinc-400 hover:text-red-400" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {/* Description */}
          {entry.description && (
            <div>
              <p className="text-sm text-zinc-300 leading-relaxed">{entry.description}</p>
            </div>
          )}

          {/* Content */}
          {entry.content && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{entry.content}</div>
            </div>
          )}

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={12} className="text-zinc-500" />
              {entry.tags.map(tag => (
                <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          )}

          {/* Custom Properties */}
          {Object.keys(entry.customProperties).length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
              <div className="px-4 py-2 border-b border-zinc-800 text-xs font-medium text-zinc-400">Properties</div>
              <div className="divide-y divide-zinc-800/50">
                {Object.entries(entry.customProperties).map(([key, value]) => (
                  <div key={key} className="flex items-center px-4 py-2">
                    <span className="text-xs text-zinc-500 w-32 shrink-0">{key}</span>
                    <span className="text-xs text-zinc-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><Calendar size={10} /> Created: {new Date(entry.createdAt).toLocaleDateString()}</span>
            <span>Modified: {new Date(entry.updatedAt).toLocaleDateString()}</span>
          </div>

          {/* Relationships */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5"><Link2 size={12} /> Relationships</span>
              <button onClick={() => setShowRelForm(!showRelForm)} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add</button>
            </div>

            {showRelForm && (
              <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-800/30 space-y-2">
                <select value={relType} onChange={e => setRelType(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200">
                  <option value="">Select relationship type...</option>
                  {uniRelTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </select>
                <select value={relTarget} onChange={e => setRelTarget(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200">
                  <option value="">Select target entry...</option>
                  {uniEntries.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                <button onClick={handleAddRel} className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded">Add Relationship</button>
              </div>
            )}

            <div className="divide-y divide-zinc-800/50">
              {outgoingRels.length === 0 && incomingRels.length === 0 && (
                <div className="px-4 py-4 text-xs text-zinc-500 text-center">No relationships yet</div>
              )}
              {outgoingRels.map(rel => {
                const target = entries.find(e => e.id === rel.targetId);
                const targetCat = categories.find(c => c.id === target?.categoryId);
                return (
                  <button key={rel.id} onClick={() => target && setSelectedEntry(target.id)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-800/30 text-left transition-colors">
                    <span className="text-xs text-zinc-500">{rel.type} →</span>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: targetCat?.color || '#6b7280' }} />
                    <span className="text-xs text-zinc-300">{target?.name || 'Unknown'}</span>
                  </button>
                );
              })}
              {incomingRels.map(rel => {
                const source = entries.find(e => e.id === rel.sourceId);
                const sourceCat = categories.find(c => c.id === source?.categoryId);
                return (
                  <button key={rel.id} onClick={() => source && setSelectedEntry(source.id)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-800/30 text-left transition-colors">
                    <span className="text-xs text-zinc-500">← {rel.reverseType}</span>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sourceCat?.color || '#6b7280' }} />
                    <span className="text-xs text-zinc-300">{source?.name || 'Unknown'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
