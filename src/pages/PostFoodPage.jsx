import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader.jsx";
import { usePersistedList } from "../hooks/usePersistedList.js";
import { makeListingFromForm } from "../data/listings.js";

const initialForm = {
  title: "",
  restaurant: "",
  address: "",
  packed: "packed",
  type: "veg",
  quantity: "",
  unit: "servings",
  expiresAt: "",
  pickupWindow: "",
  description: "",
};

export default function PostFoodPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [, addListing] = usePersistedList("aidlink_posted_listings");
  const navigate = useNavigate();

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = "Name the dish or item";
    if (!form.restaurant.trim()) errs.restaurant = "Enter your restaurant's name";
    if (!form.address.trim()) errs.address = "Enter a pickup address";
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = "Enter how much is available";
    if (!form.expiresAt.trim()) errs.expiresAt = "Say when this expires / must be used by";
    if (!form.pickupWindow.trim()) errs.pickupWindow = "Give a pickup window";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    const listing = await makeListingFromForm(form); // geocodes the address
    addListing(listing);
    navigate("/browse");
  };

  return (
    <div className="app-page">
      <AppHeader title="Post surplus food" />
      <div className="app-container app-container-narrow">
        <form className="post-form" onSubmit={submit}>
          <h1 className="post-form-title">What are you giving away?</h1>
          <p className="app-status">Fill this in whenever you have surplus food at closing.</p>

          <label className="post-field">
            <span>Dish / item name</span>
            <input
              value={form.title}
              onChange={update("title")}
              placeholder="e.g. Paneer butter masala + naan"
            />
            {errors.title && <span className="post-field-error">{errors.title}</span>}
          </label>

          <label className="post-field">
            <span>Restaurant name</span>
            <input
              value={form.restaurant}
              onChange={update("restaurant")}
              placeholder="Your restaurant's name"
            />
            {errors.restaurant && <span className="post-field-error">{errors.restaurant}</span>}
          </label>

          <label className="post-field">
            <span>Pickup address</span>
            <input
              value={form.address}
              onChange={update("address")}
              placeholder="e.g. Sector 17, Chandigarh"
            />
            {errors.address && <span className="post-field-error">{errors.address}</span>}
            <span className="post-field-hint">
              This gets converted into map coordinates automatically so it shows up in the right spot on Browse's map view.
            </span>
          </label>

          <div className="post-field-row">
            <label className="post-field">
              <span>Packed or unpacked?</span>
              <select value={form.packed} onChange={update("packed")}>
                <option value="packed">Packed (sealed / containers)</option>
                <option value="unpacked">Unpacked (loose / open trays)</option>
              </select>
            </label>

            <label className="post-field">
              <span>Veg or non-veg?</span>
              <select value={form.type} onChange={update("type")}>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-veg</option>
                <option value="both">Both (mixed)</option>
              </select>
            </label>
          </div>

          <div className="post-field-row">
            <label className="post-field">
              <span>Quantity</span>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={update("quantity")}
                placeholder="e.g. 12"
              />
              {errors.quantity && <span className="post-field-error">{errors.quantity}</span>}
            </label>

            <label className="post-field">
              <span>Unit</span>
              <select value={form.unit} onChange={update("unit")}>
                <option value="servings">Servings</option>
                <option value="plates">Plates</option>
                <option value="kg">Kilograms</option>
                <option value="trays">Trays</option>
              </select>
            </label>
          </div>

          <label className="post-field">
            <span>When does this expire / need to be used by?</span>
            <input
              value={form.expiresAt}
              onChange={update("expiresAt")}
              placeholder="e.g. Today, 9:30 PM"
            />
            {errors.expiresAt && <span className="post-field-error">{errors.expiresAt}</span>}
          </label>

          <label className="post-field">
            <span>Pickup window</span>
            <input
              value={form.pickupWindow}
              onChange={update("pickupWindow")}
              placeholder="e.g. 6:30 PM – 8:30 PM"
            />
            {errors.pickupWindow && <span className="post-field-error">{errors.pickupWindow}</span>}
          </label>

          <label className="post-field">
            <span>Anything else claimers should know?</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={update("description")}
              placeholder="Allergens, how it's packed, where to collect from, etc."
            />
          </label>

          <button type="submit" className="listing-claim-btn post-submit" disabled={submitting}>
            {submitting ? "Locating pickup address…" : "Post this listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
