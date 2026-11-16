import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { ZoomIn, ZoomOut, Filter } from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  name: string;
  categoryId: string;
  radius: number;
}

export function KnowledgeGraph() {
  const { entries, categories, relationships, selectedUniverseId, setSelectedEntry } = useStore();
  const uniEntries = entries.filter(e => e.universeId === selectedUniverseId);
  const uniRels = relationships.filter(r => r.universeId === selectedUniverseId);
  const uniCats = categories.filter(c => c.universeId === selectedUniverseId);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragNode = useRef<string | null>(null);

  // Initialize nodes in a circle
  useEffect(() => {
    const filtered = filterCat === 'all' ? uniEntries : uniEntries.filter(e => e.categoryId === filterCat);
    const initialNodes: Node[] = filtered.map((entry, i) => {
      const angle = (i / filtered.length) * Math.PI * 2;
      const radius = 150 + Math.random() * 100;
      return {
        id: entry.id,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        name: entry.name,
        categoryId: entry.categoryId,
        radius: 8,
      };
    });
    setNodes(initialNodes);
  }, [uniEntries, filterCat]);

  // Force-directed layout simulation
  const nodesCount = nodes.length;
  useEffect(() => {
    if (nodesCount === 0) return;

    const simulate = () => {
      setNodes(prev => {
        const next = prev.map(n => ({ ...n }));
        const repulsion = 3000;
        const attraction = 0.005;
        const damping = 0.85;

        // Repulsion between all nodes
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const dx = next[j].x - next[i].x;
            const dy = next[j].y - next[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsion / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            next[i].vx -= fx;
            next[i].vy -= fy;
            next[j].vx += fx;
            next[j].vy += fy;
          }
        }

        // Attraction along edges
        const relevantRels = uniRels.filter(r =>
          next.some(n => n.id === r.sourceId) && next.some(n => n.id === r.targetId)
        );
        for (const rel of relevantRels) {
          const source = next.find(n => n.id === rel.sourceId);
          const target = next.find(n => n.id === rel.targetId);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = dist * attraction;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        }

        // Center gravity
        for (const node of next) {
          node.vx -= node.x * 0.001;
          node.vy -= node.y * 0.001;
        }

        // Apply velocity
        for (const node of next) {
          if (dragNode.current === node.id) continue;
          node.vx *= damping;
          node.vy *= damping;
          node.x += node.vx;
          node.y += node.vy;
        }

        return next;
      });

      animRef.current = requestAnimationFrame(simulate);
    };

    animRef.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animRef.current);
  }, [nodesCount, uniRels]);

  const handleMouseDown = (e: React.MouseEvent, nodeId?: string) => {
    if (nodeId) {
      dragNode.current = nodeId;
    } else {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragNode.current) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
      const y = (e.clientY - rect.top - rect.height / 2 - pan.y) / zoom;
      setNodes(prev => prev.map(n => n.id === dragNode.current ? { ...n, x, y, vx: 0, vy: 0 } : n));
    } else if (isDragging.current) {
      setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    dragNode.current = null;
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.1, Math.min(5, z * delta)));
  }, []);

  const getConnectedNodes = (nodeId: string) => {
    const connected = new Set<string>();
    for (const rel of uniRels) {
      if (rel.sourceId === nodeId) connected.add(rel.targetId);
      if (rel.targetId === nodeId) connected.add(rel.sourceId);
    }
    return connected;
  };

  const highlightedNodes = hoveredNode ? getConnectedNodes(hoveredNode) : new Set<string>();
  const selected = selectedNode ? uniEntries.find(e => e.id === selectedNode) : null;

  return (
    <div className="h-full flex">
      {/* Left panel */}
      <div className="w-48 border-r border-zinc-800 bg-zinc-900/50 flex flex-col shrink-0">
        <div className="p-2 border-b border-zinc-800">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 px-1">Filter by Category</div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200">
            <option value="all">All Categories</option>
            {uniCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="p-2 border-b border-zinc-800 flex gap-1">
          <button onClick={() => setZoom(z => Math.min(5, z * 1.2))} className="flex-1 p-1.5 rounded hover:bg-zinc-800 text-zinc-400"><ZoomIn size={14} /></button>
          <button onClick={() => setZoom(z => Math.max(0.1, z * 0.8))} className="flex-1 p-1.5 rounded hover:bg-zinc-800 text-zinc-400"><ZoomOut size={14} /></button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="flex-1 p-1.5 rounded hover:bg-zinc-800 text-zinc-400 text-[10px]">Reset</button>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 px-1">Legend</div>
          {uniCats.filter(c => uniEntries.some(e => e.categoryId === c.id)).map(cat => (
            <div key={cat.id} className="flex items-center gap-2 px-1 py-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-[11px] text-zinc-400">{cat.name}</span>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-zinc-800 text-[10px] text-zinc-600">
          {nodes.length} nodes · {uniRels.length} edges
        </div>
      </div>

      {/* Graph canvas */}
      <div className="flex-1 relative overflow-hidden bg-zinc-950">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={(e) => handleMouseDown(e)}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {uniRels.map(rel => {
              const source = nodes.find(n => n.id === rel.sourceId);
              const target = nodes.find(n => n.id === rel.targetId);
              if (!source || !target) return null;
              const isHighlighted = hoveredNode && (hoveredNode === rel.sourceId || hoveredNode === rel.targetId);
              return (
                <line
                  key={rel.id}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isHighlighted ? '#6366f1' : '#3f3f46'}
                  strokeWidth={isHighlighted ? 1.5 : 0.5}
                  opacity={hoveredNode && !isHighlighted ? 0.15 : 0.6}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const cat = categories.find(c => c.id === node.categoryId);
              const isHovered = hoveredNode === node.id;
              const isConnected = highlightedNodes.has(node.id);
              const isDimmed = hoveredNode && !isHovered && !isConnected;
              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, node.id); }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id); }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHovered ? node.radius + 2 : node.radius}
                    fill={cat?.color || '#6b7280'}
                    stroke={selectedNode === node.id ? '#ffffff' : 'transparent'}
                    strokeWidth={2}
                    opacity={isDimmed ? 0.2 : 1}
                  />
                  {(isHovered || isConnected || !hoveredNode) && (
                    <text
                      x={node.x}
                      y={node.y + node.radius + 12}
                      textAnchor="middle"
                      fill={isDimmed ? '#52525b' : '#d4d4d8'}
                      fontSize={9}
                      className="select-none pointer-events-none"
                    >
                      {node.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected node panel */}
        {selected && (
          <div className="absolute top-4 right-4 bg-zinc-900 border border-zinc-700 rounded-lg p-3 w-56 shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categories.find(c => c.id === selected.categoryId)?.color || '#6b7280' }} />
              <div className="text-xs font-medium text-zinc-200">{selected.name}</div>
            </div>
            <div className="text-[10px] text-zinc-500 mb-2">{categories.find(c => c.id === selected.categoryId)?.name}</div>
            {selected.description && <div className="text-[11px] text-zinc-400 line-clamp-3 mb-2">{selected.description}</div>}
            <button onClick={() => setSelectedEntry(selected.id)} className="text-[10px] text-indigo-400 hover:text-indigo-300">Open Full Entry →</button>
          </div>
        )}
      </div>
    </div>
  );
}
