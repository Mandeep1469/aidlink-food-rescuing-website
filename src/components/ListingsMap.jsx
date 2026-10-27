import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// Load marker icons from a CDN instead of bundling them — avoids the
// well-known Leaflet + Vite broken-default-icon-path issue.
const foodIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const youIcon = L.divIcon({
  className: "you-marker",
  html: '<div class="you-marker-dot"></div>',
  iconSize: [16, 16],
});

export default function ListingsMap({ listings, userCoords }) {
  const center =
    userCoords ||
    (listings[0] ? { lat: listings[0].lat, lng: listings[0].lng } : { lat: 30.7333, lng: 76.7794 });

  return (
    <div className="listings-map-wrap">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "420px", width: "100%", borderRadius: "16px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={youIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {listings
          .filter((l) => typeof l.lat === "number" && typeof l.lng === "number")
          .map((l) => (
            <Marker key={l.id} position={[l.lat, l.lng]} icon={foodIcon}>
              <Popup>
                <strong>{l.title}</strong>
                <br />
                {l.restaurant}
                <br />
                <Link to={`/food/${l.id}`}>View details</Link>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
