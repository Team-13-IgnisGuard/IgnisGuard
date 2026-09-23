import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.png';

const Navbar = ({ onMenuToggle, showMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom py-2 sticky-top">
      <div className="container-fluid">
        {showMenuToggle && (
          <button
            className="btn d-lg-none border-0 me-2 p-0 d-flex align-items-center justify-content-center"
            type="button"
            onClick={onMenuToggle}
            aria-label="Toggle sidebar menu"
            style={{ width: '38px', height: '38px', color: 'var(--text-primary)', fontSize: '1.4rem' }}
          >
            <i className="bi bi-list"></i>
          </button>
        )}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img
            src={logo}
            alt="IgnisGuard"
            style={{ height: '2.1rem', width: 'auto', filter: 'drop-shadow(0 2px 6px rgba(255,95,37,0.3))' }}
          />
          <span className="display-font fs-4 fw-extrabold" style={{ color: 'var(--text-primary)' }}>Ignis<span style={{ color: 'var(--primary-color)' }}>Guard</span></span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ filter: theme === 'dark' ? 'invert(1)' : 'invert(0.1)' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            {!user ? (
              <>
                <li className="nav-item">
                  <a className="nav-link fw-semibold px-3 rounded-pill" style={{ color: 'var(--primary-color)', backgroundColor: 'rgba(255, 95, 37, 0.08)' }} href="#home">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link fw-semibold px-3 text-secondary" href="#about-us">About Us</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link fw-semibold px-3 text-secondary" href="#features">Features</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link fw-semibold px-3 text-secondary" href="#how-it-works">How It Works</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link fw-semibold px-3 text-secondary" href="#contact">Contact</a>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold px-3 text-secondary" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold px-3 text-secondary" to={`/${user.role.toLowerCase()}/dashboard`}>Dashboard</Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn d-flex align-items-center justify-content-center shadow-sm "
              type="button"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: theme === 'light' ? '#475569' : '#ff5f25',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-focus)';
                e.currentTarget.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {theme === 'light' ? (
                <i className="bi bi-moon-stars-fill" style={{ fontSize: '1.05rem' }}></i>
              ) : (
                <i className="bi bi-sun-fill" style={{ fontSize: '1.15rem' }}></i>
              )}
            </button>

            {user ? (
              <>
                {/* Merged profile card from sidebar */}
                <Link
                  to="/profile"
                  className="d-none d-md-flex align-items-center gap-2 px-2 py-1 rounded-4 text-decoration-none"
                  style={{
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 95, 37, 0.25)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Avatar with online dot */}
                  <div className="position-relative flex-shrink-0">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255, 95, 37, 0.08)', border: '1px solid rgba(255, 95, 37, 0.25)' }}>
                      <i className="bi bi-person-fill" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                    </div>
                    <span className="position-absolute bottom-0 end-0 bg-success border rounded-circle" style={{ width: '9px', height: '9px', borderColor: 'var(--bg-primary) !important' }}></span>
                  </div>
                  {/* Name + role */}
                  <div className="d-flex flex-column lh-1" style={{ whiteSpace: 'nowrap' }}>
                    <span className="fw-bold" style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : (() => {
                            const namePart = (user.email || '').split('@')[0];
                            return namePart.split(/[._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
                          })()
                      }
                    </span>
                    <span className="badge mt-1" style={{ fontSize: '0.55rem', border: '1px solid rgba(255,95,37,0.3)', color: 'var(--primary-color)', backgroundColor: 'rgba(255,95,37,0.08)', letterSpacing: '0.05em', textTransform: 'uppercase', width: 'fit-content' }}>
                      {user.role}
                    </span>
                  </div>
                </Link>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm px-3 rounded-pill d-flex align-items-center gap-2" style={{ border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626', background: 'transparent' }}>
                  <i className="bi bi-box-arrow-right"></i> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary rounded-pill px-4" 
                      style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  Login
                </Link>
                <Link to="/login" className="btn btn-gradient-primary rounded-pill px-4">Book Cylinder</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
