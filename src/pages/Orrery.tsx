import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { v4 as uuid } from 'uuid';
import { Plus, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Settings2 } from 'lucide-react';

export function Orrery() {
  const { celestialBodies, entries, selectedUniverseId, createCelestialBody, updateCelestialBody, deleteCelestialBody, setSelectedEntry } = useStore();
  const uniBodies = celestialBodies.filter(b => b.universeId === selectedUniverseId);
  const stars = uniBodies.filter(b => b.type === 'star');
  const planets = uniBodies.filter(b => b.type === 'planet' || b.type === 'dwarf_planet');
  const moons = uniBodies.filter(b => b.type === 'moon');

  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'planet' as const, parentId: '', orbitalDistance: 100, orbitalPeriod: 365, diameter: 10, color: '#6b7280', description: '' });
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [mode, setMode] = useState<'schematic' | 'simulation'>('schematic');
  const [time, setTime] = useState(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setTime(t => t + delta * simSpeed);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, simSpeed]);

  const getBodyPosition = (body: typeof uniBodies[0]) => {
    const angle = (body.angle || 0) + (mode === 'simulation' ? (time * 360) / (body.orbitalPeriod || 365) : 0);
    const rad = (angle * Math.PI) / 180;
    const dist = mode === 'schematic' ? getSchematicDistance(body) : body.orbitalDistance;
    return {
      x: Math.cos(rad) * dist,
      y: Math.sin(rad) * dist * (1 - (body.orbitalEccentricity || 0) * 0.3),
    };
  };

  const getSchematicDistance = (body: typeof uniBodies[0]) => {
    if (body.type === 'star') return 0;
    if (body.type === 'moon') return 30;
    const siblings = uniBodies.filter(b => b.parentId === body.parentId && b.type !== 'moon');
    const idx = siblings.indexOf(body);
    return 60 + idx * 50;
  };

  const getBodyRadius = (body: typeof uniBodies[0]) => {
    if (body.type === 'star') return 16;
    if (body.type === 'moon') return 3;
    return Math.max(4, Math.min(12, body.diameter / 5));
  };

  const handleSave = () => {
    if (!formData.name) return;
    createCelestialBody({ ...formData, universeId: selectedUniverseId || '', angle: Math.random() * 360 });
    setShowForm(false);
    setFormData({ name: '', type: 'planet', parentId: '', orbitalDistance: 100, orbitalPeriod: 365, diameter: 10, color: '#6b7280', description: '' });
  };

  const selected = selectedBody ? uniBodies.find(b => b.id === selectedBody) : null;
  const center = { x: 0, y: 0 };
  const svgSize = 800;

  return (
    <div className="h-full flex">
      {/* Left panel */}
      <div className="w-56 border-r border-zinc-800 bg-zinc-900/50 flex flex-col shrink-0">
        <div className="p-3 border-b border-zinc-800">
          <button onClick={() => setShowForm(true)} className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors">
            <Plus size={12} /> Add Body
          </button>
        </div>

        {/* Controls */}
        <div className="p-2 border-b border-zinc-800 space-y-2">
          <div className="flex items-center gap-1">
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400">
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={() => setTime(0)} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400"><RotateCcw size={14} /></button>
            <div className="flex-1 flex items-center gap-1">
              <span className="text-[10px] text-zinc-500">Speed:</span>
              <input type="range" min="0.1" max="10" step="0.1" value={simSpeed} onChange={e => setSimSpeed(parseFloat(e.target.value))} className="flex-1 h-1 accent-indigo-500" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.max(0.2, z * 0.8))} className="p-1 rounded hover:bg-zinc-800 text-zinc-400"><ZoomOut size={12} /></button>
            <button onClick={() => setZoom(z => Math.min(3, z * 1.2))} className="p-1 rounded hover:bg-zinc-800 text-zinc-400"><ZoomIn size={12} /></button>
            <span className="text-[10px] text-zinc-500 flex-1 text-center">{(zoom * 100).toFixed(0)}%</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMode('schematic')} className={`flex-1 px-2 py-1 rounded text-[10px] ${mode === 'schematic' ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:bg-zinc-800'}`}>Schematic</button>
            <button onClick={() => setMode('simulation')} className={`flex-1 px-2 py-1 rounded text-[10px] ${mode === 'simulation' ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:bg-zinc-800'}`}>Simulation</button>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setShowLabels(!showLabels)} className={`flex-1 px-2 py-1 rounded text-[10px] ${showLabels ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:bg-zinc-800'}`}>Labels</button>
            <button onClick={() => setShowOrbits(!showOrbits)} className={`flex-1 px-2 py-1 rounded text-[10px] ${showOrbits ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:bg-zinc-800'}`}>Orbits</button>
          </div>
        </div>

        {/* Body list */}
        <div className="flex-1 overflow-auto p-2">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 px-1">Celestial Bodies</div>
          {uniBodies.map(body => (
            <button
              key={body.id}
              onClick={() => setSelectedBody(body.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${selectedBody === body.id ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: body.color }} />
              <span className="flex-1 truncate">{body.name}</span>
              <span className="text-[10px] text-zinc-600 capitalize">{body.type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orrery visualization */}
      <div className="flex-1 relative overflow-hidden bg-zinc-950">
        <svg
          width="100%"
          height="100%"
          viewBox={`${-svgSize / 2 / zoom} ${-svgSize / 2 / zoom} ${svgSize / zoom} ${svgSize / zoom}`}
          className="absolute inset-0"
        >
          {/* Stars background */}
          {Array.from({ length: 50 }, (_, i) => (
            <circle key={i} cx={(Math.sin(i * 137.5) * 400)} cy={(Math.cos(i * 137.5) * 400)} r={0.5} fill="#ffffff" opacity={0.2 + Math.random() * 0.3} />
          ))}

          {/* Orbital paths */}
          {showOrbits && uniBodies.filter(b => b.parentId || b.type === 'planet').map(body => {
            const parent = uniBodies.find(b => b.id === body.parentId);
            const parentPos = parent ? getBodyPosition(parent) : center;
            const dist = mode === 'schematic' ? getSchematicDistance(body) : body.orbitalDistance;
            return (
              <ellipse
                key={`orbit-${body.id}`}
                cx={parentPos.x}
                cy={parentPos.y}
                rx={dist}
                ry={dist * (1 - (body.orbitalEccentricity || 0) * 0.3)}
                fill="none"
                stroke="#3f3f46"
                strokeWidth={0.5}
                strokeDasharray="2 4"
                opacity={0.5}
              />
            );
          })}

          {/* Celestial bodies */}
          {uniBodies.map(body => {
            const pos = getBodyPosition(body);
            const radius = getBodyRadius(body);
            return (
              <g key={body.id} className="cursor-pointer" onClick={() => setSelectedBody(body.id)}>
                {/* Glow for stars */}
                {body.type === 'star' && (
                  <circle cx={pos.x} cy={pos.y} r={radius * 2} fill={body.color} opacity={0.15} />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={body.color}
                  stroke={selectedBody === body.id ? '#ffffff' : 'transparent'}
                  strokeWidth={1.5}
                  className="hover:opacity-80 transition-opacity"
                />
                {showLabels && (
                  <text x={pos.x} y={pos.y + radius + 10} textAnchor="middle" fill="#a1a1aa" fontSize={8} className="select-none pointer-events-none">
                    {body.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected body info */}
        {selected && (
          <div className="absolute top-4 right-4 bg-zinc-900 border border-zinc-700 rounded-lg p-3 w-64 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selected.color }} />
              <div className="text-sm font-medium text-zinc-200">{selected.name}</div>
            </div>
            <div className="text-[10px] text-zinc-500 capitalize mb-2">{selected.type.replace('_', ' ')}</div>
            <div className="space-y-1 text-xs">
              {selected.orbitalDistance > 0 && <div className="flex justify-between"><span className="text-zinc-500">Orbital Distance</span><span className="text-zinc-300">{selected.orbitalDistance}</span></div>}
              {selected.orbitalPeriod > 0 && <div className="flex justify-between"><span className="text-zinc-500">Orbital Period</span><span className="text-zinc-300">{selected.orbitalPeriod}</span></div>}
              {selected.diameter > 0 && <div className="flex justify-between"><span className="text-zinc-500">Diameter</span><span className="text-zinc-300">{selected.diameter}</span></div>}
              {selected.temperature && <div className="flex justify-between"><span className="text-zinc-500">Temperature</span><span className="text-zinc-300">{selected.temperature}</span></div>}
              {selected.atmosphere && <div className="flex justify-between"><span className="text-zinc-500">Atmosphere</span><span className="text-zinc-300">{selected.atmosphere}</span></div>}
            </div>
            {selected.description && <div className="text-xs text-zinc-400 mt-2 line-clamp-2">{selected.description}</div>}
            <div className="flex gap-1 mt-2">
              {selected.entryId && (
                <button onClick={() => setSelectedEntry(selected.entryId!)} className="text-[10px] text-indigo-400 hover:text-indigo-300">Open Entry</button>
              )}
              <button onClick={() => { if (confirm('Delete this body?')) { deleteCelestialBody(selected.id); setSelectedBody(null); } }} className="text-[10px] text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="absolute bottom-3 left-3 bg-zinc-900/80 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-500">
          {uniBodies.length} bodies | {mode} mode | Time: {time.toFixed(1)}s
        </div>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-sm font-medium text-zinc-200 mb-3">New Celestial Body</div>
            <div className="space-y-2">
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Name" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500" />
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200">
                <option value="star">Star</option>
                <option value="planet">Planet</option>
                <option value="dwarf_planet">Dwarf Planet</option>
                <option value="moon">Moon</option>
                <option value="asteroid">Asteroid</option>
                <option value="comet">Comet</option>
              </select>
              <select value={formData.parentId} onChange={e => setFormData({ ...formData, parentId: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200">
                <option value="">No parent (orbits center)</option>
                {uniBodies.map(b => <option key={b.id} value={b.id}>{b.name} ({b.type})</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500">Distance</label>
                  <input type="number" value={formData.orbitalDistance} onChange={e => setFormData({ ...formData, orbitalDistance: parseFloat(e.target.value) || 0 })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500">Period</label>
                  <input type="number" value={formData.orbitalPeriod} onChange={e => setFormData({ ...formData, orbitalPeriod: parseFloat(e.target.value) || 0 })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500">Diameter</label>
                  <input type="number" value={formData.diameter} onChange={e => setFormData({ ...formData, diameter: parseFloat(e.target.value) || 0 })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500">Color</label>
                  <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full h-7 rounded cursor-pointer bg-zinc-800 border border-zinc-700" />
                </div>
              </div>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 resize-none" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleSave} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded">Create</button>
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
