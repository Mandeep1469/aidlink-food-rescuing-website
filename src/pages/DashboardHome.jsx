import { useAuth } from "../hooks/useAuth.js";

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Welcome{user ? `, ${user.id}` : ""}</h2>
      <p className="app-status">
        This is your AidLink dashboard. Use the sidebar to see the listings
        you've posted, or head back to Browse to claim more surplus food.
      </p>
      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <strong>3</strong>
          <span>Active listings</span>
        </div>
        <div className="dashboard-stat">
          <strong>14</strong>
          <span>Meals rescued</span>
        </div>
        <div className="dashboard-stat">
          <strong>4.8</strong>
          <span>Trust rating</span>
        </div>
      </div>
    </div>
  );
}
