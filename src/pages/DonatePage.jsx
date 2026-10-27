import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { usePersistedList } from "../hooks/usePersistedList.js";
import { fetchDonations, makeDonationFromForm } from "../data/donations.js";

const initialForm = {
  item: "",
  category: "clothing",
  quantity: "",
  pickupOrDrop: "drop",
};

const CATEGORY_LABEL = {
  clothing: "Clothing",
  hygiene: "Hygiene & essentials",
  education: "Education supplies",
  household: "Household items",
  other: "Other",
};

export default function DonatePage() {
  const { user, isAuthenticated } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, addDonation] = usePersistedList("aidlink_posted_donations");
  const [form, setForm] = useState(initialForm);
  const [claimedIds, setClaimedIds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchDonations().then((data) => {
      if (!cancelled) {
        setDonations(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.item.trim() || !form.quantity.trim()) return;
    const newDonation = makeDonationFromForm({
      ...form,
      donatedBy: user?.id,
      pickupOrDrop:
        form.pickupOrDrop === "drop"
          ? "Can drop off at any partner NGO"
          : "Needs pickup from home",
    });
    addDonation(newDonation);
    setDonations((prev) => [newDonation, ...prev]);
    setForm(initialForm);
  };

  const handleClaim = (id) => {
    setClaimedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="app-page">
      <AppHeader title="Donate essentials" />
      <div className="app-container app-container-narrow">
        <h1 className="post-form-title">Donate something other than food</h1>
        <p className="app-status">
          Clothes, hygiene items, school supplies, or any other everyday
          essentials — offer them directly to NGOs on AidLink.
        </p>

        {isAuthenticated ? (
          <form className="post-form post-form-compact" onSubmit={submit}>
            <label className="post-field">
              <span>What are you donating?</span>
              <input value={form.item} onChange={update("item")} placeholder="e.g. Winter jackets, size M–L" />
            </label>
            <label className="post-field">
              <span>Category</span>
              <select value={form.category} onChange={update("category")}>
                <option value="clothing">Clothing</option>
                <option value="hygiene">Hygiene & essentials</option>
                <option value="education">Education supplies</option>
                <option value="household">Household items</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="post-field">
              <span>Quantity</span>
              <input value={form.quantity} onChange={update("quantity")} placeholder="e.g. 3 jackets" />
            </label>
            <label className="post-field">
              <span>Pickup or drop-off?</span>
              <select value={form.pickupOrDrop} onChange={update("pickupOrDrop")}>
                <option value="drop">I can drop it off at an NGO</option>
                <option value="pickup">I need it picked up</option>
              </select>
            </label>
            <button type="submit" className="listing-claim-btn post-submit">Offer this donation</button>
          </form>
        ) : (
          <p className="app-status">Log in to offer a donation.</p>
        )}

        <h2 className="donations-list-title">Current offers</h2>
        {loading && <p className="app-status">Loading offers…</p>}
        {!loading && (
          <ul className="requests-list">
            {donations.map((d) => (
              <li key={d.id} className="request-card">
                <div className="request-card-top">
                  <h3>{d.item}</h3>
                  <span className="urgency-badge urgency-flexible">
                    {CATEGORY_LABEL[d.category] || d.category}
                  </span>
                </div>
                <p className="listing-meta">{d.donatedBy} · {d.quantity}</p>
                <p className="detail-description">{d.pickupOrDrop}</p>
                <button
                  className="listing-claim-btn"
                  disabled={claimedIds.includes(d.id)}
                  onClick={() => handleClaim(d.id)}
                >
                  {claimedIds.includes(d.id) ? "Thanks — claimed! ✓" : "Claim for my NGO"}
                </button>
                {claimedIds.includes(d.id) && (
                  <p className="thank-you-note">
                    🙏 Thank you for coordinating this pickup — {d.donatedBy} will be
                    notified.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
