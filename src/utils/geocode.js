/**
 * geocodeAddress — looks up real coordinates for a free-text address using
 * OpenStreetMap's Nominatim API (free, no API key required).
 * Returns { lat, lng } on success, or null if nothing was found / the
 * request failed (callers should fall back to an approximate location).
 */
export async function geocodeAddress(address) {
  if (!address || !address.trim()) return null;

  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
    encodeURIComponent(address);

  // give up after 6s so a slow lookup never leaves a form stuck waiting
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const results = await res.json();
    if (!results.length) return null;
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
