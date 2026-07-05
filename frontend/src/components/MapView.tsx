import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useRouteStore } from "../store/routeStore";

// Fix Leaflet default marker icons under Vite's bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons
const originIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "origin-marker",
});

const destIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "dest-marker",
});

/**
 * Child component inside MapContainer that auto-fits bounds
 * whenever the routes change — solves the zoom problem.
 */
function FitBounds() {
  const map = useMap();
  const { fastest, safe } = useRouteStore();

  useEffect(() => {
    const allCoords: [number, number][] = [];
    if (fastest) allCoords.push(...fastest.coordinates);
    if (safe) allCoords.push(...safe.coordinates);

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [fastest, safe, map]);

  return null;
}

export default function MapView() {
  const { fastest, safe, selectedRoute } = useRouteStore();

  // When a route is selected, highlight it and dim the other
  const isSafeSelected = selectedRoute === "safe";
  const isFastSelected = selectedRoute === "fastest";

  const fastOptions = {
    color: "#3b82f6",
    weight: isFastSelected ? 7 : isSafeSelected ? 4 : 6,
    opacity: isSafeSelected ? 0.35 : 0.85,
  };

  const safeOptions = {
    color: "#ec4899",
    weight: isSafeSelected ? 7 : isFastSelected ? 4 : 5,
    opacity: isFastSelected ? 0.35 : 0.95,
    dashArray: isSafeSelected ? undefined : "8 6",
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200/60 shadow-lg shadow-gray-200/50">
      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={12}
        style={{ height: "60vh", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FitBounds />
        {fastest && <Polyline positions={fastest.coordinates} pathOptions={fastOptions} />}
        {safe && <Polyline positions={safe.coordinates} pathOptions={safeOptions} />}
        {fastest && <Marker position={fastest.coordinates[0]} icon={originIcon} />}
        {fastest && (
          <Marker
            position={fastest.coordinates[fastest.coordinates.length - 1]}
            icon={destIcon}
          />
        )}
      </MapContainer>
    </div>
  );
}
