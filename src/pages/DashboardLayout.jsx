import { NavLink, Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader.jsx";

export default function DashboardLayout() {
  return (
    <div className="app-page">
      <AppHeader title="Dashboard" />
      <div className="app-container">
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => (isActive ? "dashboard-link dashboard-link-on" : "dashboard-link")}
            >
              Overview
            </NavLink>
            <NavLink
              to="/dashboard/posts"
              className={({ isActive }) => (isActive ? "dashboard-link dashboard-link-on" : "dashboard-link")}
            >
              My posts
            </NavLink>
          </aside>
          <div className="dashboard-content">
            {/* nested route renders here */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
