import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MOCK_LISTINGS } from "./data/listings.js";
import { getRestaurantAccounts } from "./utils/accounts.js";
import { haversineKm } from "./utils/geo.js";

// Chandigarh city center — used if there is nothing to fit the view to
const FALLBACK_CENTER = [30.7333, 76.7794];

/* ------------------------------------------------------------------ */
/*  Pins                                                               */
/* ------------------------------------------------------------------ */
function makePin(fill) {
  return L.divIcon({
    className: "map-pin-wrap",
    html:
      '<svg width="28" height="35" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M12 .75C5.7.75.75 5.7.75 11.7c0 7.6 11.25 17.55 11.25 17.55S23.25 19.3 23.25 11.7C23.25 5.7 18.3.75 12 .75z" fill="' +
      fill +
      '" stroke="#fff" stroke-width="1.5"/>' +
      '<circle cx="12" cy="11.7" r="4.4" fill="#fff"/>' +
      "</svg>",
    iconSize: [28, 35],
    iconAnchor: [14, 35],
    popupAnchor: [0, -32],
  });
}

const livePin = makePin("#1F4D3A"); // restaurant has food available now
const idlePin = makePin("#8DB3A2"); // registered, nothing listed right now

const youIcon = L.divIcon({
  className: "map-you-wrap",
  html: '<div class="map-you-dot"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/* ------------------------------------------------------------------ */
/*  Visitor location (asked for only when a distance is chosen)       */
/* ------------------------------------------------------------------ */
let userLoc = null; // { lat, lng, fallback }
let locationPromise = null;

function getLocation() {
  if (locationPromise) return locationPromise;
  locationPromise = new Promise((resolve) => {
    const useFallback = () =>
      resolve({ lat: FALLBACK_CENTER[0], lng: FALLBACK_CENTER[1], fallback: true });
    if (!("geolocation" in navigator)) return useFallback();
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, fallback: false }),
      useFallback,
      { timeout: 8000 }
    );
  });
  return locationPromise;
}

/* ------------------------------------------------------------------ */
/*  Data: one entry per restaurant                                     */
/* ------------------------------------------------------------------ */
function getPostedListings() {
  try {
    return JSON.parse(window.localStorage.getItem("aidlink_posted_listings") || "[]");
  } catch {
    return [];
  }
}

const keyOf = (name) => String(name || "").trim().toLowerCase();
const hasCoords = (o) => typeof o.lat === "number" && typeof o.lng === "number";

/**
 * Every restaurant AidLink knows about, de-duplicated by name:
 *  - restaurants behind a live listing (sample data + anything posted from this browser)
 *  - restaurants that registered an account (pinned from the location they signed up with)
 */
function collectRestaurants() {
  const byKey = new Map();

  [...getPostedListings(), ...MOCK_LISTINGS].forEach((l) => {
    if (!l.restaurant || !hasCoords(l)) return;
    const key = keyOf(l.restaurant);
    if (!byKey.has(key)) {
      byKey.set(key, {
        name: l.restaurant,
        address: l.address,
        lat: l.lat,
        lng: l.lng,
        foodType: "",
        types: new Set(),
        listings: [],
      });
    }
    const r = byKey.get(key);
    r.listings.push(l);
    if (l.type) r.types.add(l.type);
  });

  getRestaurantAccounts().forEach((a) => {
    if (!hasCoords(a)) return; // location couldn't be found at signup
    const existing = byKey.get(keyOf(a.name));
    if (existing) {
      existing.foodType = a.foodType || existing.foodType;
      existing.address = existing.address || a.location;
    } else {
      byKey.set(keyOf(a.name), {
        name: a.name,
        address: a.location,
        lat: a.lat,
        lng: a.lng,
        foodType: a.foodType || "",
        types: new Set(),
        listings: [],
      });
    }
  });

  return [...byKey.values()];
}

function foodLabel(r) {
  const stated = r.foodType.toLowerCase();
  if (stated === "veg") return "Veg";
  if (stated === "non-veg") return "Non-veg";
  if (stated === "both") return "Veg & non-veg";

  const veg = r.types.has("veg") || r.types.has("both");
  const nonVeg = r.types.has("non-veg") || r.types.has("both");
  if (veg && nonVeg) return "Veg & non-veg";
  if (veg) return "Veg";
  if (nonVeg) return "Non-veg";
  return "";
}

/* ------------------------------------------------------------------ */
/*  Popup — built from DOM nodes so posted text can't inject markup    */
/* ------------------------------------------------------------------ */
function node(tag, text, className) {
  const n = document.createElement(tag);
  if (text) n.textContent = text;
  if (className) n.className = className;
  return n;
}

function buildPopup(r) {
  const wrap = node("div");
  wrap.append(node("strong", r.name));

  if (r.address) wrap.append(node("div", r.address, "map-popup-muted"));
  if (r.distanceKm != null) {
    const from = userLoc && userLoc.fallback ? " km from city center" : " km from you";
    wrap.append(node("div", r.distanceKm.toFixed(1) + from, "map-popup-muted"));
  }
  const food = foodLabel(r);
  if (food) wrap.append(node("div", "Serves: " + food, "map-popup-muted"));

  if (r.listings.length === 0) {
    wrap.append(node("div", "No food listed right now.", "map-popup-note"));
    return wrap;
  }

  wrap.append(
    node(
      "div",
      r.listings.length + (r.listings.length === 1 ? " listing available:" : " listings available:"),
      "map-popup-note"
    )
  );
  const list = node("ul", "", "map-popup-list");
  r.listings.slice(0, 4).forEach((l) => {
    const li = node("li");
    const a = node("a", l.title);
    a.href = "/app.html#/food/" + encodeURIComponent(l.id);
    li.append(a);
    list.append(li);
  });
  wrap.append(list);

  if (r.listings.length > 4) {
    const more = node("a", "+" + (r.listings.length - 4) + " more");
    more.href = "/app.html#/browse";
    wrap.append(more);
  }
  return wrap;
}

/* ------------------------------------------------------------------ */
/*  Map                                                                */
/* ------------------------------------------------------------------ */
const ICON_MAXIMIZE =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5"/><path d="M3 3l6 6"/><path d="M16 3h5v5"/><path d="M21 3l-6 6"/><path d="M8 21H3v-5"/><path d="M3 21l6-6"/><path d="M16 21h5v-5"/><path d="M21 21l-6-6"/></svg>';
const ICON_MINIMIZE =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3v6H3"/><path d="M3 9l6-6"/><path d="M15 3v6h6"/><path d="M21 9l-6-6"/><path d="M9 21v-6H3"/><path d="M3 15l6 6"/><path d="M15 21v-6h6"/><path d="M21 15l-6 6"/></svg>';

function initLandingMap() {
  const el = document.getElementById("landingMap");
  if (!el) return;
  const card = el.closest(".map-card");

  const restaurants = collectRestaurants();
  const map = L.map(el, { scrollWheelZoom: false }).setView(FALLBACK_CENTER, 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const markerLayer = L.layerGroup().addTo(map);
  const entries = restaurants.map((r) => ({
    r,
    marker: L.marker([r.lat, r.lng], {
      icon: r.listings.length ? livePin : idlePin,
      title: r.name,
      alt: r.name,
    }).bindPopup(() => buildPopup(r)), // built on open, so it can include the distance
  }));
  entries.forEach((e) => markerLayer.addLayer(e.marker));

  const fitAll = () => {
    if (!restaurants.length) return;
    map.fitBounds(L.latLngBounds(restaurants.map((r) => [r.lat, r.lng])), {
      padding: [40, 40],
      maxZoom: 14,
    });
  };
  fitAll();

  /* ---- maximize / minimize ---- */
  let maximized = false;
  let maxBtn = null;

  function refreshButton() {
    if (!maxBtn) return;
    maxBtn.innerHTML = maximized ? ICON_MINIMIZE : ICON_MAXIMIZE;
    const label = maximized ? "Exit full screen" : "Maximize map";
    maxBtn.setAttribute("aria-label", label);
    maxBtn.setAttribute("aria-pressed", String(maximized));
    maxBtn.title = label;
  }

  function setMaximized(next) {
    maximized = next;
    if (card) card.classList.toggle("is-maximized", next);
    document.documentElement.classList.toggle("map-locked", next);

    // nothing to protect from page-scroll once the map fills the screen
    if (next) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();

    refreshButton();
    // let layout settle, then tell Leaflet its container changed size
    requestAnimationFrame(() => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 250);
  }

  const MaximizeControl = L.Control.extend({
    options: { position: "topright" },
    onAdd() {
      const bar = L.DomUtil.create("div", "leaflet-bar");
      maxBtn = L.DomUtil.create("button", "map-max-btn", bar);
      maxBtn.type = "button";
      L.DomEvent.disableClickPropagation(bar);
      maxBtn.addEventListener("click", () => setMaximized(!maximized));
      refreshButton();
      return bar;
    },
  });
  new MaximizeControl().addTo(map);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && maximized) setMaximized(false);
  });

  // Don't hijack page scrolling: wheel-zoom only turns on once the map is clicked
  map.on("click", () => map.scrollWheelZoom.enable());
  map.on("mouseout", () => {
    if (!maximized) map.scrollWheelZoom.disable();
  });

  /* ---- distance filter (All / 2 / 5 / 10 km) ---- */
  const count = document.getElementById("mapCount");
  const note = document.getElementById("mapRadiusNote");
  const chips = [...document.querySelectorAll(".map-chip")];
  const setCount = (t) => { if (count) count.textContent = t; };
  const setNote = (t) => { if (note) note.textContent = t; };
  const plural = (n, word) => n + " " + word + (n === 1 ? "" : "s");
  const liveCount = (list) => list.filter((r) => r.listings.length).length;

  let youMarker = null;
  let circle = null;
  let requestId = 0;

  function summaryAll() {
    setCount(
      restaurants.length
        ? plural(restaurants.length, "restaurant") +
            " on the map · " +
            liveCount(restaurants) +
            " with food available now"
        : "No restaurants on the map yet."
    );
  }

  function showYou(loc) {
    if (youMarker) {
      youMarker.setLatLng([loc.lat, loc.lng]);
      return;
    }
    youMarker = L.marker([loc.lat, loc.lng], {
      icon: youIcon,
      title: "You are here",
      zIndexOffset: 1000,
    })
      .addTo(map)
      .bindPopup(loc.fallback ? "Chandigarh city center (your location wasn't available)" : "You are here");
  }

  async function applyRadius(km) {
    const myRequest = ++requestId;
    chips.forEach((c) => {
      const on = Number(c.dataset.radius) === km;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", String(on));
    });
    map.closePopup();

    if (km === 0) {
      if (circle) { map.removeLayer(circle); circle = null; }
      entries.forEach((e) => markerLayer.addLayer(e.marker));
      setNote("");
      summaryAll();
      fitAll();
      return;
    }

    setNote("Finding your location…");
    const loc = await getLocation();
    if (myRequest !== requestId) return; // a newer choice replaced this one
    userLoc = loc;

    restaurants.forEach((r) => {
      r.distanceKm = haversineKm(loc.lat, loc.lng, r.lat, r.lng);
    });
    showYou(loc);

    if (circle) map.removeLayer(circle);
    circle = L.circle([loc.lat, loc.lng], {
      radius: km * 1000,
      color: "#1F4D3A",
      weight: 1.5,
      fillColor: "#4F8F75",
      fillOpacity: 0.1,
      interactive: false,
    }).addTo(map);

    const inside = entries.filter((e) => e.r.distanceKm <= km);
    entries.forEach((e) =>
      inside.includes(e) ? markerLayer.addLayer(e.marker) : markerLayer.removeLayer(e.marker)
    );
    map.fitBounds(circle.getBounds(), { padding: [24, 24] });

    setNote(loc.fallback ? "Location unavailable — measuring from Chandigarh city center." : "");

    if (inside.length) {
      setCount(
        plural(inside.length, "restaurant") +
          " within " +
          km +
          " km · " +
          liveCount(inside.map((e) => e.r)) +
          " with food available now"
      );
    } else {
      const nearest = restaurants.slice().sort((a, b) => a.distanceKm - b.distanceKm)[0];
      setCount(
        "No restaurants within " +
          km +
          " km" +
          (nearest
            ? " — the nearest is " + nearest.name + ", " + nearest.distanceKm.toFixed(1) + " km away."
            : ".")
      );
    }
  }

  chips.forEach((c) => {
    c.setAttribute("aria-pressed", String(c.classList.contains("is-on")));
    c.addEventListener("click", () => applyRadius(Number(c.dataset.radius)));
  });

  summaryAll();

  // The map sits far down the page; make sure it measures itself once layout settles
  window.addEventListener("load", () => map.invalidateSize());
}

initLandingMap();
