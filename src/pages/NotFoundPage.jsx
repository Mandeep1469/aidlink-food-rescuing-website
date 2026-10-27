import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="app-page">
      <div className="app-container app-container-narrow app-404">
        <h1>404</h1>
        <p>That page doesn't exist.</p>
        <Link to="/browse" className="listing-claim-btn">
          Back to Browse
        </Link>
      </div>
    </div>
  );
}
