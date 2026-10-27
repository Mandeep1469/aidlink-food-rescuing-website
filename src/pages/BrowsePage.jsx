import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader.jsx";
import ListingsMap from "../components/ListingsMap.jsx";
import { fetchListings } from "../data/listings.js";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { useAuth } from "../hooks/useAuth.js";
import { haversineKm } from "../utils/geo.js";
import defaultFoodImage from "../assets/default-food-listing.svg";

export default function BrowsePage() {
  const { coords, source } = useGeolocation();
  const { user, isAuthenticated } = useAuth();
  const isRestaurant = user?.role === "restaurant";

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | veg | non-veg
  const [view, setView] = useState("list"); // list | map
  const [claimedIds, setClaimedIds] = useState([]);

  // useEffect + async/await fetch on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchListings();
        if (!cancelled) setListings(data);
      } catch (err) {
        if (!cancelled) setError("Couldn't load listings. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // useCallback: stable handler passed down to each card's button
  const handleClaim = useCallback((id) => {
    if (isRestaurant || !isAuthenticated) return;
    setClaimedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, [isRestaurant, isAuthenticated]);

  // Real distance from the user's actual (or fallback) location to each
  // listing, via the Haversine formula — replaces the old hardcoded numbers.
  const listingsWithDistance = useMemo(() => {
    if (!coords) return listings.map((l) => ({ ...l, distanceKm: null }));
    return listings.map((l) => ({
      ...l,
      distanceKm:
        typeof l.lat === "number" && typeof l.lng === "number"
          ? haversineKm(coords.lat, coords.lng, l.lat, l.lng)
          : null,
    }));
  }, [listings, coords]);

  const visibleListings = (
    filter === "all"
      ? listingsWithDistance
      : listingsWithDistance.filter((l) => l.type === filter)
  ).sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  // Real numbers derived from the current listings — not tracked history,
  // just what's actually live right now (no backend to log rescues over time yet).
  const stats = useMemo(() => {
    return {
      listingsLive: listings.length,
      mealsAvailable: listings.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0),
      restaurantsActive: new Set(listings.map((l) => l.restaurant)).size,
    };
  }, [listings]);

  return (
    <div className="app-page">
      <AppHeader title="Browse listings" />

      <div className="app-container">
        {!loading && !error && (
          <div className="impact-strip">
            <div className="impact-stat">
              <strong>{stats.listingsLive}</strong>
              <span>Listings live now</span>
            </div>
            <div className="impact-stat">
              <strong>{stats.mealsAvailable}</strong>
              <span>Meals up for grabs</span>
            </div>
            <div className="impact-stat">
              <strong>{stats.restaurantsActive}</strong>
              <span>Restaurants active</span>
            </div>
          </div>
        )}

        {source === "fallback" && (
          <p className="app-status app-status-note">
            Location access wasn't available, so distances are estimated from Chandigarh's city center instead of your exact location.
          </p>
        )}

        {isRestaurant && (
          <p className="app-status app-status-note">
            You're logged in as a restaurant — restaurants post surplus food rather than claim it. Head to Post food to list something.
          </p>
        )}

        {!isAuthenticated && (
          <p className="app-status app-status-note">
            You're browsing as a guest — <Link to="/">log in</Link> to claim a listing.
          </p>
        )}

        <div className="app-filters">
          <button className={filter === "all" ? "chip chip-on" : "chip"} onClick={() => setFilter("all")}>All</button>
          <button className={filter === "veg" ? "chip chip-on" : "chip"} onClick={() => setFilter("veg")}>Veg</button>
          <button className={filter === "non-veg" ? "chip chip-on" : "chip"} onClick={() => setFilter("non-veg")}>Non-veg</button>
          <span className="app-filters-spacer" />
          <button className={view === "list" ? "chip chip-on" : "chip"} onClick={() => setView("list")}>List</button>
          <button className={view === "map" ? "chip chip-on" : "chip"} onClick={() => setView("map")}>Map</button>
        </div>

        {loading && <p className="app-status">Loading nearby listings…</p>}
        {error && <p className="app-status app-status-error">{error}</p>}

        {!loading && !error && visibleListings.length === 0 && (
          <p className="app-status">No listings match that filter right now.</p>
        )}

        {!loading && !error && visibleListings.length > 0 && view === "map" && (
          <ListingsMap listings={visibleListings} userCoords={coords} />
        )}

        {!loading && !error && visibleListings.length > 0 && view === "list" && (
          <div className="listing-cards">
            {visibleListings.map((listing) => (
              <div className="listing-card-visual" key={listing.id}>
                <div className="listing-card-visual-image">
                  <img
                    src={listing.image || defaultFoodImage}
                    alt={listing.title}
                    onError={(event) => {
                      if (event.currentTarget.src !== defaultFoodImage) {
                        event.currentTarget.src = defaultFoodImage;
                      }
                    }}
                  />
                </div>

                <div className="listing-card-visual-body">
                  <h3>
                    <Link to={`/food/${listing.id}`}>{listing.title}</Link>
                  </h3>
                  <p className="listing-meta">
                    {listing.restaurant}
                    {listing.distanceKm != null ? ` · ${listing.distanceKm.toFixed(1)} km away` : ""}
                  </p>
                  <p className="listing-meta">
                    {listing.packed ? "Packed" : "Unpacked"} · {listing.type} · {listing.quantity} {listing.unit}
                  </p>
                  <p className="listing-meta">Expires: {listing.expiresAt}</p>
                  <p className="listing-meta">Pickup: {listing.pickupWindow}</p>

                  {!isAuthenticated ? (
                    <Link to="/" className="listing-claim-btn">
                      Log in to claim
                    </Link>
                  ) : isRestaurant ? (
                    <button className="listing-claim-btn" disabled>
                      Restaurants can't claim
                    </button>
                  ) : (
                    <button
                      className="listing-claim-btn"
                      disabled={claimedIds.includes(listing.id)}
                      onClick={() => handleClaim(listing.id)}
                    >
                      {claimedIds.includes(listing.id) ? "Claimed ✓" : "Claim"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
