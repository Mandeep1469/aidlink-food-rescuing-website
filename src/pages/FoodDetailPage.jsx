import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppHeader from "../components/AppHeader.jsx";
import ListingsMap from "../components/ListingsMap.jsx";
import { fetchListings } from "../data/listings.js";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { useAuth } from "../hooks/useAuth.js";
import { haversineKm } from "../utils/geo.js";

export default function FoodDetailPage() {
  const { id } = useParams(); // dynamic route param
  const { coords } = useGeolocation();
  const { user, isAuthenticated } = useAuth();
  const isRestaurant = user?.role === "restaurant";
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetchListings().then((data) => {
      if (cancelled) return;
      const match = data.find((l) => l.id === id);
      if (match) {
        setListing(match);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const distanceKm =
    listing && coords && typeof listing.lat === "number" && typeof listing.lng === "number"
      ? haversineKm(coords.lat, coords.lng, listing.lat, listing.lng)
      : null;

  return (
    <div className="app-page">
      <AppHeader title="Listing detail" />
      <div className="app-container app-container-narrow">
        <Link to="/browse" className="app-back-link">
          ← Back to browse
        </Link>

        {loading && <p className="app-status">Loading listing…</p>}

        {!loading && notFound && (
          <p className="app-status app-status-error">
            No listing found with id "{id}".
          </p>
        )}

        {!loading && listing && (
          <div className="detail-card">
            <h1>{listing.title}</h1>
            <p className="listing-meta">
              {listing.restaurant}
              {listing.address ? ` · ${listing.address}` : ""}
              {distanceKm != null ? ` · ${distanceKm.toFixed(1)} km away` : ""}
            </p>
            <p className="listing-meta">
              {listing.packed ? "Packed" : "Unpacked"} · {listing.type} · {listing.quantity} {listing.unit}
            </p>
            <p className="listing-meta">Expires: {listing.expiresAt}</p>
            <p className="listing-meta">Pickup window: {listing.pickupWindow}</p>
            <p className="detail-description">{listing.description}</p>
            {!isAuthenticated ? (
              <>
                <Link to="/" className="listing-claim-btn">Log in to claim</Link>
                <p className="post-field-hint">You need to be logged in to claim a listing.</p>
              </>
            ) : isRestaurant ? (
              <>
                <button className="listing-claim-btn" disabled>Restaurants can't claim</button>
                <p className="post-field-hint">Restaurants post surplus food rather than claim it.</p>
              </>
            ) : (
              <button className="listing-claim-btn">Claim this listing</button>
            )}

            {typeof listing.lat === "number" && typeof listing.lng === "number" && (
              <div className="detail-map">
                <ListingsMap listings={[listing]} userCoords={coords} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
