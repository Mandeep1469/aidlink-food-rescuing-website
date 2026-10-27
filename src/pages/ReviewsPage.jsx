import { useState } from "react";
import AppHeader from "../components/AppHeader.jsx";
import { usePersistedList } from "../hooks/usePersistedList.js";

const MAX_REVIEW_LENGTH = 500;
const initialForm = { name: "", review: "" };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ReviewsPage() {
  // newest review first, saved in localStorage so it survives a refresh
  const [reviews, addReview] = usePersistedList("aidlink_reviews");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const submit = (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const review = form.review.trim();

    const nextErrors = {};
    if (!name) nextErrors.name = "Please enter your name";
    if (!review) nextErrors.review = "Please write a review";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    addReview({
      id: `review-${Date.now()}`,
      name,
      review,
      createdAt: new Date().toISOString(),
    });
    setForm(initialForm);
  };

  return (
    <div className="app-page">
      <AppHeader title="Reviews" />
      <div className="app-container app-container-narrow">
        <h1 className="post-form-title">Share your experience</h1>
        <p className="app-status">
          Tell others how AidLink worked for you — whether you gave, claimed, or
          collected food.
        </p>

        <form className="post-form" onSubmit={submit} noValidate>
          <label className="post-field">
            <span>Your name</span>
            <input
              value={form.name}
              onChange={update("name")}
              placeholder="e.g. Anjali S."
              maxLength={60}
            />
            {errors.name && <span className="post-field-error">{errors.name}</span>}
          </label>

          <label className="post-field">
            <span>Your review</span>
            <textarea
              rows={4}
              value={form.review}
              onChange={update("review")}
              placeholder="What went well? What could be better?"
              maxLength={MAX_REVIEW_LENGTH}
            />
            <span className="post-field-hint">
              {form.review.length}/{MAX_REVIEW_LENGTH}
            </span>
            {errors.review && <span className="post-field-error">{errors.review}</span>}
          </label>

          <button type="submit" className="listing-claim-btn post-submit">
            Submit review
          </button>
        </form>

        <h2 className="donations-list-title">
          What people are saying{reviews.length > 0 ? ` (${reviews.length})` : ""}
        </h2>

        {reviews.length === 0 ? (
          <p className="app-status">No reviews yet — be the first to share one.</p>
        ) : (
          <ul className="requests-list">
            {reviews.map((r) => (
              <li key={r.id} className="request-card review-card">
                <div className="review-card-top">
                  <span className="review-avatar" aria-hidden="true">
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <h3 className="review-name">{r.name}</h3>
                    <p className="listing-meta">{formatDate(r.createdAt)}</p>
                  </div>
                </div>
                <p className="detail-description review-text">{r.review}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
