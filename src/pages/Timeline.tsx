import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { v4 as uuid } from 'uuid';
import { Plus, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

export function Timeline() {
  const { timelineEvents, historicalPeriods, categories, entries, selectedUniverseId, createTimelineEvent, updateTimelineEvent, deleteTimelineEvent, createHistoricalPeriod, deleteHistoricalPeriod, setSelectedEntry } = useStore();
  const uniEvents = timelineEvents.filter(e => e.universeId === selectedUniverseId);
  const uniPeriods = historicalPeriods.filter(p => p.universeId === selectedUniverseId);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', startDate: '', endDate: '', categoryId: '', tags: '', associatedEntries: '' });
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [periodData, setPeriodData] = useState({ name: '', startDate: '', endDate: '', color: '#6366f1', description: '' });

  const scrollRef = useRef<HTMLDivElement>(null);
  const uniEntries = entries.filter(e => e.universeId === selectedUniverseId);
  const uniCats = categories.filter(c => c.universeId === selectedUniverseId);

  const parseYear = (s: string) => {
    if (!s) return 0;
    const n = parseInt(s.replace(/[^0-9-]/g, ''));
    return isNaN(n) ? 0 : n;
  };

  const allYears = [...uniEvents.map(e => parseYear(e.startDate)), ...uniEvents.map(e => parseYear(e.endDate)), ...uniPeriods.map(p => parseYear(p.startDate)), ...uniPeriods.map(p => parseYear(p.endDate))].filter(y => y !== 0);
  const minYear = allYears.length > 0 ? Math.min(...allYears) - 50 : -500;
  const maxYear = allYears.length > 0 ? Math.max(...allYears) + 50 : 2000;
  const totalRange = maxYear - minYear;

  // Adaptive tick spacing based on time range
  const getTickSpacing = () => {
    if (totalRange < 100) return 10; // < 100 years: every 10 years
    if (totalRange < 500) return 50; // < 500 years: every 50 years
    if (totalRange < 2000) return 100; // < 2000 years: every 100 years
    if (totalRange < 10000) return 500; // < 10000 years: every 500 years
    if (totalRange < 50000) return 1000; // < 50000 years: every 1000 years
    return 5000; // > 50000 years: every 5000 years
  };

  const yearToX = (year: number) => ((year - minYear) / totalRange) * 3000 * zoom;

  const handleSaveEvent = () => {
    if (!formData.name || !formData.startDate) return;
    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const associatedEntries = formData.associatedEntries.split(',').map(s => s.trim()).filter(Boolean);
    if (editId) {
      updateTimelineEvent(editId, { name: formData.name, description: formData.description, startDate: formData.startDate, endDate: formData.endDate, categoryId: formData.categoryId, tags, associatedEntries });
    } else {
      createTimelineEvent({ name: formData.name, description: formData.description, startDate: formData.startDate, endDate: formData.endDate, categoryId: formData.categoryId, tags, associatedEntries, universeId: selectedUniverseId || '' });
    }
    setShowForm(false);
    setEditId(null);
    setFormData({ name: '', description: '', startDate: '', endDate: '', categoryId: '', tags: '', associatedEntries: '' });
  };

  const handleEditEvent = (id: string) => {
    const evt = uniEvents.find(e => e.id === id);
    if (evt) {
      setFormData({ name: evt.name, description: evt.description, startDate: evt.startDate, endDate: evt.endDate, categoryId: evt.categoryId, tags: evt.tags.join(', '), associatedEntries: evt.associatedEntries.join(', ') });
      setEditId(id);
      setShowForm(true);
    }
  };

  const handleSavePeriod = () => {
    if (!periodData.name) return;
    createHistoricalPeriod({ ...periodData, universeId: selectedUniverseId || '' });
    setShowPeriodForm(false);
    setPeriodData({ name: '', startDate: '', endDate: '', color: '#6366f1', description: '' });
  };

  const event = selectedEvent ? uniEvents.find(e => e.id === selectedEvent) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800">
        <button onClick={() => { setShowForm(true); setEditId(null); setFormData({ name: '', description: '', startDate: '', endDate: '', categoryId: '', tags: '', associatedEntries: '' }); }} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors">
          <Plus size={12} /> Event
        </button>
        <button onClick={() => setShowPeriodForm(!showPeriodForm)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors">
          <Plus size={12} /> Period
        </button>
        <div className="flex-1" />
        <button onClick={() => setZoom(z => Math.max(0.2, z * 0.8))} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400"><ZoomOut size={14} /></button>
        <span className="text-xs text-zinc-500 w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
        <button onClick={() => setZoom(z => Math.min(5, z * 1.2))} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400"><ZoomIn size={14} /></button>
        <span className="text-xs text-zinc-600 ml-2">{uniEvents.length} events</span>
      </div>

      {/* Period form */}
      {showPeriodForm && (
        <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2 flex-wrap">
          <input value={periodData.name} onChange={e => setPeriodData({ ...periodData, name: e.target.value })} placeholder="Period name" className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-500 w-32" />
          <input value={periodData.startDate} onChange={e => setPeriodData({ ...periodData, startDate: e.target.value })} placeholder="Start year" className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-500 w-20" />
          <input value={periodData.endDate} onChange={e => setPeriodData({ ...periodData, endDate: e.target.value })} placeholder="End year" className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-500 w-20" />
          <input type="color" value={periodData.color} onChange={e => setPeriodData({ ...periodData, color: e.target.value })} className="w-6 h-6 rounded cursor-pointer" />
          <button onClick={handleSavePeriod} className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded">Add</button>
          <button onClick={() => setShowPeriodForm(false)} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">Cancel</button>
        </div>
      )}

      {/* Timeline canvas */}
      <div className="flex-1 overflow-hidden flex">
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="relative h-full min-h-[400px]" style={{ width: `${3000 * zoom}px`, minWidth: '100%' }}>
            {/* Period bands */}
            {uniPeriods.map(period => {
              const x1 = yearToX(parseYear(period.startDate));
              const x2 = yearToX(parseYear(period.endDate));
              return (
                <div key={period.id} className="absolute top-0 bottom-0 opacity-10" style={{ left: x1, width: x2 - x1, backgroundColor: period.color }}>
                  <div className="absolute top-2 left-2 text-[10px] font-medium opacity-70" style={{ color: period.color }}>{period.name}</div>
                </div>
              );
            })}

            {/* Year markers */}
            <div className="absolute top-0 left-0 right-0 h-8 border-b border-zinc-800">
              {Array.from({ length: Math.ceil(totalRange / getTickSpacing()) + 1 }, (_, i) => {
                const step = getTickSpacing();
                const year = minYear + i * step;
                const x = yearToX(year);
                return (
                  <div key={i} className="absolute top-0 bottom-0" style={{ left: x }}>
                    <div className="w-px h-full bg-zinc-800/50" />
                    <span className="absolute top-1 left-1 text-[9px] text-zinc-600">{year}</span>
                  </div>
                );
              })}
            </div>

            {/* Events */}
            <div className="absolute top-10 left-0 right-0 bottom-0">
              {uniEvents.map((evt, idx) => {
                const x = yearToX(parseYear(evt.startDate));
                const endX = evt.endDate ? yearToX(parseYear(evt.endDate)) : x + 4;
                const cat = categories.find(c => c.id === evt.categoryId);
                const row = idx % 6;
                const y = 20 + row * 50;
                return (
                  <div
                    key={evt.id}
                    className={`absolute cursor-pointer group ${selectedEvent === evt.id ? 'z-20' : 'z-10'}`}
                    style={{ left: x, top: y }}
                    onClick={() => setSelectedEvent(evt.id === selectedEvent ? null : evt.id)}
                  >
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: cat?.color || '#6b7280', backgroundColor: cat?.color || '#6b7280' }} />
                      {endX > x + 4 && (
                        <div className="h-1.5 rounded-full opacity-60" style={{ width: endX - x - 4, backgroundColor: cat?.color || '#6b7280' }} />
                      )}
                      <span className="text-[10px] text-zinc-300 whitespace-nowrap ml-1">{evt.name}</span>
                    </div>
                    {selectedEvent === evt.id && (
                      <div className="absolute top-5 left-0 bg-zinc-900 border border-zinc-700 rounded-lg p-3 w-64 shadow-xl z-30">
                        <div className="text-xs font-medium text-zinc-200 mb-1">{evt.name}</div>
                        <div className="text-[10px] text-zinc-500 mb-1">{evt.startDate}{evt.endDate ? ` — ${evt.endDate}` : ''}</div>
                        {evt.description && <div className="text-xs text-zinc-400 mb-2 line-clamp-3">{evt.description}</div>}
                        {evt.associatedEntries.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {evt.associatedEntries.map(eid => {
                              const linked = entries.find(e => e.id === eid);
                              return linked ? (
                                <button key={eid} onClick={(e) => { e.stopPropagation(); setSelectedEntry(eid); }} className="text-[10px] text-indigo-400 hover:text-indigo-300 bg-zinc-800 px-1.5 py-0.5 rounded">
                                  {linked.name}
                                </button>
                              ) : null;
                            })}
                          </div>
                        )}
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); handleEditEvent(evt.id); }} className="text-[10px] text-zinc-400 hover:text-zinc-200">Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete event?')) deleteTimelineEvent(evt.id); setSelectedEvent(null); }} className="text-[10px] text-red-400 hover:text-red-300">Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Periods list */}
        <div className="w-48 border-l border-zinc-800 bg-zinc-900/50 overflow-auto shrink-0">
          <div className="p-2">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 px-1">Periods</div>
            {uniPeriods.map(p => (
              <div key={p.id} className="flex items-center gap-2 px-1 py-1.5 group">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-zinc-300 truncate">{p.name}</div>
                  <div className="text-[10px] text-zinc-600">{p.startDate} — {p.endDate}</div>
                </div>
                <button onClick={() => deleteHistoricalPeriod(p.id)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 text-[10px]">×</button>
              </div>
            ))}
            {uniPeriods.length === 0 && <div className="text-xs text-zinc-600 px-1">No periods defined</div>}
          </div>
        </div>
      </div>

      {/* Event form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-sm font-medium text-zinc-200 mb-3">{editId ? 'Edit Event' : 'New Event'}</div>
            <div className="space-y-2">
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Event name" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500" />
              <div className="flex gap-2">
                <input value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} placeholder="Start year" className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500" />
                <input value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} placeholder="End year (opt)" className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500" />
              </div>
              <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200">
                <option value="">Category...</option>
                {uniCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description" rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 resize-none" />
              <input value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="Tags (comma separated)" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500" />
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">Associated Entry IDs (comma separated)</label>
                <input value={formData.associatedEntries} onChange={e => setFormData({ ...formData, associatedEntries: e.target.value })} placeholder="entry-id-1, entry-id-2" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500" />
                <div className="mt-1 flex flex-wrap gap-1 max-h-20 overflow-auto">
                  {uniEntries.slice(0, 10).map(e => (
                    <button key={e.id} onClick={() => {
                      const current = formData.associatedEntries.split(',').map(s => s.trim()).filter(Boolean);
                      if (current.includes(e.id)) {
                        setFormData({ ...formData, associatedEntries: current.filter(id => id !== e.id).join(', ') });
                      } else {
                        setFormData({ ...formData, associatedEntries: [...current, e.id].join(', ') });
                      }
                    }} className={`text-[10px] px-1.5 py-0.5 rounded ${formData.associatedEntries.includes(e.id) ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleSaveEvent} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded">Save</button>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
