import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Universe, Entry, Category, Relationship, RelationshipType, MapData, MapMarker, MapPolygon, MapLine, MapLayer, TimelineEvent, HistoricalPeriod, CelestialBody, Page } from '../types';

const BUILTIN_CATEGORIES = [
  { name: 'Characters', icon: 'user', color: '#6366f1' },
  { name: 'Nations', icon: 'flag', color: '#ef4444' },
  { name: 'Cities', icon: 'building-2', color: '#f59e0b' },
  { name: 'Settlements', icon: 'home', color: '#84cc16' },
  { name: 'Geographical Locations', icon: 'map-pin', color: '#10b981' },
  { name: 'Factions', icon: 'users', color: '#8b5cf6' },
  { name: 'Organizations', icon: 'building', color: '#06b6d4' },
  { name: 'Races & Species', icon: 'dna', color: '#ec4899' },
  { name: 'Religions', icon: 'sun', color: '#f97316' },
  { name: 'Deities', icon: 'sparkles', color: '#a855f7' },
  { name: 'Cultures', icon: 'palette', color: '#14b8a6' },
  { name: 'Languages', icon: 'languages', color: '#64748b' },
  { name: 'Historical Events', icon: 'clock', color: '#78716c' },
  { name: 'Wars & Conflicts', icon: 'swords', color: '#dc2626' },
  { name: 'Civilizations', icon: 'landmark', color: '#b45309' },
  { name: 'Technologies', icon: 'cpu', color: '#0ea5e9' },
  { name: 'Artifacts & Objects', icon: 'gem', color: '#d946ef' },
  { name: 'Flora & Fauna', icon: 'leaf', color: '#22c55e' },
  { name: 'Planets', icon: 'globe', color: '#3b82f6' },
  { name: 'Moons', icon: 'moon', color: '#94a3b8' },
  { name: 'Stars', icon: 'star', color: '#fbbf24' },
];

const BUILTIN_RELATIONSHIPS = [
  { name: 'Ruled by', reverseName: 'Rules', color: '#ef4444' },
  { name: 'Founded by', reverseName: 'Founded', color: '#f59e0b' },
  { name: 'Located in', reverseName: 'Contains', color: '#10b981' },
  { name: 'Allied with', reverseName: 'Allied with', color: '#3b82f6' },
  { name: 'At war with', reverseName: 'At war with', color: '#dc2626' },
  { name: 'Worships', reverseName: 'Worshipped by', color: '#a855f7' },
  { name: 'Descended from', reverseName: 'Ancestor of', color: '#ec4899' },
  { name: 'Member of', reverseName: 'Has member', color: '#6366f1' },
  { name: 'Created', reverseName: 'Created by', color: '#14b8a6' },
  { name: 'Part of', reverseName: 'Includes', color: '#78716c' },
];

interface AppState {
  // Navigation
  currentPage: Page;
  selectedEntryId: string | null;
  editingEntryId: string | null;
  searchOpen: boolean;
  selectedUniverseId: string | null;

  // Data
  universes: Universe[];
  entries: Entry[];
  categories: Category[];
  relationships: Relationship[];
  relationshipTypes: RelationshipType[];
  maps: MapData[];
  timelineEvents: TimelineEvent[];
  historicalPeriods: HistoricalPeriod[];
  celestialBodies: CelestialBody[];

  // Actions
  setPage: (page: Page) => void;
  setSelectedEntry: (id: string | null) => void;
  setEditingEntry: (id: string | null) => void;
  setSearchOpen: (open: boolean) => void;

  // Universe actions
  createUniverse: (name: string, description: string) => string;
  deleteUniverse: (id: string) => void;
  selectUniverse: (id: string) => void;
  updateUniverse: (id: string, data: Partial<Universe>) => void;

  // Entry actions
  createEntry: (data: Partial<Entry>) => string;
  updateEntry: (id: string, data: Partial<Entry>) => void;
  deleteEntry: (id: string) => void;

  // Category actions
  createCategory: (data: Partial<Category>) => string;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Relationship actions
  createRelationship: (data: Partial<Relationship>) => string;
  deleteRelationship: (id: string) => void;
  createRelationshipType: (data: Partial<RelationshipType>) => string;

  // Map actions
  createMap: (data: Partial<MapData>) => string;
  updateMap: (id: string, data: Partial<MapData>) => void;
  deleteMap: (id: string) => void;
  addMapMarker: (mapId: string, marker: MapMarker) => void;
  updateMapMarker: (mapId: string, markerId: string, data: Partial<MapMarker>) => void;
  deleteMapMarker: (mapId: string, markerId: string) => void;
  addMapPolygon: (mapId: string, polygon: MapPolygon) => void;
  updateMapPolygon: (mapId: string, polygonId: string, data: Partial<MapPolygon>) => void;
  deleteMapPolygon: (mapId: string, polygonId: string) => void;
  addMapLine: (mapId: string, line: MapLine) => void;
  deleteMapLine: (mapId: string, lineId: string) => void;
  addMapLayer: (mapId: string, layer: MapLayer) => void;
  toggleMapLayer: (mapId: string, layerId: string) => void;

  // Timeline actions
  createTimelineEvent: (data: Partial<TimelineEvent>) => string;
  updateTimelineEvent: (id: string, data: Partial<TimelineEvent>) => void;
  deleteTimelineEvent: (id: string) => void;
  createHistoricalPeriod: (data: Partial<HistoricalPeriod>) => string;
  deleteHistoricalPeriod: (id: string) => void;

  // Celestial body actions
  createCelestialBody: (data: Partial<CelestialBody>) => string;
  updateCelestialBody: (id: string, data: Partial<CelestialBody>) => void;
  deleteCelestialBody: (id: string) => void;

  // Data management
  exportUniverse: (id: string) => string;
  importUniverse: (data: string) => void;
}

const STORAGE_KEY = 'worldbuilder_data';

function loadFromStorage(): Partial<AppState> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { console.error('Failed to load data:', e); }
  return {};
}

function saveToStorage(state: AppState) {
  try {
    const toSave = {
      universes: state.universes,
      entries: state.entries,
      categories: state.categories,
      relationships: state.relationships,
      relationshipTypes: state.relationshipTypes,
      maps: state.maps,
      timelineEvents: state.timelineEvents,
      historicalPeriods: state.historicalPeriods,
      celestialBodies: state.celestialBodies,
      selectedUniverseId: state.selectedUniverseId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) { console.error('Failed to save data:', e); }
}

const stored = loadFromStorage();

export const useStore = create<AppState>((set, get) => ({
  currentPage: 'dashboard',
  selectedEntryId: null,
  editingEntryId: null,
  searchOpen: false,
  selectedUniverseId: stored.selectedUniverseId || null,

  universes: stored.universes || [],
  entries: stored.entries || [],
  categories: stored.categories || [],
  relationships: stored.relationships || [],
  relationshipTypes: stored.relationshipTypes || [],
  maps: stored.maps || [],
  timelineEvents: stored.timelineEvents || [],
  historicalPeriods: stored.historicalPeriods || [],
  celestialBodies: stored.celestialBodies || [],

  setPage: (page) => set({ currentPage: page, selectedEntryId: null, editingEntryId: null }),
  setSelectedEntry: (id) => set({ selectedEntryId: id, editingEntryId: null }),
  setEditingEntry: (id) => set({ editingEntryId: id }),
  setSearchOpen: (open) => set({ searchOpen: open }),

  createUniverse: (name, description) => {
    const id = uuid();
    const now = new Date().toISOString();
    const universe: Universe = { id, name, description, coverImage: '', createdAt: now, updatedAt: now, settings: { calendarSystem: 'Standard', defaultMapImage: '', theme: 'dark' } };
    const cats: Category[] = BUILTIN_CATEGORIES.map(c => ({ id: uuid(), universeId: id, name: c.name, icon: c.icon, color: c.color, parentId: null, isBuiltIn: true, customFields: [] }));
    const relTypes: RelationshipType[] = BUILTIN_RELATIONSHIPS.map(r => ({ id: uuid(), universeId: id, name: r.name, reverseName: r.reverseName, color: r.color, isBuiltIn: true }));
    const defaultMap: MapData = { id: uuid(), universeId: id, name: 'World Map', description: '', backgroundImage: '', markers: [], polygons: [], lines: [], layers: [{ id: uuid(), name: 'Political Borders', visible: true, type: 'political' }, { id: uuid(), name: 'Settlements', visible: true, type: 'settlements' }, { id: uuid(), name: 'Physical Geography', visible: true, type: 'geography' }], viewport: { x: 0, y: 0, zoom: 1 } };
    set(s => ({ universes: [...s.universes, universe], categories: [...s.categories, ...cats], relationshipTypes: [...s.relationshipTypes, ...relTypes], maps: [...s.maps, defaultMap], selectedUniverseId: id }));
    saveToStorage(get());
    return id;
  },

  deleteUniverse: (id) => {
    set(s => ({
      universes: s.universes.filter(u => u.id !== id),
      entries: s.entries.filter(e => e.universeId !== id),
      categories: s.categories.filter(c => c.universeId !== id),
      relationships: s.relationships.filter(r => r.universeId !== id),
      relationshipTypes: s.relationshipTypes.filter(r => r.universeId !== id),
      maps: s.maps.filter(m => m.universeId !== id),
      timelineEvents: s.timelineEvents.filter(e => e.universeId !== id),
      historicalPeriods: s.historicalPeriods.filter(p => p.universeId !== id),
      celestialBodies: s.celestialBodies.filter(b => b.universeId !== id),
      selectedUniverseId: s.selectedUniverseId === id ? null : s.selectedUniverseId,
    }));
    saveToStorage(get());
  },

  selectUniverse: (id) => set({ selectedUniverseId: id, currentPage: 'dashboard', selectedEntryId: null }),
  updateUniverse: (id, data) => {
    set(s => ({ universes: s.universes.map(u => u.id === id ? { ...u, ...data, updatedAt: new Date().toISOString() } : u) }));
    saveToStorage(get());
  },

  createEntry: (data) => {
    const id = uuid();
    const now = new Date().toISOString();
    const entry: Entry = { id, universeId: data.universeId || get().selectedUniverseId || '', name: data.name || 'Untitled', categoryId: data.categoryId || '', description: data.description || '', content: data.content || '', coverImage: data.coverImage || '', gallery: data.gallery || [], tags: data.tags || [], customProperties: data.customProperties || {}, createdAt: now, updatedAt: now };
    set(s => ({ entries: [...s.entries, entry] }));
    saveToStorage(get());
    return id;
  },

  updateEntry: (id, data) => {
    set(s => ({ entries: s.entries.map(e => e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e) }));
    saveToStorage(get());
  },

  deleteEntry: (id) => {
    set(s => ({
      entries: s.entries.filter(e => e.id !== id),
      relationships: s.relationships.filter(r => r.sourceId !== id && r.targetId !== id),
      selectedEntryId: s.selectedEntryId === id ? null : s.selectedEntryId,
    }));
    saveToStorage(get());
  },

  createCategory: (data) => {
    const id = uuid();
    const cat: Category = { id, universeId: data.universeId || get().selectedUniverseId || '', name: data.name || 'New Category', icon: data.icon || 'folder', color: data.color || '#6b7280', parentId: data.parentId || null, isBuiltIn: false, customFields: data.customFields || [] };
    set(s => ({ categories: [...s.categories, cat] }));
    saveToStorage(get());
    return id;
  },

  updateCategory: (id, data) => {
    set(s => ({ categories: s.categories.map(c => c.id === id ? { ...c, ...data } : c) }));
    saveToStorage(get());
  },

  deleteCategory: (id) => {
    set(s => ({ categories: s.categories.filter(c => c.id !== id) }));
    saveToStorage(get());
  },

  createRelationship: (data) => {
    const id = uuid();
    const rel: Relationship = { id, universeId: data.universeId || get().selectedUniverseId || '', sourceId: data.sourceId || '', targetId: data.targetId || '', type: data.type || '', reverseType: data.reverseType || '', createdAt: new Date().toISOString() };
    set(s => ({ relationships: [...s.relationships, rel] }));
    saveToStorage(get());
    return id;
  },

  deleteRelationship: (id) => {
    set(s => ({ relationships: s.relationships.filter(r => r.id !== id) }));
    saveToStorage(get());
  },

  createRelationshipType: (data) => {
    const id = uuid();
    const rt: RelationshipType = { id, universeId: data.universeId || get().selectedUniverseId || '', name: data.name || '', reverseName: data.reverseName || '', color: data.color || '#6b7280', isBuiltIn: false };
    set(s => ({ relationshipTypes: [...s.relationshipTypes, rt] }));
    saveToStorage(get());
    return id;
  },

  createMap: (data) => {
    const id = uuid();
    const map: MapData = { id, universeId: data.universeId || get().selectedUniverseId || '', name: data.name || 'New Map', description: data.description || '', backgroundImage: data.backgroundImage || '', markers: [], polygons: [], lines: [], layers: data.layers || [{ id: uuid(), name: 'Default', visible: true, type: 'default' }], viewport: { x: 0, y: 0, zoom: 1 } };
    set(s => ({ maps: [...s.maps, map] }));
    saveToStorage(get());
    return id;
  },

  updateMap: (id, data) => {
    set(s => ({ maps: s.maps.map(m => m.id === id ? { ...m, ...data } : m) }));
    saveToStorage(get());
  },

  deleteMap: (id) => {
    set(s => ({ maps: s.maps.filter(m => m.id !== id) }));
    saveToStorage(get());
  },

  addMapMarker: (mapId, marker) => {
    set(s => ({ maps: s.maps.map(m => m.id === mapId ? { ...m, markers: [...m.markers, marker] } : m) }));
    saveToStorage(get());
  },

  updateMapMarker: (mapId, markerId, data) => {
    set(s => ({ maps: s.maps.map(m => m.id === mapId ? { ...m, markers: m.markers.map(mk => mk.id === markerId ? { ...mk, ...data } : mk) } : m) }));
    saveToStorage(get());
  },

  deleteMapMarker: (mapId, markerId) => {
    set(s => ({ maps: s.maps.map(m => m.id === mapId ? { ...m, markers: m.markers.filter(mk => mk.id !== markerId) } : m) }));
    saveToStorage(get());
  },

  addMapPolygon: (mapId, polygon) => {
    set(s => ({ maps: s.maps.map(m => m.id === mapId ? { ...m, polygons: [...m.polygons, polygon] } : m) }));
    saveToStorage(get());
  },

  updateMapPolygon: (mapId, polygonId, data) => {
    set(s => ({ maps: s.maps.map(m => m.id === mapId ? { ...m, polygons: m.polygons.map(p => p.id === polygonId ? { ...p, ...data } : p) } : m) }));
    saveToStorage(get());
  },

  deleteMapPolygon: (mapId, polygonId) => {
    set(s => ({ maps: s.maps.map(m => m.id === mapId ? { ...m, polygons: m.polygons.filter(p => p.id !== polygonId) } : m) }));
    saveToStorage(get());
  },

  addMapLine: (mapId, line) => {
    set(s => ({ maps: s.maps.map(m => m.id === mapId ? { ...m, lines: [...m.lines, line] } : m) }));
    saveToStorage(get());
  },

  deleteMapLine: (mapId, lineId) => {
    set(s => ({ maps: s.maps.map(m => m.id === mapId ? { ...m, lines: m.lines.filter(l => l.id !== lineId) } : m) }));
    saveToStorage(get());
  },

  addMapLayer: (mapId, layer) => {
    set(s => ({ maps: s.maps.map(m => m.id === mapId ? { ...m, layers: [...m.layers, layer] } : m) }));
    saveToStorage(get());
  },

  toggleMapLayer: (mapId, layerId) => {
    set(s => ({ maps: s.maps.map(m => m.id === mapId ? { ...m, layers: m.layers.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l) } : m) }));
    saveToStorage(get());
  },

  createTimelineEvent: (data) => {
    const id = uuid();
    const evt: TimelineEvent = { id, universeId: data.universeId || get().selectedUniverseId || '', name: data.name || 'Untitled Event', description: data.description || '', startDate: data.startDate || '', endDate: data.endDate || '', categoryId: data.categoryId || '', associatedEntries: data.associatedEntries || [], tags: data.tags || [], images: [], isApproximate: data.isApproximate || false };
    set(s => ({ timelineEvents: [...s.timelineEvents, evt] }));
    saveToStorage(get());
    return id;
  },

  updateTimelineEvent: (id, data) => {
    set(s => ({ timelineEvents: s.timelineEvents.map(e => e.id === id ? { ...e, ...data } : e) }));
    saveToStorage(get());
  },

  deleteTimelineEvent: (id) => {
    set(s => ({ timelineEvents: s.timelineEvents.filter(e => e.id !== id) }));
    saveToStorage(get());
  },

  createHistoricalPeriod: (data) => {
    const id = uuid();
    const period: HistoricalPeriod = { id, universeId: data.universeId || get().selectedUniverseId || '', name: data.name || '', startDate: data.startDate || '', endDate: data.endDate || '', color: data.color || '#6b7280', description: data.description || '' };
    set(s => ({ historicalPeriods: [...s.historicalPeriods, period] }));
    saveToStorage(get());
    return id;
  },

  deleteHistoricalPeriod: (id) => {
    set(s => ({ historicalPeriods: s.historicalPeriods.filter(p => p.id !== id) }));
    saveToStorage(get());
  },

  createCelestialBody: (data) => {
    const id = uuid();
    const body: CelestialBody = { id, universeId: data.universeId || get().selectedUniverseId || '', name: data.name || 'Unnamed Body', type: data.type || 'planet', parentId: data.parentId || null, orbitalDistance: data.orbitalDistance || 100, orbitalPeriod: data.orbitalPeriod || 365, orbitalEccentricity: data.orbitalEccentricity || 0, orbitalInclination: data.orbitalInclination || 0, rotationPeriod: data.rotationPeriod || 24, diameter: data.diameter || 10, mass: data.mass || 1, temperature: data.temperature || '', atmosphere: data.atmosphere || '', description: data.description || '', entryId: data.entryId || null, color: data.color || '#6b7280', angle: data.angle || 0 };
    set(s => ({ celestialBodies: [...s.celestialBodies, body] }));
    saveToStorage(get());
    return id;
  },

  updateCelestialBody: (id, data) => {
    set(s => ({ celestialBodies: s.celestialBodies.map(b => b.id === id ? { ...b, ...data } : b) }));
    saveToStorage(get());
  },

  deleteCelestialBody: (id) => {
    set(s => ({ celestialBodies: s.celestialBodies.filter(b => b.id !== id) }));
    saveToStorage(get());
  },

  exportUniverse: (id) => {
    const s = get();
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      universe: s.universes.find(u => u.id === id),
      entries: s.entries.filter(e => e.universeId === id),
      categories: s.categories.filter(c => c.universeId === id),
      relationships: s.relationships.filter(r => r.universeId === id),
      relationshipTypes: s.relationshipTypes.filter(r => r.universeId === id),
      maps: s.maps.filter(m => m.universeId === id),
      timelineEvents: s.timelineEvents.filter(e => e.universeId === id),
      historicalPeriods: s.historicalPeriods.filter(p => p.universeId === id),
      celestialBodies: s.celestialBodies.filter(b => b.universeId === id),
    };
    return JSON.stringify(data, null, 2);
  },

  importUniverse: (dataStr) => {
    try {
      const data = JSON.parse(dataStr);
      if (!data.universe || !data.version) throw new Error('Invalid format');
      set(s => ({
        universes: [...s.universes, data.universe],
        entries: [...s.entries, ...(data.entries || [])],
        categories: [...s.categories, ...(data.categories || [])],
        relationships: [...s.relationships, ...(data.relationships || [])],
        relationshipTypes: [...s.relationshipTypes, ...(data.relationshipTypes || [])],
        maps: [...s.maps, ...(data.maps || [])],
        timelineEvents: [...s.timelineEvents, ...(data.timelineEvents || [])],
        historicalPeriods: [...s.historicalPeriods, ...(data.historicalPeriods || [])],
        celestialBodies: [...s.celestialBodies, ...(data.celestialBodies || [])],
      }));
      saveToStorage(get());
    } catch (e) { console.error('Import failed:', e); }
  },
}));
