import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { v4 as uuid } from 'uuid';
import { Plus, Trash2, Eye, EyeOff, MousePointer, Move, Square, Minus, ZoomIn, ZoomOut } from 'lucide-react';

export function WorldMap() {
  const { maps, selectedUniverseId, entries, categories, addMapMarker, deleteMapMarker, updateMap, addMapPolygon, deleteMapPolygon, toggleMapLayer, addMapLayer, setSelectedEntry } = useStore();
  const uniMaps = maps.filter(m => m.universeId === selectedUniverseId);
  const [activeMapId, setActiveMapId] = useState(uniMaps[0]?.id || '');
  const activeMap = uniMaps.find(m => m.id === activeMapId);

  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [tool, setTool] = useState<'select' | 'marker' | 'polygon'>('select');
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [markerForm, setMarkerForm] = useState({ type: 'city', label: '', entryId: '' });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (activeMap) setViewport(activeMap.viewport);
  }, [activeMapId]);

  const getMousePos = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left - viewport.x) / viewport.zoom,
      y: (e.clientY - rect.top - viewport.y) / viewport.zoom,
    };
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewport(v => ({ ...v, zoom: Math.max(0.1, Math.min(5, v.zoom * delta)) }));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === 'select' || tool === 'polygon') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setViewport(v => ({ ...v, x: e.clientX - panStart.x, y: e.clientY - panStart.y }));
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleClick = (e: React.MouseEvent) => {
    if (isPanning) return;
    const pos = getMousePos(e);

    if (tool === 'marker') {
      setShowPanel(true);
      setMarkerForm({ type: 'city', label: '', entryId: '' });
      const tempPos = pos;
      const handleConfirm = () => {
        if (!activeMap) return;
        const layerId = activeMap.layers[0]?.id || '';
        addMapMarker(activeMap.id, {
          id: uuid(), x: tempPos.x, y: tempPos.y, type: markerForm.type,
          label: markerForm.label || 'Marker', entryId: markerForm.entryId || null,
          layerId, icon: 'circle',
        });
        setShowPanel(false);
      };
      (window as any).__markerConfirm = handleConfirm;
    } else if (tool === 'polygon') {
      setPolygonPoints([...polygonPoints, pos]);
    }
  };

  const finishPolygon = () => {
    if (polygonPoints.length >= 3 && activeMap) {
      addMapPolygon(activeMap.id, {
        id: uuid(), points: polygonPoints, color: '#6366f1', opacity: 0.3,
        entryId: null, label: 'Territory', layerId: activeMap.layers[0]?.id || '',
      });
      setPolygonPoints([]);
    }
  };

  const uniEntries = entries.filter(e => e.universeId === selectedUniverseId);

  if (!activeMap) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">
        <div className="text-center">
          <p className="text-sm mb-2">No maps available</p>
          <p className="text-xs text-zinc-600">Maps are created automatically with each universe</p>
        </div>
      </div>
    );
  }

  const visibleLayers = activeMap.layers.filter(l => l.visible).map(l => l.id);
  const visibleMarkers = activeMap.markers.filter(m => visibleLayers.includes(m.layerId));
  const visiblePolygons = activeMap.polygons.filter(p => visibleLayers.includes(p.layerId));

  return (
    <div className="h-full flex">
      {/* Left panel - layers & tools */}
      <div className="w-52 border-r border-zinc-800 bg-zinc-900/50 flex flex-col shrink-0">
        <div className="p-3 border-b border-zinc-800">
          <select value={activeMapId} onChange={e => setActiveMapId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200">
            {uniMaps.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        {/* Tools */}
        <div className="p-2 border-b border-zinc-800">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 px-1">Tools</div>
          <div className="flex gap-1">
            <button onClick={() => setTool('select')} className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs ${tool === 'select' ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-400 hover:bg-zinc-800'}`}>
              <MousePointer size={12} /> Pan
            </button>
            <button onClick={() => { setTool('marker'); setShowPanel(false); }} className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs ${tool === 'marker' ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-400 hover:bg-zinc-800'}`}>
              <Plus size={12} /> Mark
            </button>
            <button onClick={() => { setTool('polygon'); setPolygonPoints([]); }} className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs ${tool === 'polygon' ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-400 hover:bg-zinc-800'}`}>
              <Square size={12} /> Area
            </button>
          </div>
          {tool === 'polygon' && polygonPoints.length > 0 && (
            <button onClick={finishPolygon} className="w-full mt-1.5 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded">
              Finish Polygon ({polygonPoints.length} pts)
            </button>
          )}
        </div>

        {/* Layers */}
        <div className="p-2 flex-1 overflow-auto">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 px-1">Layers</div>
          {activeMap.layers.map(layer => (
            <div key={layer.id} className="flex items-center gap-2 px-1 py-1">
              <button onClick={() => toggleMapLayer(activeMap.id, layer.id)} className="text-zinc-400 hover:text-zinc-200">
                {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
              <span className="text-xs text-zinc-300 flex-1">{layer.name}</span>
            </div>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="p-2 border-t border-zinc-800 flex gap-1">
          <button onClick={() => setViewport(v => ({ ...v, zoom: Math.min(5, v.zoom * 1.2) }))} className="flex-1 flex items-center justify-center p-1.5 rounded hover:bg-zinc-800 text-zinc-400"><ZoomIn size={14} /></button>
          <button onClick={() => setViewport(v => ({ ...v, zoom: Math.max(0.1, v.zoom * 0.8) }))} className="flex-1 flex items-center justify-center p-1.5 rounded hover:bg-zinc-800 text-zinc-400"><ZoomOut size={14} /></button>
          <button onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })} className="flex-1 flex items-center justify-center p-1.5 rounded hover:bg-zinc-800 text-zinc-400 text-xs">Reset</button>
        </div>
      </div>

      {/* Map canvas */}
      <div className="flex-1 relative overflow-hidden bg-zinc-950">
        <div
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          style={{ backgroundImage: 'radial-gradient(circle, #27272a 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
        >
          <div style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`, transformOrigin: '0 0' }}>
            {/* Grid background */}
            <svg className="absolute inset-0 w-[4000px] h-[4000px]" style={{ left: -2000, top: -2000 }}>
              {/* Polygons */}
              {visiblePolygons.map(poly => (
                <polygon
                  key={poly.id}
                  points={poly.points.map(p => `${p.x + 2000},${p.y + 2000}`).join(' ')}
                  fill={poly.color}
                  fillOpacity={poly.opacity}
                  stroke={poly.color}
                  strokeWidth={1}
                  className="cursor-pointer hover:fill-opacity-50"
                  onClick={(e) => { e.stopPropagation(); if (poly.entryId) setSelectedEntry(poly.entryId); }}
                />
              ))}
              {/* Drawing polygon */}
              {tool === 'polygon' && polygonPoints.length > 0 && (
                <polygon
                  points={[...polygonPoints, polygonPoints[0]].map(p => `${p.x + 2000},${p.y + 2000}`).join(' ')}
                  fill="#6366f1"
                  fillOpacity={0.15}
                  stroke="#6366f1"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              )}
            </svg>

            {/* Markers */}
            {visibleMarkers.map(marker => (
              <div
                key={marker.id}
                className={`absolute cursor-pointer group ${selectedMarker === marker.id ? 'z-20' : 'z-10'}`}
                style={{ left: marker.x - 8, top: marker.y - 8 }}
                onClick={(e) => { e.stopPropagation(); setSelectedMarker(marker.id); }}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  marker.type === 'capital' ? 'bg-amber-500 border-amber-300' :
                  marker.type === 'city' ? 'bg-blue-500 border-blue-300' :
                  marker.type === 'village' ? 'bg-green-500 border-green-300' :
                  marker.type === 'castle' ? 'bg-red-500 border-red-300' :
                  marker.type === 'ruins' ? 'bg-zinc-500 border-zinc-300' :
                  'bg-indigo-500 border-indigo-300'
                }`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                </div>
                <div className="absolute left-5 top-0 text-[10px] text-zinc-300 whitespace-nowrap bg-zinc-900/80 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {marker.label}
                </div>
                {selectedMarker === marker.id && (
                  <div className="absolute left-6 top-4 bg-zinc-900 border border-zinc-700 rounded p-2 min-w-[140px] z-30 shadow-xl">
                    <div className="text-xs font-medium text-zinc-200">{marker.label}</div>
                    <div className="text-[10px] text-zinc-500 capitalize">{marker.type}</div>
                    <div className="flex gap-1 mt-1.5">
                      {marker.entryId && (
                        <button onClick={(e) => { e.stopPropagation(); setSelectedEntry(marker.entryId!); }} className="text-[10px] text-indigo-400 hover:text-indigo-300">Open Entry</button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); deleteMapMarker(activeMap.id, marker.id); setSelectedMarker(null); }} className="text-[10px] text-red-400 hover:text-red-300">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Marker creation panel */}
        {showPanel && tool === 'marker' && (
          <div className="absolute top-4 right-4 bg-zinc-900 border border-zinc-700 rounded-lg p-3 w-56 shadow-xl z-30">
            <div className="text-xs font-medium text-zinc-300 mb-2">New Marker</div>
            <select value={markerForm.type} onChange={e => setMarkerForm({ ...markerForm, type: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 mb-2">
              <option value="city">City</option>
              <option value="village">Village</option>
              <option value="capital">Capital</option>
              <option value="castle">Castle</option>
              <option value="ruins">Ruins</option>
              <option value="landmark">Landmark</option>
            </select>
            <input value={markerForm.label} onChange={e => setMarkerForm({ ...markerForm, label: e.target.value })} placeholder="Label" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 mb-2 placeholder-zinc-500" />
            <select value={markerForm.entryId} onChange={e => setMarkerForm({ ...markerForm, entryId: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 mb-2">
              <option value="">Link to entry...</option>
              {uniEntries.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <div className="flex gap-1">
              <button onClick={() => (window as any).__markerConfirm?.()} className="flex-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded">Place</button>
              <button onClick={() => setShowPanel(false)} className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded">Cancel</button>
            </div>
          </div>
        )}

        {/* Info bar */}
        <div className="absolute bottom-3 left-3 bg-zinc-900/80 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-500">
          Zoom: {(viewport.zoom * 100).toFixed(0)}% | Markers: {activeMap.markers.length} | Areas: {activeMap.polygons.length}
        </div>
      </div>
    </div>
  );
}
