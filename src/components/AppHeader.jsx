import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function AppHeader({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
    closeMenu();
  }, [logout, navigate, closeMenu]);

  // close the menu on outside click
  useEffect(() => {
    function onClick(e) {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="app-header" ref={headerRef}>
      <div className="app-header-left">
        <button
          type="button"
          className="app-logo-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="app-logo">AidLink</span>
          <svg
            className={"app-logo-chevron" + (menuOpen ? " app-logo-chevron-open" : "")}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {title && <span className="app-header-title">{title}</span>}
      </div>

      {menuOpen && (
        <nav className="app-header-menu">
          <a href="/" onClick={closeMenu}>Home</a>
          <Link to="/browse" onClick={closeMenu}>Browse</Link>
          <Link to="/requests" onClick={closeMenu}>Requests</Link>
          <Link to="/donate" onClick={closeMenu}>Donate</Link>
          <Link to="/reviews" onClick={closeMenu}>Reviews</Link>
          {user?.role === "restaurant" && <Link to="/post-food" onClick={closeMenu}>Post food</Link>}
          {user && <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>}
          <div className="app-header-menu-divider" />
          {user ? (
            <div className="app-header-menu-account">
              <span className="app-header-user">
                {user.id}
                {user.role && <span className="app-header-role"> · {user.role}</span>}
              </span>
              <button type="button" onClick={handleLogout}>Log out</button>
            </div>
          ) : (
            <Link to="/" onClick={closeMenu}>Log in</Link>
          )}
        </nav>
      )}
    </header>
  );
}
