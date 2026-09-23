import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ onNavigate }) => {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  const linksByRole = {
    Customer: [
      { path: '/customer/dashboard', label: 'Dashboard', icon: 'bi-grid-fill' },
      { path: '/customer/complete-profile', label: 'Complete Profile', icon: 'bi-person-plus-fill' },
      { path: '/profile', label: 'My Profile', icon: 'bi-person-badge-fill' },
      { path: '/customer/book', label: 'Book Cylinder', icon: 'bi-bag-plus-fill' },
      { path: '/customer/history', label: 'Booking History', icon: 'bi-clock-history' },
      { path: '/customer/complaints', label: 'My Complaints', icon: 'bi-flag-fill' },
      { path: '/customer/p2p-transfer', label: 'Neighbor Transfer', icon: 'bi-people-fill' },
    ],
    Distributor: [
      { path: '/distributor/dashboard', label: 'Dashboard', icon: 'bi-grid-fill' },
      { path: '/profile', label: 'My Profile', icon: 'bi-person-badge-fill' },
      { path: '/distributor/bookings', label: 'Bookings Queue', icon: 'bi-list-task' },
      { path: '/distributor/agents', label: 'Manage Agents', icon: 'bi-people-fill' },
      { path: '/distributor/cylinders', label: 'Cylinder Tracking', icon: 'bi-qr-code-scan' },
    ],
    DeliveryAgent: [
      { path: '/deliveryagent/dashboard', label: 'Dashboard', icon: 'bi-grid-fill' },
      { path: '/profile', label: 'My Profile', icon: 'bi-person-badge-fill' },
      { path: '/deliveryagent/deliveries', label: 'My Deliveries', icon: 'bi-truck' },
    ],
    Admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: 'bi-grid-fill' },
      { path: '/profile', label: 'My Profile', icon: 'bi-person-badge-fill' },
      { path: '/admin/customers', label: 'Customer Registry', icon: 'bi-people-fill' },
      { path: '/admin/distributors', label: 'Distributor Registry', icon: 'bi-shop' },
      { path: '/admin/agents', label: 'Driver Registry', icon: 'bi-truck' },
      { path: '/admin/bookings', label: 'Booking Logs', icon: 'bi-journal-list' },
      { path: '/admin/complaints', label: 'Complaints', icon: 'bi-flag-fill' },
    ],
    SuperAdmin: [
      { path: '/superadmin/dashboard', label: 'Cylinder Tracking', icon: 'bi-qr-code-scan' },
    ],
    WarehouseManager: [
      { path: '/warehousemanager/dashboard', label: 'Cylinder Intake', icon: 'bi-qr-code-scan' },
    ],
  };

  const currentLinks = linksByRole[role] || [];

  return (
    <div className="sidebar-custom p-3 d-flex flex-column h-100 animate-slide-up">
      <div className="text-muted small text-uppercase fw-bold mb-3 px-2" style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>Navigation</div>
      <nav className="nav flex-column gap-2">
        {currentLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={() => onNavigate && onNavigate()}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${link.icon} fs-5`}></i>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
