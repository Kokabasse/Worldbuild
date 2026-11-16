export interface Universe {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  settings: UniverseSettings;
}

export interface UniverseSettings {
  calendarSystem: string;
  defaultMapImage: string;
  theme: 'light' | 'dark';
}

export interface Entry {
  id: string;
  universeId: string;
  name: string;
  categoryId: string;
  description: string;
  content: string;
  coverImage: string;
  gallery: string[];
  tags: string[];
  customProperties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  universeId: string;
  name: string;
  icon: string;
  color: string;
  parentId: string | null;
  isBuiltIn: boolean;
  customFields: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[];
}

export interface Relationship {
  id: string;
  universeId: string;
  sourceId: string;
  targetId: string;
  type: string;
  reverseType: string;
  createdAt: string;
}

export interface RelationshipType {
  id: string;
  universeId: string;
  name: string;
  reverseName: string;
  color: string;
  isBuiltIn: boolean;
}

export interface MapData {
  id: string;
  universeId: string;
  name: string;
  description: string;
  backgroundImage: string;
  markers: MapMarker[];
  polygons: MapPolygon[];
  lines: MapLine[];
  layers: MapLayer[];
  viewport: { x: number; y: number; zoom: number };
}

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  type: string;
  entryId: string | null;
  label: string;
  layerId: string;
  icon: string;
}

export interface MapPolygon {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  opacity: number;
  entryId: string | null;
  label: string;
  layerId: string;
}

export interface MapLine {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  entryId: string | null;
  label: string;
  layerId: string;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: string;
}

export interface TimelineEvent {
  id: string;
  universeId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  associatedEntries: string[];
  tags: string[];
  images: string[];
  isApproximate: boolean;
}

export interface HistoricalPeriod {
  id: string;
  universeId: string;
  name: string;
  startDate: string;
  endDate: string;
  color: string;
  description: string;
}

export interface CelestialBody {
  id: string;
  universeId: string;
  name: string;
  type: 'star' | 'planet' | 'dwarf_planet' | 'moon' | 'asteroid' | 'comet' | 'satellite' | 'custom';
  parentId: string | null;
  orbitalDistance: number;
  orbitalPeriod: number;
  orbitalEccentricity: number;
  orbitalInclination: number;
  rotationPeriod: number;
  diameter: number;
  mass: number;
  temperature: string;
  atmosphere: string;
  description: string;
  entryId: string | null;
  color: string;
  angle: number;
}

export type Page = 'dashboard' | 'encyclopedia' | 'map' | 'timeline' | 'orrery' | 'settings' | 'graph';
