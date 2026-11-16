import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';

export function EntryEditor() {
  const { entries, categories, selectedUniverseId, editingEntryId, setEditingEntry, updateEntry, createEntry } = useStore();
  const isNew = !editingEntryId || !entries.find(e => e.id === editingEntryId);
  const existingEntry = entries.find(e => e.id === editingEntryId);

  const [name, setName] = useState(existingEntry?.name || '');
  const [categoryId, setCategoryId] = useState(existingEntry?.categoryId || '');
  const [description, setDescription] = useState(existingEntry?.description || '');
  const [content, setContent] = useState(existingEntry?.content || '');
  const [tagsStr, setTagsStr] = useState(existingEntry?.tags.join(', ') || '');
  const [customProps, setCustomProps] = useState<[string, string][]>(Object.entries(existingEntry?.customProperties || {}));

  const uniCats = categories.filter(c => c.universeId === selectedUniverseId);

  useEffect(() => {
    if (!categoryId && uniCats.length > 0) setCategoryId(uniCats[0].id);
  }, [uniCats, categoryId]);

  const handleSave = () => {
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const customProperties: Record<string, string> = {};
    customProps.forEach(([k, v]) => { if (k.trim()) customProperties[k.trim()] = v; });

    if (isNew) {
      const id = createEntry({ name: name || 'Untitled', categoryId, description, content, tags, customProperties, universeId: selectedUniverseId || '' });
      setEditingEntry(null);
      useStore.getState().setSelectedEntry(id);
    } else {
      updateEntry(editingEntryId!, { name, categoryId, description, content, tags, customProperties });
      setEditingEntry(null);
    }
  };

  const addProp = () => setCustomProps([...customProps, ['', '']]);
  const removeProp = (i: number) => setCustomProps(customProps.filter((_, idx) => idx !== i));
  const updateProp = (i: number, field: 0 | 1, val: string) => {
    const newProps = [...customProps];
    newProps[i] = [field === 0 ? val : newProps[i][0], field === 1 ? val : newProps[i][1]];
    setCustomProps(newProps);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
        <button onClick={() => setEditingEntry(null)} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-sm font-medium text-zinc-200">{isNew ? 'New Entry' : 'Edit Entry'}</h1>
        <div className="flex-1" />
        <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors">
          <Save size={12} /> Save
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Entry name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select category...</option>
              {uniCats.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Short Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary..."
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Detailed description, lore, notes..."
              rows={12}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-y font-mono"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tags (comma separated)</label>
            <input
              value={tagsStr}
              onChange={e => setTagsStr(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Custom Properties */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-400">Custom Properties</label>
              <button onClick={addProp} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                <Plus size={10} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {customProps.map(([key, value], i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={key}
                    onChange={e => updateProp(i, 0, e.target.value)}
                    placeholder="Property name"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    value={value}
                    onChange={e => updateProp(i, 1, e.target.value)}
                    placeholder="Value"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button onClick={() => removeProp(i)} className="p-1 text-zinc-500 hover:text-red-400">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
