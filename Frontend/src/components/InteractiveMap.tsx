import { PORTFOLIO_MODE } from "../portfolio";
const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
import L from "leaflet";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Crosshair,
  Download,
  Droplets,
  Eye,
  EyeOff,
  Footprints,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Mountain,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Signal,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Accommodation,
  Attraction,
  HikingTrail,
  TrailWaypoint,
} from "../types";

interface InteractiveMapProps {
  attractions: Attraction[];
  hikingTrails: HikingTrail[];
  accommodations: Accommodation[];
  isDarkMode: boolean;
  onSelectAttraction: (item: Attraction) => void;
  onSelectAccommodation: (item: Accommodation) => void;
  isOffline: boolean;
}

// Center coordinates for Maestro de Campo (Sibale Island, Concepcion, Romblon)
const SIBALE_CENTER: [number, number] = [12.9242, 121.7088];
const DEFAULT_ZOOM = 13.5;

export type TileStyleKey = "satellite" | "topo" | "terrain" | "street";

export interface TileStyleConfig {
  id: TileStyleKey;
  name: string;
  tagline: string;
  badge: string;
  icon: string;
  description: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
  bestFor: string;
  features: string[];
}

// Tile Layers Configuration for Satellite, Topographical, Terrain, and Standard Street
const MAP_STYLES: Record<TileStyleKey, TileStyleConfig> = {
  satellite: {
    id: "satellite",
    name: "Satellite View",
    tagline: "High-Res Aerial Imagery",
    badge: "Aerial",
    icon: "🛰️",
    description:
      "High-resolution true-color satellite imagery showing reef barriers, beaches, forest canopy, and coastal shelf.",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP",
    maxZoom: 18,
    bestFor: "Coral reefs, coastal coves, vegetation density & beach sandbars",
    features: [
      "High-res aerial photography",
      "Reef barrier clarity",
      "Shoreline shelf",
    ],
  },
  topo: {
    id: "topo",
    name: "Topographical Map",
    tagline: "Contours & Peak Elevations",
    badge: "Elevation",
    icon: "⛰️",
    description:
      "Topographic contour lines, elevation gradients, high ridges, and peak summits for backcountry hiking navigation.",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)",
    maxZoom: 17,
    subdomains: ["a", "b", "c"],
    bestFor: "Ridge navigation, steep slope assessment & elevation profiles",
    features: [
      "Elevation contour intervals",
      "Summit peak heights",
      "Mountain saddles & ridges",
    ],
  },
  terrain: {
    id: "terrain",
    name: "Shaded Relief Terrain",
    tagline: "Physiographic 3D Relief",
    badge: "3D Relief",
    icon: "🏞️",
    description:
      "Physiographic hillshaded terrain combining contour topography, valley depressions, water drainage, and natural landmarks.",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; DeLorme, NAVTEQ, TomTom, USGS, NPS, NRCAN",
    maxZoom: 18,
    bestFor:
      "Terrain orientation, ravines, drainage gullies & landmark spotting",
    features: [
      "3D hillshade illumination",
      "Valley depth gradients",
      "Natural landforms",
    ],
  },
  street: {
    id: "street",
    name: "Standard Street & Coast",
    tagline: "Roads & Coastal Settlements",
    badge: "Streets",
    icon: "🗺️",
    description:
      "Clean high-contrast vector cartography with municipal roads, 9 barangay centers, ports, and points of interest.",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    maxZoom: 19,
    subdomains: ["a", "b", "c", "d"],
    bestFor:
      "Barangay town navigation, road trips, jetty arrivals & homestay finding",
    features: [
      "Barangay town centers",
      "Port jetty pier access",
      "High-contrast road labels",
    ],
  },
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  attractions,
  hikingTrails,
  accommodations,
  isDarkMode,
  onSelectAttraction,
  onSelectAccommodation,
  isOffline,
}) => {
  // Map Container & Instance Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const trailsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const simulationMarkerRef = useRef<L.Marker | null>(null);
  const layerControlRef = useRef<HTMLDivElement>(null);
  const layerControlToggleRef = useRef<HTMLButtonElement>(null);
  const floatingLayerControlToggleRef = useRef<HTMLButtonElement>(null);

  // Map Tile Style State
  const [activeTileStyle, setActiveTileStyle] =
    useState<TileStyleKey>("satellite");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLayerControlOpen, setIsLayerControlOpen] = useState<boolean>(false);

  // Layer Toggles
  const [showTrailsLayer, setShowTrailsLayer] = useState<boolean>(true);
  const [showAttractionsLayer, setShowAttractionsLayer] =
    useState<boolean>(true);
  const [showStaysLayer, setShowStaysLayer] = useState<boolean>(true);
  const [showPortsLayer, setShowPortsLayer] = useState<boolean>(true);
  const [showWaypointsOnMap, setShowWaypointsOnMap] = useState<boolean>(true);

  // Category Focus Filter
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [trailDifficultyFilter, setTrailDifficultyFilter] =
    useState<string>("all");
  const [searchPinQuery, setSearchPinQuery] = useState<string>("");

  // Selected Entities
  const [selectedTrail, setSelectedTrail] = useState<HikingTrail | null>(
    hikingTrails[0] || null,
  );
  const [selectedWaypoint, setSelectedWaypoint] =
    useState<TrailWaypoint | null>(null);
  const [isMobileSheetExpanded, setIsMobileSheetExpanded] =
    useState<boolean>(false);

  // Recalculate only while this map instance is still mounted.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const timer = window.setTimeout(() => {
      if (mapInstanceRef.current === map) map.invalidateSize();
    }, 320);
    return () => window.clearTimeout(timer);
  }, [isMobileSheetExpanded, isFullscreen]);
  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    type: "attraction" | "stay" | "port" | "emergency" | "trailhead";
    name: string;
    categoryLabel: string;
    lat: number;
    lng: number;
    image: string;
    description: string;
    highlights?: string[];
    rawObject?: Attraction | Accommodation | HikingTrail;
  } | null>(null);

  // Trek Simulation State
  const [isSimulatingTrek, setIsSimulatingTrek] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [offlineMapSaved, setOfflineMapSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Distance Calculator
  const [distanceStart, setDistanceStart] = useState<string | null>(null);
  const [distanceEnd, setDistanceEnd] = useState<string | null>(null);

  // Trigger Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active overlay count for layer control switch badge
  const activeOverlayCount = [
    showTrailsLayer,
    showWaypointsOnMap,
    showAttractionsLayer,
    showStaysLayer,
    showPortsLayer,
  ].filter(Boolean).length;

  // Preset configuration helper for terrain navigation modes
  const applyPreset = (preset: "trekker" | "coastal" | "town") => {
    if (preset === "trekker") {
      setActiveTileStyle("topo");
      setShowTrailsLayer(true);
      setShowWaypointsOnMap(true);
      setShowAttractionsLayer(true);
      showToast(
        "Switched to Trekker Mode (Topographical + Trails + Waypoints)",
      );
    } else if (preset === "coastal") {
      setActiveTileStyle("satellite");
      setShowAttractionsLayer(true);
      setShowPortsLayer(true);
      showToast(
        "Switched to Coastal Explorer (Satellite + Reefs + Beaches + Ports)",
      );
    } else if (preset === "town") {
      setActiveTileStyle("street");
      setShowStaysLayer(true);
      setShowPortsLayer(true);
      setShowAttractionsLayer(true);
      showToast(
        "Switched to Town Navigator (Standard Street + Homestays + Emergency)",
      );
    }
  };

  // Close Layer Control Switch popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        layerControlRef.current &&
        !layerControlRef.current.contains(event.target as Node)
      ) {
        if (
          layerControlToggleRef.current?.contains(event.target as Node) ||
          floatingLayerControlToggleRef.current?.contains(event.target as Node)
        ) {
          return;
        }
        setIsLayerControlOpen(false);
      }
    };
    if (isLayerControlOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLayerControlOpen]);

  // Compile Unified Pins Dataset with Actual Coordinates
  const mapPins = useMemo(() => {
    const pins: any[] = [];

    // Attractions
    if (showAttractionsLayer) {
      pins.push(
        ...attractions
          .filter((a) => a.coordinateStatus !== "unconfirmed")
          .map((a) => ({
            id: a.id,
            type: "attraction" as const,
            name: a.name,
            categoryLabel: a.category.toUpperCase(),
            lat: a.lat,
            lng: a.lng,
            image: a.image,
            description: a.description,
            highlights: a.highlights,
            rawObject: a,
          })),
      );
    }

    // Accommodations
    if (showStaysLayer) {
      pins.push(
        ...accommodations
          .filter((s) => s.coordinates !== null)
          .map((s) => ({
            id: s.id,
            type: "stay" as const,
            name: s.name,
            categoryLabel:
              s.pricePerNight === null
                ? "LODGING · RATE UNCONFIRMED"
                : `LODGING (₱${s.pricePerNight})`,
            lat: s.coordinates!.lat,
            lng: s.coordinates!.lng,
            image: s.image,
            description: s.description,
            rawObject: s,
          })),
      );
    }

    // Ports & Emergency Services
    if (showPortsLayer) {
      pins.push(
        {
          id: "port-concepcion",
          type: "port" as const,
          name: "Concepcion Passenger Port",
          categoryLabel: "BOAT TERMINAL",
          lat: 12.9238,
          lng: 121.7058,
          image:
            "/assets/portfolio-placeholder.svg",
          description:
            "Main arrival jetty for passenger boats from Pinamalayan (Oriental Mindoro). Coast Guard & Tourism Assistance desk located here.",
          highlights: [
            "Passenger Boat Jetty",
            "Tourism Registry Desk",
            "Habal-Habal Terminal",
          ],
        },
        {
          id: "emergency-rhu",
          type: "emergency" as const,
          name: "Concepcion Rural Health Unit & MDRRMO",
          categoryLabel: "EMERGENCY & MEDICAL",
          lat: 12.9242,
          lng: 121.7075,
          image:
            "/assets/portfolio-placeholder.svg",
          description:
            "Unverified clinic example; service hours and emergency contacts are not supplied by this prototype. Contact withheld — demo only.",
          highlights: [
            "24/7 First Aid",
            "Disaster Response Command",
            "Coast Guard Substation",
          ],
        },
      );
    }

    // Hiking Trailheads
    if (showTrailsLayer) {
      pins.push(
        ...hikingTrails.map((t) => ({
          id: t.id,
          type: "trailhead" as const,
          name: t.name,
          categoryLabel: `${t.difficulty.toUpperCase()} TREK (${t.distanceKm}km)`,
          lat: t.coordinates[0][0],
          lng: t.coordinates[0][1],
          image: t.image,
          description: t.description,
          highlights: t.highlights,
          rawObject: t,
        })),
      );
    }

    return pins;
  }, [
    showAttractionsLayer,
    showStaysLayer,
    showPortsLayer,
    showTrailsLayer,
    attractions,
    accommodations,
    hikingTrails,
  ]);

  // Filtered Pins according to focus mode and search
  const filteredPins = useMemo(() => {
    return mapPins.filter((pin) => {
      // Search text filter
      if (searchPinQuery.trim()) {
        const query = searchPinQuery.toLowerCase();
        const matchesName = pin.name.toLowerCase().includes(query);
        const matchesDesc = pin.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // Category filter
      if (activeCategory === "all") return true;
      if (activeCategory === "trails") return pin.type === "trailhead";
      if (activeCategory === "beach")
        return (
          pin.rawObject &&
          "category" in pin.rawObject &&
          pin.rawObject.category === "beach"
        );
      if (activeCategory === "landmark")
        return (
          pin.rawObject &&
          "category" in pin.rawObject &&
          pin.rawObject.category === "landmark"
        );
      if (activeCategory === "stay") return pin.type === "stay";
      if (activeCategory === "emergency")
        return pin.type === "emergency" || pin.type === "port";
      return true;
    });
  }, [mapPins, activeCategory, searchPinQuery]);

  // Filtered Trails
  const filteredTrails = useMemo(() => {
    return hikingTrails.filter((trail) => {
      if (
        trailDifficultyFilter !== "all" &&
        trail.difficulty.toLowerCase() !== trailDifficultyFilter.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [trailDifficultyFilter, hikingTrails]);

  // Recenter Map Helper
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(SIBALE_CENTER, DEFAULT_ZOOM, {
        duration: 1.2,
      });
      showToast("Centered on Sibale Island (Maestro de Campo)");
    }
  };

  // Fly to Pin Helper

  // Fly to Trail Helper
  const handleSelectTrail = (trail: HikingTrail) => {
    setSelectedTrail(trail);
    setSelectedWaypoint(null);
    setIsMobileSheetExpanded(true);
    if (mapInstanceRef.current && trail.coordinates.length > 0) {
      const bounds = L.latLngBounds(trail.coordinates.map((c) => [c[0], c[1]]));
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15.5,
      });
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let initialResizeTimer: number | undefined;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: SIBALE_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false, // custom position
        // Leaflet 1.9's CSS zoom timeout can fire after its map pane is removed.
        zoomAnimation: false,
      });

      // Add zoom control in top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Create base tile layer
      const config = MAP_STYLES.satellite;
      const tileLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: config.maxZoom,
        subdomains: config.subdomains || "abc",
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Layer groups for markers and polylines
      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      trailsLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size on load
      initialResizeTimer = window.setTimeout(() => {
        if (mapInstanceRef.current === map) map.invalidateSize();
      }, 250);
    }

    return () => {
      window.clearTimeout(initialResizeTimer);
      const map = mapInstanceRef.current;
      mapInstanceRef.current = null;
      if (map) {
        map.stop();
        map.off();
        map.remove();
      }
      tileLayerRef.current = null;
      markersLayerGroupRef.current = null;
      trailsLayerGroupRef.current = null;
      simulationMarkerRef.current = null;
    };
  }, []);

  // Update Tile Style Layer when activeTileStyle changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = MAP_STYLES[activeTileStyle];
    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || "abc",
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [activeTileStyle]);

  // Render Trails on Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current || !trailsLayerGroupRef.current) return;
    const group = trailsLayerGroupRef.current;
    group.clearLayers();

    if (!showTrailsLayer) return;

    hikingTrails.forEach((trail) => {
      const isSelected = selectedTrail?.id === trail.id;
      let trailColor = "#10b981"; // Easy
      if (trail.difficulty === "Moderate") trailColor = "#f59e0b";
      if (trail.difficulty === "Challenging") trailColor = "#f43f5e";

      const latlngs = trail.coordinates.map(
        (c) => [c[0], c[1]] as [number, number],
      );

      // Outer glow polyline if selected
      if (isSelected) {
        const glowLine = L.polyline(latlngs, {
          color: trailColor,
          weight: 10,
          opacity: 0.35,
          lineCap: "round",
          lineJoin: "round",
        });
        group.addLayer(glowLine);
      }

      // Main dashed trail line
      const polyline = L.polyline(latlngs, {
        color: isSelected ? "#22b5d6" : trailColor,
        weight: isSelected ? 4.5 : 3.5,
        opacity: isSelected ? 1.0 : 0.85,
        dashArray: isSelected ? "8, 6" : "6, 5",
        lineCap: "round",
        lineJoin: "round",
      });

      // Trail Click
      polyline.on("click", () => {
        handleSelectTrail(trail);
      });

      // Tooltip on trail
      polyline.bindTooltip(
        `
        <div class="px-1 py-0.5 font-sans">
          <strong class="text-xs font-black block">${escapeHtml(trail.name)}</strong>
          <span class="text-[10px] text-teal-300 font-semibold">${escapeHtml(trail.difficulty)} • ${escapeHtml(trail.distanceKm)} km</span>
        </div>
      `,
        {
          sticky: true,
          className:
            "bg-slate-900/90 text-white rounded-lg border border-teal-500/40",
        },
      );

      group.addLayer(polyline);

      // Render Waypoint Markers if enabled
      if (showWaypointsOnMap && trail.waypoints) {
        trail.waypoints.forEach((wp, idx) => {
          const isStart = wp.type === "start";
          const isSummit = wp.type === "summit";

          let wpBg = "bg-teal-500 text-slate-950";
          if (isStart) wpBg = "bg-emerald-500 text-white";
          if (isSummit) wpBg = "bg-rose-500 text-white animate-pulse";

          const wpIcon = L.divIcon({
            className: "custom-leaflet-icon",
            html: `
              <div class="w-6 h-6 rounded-full ${wpBg} flex items-center justify-center font-black text-[10px] shadow-lg ring-2 ring-white cursor-pointer hover:scale-125 transition-transform">
                ${isSummit ? "★" : idx + 1}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const wpMarker = L.marker([wp.lat, wp.lng], { icon: wpIcon });
          wpMarker.bindPopup(`
            <div class="p-3 text-white max-w-[220px]">
              <div class="flex items-center gap-1.5 text-[10px] text-teal-300 font-bold uppercase mb-1">
                <span>Waypoint ${idx + 1}</span> • <span>${escapeHtml(wp.elevationMeters)}m</span>
              </div>
              <h5 class="font-black text-sm text-white">${escapeHtml(wp.name)}</h5>
              <p class="text-xs text-slate-300 mt-1 leading-tight">${escapeHtml(wp.description)}</p>
            </div>
          `);

          wpMarker.on("click", () => {
            setSelectedTrail(trail);
            setSelectedWaypoint(wp);
          });

          group.addLayer(wpMarker);
        });
      }
    });
  }, [showTrailsLayer, selectedTrail, showWaypointsOnMap, hikingTrails]);

  // Render Markers on Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;
    const group = markersLayerGroupRef.current;
    group.clearLayers();

    filteredPins.forEach((pin) => {
      const isSelected = selectedPin?.id === pin.id;

      let badgeColor = "bg-emerald-500 text-white";
      let iconSymbol = "📍";

      if (pin.type === "trailhead") {
        badgeColor = "bg-rose-500 text-white";
        iconSymbol = "🥾";
      } else if (pin.type === "stay") {
        badgeColor = "bg-amber-500 text-white";
        iconSymbol = "🏡";
      } else if (pin.type === "port") {
        badgeColor = "bg-cyan-500 text-white";
        iconSymbol = "⚓";
      } else if (pin.type === "emergency") {
        badgeColor = "bg-red-600 text-white animate-pulse";
        iconSymbol = "🚨";
      } else if (
        pin.rawObject &&
        "category" in pin.rawObject &&
        pin.rawObject.category === "beach"
      ) {
        badgeColor = "bg-teal-500 text-white";
        iconSymbol = "🏖️";
      } else if (
        pin.rawObject &&
        "category" in pin.rawObject &&
        pin.rawObject.category === "landmark"
      ) {
        badgeColor = "bg-indigo-600 text-white";
        iconSymbol = "🏛️";
      }

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div class="relative group cursor-pointer transition-transform duration-200 ${isSelected ? "scale-125 z-50" : "hover:scale-115"}">
            <div class="w-9 h-9 rounded-2xl ${badgeColor} flex items-center justify-center text-sm shadow-xl ring-2 ${isSelected ? "ring-cyan-300 shadow-[0_0_15px_rgba(34,181,214,0.7)]" : "ring-white/80"}">
              <span>${iconSymbol}</span>
            </div>
            <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${badgeColor}"></div>
          </div>
        `,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon });

      // Interactive Popup with Photo and Details
      const popupContent = document.createElement("div");
      popupContent.className = "w-64 p-0 overflow-hidden text-white font-sans";
      popupContent.innerHTML = `
        <div class="relative h-28 w-full overflow-hidden">
          <img src="${escapeHtml(pin.image)}" alt="${escapeHtml(pin.name)}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-transparent"></div>
          <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-950/80 text-teal-300 border border-white/10">
            ${escapeHtml(pin.categoryLabel)}
          </span>
        </div>
        <div class="p-3.5 space-y-2">
          <h4 class="text-sm font-black text-white leading-snug">${escapeHtml(pin.name)}</h4>
          <p class="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">${escapeHtml(pin.description)}</p>
          <div class="flex items-center justify-between text-[10px] text-teal-400 font-mono pt-1">
            <span>${pin.lat.toFixed(4)}° N, ${pin.lng.toFixed(4)}° E</span>
          </div>
          <div class="pt-2 flex gap-1.5">
            <button id="popup-btn-${escapeHtml(pin.id)}" class="flex-1 py-1.5 px-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs text-center transition-all cursor-pointer">
              ${pin.type === "stay" ? "Book Homestay" : pin.type === "trailhead" ? "View Trail" : "Explore Details"}
            </button>
          </div>
        </div>
      `;

      // Attach button click handler after popup opens
      marker.bindPopup(popupContent);
      marker.on("popupopen", () => {
        setSelectedPin(pin);
        const btn = document.getElementById(`popup-btn-${pin.id}`);
        if (btn) {
          btn.onclick = () => {
            if (pin.type === "stay") {
              onSelectAccommodation(pin.rawObject);
            } else if (pin.type === "trailhead") {
              const t = hikingTrails.find((tr) => tr.id === pin.id);
              if (t) handleSelectTrail(t);
            } else if (pin.rawObject && "category" in pin.rawObject) {
              onSelectAttraction(pin.rawObject);
            }
          };
        }
      });

      marker.on("click", () => {
        setSelectedPin(pin);
        if (pin.type === "trailhead") {
          const t = hikingTrails.find((tr) => tr.id === pin.id);
          if (t) setSelectedTrail(t);
        }
      });

      group.addLayer(marker);
    });
  }, [
    filteredPins,
    selectedPin,
    hikingTrails,
    onSelectAttraction,
    onSelectAccommodation,
  ]);

  // Virtual Trek Simulation on Map
  useEffect(() => {
    let interval: any = null;
    if (isSimulatingTrek && selectedTrail) {
      interval = setInterval(() => {
        setSimulationProgress((prev) => {
          if (prev >= 100) {
            setIsSimulatingTrek(false);
            showToast(`Virtual trek completed for ${selectedTrail.name}!`);
            return 100;
          }
          return prev + 2;
        });
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isSimulatingTrek, selectedTrail]);

  // Update Simulation Marker Position on Leaflet
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (
      !isSimulatingTrek ||
      !selectedTrail ||
      selectedTrail.coordinates.length < 2
    ) {
      if (simulationMarkerRef.current) {
        map.removeLayer(simulationMarkerRef.current);
        simulationMarkerRef.current = null;
      }
      return;
    }

    // Interpolate coordinate along trail coordinates
    const coords = selectedTrail.coordinates;
    const totalSegments = coords.length - 1;
    const progressNormalized = (simulationProgress / 100) * totalSegments;
    const segmentIndex = Math.min(
      Math.floor(progressNormalized),
      totalSegments - 1,
    );
    const segmentProgress = progressNormalized - segmentIndex;

    const startPt = coords[segmentIndex];
    const endPt = coords[segmentIndex + 1];

    const currentLat = startPt[0] + (endPt[0] - startPt[0]) * segmentProgress;
    const currentLng = startPt[1] + (endPt[1] - startPt[1]) * segmentProgress;

    const simulatedDistance = (
      selectedTrail.distanceKm *
      (simulationProgress / 100)
    ).toFixed(2);

    const trekIcon = L.divIcon({
      className: "sim-trek-icon",
      html: `
        <div class="relative flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-[0_0_20px_rgba(34,181,214,1)] ring-2 ring-white animate-bounce">
            🥾
          </div>
          <span class="mt-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-950 text-cyan-300 whitespace-nowrap shadow-md border border-cyan-400/40">
            ${simulatedDistance} km
          </span>
        </div>
      `,
      iconSize: [60, 48],
      iconAnchor: [30, 24],
    });

    if (simulationMarkerRef.current) {
      simulationMarkerRef.current.setLatLng([currentLat, currentLng]);
    } else {
      const marker = L.marker([currentLat, currentLng], {
        icon: trekIcon,
      }).addTo(map);
      simulationMarkerRef.current = marker;
    }
  }, [isSimulatingTrek, simulationProgress, selectedTrail]);

  // Offline Save Bundle
  const handleSaveOfflineMap = () => {
    if (PORTFOLIO_MODE) { showToast("Offline navigation exports are unavailable for unverified demo routes."); return; }
    const offlinePackage = {
      timestamp: new Date().toISOString(),
      mapPins,
      hikingTrails: hikingTrails,
      emergencyHotlines: {
        rhu: "Contact withheld — demo only",
        coastGuard: "Contact withheld — demo only",
        tourismOffice: "Contact withheld — demo only",
      },
    };
    localStorage.setItem(
      "concepcion_offline_map_cached",
      JSON.stringify(offlinePackage),
    );
    setOfflineMapSaved(true);
    showToast(
      "Map coordinates and trail descriptions saved. Map tiles still require internet.",
    );
    setTimeout(() => setOfflineMapSaved(false), 3000);
  };

  // GPX Download
  const handleExportTrailGPX = (trail: HikingTrail) => {
    if (PORTFOLIO_MODE) { showToast("GPX downloads are unavailable: sample routes are not verified for navigation."); return; }
    const gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TaraSibale - Concepcion Romblon Tourism" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeHtml(trail.name)}</name>
    <desc>${escapeHtml(trail.description)}</desc>
    <author><name>TaraSibale Independent Portfolio</name></author>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${escapeHtml(trail.name)}</name>
    <desc>Difficulty: ${escapeHtml(trail.difficulty)} | Distance: ${escapeHtml(trail.distanceKm)}km | Peak: ${trail.peakElevationMeters}m</desc>
    <trkseg>
      ${trail.coordinates.map((c) => `<trkpt lat="${c[0]}" lon="${c[1]}"><ele>${trail.peakElevationMeters * 0.7}</ele></trkpt>`).join("\n      ")}
    </trkseg>
  </trk>
  ${trail.waypoints
    .map(
      (wp) => `
  <wpt lat="${wp.lat}" lon="${wp.lng}">
    <ele>${wp.elevationMeters || 0}</ele>
    <name>${escapeHtml(wp.name)}</name>
    <desc>${escapeHtml(wp.description)}</desc>
    <type>${wp.type}</type>
  </wpt>`,
    )
    .join("")}
</gpx>`;

    const blob = new Blob([gpxData], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trail.id}-sibale-route.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded GPX file for ${escapeHtml(trail.name)}`);
  };

  // Distance Calculation
  const calculateDistance = () => {
    if (!distanceStart || !distanceEnd) return null;
    const pin1 = mapPins.find((p) => p.id === distanceStart);
    const pin2 = mapPins.find((p) => p.id === distanceEnd);
    if (!pin1 || !pin2) return null;

    const R = 6371; // km
    const dLat = ((pin2.lat - pin1.lat) * Math.PI) / 180;
    const dLng = ((pin2.lng - pin1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pin1.lat * Math.PI) / 180) *
        Math.cos((pin2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = (R * c).toFixed(2);
    const boatMins = Math.round(Number(distKm) * 6 + 5);
    const habalMins = Math.round(Number(distKm) * 4 + 3);
    const hikeHours = (Number(distKm) / 3.2).toFixed(1);
    return {
      distKm,
      boatMins,
      habalMins,
      hikeHours,
      from: pin1.name,
      to: pin2.name,
    };
  };

  const distInfo = calculateDistance();

  // Simulated metrics
  const simulatedDistance = selectedTrail
    ? (selectedTrail.distanceKm * (simulationProgress / 100)).toFixed(2)
    : "0.00";
  const simulatedAltitude = selectedTrail
    ? Math.round(
        (selectedTrail.elevationProfile[0]?.elevationMeters || 10) +
          (selectedTrail.peakElevationMeters -
            (selectedTrail.elevationProfile[0]?.elevationMeters || 10)) *
            (simulationProgress / 100),
      )
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-950/95 border border-teal-500/50 text-teal-200 text-xs font-bold shadow-2xl flex items-center gap-2.5 backdrop-blur-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Streamlined Control Bar - Compact & Unobtrusive */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isDarkMode
            ? "bg-[#061e2c]/90 border-white/15 text-white"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-sm"
        }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Island Geo Tag */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Sibale Island Map • Portfolio Demonstration
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30">
                12.924°N, 121.709°E • Concepcion, Romblon
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Explore satellite, terrain and street maps with unverified sample routes. Not for navigation. Try map controls and sample route animations.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tile Switcher Pills */}
            <div className="flex flex-wrap items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">
              {(
                ["satellite", "topo", "terrain", "street"] as TileStyleKey[]
              ).map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    setActiveTileStyle(style);
                    showToast(`Switched map view to ${MAP_STYLES[style].name}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTileStyle === style
                      ? "bg-teal-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title={`${MAP_STYLES[style].name} - ${MAP_STYLES[style].tagline}`}>
                  <span>{MAP_STYLES[style].icon}</span>
                  <span className="hidden xl:inline">
                    {MAP_STYLES[style].name
                      .replace(" View", "")
                      .replace(" Map", "")}
                  </span>
                  <span className="xl:hidden">{MAP_STYLES[style].badge}</span>
                </button>
              ))}
            </div>

            {/* Layer Control Switch Drawer Toggle Button */}
            <button
              id="map-layer-control-toggle"
              ref={layerControlToggleRef}
              aria-expanded={isLayerControlOpen}
              onClick={() => setIsLayerControlOpen((open) => !open)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isLayerControlOpen
                  ? "bg-teal-500 text-slate-950 border-teal-400 font-black shadow-md"
                  : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-white/15 hover:bg-teal-500/20 hover:text-teal-600 dark:hover:text-teal-300"
              }`}
              title="Open Terrain Layer Controls & Feature Toggles">
              <Layers className="w-3.5 h-3.5 text-teal-500" />
              <span className="hidden sm:inline">Layers</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-teal-500/20 text-teal-800 dark:text-teal-200">
                {activeOverlayCount}
              </span>
            </button>

            {/* Recenter Button */}
            <button
              onClick={handleRecenter}
              title="Recenter Map on Sibale Island"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/15 hover:bg-teal-500/20 hover:text-teal-600 dark:hover:text-teal-300 transition-all cursor-pointer">
              <Crosshair className="w-3.5 h-3.5 text-teal-500" />
              <span>Recenter</span>
            </button>

            {/* Offline Bundle Button */}
            <button
              disabled={PORTFOLIO_MODE}
              title="Unverified sample routes: offline navigation export unavailable"
              onClick={handleSaveOfflineMap}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                offlineMapSaved
                  ? "bg-teal-600 text-white"
                  : "bg-teal-500/20 text-teal-900 dark:text-teal-300 border border-teal-500/30 hover:bg-teal-500/30"
              }`}>
              {offlineMapSaved ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {offlineMapSaved ? "Offline Bundle Ready" : "Navigation Export Unavailable"}
              </span>
            </button>
          </div>
        </div>

        {/* Clean Filter Tabs Bar - Sits ABOVE the map without blocking */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2.5">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
              Filter:
            </span>
            {[
              { id: "all", label: `All (${mapPins.length})` },
              { id: "trails", label: `🥾 Trails (${hikingTrails.length})` },
              { id: "beach", label: "🏖️ Beaches" },
              { id: "landmark", label: "🏛️ Heritage" },
              { id: "stay", label: "🏡 Homestays" },
              { id: "emergency", label: "🚨 Ports & Clinic" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-teal-500 text-slate-950 font-black shadow-sm"
                    : isDarkMode
                      ? "bg-white/5 text-slate-300 hover:bg-white/15 border border-white/10"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Search on Map Markers */}
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search map places..."
              value={searchPinQuery}
              onChange={(e) => setSearchPinQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border ${
                isDarkMode
                  ? "bg-slate-900/80 border-white/15 text-white placeholder:text-slate-500"
                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Main Map Canvas and Sidebar Grid */}
      <div
        className={`grid grid-cols-1 ${isFullscreen ? "fixed inset-0 z-50 p-4 bg-slate-950" : "lg:grid-cols-3"} gap-6`}>
        {/* Real Leaflet Map Container - Completely Unblocked */}
        <div
          className={`${isFullscreen ? "h-full" : "lg:col-span-2 self-start h-[calc(100dvh-200px)] min-h-[460px] sm:h-[620px] lg:h-[740px]"} relative rounded-3xl border overflow-hidden shadow-2xl ${
            isDarkMode
              ? "border-white/15 bg-slate-950"
              : "border-slate-300 bg-slate-900"
          }`}>
          {/* Leaflet DOM Node */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Map Header Overlay (Sleek & Non-intrusive in top-left) */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border border-white/20 text-white shadow-xl pointer-events-auto max-w-[calc(100%-190px)] sm:max-w-none">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-black block leading-none truncate">
                Maestro de Campo (Sibale)
              </span>
              <span className="text-[10px] text-teal-300 font-mono truncate block sm:inline">
                Sample elevation • {MAP_STYLES[activeTileStyle].name}
              </span>
            </div>
          </div>

          {/* Floating Controls in Top-Right (Layers, Recenter, Fullscreen) */}
          <div className="absolute top-3 sm:top-4 right-14 z-20 flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            {/* Layer Control Switch Button */}
            <button
              ref={floatingLayerControlToggleRef}
              aria-expanded={isLayerControlOpen}
              onClick={() => setIsLayerControlOpen((open) => !open)}
              className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xl backdrop-blur-md border cursor-pointer ${
                isLayerControlOpen
                  ? "bg-teal-500 text-slate-950 border-teal-300 ring-2 ring-teal-400/50"
                  : "bg-slate-950/85 text-teal-300 hover:text-white border-white/20"
              }`}
              title="Toggle Map Views & Terrain Overlays">
              <Layers className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="hidden sm:inline font-bold">
                Layers:{" "}
                {MAP_STYLES[activeTileStyle].name
                  .replace(" View", "")
                  .replace(" Map", "")}
              </span>
              <span className="sm:hidden font-bold">
                {MAP_STYLES[activeTileStyle].badge}
              </span>
              <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
            </button>

            {/* Recenter Button */}
            <button
              onClick={handleRecenter}
              title="Recenter on Sibale Island"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/20 text-teal-300 hover:text-white shadow-xl cursor-pointer transition-all">
              <Crosshair className="w-4 h-4" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Expand Fullscreen Map"}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/20 text-teal-300 hover:text-white shadow-xl cursor-pointer transition-all">
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Interactive Floating Layer Control Switch Panel */}
          {isLayerControlOpen && (
            <div
              ref={layerControlRef}
              className="absolute top-16 right-4 sm:right-14 z-30 w-[calc(100%-2rem)] sm:w-[380px] max-h-[calc(100%-5rem)] overflow-y-auto rounded-3xl p-5 border border-white/20 bg-slate-950/95 backdrop-blur-2xl shadow-2xl space-y-4 animate-fade-in text-white pointer-events-auto custom-scrollbar">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-none">
                      Map View & Layer Control
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Toggle terrain navigation imagery & layers
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLayerControlOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Close layers panel">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Section 1: Base Map Views */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-400">
                    1. Base Map View
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    4 Imagery Styles
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {(Object.keys(MAP_STYLES) as TileStyleKey[]).map(
                    (styleKey) => {
                      const style = MAP_STYLES[styleKey];
                      const isSelected = activeTileStyle === styleKey;
                      return (
                        <div
                          key={styleKey}
                          onClick={() => {
                            setActiveTileStyle(styleKey);
                            showToast(`Map view changed to: ${style.name}`);
                          }}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all relative ${
                            isSelected
                              ? "bg-teal-500/15 border-teal-400 ring-1 ring-teal-400/50 shadow-md"
                              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                          }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl shrink-0">
                                {style.icon}
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-white leading-tight">
                                    {style.name}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/10 text-teal-300 uppercase">
                                    {style.badge}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                                  {style.tagline}
                                </span>
                              </div>
                            </div>

                            {/* Radio Checkmark */}
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 mt-0.5 ${
                                isSelected
                                  ? "bg-teal-400 border-teal-400 text-slate-950"
                                  : "border-white/30"
                              }`}>
                              {isSelected && (
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              )}
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-300 mt-2 leading-relaxed">
                            {style.description}
                          </p>

                          <div className="mt-2 pt-1.5 border-t border-white/5 flex flex-wrap gap-1">
                            {style.features.map((feat, fi) => (
                              <span
                                key={fi}
                                className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900/80 text-teal-300/80 font-mono">
                                • {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Section 2: Terrain Navigation Overlays */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-400">
                    2. Terrain Navigation Overlays
                  </span>
                  <span className="text-[10px] text-teal-300 font-mono">
                    {activeOverlayCount} / 5 Active
                  </span>
                </div>

                <div className="space-y-1.5">
                  {/* Hiking Trails */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🥾</span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Hiking Trails & Ridges
                        </div>
                        <div className="text-[10px] text-slate-400">
                          GPS polyline vectors & difficulty colors
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {showTrailsLayer ? (
                        <Eye className="w-3.5 h-3.5 text-teal-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <input
                        type="checkbox"
                        checked={showTrailsLayer}
                        onChange={(e) => setShowTrailsLayer(e.target.checked)}
                        className="w-4 h-4 rounded accent-teal-400 cursor-pointer"
                      />
                    </div>
                  </label>

                  {/* Waypoints & Summits */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🚩</span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Trail Waypoints & Summits
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Elevation milestone tags (356m MASL)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {showWaypointsOnMap ? (
                        <Eye className="w-3.5 h-3.5 text-teal-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <input
                        type="checkbox"
                        checked={showWaypointsOnMap}
                        onChange={(e) =>
                          setShowWaypointsOnMap(e.target.checked)
                        }
                        className="w-4 h-4 rounded accent-teal-400 cursor-pointer"
                      />
                    </div>
                  </label>

                  {/* Attractions & Beaches */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏖️</span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Beaches & Landmarks
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Bachawan, Dampali, Spanish tower
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {showAttractionsLayer ? (
                        <Eye className="w-3.5 h-3.5 text-teal-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <input
                        type="checkbox"
                        checked={showAttractionsLayer}
                        onChange={(e) =>
                          setShowAttractionsLayer(e.target.checked)
                        }
                        className="w-4 h-4 rounded accent-teal-400 cursor-pointer"
                      />
                    </div>
                  </label>

                  {/* Homestays & Lodging */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏡</span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Community Homestays
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Island lodges & village stays
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {showStaysLayer ? (
                        <Eye className="w-3.5 h-3.5 text-teal-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <input
                        type="checkbox"
                        checked={showStaysLayer}
                        onChange={(e) => setShowStaysLayer(e.target.checked)}
                        className="w-4 h-4 rounded accent-teal-400 cursor-pointer"
                      />
                    </div>
                  </label>

                  {/* Ports & Emergency */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚓</span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Ports & Emergency Clinic
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Concepcion jetty & RHU triage
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {showPortsLayer ? (
                        <Eye className="w-3.5 h-3.5 text-teal-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <input
                        type="checkbox"
                        checked={showPortsLayer}
                        onChange={(e) => setShowPortsLayer(e.target.checked)}
                        className="w-4 h-4 rounded accent-teal-400 cursor-pointer"
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 3: Navigation Presets */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-400 block">
                  3. Quick Navigation Presets
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => applyPreset("trekker")}
                    className="p-2 rounded-xl bg-white/5 hover:bg-teal-500/20 text-slate-200 hover:text-teal-300 border border-white/10 text-center transition-all cursor-pointer"
                    title="Switch to Topographical Map + Trails + Waypoints">
                    <span className="text-sm block">🥾</span>
                    <span className="text-[10px] font-bold block mt-0.5">
                      Trekker
                    </span>
                  </button>
                  <button
                    onClick={() => applyPreset("coastal")}
                    className="p-2 rounded-xl bg-white/5 hover:bg-teal-500/20 text-slate-200 hover:text-teal-300 border border-white/10 text-center transition-all cursor-pointer"
                    title="Switch to Satellite View + Beaches + Ports">
                    <span className="text-sm block">🏖️</span>
                    <span className="text-[10px] font-bold block mt-0.5">
                      Coastal
                    </span>
                  </button>
                  <button
                    onClick={() => applyPreset("town")}
                    className="p-2 rounded-xl bg-white/5 hover:bg-teal-500/20 text-slate-200 hover:text-teal-300 border border-white/10 text-center transition-all cursor-pointer"
                    title="Switch to Standard Street + Homestays + Emergency">
                    <span className="text-sm block">🗺️</span>
                    <span className="text-[10px] font-bold block mt-0.5">
                      Town
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Bottom Legend - Compact, Semitransparent Pill */}
          <div
            className={`absolute ${selectedTrail ? "bottom-20 lg:bottom-4" : "bottom-4"} left-3 sm:left-4 right-3 sm:right-4 z-20 bg-slate-950/85 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-white/20 text-[10px] sm:text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shadow-xl pointer-events-auto ${isMobileSheetExpanded ? "hidden lg:flex" : "flex"}`}>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />{" "}
                Challenging Trail
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />{" "}
                Moderate Trail
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />{" "}
                Easy / Beach
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Port &
                Medical
              </span>
            </div>
            <div className="text-[10px] font-mono text-teal-300">
              {isOffline
                ? "Saved Coordinates · Tiles Need Internet"
                : MAP_STYLES[activeTileStyle].name}
            </div>
          </div>

          {/* Mobile Collapsible / Swipeable Bottom Sheet for Active Trail Dossier */}
          {selectedTrail && !isFullscreen && (
            <div
              className={`lg:hidden absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out ${
                isMobileSheetExpanded
                  ? "h-[76dvh] max-h-[620px] shadow-[0_-16px_40px_rgba(0,0,0,0.8)]"
                  : "h-[72px] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
              } rounded-t-3xl border-t border-white/20 bg-slate-950/95 backdrop-blur-2xl text-white flex flex-col pointer-events-auto`}>
              {/* Drag Handle & Peek Header Bar */}
              <button
                type="button"
                onClick={() => setIsMobileSheetExpanded(!isMobileSheetExpanded)}
                className="w-full p-3 pb-2 cursor-pointer flex flex-col items-center select-none text-left bg-transparent border-none"
                aria-label={
                  isMobileSheetExpanded
                    ? "Collapse trail sheet"
                    : "Expand trail sheet"
                }>
                <div className="w-12 h-1.5 bg-slate-400/50 rounded-full mb-2" />
                <div className="w-full flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      data-difficulty={selectedTrail.difficulty}
                      className="trail-difficulty-badge px-2 py-0.5 rounded-full uppercase shrink-0">
                      {selectedTrail.difficulty}
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {selectedTrail.name}
                    </span>
                    <span className="text-[10px] text-teal-300 font-mono shrink-0">
                      {selectedTrail.distanceKm} km
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-teal-400 text-[10px] font-bold">
                    <span>
                      {isMobileSheetExpanded
                        ? "Minimize"
                        : "Elevation & Waypoints"}
                    </span>
                    {isMobileSheetExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Scrollable Expanded Trail Dossier Content */}
              {isMobileSheetExpanded && (
                <div className="flex-1 overflow-y-auto p-4 pt-1 space-y-4 custom-scrollbar pb-6">
                  {/* Photo & Badges */}
                  <div className="relative h-40 rounded-2xl overflow-hidden shadow-inner">
                    <img
                      src={selectedTrail.image}
                      alt={selectedTrail.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold">
                      <span className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                        <TrendingUp className="w-3 h-3 text-teal-400" />
                        {selectedTrail.distanceKm} km
                      </span>
                      <span className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                        <Mountain className="w-3 h-3 text-amber-400" />
                        Peak {selectedTrail.peakElevationMeters}m
                      </span>
                      <span className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {selectedTrail.estimatedDuration}
                      </span>
                    </div>
                  </div>

                  {/* Title & Barangay Location */}
                  <div>
                    <h3 className="text-base font-black leading-snug text-white">
                      {selectedTrail.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedTrail.barangay}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {selectedTrail.description}
                    </p>
                  </div>

                  {/* Elevation Profile Visualization */}
                  <div className="p-3.5 rounded-2xl border bg-slate-900/80 border-white/10">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Activity className="w-3.5 h-3.5 text-teal-400" />
                        Elevation Profile
                      </span>
                      <span className="text-[11px] text-teal-400">
                        Peak: {selectedTrail.peakElevationMeters}m MASL
                      </span>
                    </div>

                    <div className="h-14 w-full">
                      <svg viewBox="0 0 300 70" className="w-full h-full">
                        <line
                          x1="0"
                          y1="15"
                          x2="300"
                          y2="15"
                          stroke="rgba(255,255,255,0.06)"
                          strokeDasharray="3,3"
                        />
                        <line
                          x1="0"
                          y1="40"
                          x2="300"
                          y2="40"
                          stroke="rgba(255,255,255,0.06)"
                          strokeDasharray="3,3"
                        />
                        <path
                          d={`M 0 65 ${selectedTrail.elevationProfile
                            .map((pt) => {
                              const x =
                                (pt.distanceKm / selectedTrail.distanceKm) *
                                300;
                              const y =
                                65 -
                                (pt.elevationMeters /
                                  selectedTrail.peakElevationMeters) *
                                  50;
                              return `L ${x} ${y}`;
                            })
                            .join(" ")} L 300 65 Z`}
                          fill="rgba(46,196,182, 0.25)"
                        />
                        <path
                          d={`M 0 65 ${selectedTrail.elevationProfile
                            .map((pt) => {
                              const x =
                                (pt.distanceKm / selectedTrail.distanceKm) *
                                300;
                              const y =
                                65 -
                                (pt.elevationMeters /
                                  selectedTrail.peakElevationMeters) *
                                  50;
                              return `L ${x} ${y}`;
                            })
                            .join(" ")}`}
                          fill="none"
                          stroke="#2ec4b6"
                          strokeWidth="2.5"
                        />
                        {selectedTrail.elevationProfile.map((pt, i) => {
                          const x =
                            (pt.distanceKm / selectedTrail.distanceKm) * 300;
                          const y =
                            65 -
                            (pt.elevationMeters /
                              selectedTrail.peakElevationMeters) *
                              50;
                          return (
                            <g key={i}>
                              <circle
                                cx={x}
                                cy={y}
                                r="3"
                                fill="#ffffff"
                                stroke="#073b4c"
                                strokeWidth="1.5"
                              />
                              {pt.label && (
                                <text
                                  x={x}
                                  y={y - 6}
                                  fill="#7da3af"
                                  fontSize="7"
                                  textAnchor="middle"
                                  fontWeight="bold">
                                  {pt.elevationMeters}m
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Simulation Player */}
                  <div className="p-3.5 rounded-2xl border bg-slate-900/80 border-teal-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-teal-200 flex items-center gap-1.5">
                        <Footprints className="w-4 h-4 text-teal-400" />
                        Sample Trek Animation
                      </span>
                      <span className="text-[11px] font-mono text-teal-300">
                        {simulatedDistance} / {selectedTrail.distanceKm} km (
                        {simulationProgress}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${simulationProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                      <span>
                        Altitude:{" "}
                        <strong className="text-teal-300">
                          {simulatedAltitude}m
                        </strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setIsSimulatingTrek(!isSimulatingTrek)}
                          className="min-h-[40px] px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-all">
                          {isSimulatingTrek ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          <span>{isSimulatingTrek ? "Pause" : "Simulate"}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsSimulatingTrek(false);
                            setSimulationProgress(0);
                          }}
                          className="min-h-[40px] min-w-[40px] flex items-center justify-center p-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                          title="Reset Trek">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Waypoints List */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                      Trail Checkpoints ({selectedTrail.waypoints.length}):
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {selectedTrail.waypoints.map((wp, idx) => (
                        <div
                          key={wp.id}
                          onClick={() => {
                            setSelectedWaypoint(wp);
                            if (mapInstanceRef.current) {
                              mapInstanceRef.current.flyTo(
                                [wp.lat, wp.lng],
                                16,
                                { duration: 0.8 },
                              );
                            }
                          }}
                          className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                            selectedWaypoint?.id === wp.id
                              ? "bg-teal-500/20 border-teal-500 text-white ring-1 ring-teal-500"
                              : "bg-slate-900/60 border-white/5 hover:bg-white/5 text-slate-200"
                          }`}>
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 text-[10px] flex items-center justify-center font-black">
                                {idx + 1}
                              </span>
                              {wp.name}
                            </span>
                            <span className="text-[10px] font-mono text-teal-400">
                              {wp.elevationMeters}m
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1 pb-4">
                    <button
                      disabled={PORTFOLIO_MODE}
                      title="Sample route: navigation download unavailable"
                      onClick={() => handleExportTrailGPX(selectedTrail)}
                      className="min-h-[44px] py-2 px-3 rounded-xl bg-slate-900 text-teal-300 border border-teal-500/40 hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                      <Download className="w-3.5 h-3.5" />
                      <span>GPX Unavailable</span>
                    </button>
                    <button
                      onClick={() =>
                        showToast(
                          `Demo only: no guide request was sent for ${selectedTrail.name}.`,
                        )
                      }
                      className="min-h-[44px] py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(46,196,182,0.4)] cursor-pointer transition-all">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Demo Guide Request</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Hiking Route Dossier / Pin Details & Distance Desk (Desktop View) */}
        {!isFullscreen && (
          <div
            role="region"
            aria-label="Map location details and route calculator"
            tabIndex={0}
            className="hidden lg:block lg:max-h-[740px] lg:overflow-y-auto lg:overscroll-contain space-y-6 custom-scrollbar">
            {/* Active Trail Dossier Card */}
            {selectedTrail && (
              <div
                className={`p-6 rounded-3xl border space-y-4 backdrop-blur-xl transition-all shadow-lg ${
                  isDarkMode
                    ? "bg-[#061e2c]/90 border-white/20 text-slate-100"
                    : "bg-white/95 border-slate-200 text-slate-900 shadow-md"
                }`}>
                {/* Card Header & Photo */}
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-inner">
                  <img
                    src={selectedTrail.image}
                    alt={selectedTrail.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      data-difficulty={selectedTrail.difficulty}
                      className="trail-difficulty-badge px-2.5 py-1 rounded-full uppercase shadow-sm">
                      {selectedTrail.difficulty} Trek
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-md border border-white/10">
                      {selectedTrail.trailType}
                    </span>
                  </div>

                  {/* Trail Key Metrics on Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                    <span className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                      {selectedTrail.distanceKm} km
                    </span>
                    <span className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      <Mountain className="w-3.5 h-3.5 text-amber-400" />+
                      {selectedTrail.elevationGainMeters}m / Peak{" "}
                      {selectedTrail.peakElevationMeters}m
                    </span>
                    <span className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {selectedTrail.estimatedDuration}
                    </span>
                  </div>
                </div>

                {/* Title & Barangay Location */}
                <div>
                  <h3 className="text-lg font-black leading-snug text-slate-900 dark:text-white">
                    {selectedTrail.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedTrail.barangay}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {selectedTrail.description}
                  </p>
                </div>

                {/* Elevation Profile Visualization */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isDarkMode
                      ? "bg-slate-950/60 border-white/10"
                      : "bg-slate-50 border-slate-200"
                  }`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Activity className="w-3.5 h-3.5 text-teal-500" />
                      Elevation Profile
                    </span>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400">
                      Peak: {selectedTrail.peakElevationMeters}m MASL
                    </span>
                  </div>

                  {/* SVG Mini Sparkline Area Graph */}
                  <div className="h-16 w-full">
                    <svg viewBox="0 0 300 70" className="w-full h-full">
                      <line
                        x1="0"
                        y1="15"
                        x2="300"
                        y2="15"
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="3,3"
                      />
                      <line
                        x1="0"
                        y1="40"
                        x2="300"
                        y2="40"
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="3,3"
                      />

                      <path
                        d={`M 0 65 ${selectedTrail.elevationProfile
                          .map((pt) => {
                            const x =
                              (pt.distanceKm / selectedTrail.distanceKm) * 300;
                            const y =
                              65 -
                              (pt.elevationMeters /
                                selectedTrail.peakElevationMeters) *
                                50;
                            return `L ${x} ${y}`;
                          })
                          .join(" ")} L 300 65 Z`}
                        fill="rgba(46,196,182, 0.25)"
                      />

                      <path
                        d={`M 0 65 ${selectedTrail.elevationProfile
                          .map((pt) => {
                            const x =
                              (pt.distanceKm / selectedTrail.distanceKm) * 300;
                            const y =
                              65 -
                              (pt.elevationMeters /
                                selectedTrail.peakElevationMeters) *
                                50;
                            return `L ${x} ${y}`;
                          })
                          .join(" ")}`}
                        fill="none"
                        stroke="#2ec4b6"
                        strokeWidth="2.5"
                      />

                      {selectedTrail.elevationProfile.map((pt, i) => {
                        const x =
                          (pt.distanceKm / selectedTrail.distanceKm) * 300;
                        const y =
                          65 -
                          (pt.elevationMeters /
                            selectedTrail.peakElevationMeters) *
                            50;
                        return (
                          <g key={i}>
                            <circle
                              cx={x}
                              cy={y}
                              r="3"
                              fill="#ffffff"
                              stroke="#073b4c"
                              strokeWidth="1.5"
                            />
                            {pt.label && (
                              <text
                                x={x}
                                y={y - 6}
                                fill="#7da3af"
                                fontSize="7"
                                textAnchor="middle"
                                fontWeight="bold">
                                {pt.elevationMeters}m
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Interactive Virtual Trek Simulation Player */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isDarkMode
                      ? "bg-slate-950/70 border-teal-500/30"
                      : "bg-teal-50/70 border-teal-200"
                  }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                      <Footprints className="w-4 h-4 text-teal-500" />
                      Sample Trek Animation
                    </span>
                    <span className="text-[11px] font-mono text-teal-700 dark:text-teal-300">
                      {simulatedDistance} / {selectedTrail.distanceKm} km (
                      {simulationProgress}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${simulationProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                    <span>
                      Current Alt:{" "}
                      <strong className="text-teal-600 dark:text-teal-300">
                        {simulatedAltitude}m
                      </strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsSimulatingTrek(!isSimulatingTrek)}
                        className="px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-all">
                        {isSimulatingTrek ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        <span>
                          {isSimulatingTrek ? "Pause" : "Simulate Walk"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setIsSimulatingTrek(false);
                          setSimulationProgress(0);
                        }}
                        className="p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                        title="Reset Trek">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Waypoints Step-by-Step List */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Trail Waypoints & Checkpoints (
                    {selectedTrail.waypoints.length}):
                  </span>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedTrail.waypoints.map((wp, idx) => (
                      <div
                        key={wp.id}
                        onClick={() => {
                          setSelectedWaypoint(wp);
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.flyTo([wp.lat, wp.lng], 16, {
                              duration: 0.8,
                            });
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          selectedWaypoint?.id === wp.id
                            ? "bg-teal-500/20 border-teal-500/50 text-slate-900 dark:text-white ring-1 ring-teal-500"
                            : isDarkMode
                              ? "bg-slate-950/40 border-white/5 hover:bg-white/5"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}>
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 text-[10px] flex items-center justify-center font-black">
                              {idx + 1}
                            </span>
                            {wp.name}
                          </span>
                          <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">
                            {wp.elevationMeters}m
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug pl-5.5">
                          {wp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety & Logistics Info */}
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    isDarkMode
                      ? "bg-slate-950/50 border-white/10"
                      : "bg-slate-50 border-slate-200"
                  }`}>
                  <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <Signal className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Cell Signal:</span>{" "}
                      {selectedTrail.signalCoverage}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <Droplets className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Water Source:</span>{" "}
                      {selectedTrail.waterAvailability}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Guide Recommendation:</span>{" "}
                      {selectedTrail.recommendedGuide
                        ? "Local Guide Required/Recommended"
                        : "Self-guided allowed"}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 mt-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-tight">
                      <strong>Advisory:</strong> {selectedTrail.safetyAdvisory}
                    </p>
                  </div>
                </div>

                {/* Trail Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    disabled={PORTFOLIO_MODE}
                      title="Sample route: navigation download unavailable"
                      onClick={() => handleExportTrailGPX(selectedTrail)}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 text-teal-300 border border-teal-500/40 hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                    <Download className="w-3.5 h-3.5" />
                    <span>GPX Unavailable</span>
                  </button>

                  <button
                    onClick={() =>
                      showToast(
                        `Demo only: no guide request was sent for ${selectedTrail.name}.`,
                      )
                    }
                    className="py-2.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(46,196,182,0.4)] cursor-pointer transition-all">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Demo Guide Request</span>
                  </button>
                </div>
              </div>
            )}

            {/* Distance & Travel Time Calculator */}
            <div
              className={`p-5 rounded-3xl border space-y-3 backdrop-blur-xl ${
                isDarkMode
                  ? "bg-[#061e2c]/90 border-white/20 text-slate-100"
                  : "bg-white/90 border-slate-200 text-slate-900 shadow-sm"
              }`}>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Island Distance & Route Calculator
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    From Location
                  </label>
                  <select
                    value={distanceStart || ""}
                    onChange={(e) => setDistanceStart(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                      isDarkMode
                        ? "bg-slate-900 border-white/15 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}>
                    <option value="">Select origin...</option>
                    {mapPins.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    To Destination
                  </label>
                  <select
                    value={distanceEnd || ""}
                    onChange={(e) => setDistanceEnd(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                      isDarkMode
                        ? "bg-slate-900 border-white/15 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}>
                    <option value="">Select destination...</option>
                    {mapPins.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {distInfo && (
                <div className="p-3.5 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-xs space-y-1.5">
                  <p className="font-bold text-teal-950 dark:text-teal-200">
                    Calculated Distance: {distInfo.distKm} km
                  </p>
                  <div className="grid grid-cols-3 gap-1 text-[11px] text-teal-900 dark:text-teal-300">
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <span className="block text-[10px] opacity-70">
                        🚤 Boat:
                      </span>
                      <strong>~{distInfo.boatMins}m</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <span className="block text-[10px] opacity-70">
                        🏍️ Motor:
                      </span>
                      <strong>~{distInfo.habalMins}m</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <span className="block text-[10px] opacity-70">
                        🥾 Hike:
                      </span>
                      <strong>~{distInfo.hikeHours}h</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Island Distance & Route Calculator (on screens < lg) */}
      {!isFullscreen && (
        <div className="block lg:hidden">
          <div
            className={`p-5 rounded-3xl border space-y-3 backdrop-blur-xl ${
              isDarkMode
                ? "bg-[#061e2c]/90 border-white/20 text-slate-100"
                : "bg-white/90 border-slate-200 text-slate-900 shadow-sm"
            }`}>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Island Distance & Route Calculator
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  From Location
                </label>
                <select
                  value={distanceStart || ""}
                  onChange={(e) => setDistanceStart(e.target.value)}
                  className={`w-full min-h-[44px] p-2.5 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                    isDarkMode
                      ? "bg-slate-900 border-white/15 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}>
                  <option value="">Select origin...</option>
                  {mapPins.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  To Destination
                </label>
                <select
                  value={distanceEnd || ""}
                  onChange={(e) => setDistanceEnd(e.target.value)}
                  className={`w-full min-h-[44px] p-2.5 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                    isDarkMode
                      ? "bg-slate-900 border-white/15 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}>
                  <option value="">Select destination...</option>
                  {mapPins.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {distInfo && (
              <div className="p-3.5 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-xs space-y-1.5">
                <p className="font-bold text-teal-950 dark:text-teal-200">
                  Calculated Distance: {distInfo.distKm} km
                </p>
                <div className="grid grid-cols-3 gap-1 text-[11px] text-teal-900 dark:text-teal-300">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-center">
                    <span className="block text-[10px] opacity-70">
                      🚤 Boat
                    </span>
                    <strong>~{distInfo.boatMins}m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-teal-500/10 text-center">
                    <span className="block text-[10px] opacity-70">
                      🏍️ Motor
                    </span>
                    <strong>~{distInfo.habalMins}m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-teal-500/10 text-center">
                    <span className="block text-[10px] opacity-70">
                      🥾 Hike
                    </span>
                    <strong>~{distInfo.hikeHours}h</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Directory of Landmarks & Hiking Trails Below Map */}
      <div
        className={`p-6 rounded-3xl border backdrop-blur-xl ${
          isDarkMode
            ? "bg-slate-900/60 border-white/15 text-white"
            : "bg-white/85 border-slate-200 text-slate-900 shadow-sm"
        }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
              <Footprints className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Sibale Island Hiking & Trekking Routes Directory
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Select any trekking route below to center on the map, view the
              sample elevation profile. Navigation downloads are unavailable.
            </p>
          </div>

          {/* Difficulty filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["all", "easy", "moderate", "challenging"].map((diff) => (
              <button
                key={diff}
                onClick={() => setTrailDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  trailDifficultyFilter === diff
                    ? "bg-teal-500 text-slate-950 font-black shadow-sm"
                    : isDarkMode
                      ? "bg-white/5 text-slate-300 hover:bg-white/10"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}>
                {diff === "all" ? "All Difficulties" : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Trail Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrails.map((trail) => {
            const isSelected = selectedTrail?.id === trail.id;
            return (
              <div
                key={trail.id}
                onClick={() => {
                  handleSelectTrail(trail);
                  // smooth scroll to map
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`group rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between shadow-sm ${
                  isSelected
                    ? "border-teal-500 bg-teal-500/10 dark:bg-slate-900/90 ring-2 ring-teal-500/50 shadow-xl"
                    : isDarkMode
                      ? "border-white/10 bg-slate-900/60 hover:border-teal-500/50 hover:bg-slate-900/90"
                      : "border-slate-200 bg-white hover:border-teal-500/50 hover:shadow-md"
                }`}>
                <div>
                  {/* Photo Header */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={trail.image}
                      alt={trail.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/20" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        data-difficulty={trail.difficulty}
                        className="trail-difficulty-badge px-2.5 py-1 rounded-full uppercase shadow-md">
                        {trail.difficulty}
                      </span>
                      {trail.isPopular && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Top Trail
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-bold">
                      <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                        {trail.distanceKm} km
                      </span>
                      <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-teal-300">
                        Peak: {trail.peakElevationMeters}m
                      </span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-2.5">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors leading-snug">
                      {trail.name}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="truncate">{trail.barangay}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {trail.description}
                    </p>

                    {/* Highlights tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {trail.highlights.slice(0, 2).map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 dark:bg-white/10 dark:text-teal-200 dark:border-white/15">
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-white/5 mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Est: {trail.estimatedDuration}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTrail(trail);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-extrabold text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-white/10 transition-colors cursor-pointer">
                    <span>View on Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
