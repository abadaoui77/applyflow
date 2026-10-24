import { Link, useLocation } from "react-router-dom";

function PageHeader({ onLogout, disabled = false }) {
  const { pathname } = useLocation();
  return (
    <header>
      <div>
        <strong>ApplyFlow</strong>
        <p>Votre recherche, organisée.</p>
      </div>
      <nav aria-label="Navigation principale">
        <Link to="/applications" aria-current={pathname === "/applications" ? "page" : undefined} onClick={disabled ? e => e.preventDefault() : undefined}>Candidatures</Link>
        <Link to="/dashboard" aria-current={pathname === "/dashboard" ? "page" : undefined} onClick={disabled ? e => e.preventDefault() : undefined}>Dashboard</Link>
        <Link to="/notifications" aria-current={pathname === "/notifications" ? "page" : undefined} onClick={disabled ? e => e.preventDefault() : undefined}>
          Notifications
        </Link>
        <button type="button" onClick={onLogout} disabled={disabled}>Déconnexion</button>
      </nav>
    </header>
  );
}
export default PageHeader;
