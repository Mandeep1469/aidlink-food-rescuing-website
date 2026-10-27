import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { usePersistedList } from "../hooks/usePersistedList.js";
import { fetchRequests, makeRequestFromForm } from "../data/requests.js";

const initialForm = { title: "", location: "", urgency: "soon", description: "" };

const URGENCY_LABEL = {
  urgent: "Urgent",
  soon: "Needed soon",
  flexible: "Flexible",
};

export default function RequestsPage() {
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, addRequest] = usePersistedList("aidlink_posted_requests");
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [helpedIds, setHelpedIds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchRequests().then((data) => {
      if (!cancelled) {
        setRequests(data);
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
    if (!form.title.trim() || !form.location.trim()) return;
    const newRequest = makeRequestFromForm({ ...form, postedBy: user?.id });
    addRequest(newRequest);
    setRequests((prev) => [newRequest, ...prev]);
    setForm(initialForm);
    setShowForm(false);
  };

  const handleHelp = (id) => {
    setHelpedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="app-page">
      <AppHeader title="Community needs" />
      <div className="app-container app-container-narrow">
        <div className="requests-head">
          <div>
            <h1 className="post-form-title">Ask for what you need</h1>
            <p className="app-status">
              Anyone can post a need here — essentials, not just food — for
              others nearby to help with.
            </p>
          </div>
          {isAuthenticated ? (
            <button className="chip chip-on" onClick={() => setShowForm((s) => !s)}>
              {showForm ? "Cancel" : "Post a need"}
            </button>
          ) : (
            <p className="app-status">Log in to post a need.</p>
          )}
        </div>

        {showForm && (
          <form className="post-form post-form-compact" onSubmit={submit}>
            <label className="post-field">
              <span>What do you need?</span>
              <input value={form.title} onChange={update("title")} placeholder="e.g. Baby formula for a newborn" />
            </label>
            <label className="post-field">
              <span>Your location / area</span>
              <input value={form.location} onChange={update("location")} placeholder="e.g. Sector 14, Rajpura" />
            </label>
            <label className="post-field">
              <span>How urgent?</span>
              <select value={form.urgency} onChange={update("urgency")}>
                <option value="urgent">Urgent</option>
                <option value="soon">Needed soon</option>
                <option value="flexible">Flexible</option>
              </select>
            </label>
            <label className="post-field">
              <span>More detail (optional)</span>
              <textarea rows={3} value={form.description} onChange={update("description")} placeholder="Anything that helps someone respond" />
            </label>
            <button type="submit" className="listing-claim-btn post-submit">Post this need</button>
          </form>
        )}

        {loading && <p className="app-status">Loading requests…</p>}

        {!loading && (
          <ul className="requests-list">
            {requests.map((r) => (
              <li key={r.id} className="request-card">
                <div className="request-card-top">
                  <h3>{r.title}</h3>
                  <span className={"urgency-badge urgency-" + r.urgency}>
                    {URGENCY_LABEL[r.urgency] || r.urgency}
                  </span>
                </div>
                <p className="listing-meta">{r.postedBy} · {r.location}</p>
                {r.description && <p className="detail-description">{r.description}</p>}
                <button
                  className="listing-claim-btn"
                  disabled={helpedIds.includes(r.id)}
                  onClick={() => handleHelp(r.id)}
                >
                  {helpedIds.includes(r.id) ? "Thanks for offering! ✓" : "I can help"}
                </button>
                {helpedIds.includes(r.id) && (
                  <p className="thank-you-note">
                    🙏 Thank you for stepping up — {r.postedBy} will be notified that
                    someone nearby can help.
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
