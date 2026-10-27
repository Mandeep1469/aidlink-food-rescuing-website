import { useEffect, useState } from "react";

// Fallback center (Chandigarh) used if location access is denied or unavailable
const FALLBACK_COORDS = { lat: 30.7333, lng: 76.7794 };

/**
 * useGeolocation — asks the browser for the user's real position via the
 * Geolocation API. Falls back to a fixed city center if denied/unavailable,
 * so the map and distance calculations always have coordinates to work with.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [source, setSource] = useState("pending"); // pending | gps | fallback

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setCoords(FALLBACK_COORDS);
      setSource("fallback");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSource("gps");
      },
      () => {
        setCoords(FALLBACK_COORDS);
        setSource("fallback");
      },
      { timeout: 8000 }
    );
  }, []);

  return { coords, source };
}
