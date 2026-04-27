/**
 * EducationFinder — live search for education institutions using
 * the free OpenStreetMap Overpass API (no backend required).
 *
 * Gestures / UI:
 *  - Enter city/pincode → geocode with Nominatim → search Overpass API
 *  - "My Location" GPS → reverse geocode city name → search Overpass API
 *  - Radius selector (1 / 5 / 10 / 25 km)
 *  - Split panel: scrollable result list on the left, sticky map on the right
 *  - Click a card → fly map to that marker; click a marker → highlight card
 *  - "Directions" opens Google Maps with full route
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Search,
  ArrowLeft,
  Phone,
  Globe,
  ChevronRight,
  Loader2,
  Building2,
  Map,
} from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ── Fix Leaflet default-marker asset path ─────────────────────────────── */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ── Custom SVG pin markers ─────────────────────────────────────────────── */
function makePin(fill: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${fill}"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`;
  return L.divIcon({
    className: "",
    html: svg,
    iconSize:   [28, 40],
    iconAnchor: [14, 40],
    popupAnchor:[0, -42],
  });
}
const PIN_BLUE   = makePin("#2563eb");
const PIN_GREEN  = makePin("#16a34a");
const PIN_ORANGE = makePin("#ea580c");

/* ── Types ──────────────────────────────────────────────────────────────── */
interface Institution {
  id:       string;
  name:     string;
  address:  string;
  type:     string;
  lat:      number;
  lon:      number;
  distance: number;
  phone?:   string;
  website?: string;
}

export interface EducationFinderProps {
  category: "schools" | "colleges" | "coaching" | "skill-development";
}

/* ── Per-category configuration ─────────────────────────────────────────── */
const categoryConfig = {
  schools: {
    title:       "Schools for Special Needs",
    icon:        "🏫",
    description: "Find inclusive schools and special education institutions near you",
    gradient:    "from-blue-700 to-blue-900",
    // "school" is the standard OSM amenity tag for schools
    amenities:   ["school"],
  },
  colleges: {
    title:       "Colleges & Universities",
    icon:        "🎓",
    description: "Higher education institutions with accessibility and disability support",
    gradient:    "from-violet-700 to-purple-900",
    // "college" and "university" are the correct OSM amenity values
    amenities:   ["college", "university"],
  },
  coaching: {
    title:       "Coaching Centers",
    icon:        "📚",
    description: "Specialized coaching and tutoring services for competitive exams",
    gradient:    "from-emerald-700 to-teal-900",
    // OSM has no "tutoring_centre" tag — coaching centers in India are mapped
    // as school, language_school, or driving_school
    amenities:   ["school", "language_school", "driving_school"],
  },
  "skill-development": {
    title:       "Skill Development Centers",
    icon:        "🛠️",
    description: "Vocational training programs and certification courses",
    gradient:    "from-amber-600 to-orange-800",
    // OSM has no "training_centre" tag — vocational/polytechnic institutes
    // are tagged as college or university in OSM
    amenities:   ["college", "university"],
  },
} as const;

const RADIUS_OPTIONS = [
  { label: "1 km",  value: 1000  },
  { label: "5 km",  value: 5000  },
  { label: "10 km", value: 10000 },
  { label: "25 km", value: 25000 },
];

/* ── Helpers ────────────────────────────────────────────────────────────── */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildAddress(tags: Record<string, string>): string {
  if (tags["addr:full"]) return tags["addr:full"];
  const parts = [
    tags["addr:housenumber"] && tags["addr:street"]
      ? `${tags["addr:housenumber"]} ${tags["addr:street"]}`
      : tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"] || tags["addr:town"] || tags["addr:village"],
    tags["addr:postcode"],
  ].filter(Boolean);
  return parts.join(", ") || "Address not available";
}

/* ── Inner map helper: animates camera to a coordinate ─────────────────── */
function MapFlyTo({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 16, { animate: true, duration: 0.7 });
  }, [lat, lon, map]);
  return null;
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function EducationFinder({ category }: EducationFinderProps) {
  const navigate = useNavigate();
  const config   = categoryConfig[category];

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [locating,     setLocating]     = useState(false);
  const [query,        setQuery]        = useState("");
  const [radius,       setRadius]       = useState(5000);
  const [userLoc,      setUserLoc]      = useState<{ lat: number; lon: number } | null>(null);
  const [userCity,     setUserCity]     = useState("");
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [flyTarget,    setFlyTarget]    = useState<{ lat: number; lon: number } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  /* ── Overpass API search ──────────────────────────────────────────────── */
  const fetchInstitutions = useCallback(
    async (loc: { lat: number; lon: number }, rad: number) => {
      setLoading(true);
      setInstitutions([]);
      setSelectedId(null);

      const amenities = categoryConfig[category].amenities;

      // Build union of node + way + relation for each amenity value
      const amenityLines = amenities
        .flatMap(a => [
          `node["amenity"="${a}"](around:${rad},${loc.lat},${loc.lon});`,
          `way["amenity"="${a}"](around:${rad},${loc.lat},${loc.lon});`,
          `relation["amenity"="${a}"](around:${rad},${loc.lat},${loc.lon});`,
        ])
        .join("\n  ");

      // Also catch institutions tagged via building=school/college/university
      const buildingValues = (amenities as readonly string[])
        .filter(a => ["school", "college", "university"].includes(a))
        .flatMap(a => [
          `node["building"="${a}"](around:${rad},${loc.lat},${loc.lon});`,
          `way["building"="${a}"](around:${rad},${loc.lat},${loc.lon});`,
        ])
        .join("\n  ");

      const overpassQuery = `[out:json][timeout:30];
(
  ${amenityLines}
  ${buildingValues}
);
out center tags;`;

      try {
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body:   overpassQuery,
          headers: { "Content-Type": "text/plain" },
        });
        if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
        const data = await res.json();

        // Deduplicate by name + rounded coords (node and way can overlap)
        const seen = new Set<string>();

        const results: Institution[] = (data.elements as any[])
          .filter(el => el.tags?.name)
          .reduce<Institution[]>((acc, el) => {
            const lat = el.type === "node" ? el.lat : el.center?.lat;
            const lon = el.type === "node" ? el.lon : el.center?.lon;
            if (!lat || !lon) return acc;

            const key = `${el.tags.name}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
            if (seen.has(key)) return acc;
            seen.add(key);

            acc.push({
              id:       String(el.id),
              name:     el.tags.name as string,
              address:  buildAddress(el.tags as Record<string, string>),
              type:     (el.tags.amenity || el.tags.building || category) as string,
              lat,
              lon,
              distance: haversine(loc.lat, loc.lon, lat, lon),
              phone:    el.tags["contact:phone"] || el.tags["phone"],
              website:  el.tags["contact:website"] || el.tags["website"],
            });
            return acc;
          }, []);

        results.sort((a, b) => a.distance - b.distance);
        setInstitutions(results);

        if (results.length === 0) {
          toast.info("No institutions found. Try a wider radius.");
        } else {
          toast.success(`Found ${results.length} institution${results.length !== 1 ? "s" : ""}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [category],
  );

  /* ── GPS: get position → reverse geocode → search ────────────────────── */
  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserLoc(loc);
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lon}`,
            { headers: { "User-Agent": "DivyangConnect/1.0 (education-finder)" } },
          );
          const d = await r.json();
          const city =
            d.address?.city    ||
            d.address?.town    ||
            d.address?.village ||
            d.address?.county  ||
            "your location";
          setUserCity(city);
          setQuery(city);
        } catch {
          setUserCity("your location");
        }
        setLocating(false);
        await fetchInstitutions(loc, radius);
      },
      err => {
        setLocating(false);
        toast.error(err.message || "Could not get your location");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  /* ── City / pincode search ────────────────────────────────────────────── */
  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a city name or pincode");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { "User-Agent": "DivyangConnect/1.0 (education-finder)" } },
      );
      const data = await res.json();
      if (!data.length) {
        toast.error("Location not found. Try a different city or pincode.");
        setLoading(false);
        return;
      }
      const loc = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      setUserLoc(loc);
      setUserCity(data[0].display_name.split(",")[0]);
      await fetchInstitutions(loc, radius);
    } catch {
      toast.error("Location search failed. Please try again.");
      setLoading(false);
    }
  };

  /* ── Scroll selected card into view when selection changes ───────────── */
  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-id="${selectedId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const mapCenter: [number, number] = userLoc
    ? [userLoc.lat, userLoc.lon]
    : [20.5937, 78.9629]; // centre of India as default

  return (
    <div className="flex flex-col flex-1">

      {/* ── Gradient hero banner ─────────────────────────────────────────── */}
      <div className={`bg-gradient-to-br ${config.gradient} text-white shrink-0`}>
        <div className="container mx-auto px-4 pt-5 pb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-4xl">{config.icon}</span>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{config.title}</h1>
          </div>
          <p className="text-white/75 text-sm max-w-xl pb-4">{config.description}</p>
        </div>

        {/* ── Search bar ──────────────────────────────────────────────────── */}
        <div className="bg-black/20 border-t border-white/20">
          <div className="container mx-auto px-4 py-3 flex flex-wrap gap-2 items-center">

            {/* Text input + search button */}
            <div className="flex flex-1 min-w-[220px] gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
                <input
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/15 border border-white/25 text-white placeholder:text-white/55 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                  placeholder="Enter city name or pincode…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loading && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="shrink-0 px-4 py-2.5 rounded-lg bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 disabled:opacity-60 transition-colors flex items-center gap-1.5"
              >
                {loading && !locating
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Search className="h-4 w-4" />}
                Search
              </button>
            </div>

            {/* GPS button + radius selector */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleGPS}
                disabled={locating || loading}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-white/15 border border-white/25 text-white text-sm hover:bg-white/25 disabled:opacity-60 transition-colors whitespace-nowrap"
              >
                {locating
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Navigation className="h-4 w-4" />}
                <span className="hidden sm:inline">My Location</span>
              </button>

              <select
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="px-3 py-2.5 rounded-lg bg-white/15 border border-white/25 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
              >
                {RADIUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="text-gray-900 bg-white">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main split-panel area ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* ── Left panel: scrollable results list ──────────────────────── */}
        <div
          ref={listRef}
          className="w-full lg:w-[400px] xl:w-[440px] shrink-0 overflow-y-auto bg-white border-r border-gray-200"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {/* Status bar */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {loading
                ? "Searching…"
                : institutions.length > 0
                ? `${institutions.length} result${institutions.length !== 1 ? "s" : ""}${userCity ? ` near ${userCity}` : ""}`
                : userLoc
                ? "No results — try a wider radius"
                : "Use GPS or enter a city to search"}
            </span>
            {institutions.length > 0 && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> by distance
              </span>
            )}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="divide-y divide-gray-100 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-4 py-4 flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                    <div className="flex gap-2">
                      <div className="h-5 w-14 bg-gray-200 rounded-full" />
                      <div className="h-5 w-20 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results after search */}
          {!loading && institutions.length === 0 && userLoc && (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center text-gray-400">
              <Building2 className="w-14 h-14 mb-3 opacity-25" />
              <p className="font-semibold text-gray-600 mb-1">No institutions found</p>
              <p className="text-sm">Try increasing the radius or search in a nearby city.</p>
            </div>
          )}

          {/* Pre-search prompt */}
          {!loading && !userLoc && (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center text-gray-400">
              <MapPin className="w-14 h-14 mb-3 opacity-25" />
              <p className="font-semibold text-gray-600 mb-1">Find institutions near you</p>
              <p className="text-sm">Click "My Location" or type a city name above to get started.</p>
            </div>
          )}

          {/* Institution cards */}
          {!loading &&
            institutions.map(inst => (
              <InstitutionCard
                key={inst.id}
                institution={inst}
                isSelected={selectedId === inst.id}
                userLoc={userLoc}
                onClick={() => {
                  setSelectedId(inst.id);
                  setFlyTarget({ lat: inst.lat, lon: inst.lon });
                }}
              />
            ))}
        </div>

        {/* ── Right panel: sticky map ───────────────────────────────────── */}
        <div
          className="hidden lg:block flex-1 sticky top-0"
          style={{ height: "calc(100vh - 200px)" }}
        >
          <MapContainer
            center={mapCenter}
            zoom={userLoc ? 13 : 5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Fly to selected institution */}
            {flyTarget && <MapFlyTo lat={flyTarget.lat} lon={flyTarget.lon} />}

            {/* User location marker */}
            {userLoc && (
              <Marker position={[userLoc.lat, userLoc.lon]} icon={PIN_GREEN}>
                <Popup>
                  <strong>📍 Your location</strong>
                  {userCity && <><br /><span className="text-xs text-gray-500">{userCity}</span></>}
                </Popup>
              </Marker>
            )}

            {/* Institution markers */}
            {institutions.map(inst => (
              <Marker
                key={inst.id}
                position={[inst.lat, inst.lon]}
                icon={selectedId === inst.id ? PIN_ORANGE : PIN_BLUE}
                eventHandlers={{
                  click: () => {
                    setSelectedId(inst.id);
                    setFlyTarget({ lat: inst.lat, lon: inst.lon });
                  },
                }}
              >
                <Popup>
                  <strong className="text-sm">{inst.name}</strong><br />
                  <span className="text-xs text-gray-500">{inst.address}</span><br />
                  <span className="text-xs font-semibold text-blue-600">
                    {inst.distance.toFixed(1)} km away
                  </span>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Pre-search overlay */}
          {!userLoc && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none z-10">
              <div className="bg-white rounded-2xl px-6 py-5 text-center shadow-xl max-w-xs">
                <Map className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700 mb-1">Map ready</p>
                <p className="text-xs text-gray-400">Search to see institutions on the map</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Institution list card ─────────────────────────────────────────────── */
interface InstitutionCardProps {
  institution: Institution;
  isSelected:  boolean;
  userLoc:     { lat: number; lon: number } | null;
  onClick:     () => void;
}

function InstitutionCard({ institution: inst, isSelected, userLoc, onClick }: InstitutionCardProps) {
  return (
    <div
      data-id={inst.id}
      onClick={onClick}
      className={[
        "border-b border-gray-100 px-4 py-4 cursor-pointer transition-all duration-150",
        "border-l-4",
        isSelected
          ? "bg-blue-50 border-l-blue-600"
          : "border-l-transparent hover:bg-gray-50 hover:border-l-gray-200",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className="shrink-0 mt-0.5 w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Institution name */}
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 pr-2">
            {inst.name}
          </h3>

          {/* Address */}
          <p className="text-xs text-gray-500 flex items-start gap-1 mb-2">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />
            <span className="line-clamp-2">{inst.address}</span>
          </p>

          {/* Distance + type badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {inst.distance.toFixed(1)} km
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
              {inst.type.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <ChevronRight
          className={`w-4 h-4 shrink-0 mt-1 transition-transform duration-150 ${
            isSelected ? "rotate-90 text-blue-600" : "text-gray-300"
          }`}
        />
      </div>

      {/* Expanded action row */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-blue-100 flex flex-wrap gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1${
              userLoc ? `&origin=${userLoc.lat},${userLoc.lon}` : ""
            }&destination=${inst.lat},${inst.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <Navigation className="w-3 h-3" /> Directions
          </a>

          <a
            href={`https://www.openstreetmap.org/?mlat=${inst.lat}&mlon=${inst.lon}#map=17/${inst.lat}/${inst.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
          >
            <MapPin className="w-3 h-3" /> View Map
          </a>

          {inst.phone && (
            <a
              href={`tel:${inst.phone}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors"
            >
              <Phone className="w-3 h-3" /> Call
            </a>
          )}

          {inst.website && (
            <a
              href={inst.website.startsWith("http") ? inst.website : `https://${inst.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200 transition-colors"
            >
              <Globe className="w-3 h-3" /> Website
            </a>
          )}
        </div>
      )}
    </div>
  );
}