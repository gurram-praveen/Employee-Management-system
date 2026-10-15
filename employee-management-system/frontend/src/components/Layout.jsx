import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem('emsCredentials');
    navigate('/login', { replace: true });
  };

  return (
    <div className="app">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">K</span>
          <span className="brand-copy">
            <strong>KLOUDSPOT</strong>
            <span>EMPLOYEE MANAGEMENT</span>
          </span>
        </div>
        <div className="nav-section-label">WORKSPACE</div>
        <nav className="side-nav" onClick={() => setOpen(false)}>
          <NavLink to="/employees" end>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M8 9h10M8 13h10M8 17h5M6 9h.01M6 13h.01M6 17h.01" />
            </svg>
            <span>Employees</span>
          </NavLink>
          <NavLink to="/departments">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4" />
            </svg>
            <span>Departments</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="admin-avatar">A</div>
          <div className="admin-copy"><strong>Administrator</strong><span>Workspace access</span></div>
          <span className="online-dot" aria-label="Signed in" />
        </div>
      </aside>
      <div className="main">
        <header className="header">
          <button className="menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            &#9776;
          </button>
          <div className="header-context">
            <span>WORKSPACE</span>
            <h1>Employee Management System</h1>
          </div>
          <div className="header-actions">
            <Link to="/employees/new" className="btn btn-primary">
              <span aria-hidden="true">+</span> Add employee
            </Link>
            <button className="btn logout-btn" onClick={logout}>Log out</button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
