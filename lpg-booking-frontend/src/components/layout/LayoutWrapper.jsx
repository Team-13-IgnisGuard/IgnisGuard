import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const LayoutWrapper = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar onMenuToggle={() => setSidebarOpen((v) => !v)} showMenuToggle={!!user} />

      <div className="flex-grow-1 container-fluid p-0 d-flex">
        {user ? (
          <div className="row g-0 w-100">
            {/* Mobile-only backdrop — tapping it closes the drawer, same as tapping a link does */}
            {sidebarOpen && (
              <div
                className="sidebar-backdrop d-lg-none"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}
            {/* Sidebar Column — fixed/off-canvas drawer below lg, static column at lg+ */}
            <aside
              className={`col-12 col-lg-2 border-end sidebar-wrapper-custom ${sidebarOpen ? 'sidebar-open' : ''}`}
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </aside>
            {/* Main Content Column */}
            <main className="col-12 col-lg-10 p-4 p-md-5 overflow-auto animate-fade-in main-content-custom" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <div className="container-xxl p-0">
                {children}
              </div>
            </main>
          </div>
        ) : (
          <main className="flex-grow-1 d-flex flex-column p-4 animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="w-100">
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default LayoutWrapper;
