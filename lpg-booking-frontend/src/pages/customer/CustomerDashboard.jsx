import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import customerService from '../../services/customerService';
import bookingService from '../../services/bookingService';

const CustomerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        try {
          const profileData = await customerService.getProfile();
          setProfile(profileData);
        } catch (err) {
          if (err.response && err.response.status === 404) {
            setProfile(null); // No profile completed yet
          } else {
            throw err;
          }
        }

        // Fetch bookings
        const bookingsData = await bookingService.getHistory();
        setBookings(bookingsData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setErrorMsg("Failed to load dashboard metrics. Please reload page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PendingPayment': return 'badge-pending';
      case 'Paid': return 'badge-paid';
      case 'Assigned': return 'badge-assigned';
      case 'OutForDelivery': return 'badge-delivery';
      case 'Delivered': return 'badge-delivered';
      case 'Returned': return 'badge-returned';
      case 'DeliveryFailed': return 'badge-failed';
      default: return 'badge-cancelled';
    }
  };

  const getDeliveryDateDisplay = (b) => {
    if (b.status === 'Delivered' || b.status === 'Returned') {
      return b.deliveryDate ? new Date(b.deliveryDate).toLocaleDateString() : '-';
    }
    if (b.status === 'Cancelled' || b.status === 'DeliveryFailed') {
      return '-';
    }
    const expected = new Date(b.bookingDate);
    expected.setDate(expected.getDate() + 1);
    return `${expected.toLocaleDateString()} (Expected)`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-orange" role="status" style={{ color: '#ff5e36' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Active bookings (Pending delivery status: Paid, Assigned, OutForDelivery, PendingPayment)
  const activeBookings = bookings.filter(b => b.status !== 'Delivered' && b.status !== 'Cancelled');
  const recentBookings = bookings.slice(0, 3);

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white mb-1">Customer Dashboard</h2>
          <p className="text-secondary small">Manage connection details, bookings, and payments</p>
        </div>
        {profile && profile.status === 'Active' && (
          <Link to="/customer/book" className="btn btn-gradient-primary rounded-pill d-flex align-items-center gap-2">
            <i className="bi bi-plus-circle-fill"></i> Book Cylinder
          </Link>
        )}
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">
          {errorMsg}
        </div>
      )}

      {/* Profile completion banner */}
      {!profile ? (
        <div className="glass-panel p-4 mb-4 border border-warning border-opacity-20 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h4 className="text-warning display-font fs-5 mb-1">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> Profile Incomplete
            </h4>
            <p className="text-secondary small mb-0">
              You must set up your billing details, consumer connection number, and choose your preferred distributor before ordering LPG cylinders.
            </p>
          </div>
          <Link to="/customer/complete-profile" className="btn btn-gradient-primary px-4 py-2 rounded-pill flex-shrink-0">
            Complete Profile Now
          </Link>
        </div>
      ) : profile.status === 'Suspended' ? (
        <div className="glass-panel p-4 mb-4 border border-danger border-opacity-20">
          <h4 className="text-danger display-font fs-5 mb-1">
            <i className="bi bi-shield-x me-2"></i> Account Connection Suspended
          </h4>
          <p className="text-secondary small mb-0">
            Your connection number **{profile.connectionNumber}** is suspended by the administrator. Cylinder bookings are disabled. Please contact customer support.
          </p>
        </div>
      ) : null}

      {/* Metric Cards Row */}
      {profile && (
        <div className="row g-4 mb-4 animate-fade-in">
          <div className="col-12 col-md-4">
            <div className="stat-card-custom stat-card-customer">
              <div>
                <span className="text-secondary small d-block mb-1">Account Connection</span>
                <span className="fs-5 fw-bold text-white">{profile.connectionNumber || 'Not Set'}</span>
              </div>
              <div className="icon-wrapper">
                <i className="bi bi-link-45deg"></i>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="stat-card-custom stat-card-distributor">
              <div>
                <span className="text-secondary small d-block mb-1">Total Bookings</span>
                <span className="fs-5 fw-bold text-white">{bookings.length} Refill{bookings.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="icon-wrapper">
                <i className="bi bi-cart-check-fill"></i>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="stat-card-custom stat-card-agent">
              <div>
                <span className="text-secondary small d-block mb-1">Latest Booking</span>
                <span className="fs-5 fw-bold text-white">
                  {bookings.length > 0 ? new Date(bookings[0].bookingDate).toLocaleDateString() : 'None Yet'}
                </span>
              </div>
              <div className="icon-wrapper">
                <i className="bi bi-clock-history"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="row g-4">
        {/* Profile Summary Card */}
        {profile && (
          <div className="col-lg-5 col-12">
            <div className="glass-panel p-4 h-100">
              <h3 className="text-white fs-5 border-bottom border-secondary-subtle pb-3 mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-person-badge text-orange" style={{ color: '#ff5e36' }}></i> Connection Account Details
              </h3>
              <div className="d-flex flex-column gap-3">
                <div className="row g-0">
                  <div className="col-5 text-secondary small">Connection Number:</div>
                  <div className="col-7 text-white fw-semibold">{profile.connectionNumber}</div>
                </div>
                <div className="row g-0">
                  <div className="col-5 text-secondary small">Preferred Agency:</div>
                  <div className="col-7 text-white fw-semibold">{profile.preferredDistributorName}</div>
                </div>
                <div className="row g-0">
                  <div className="col-5 text-secondary small">Service Address:</div>
                  <div className="col-7 text-white-50 small">{profile.address}, {profile.city}, {profile.state} - {profile.pinCode}</div>
                </div>
                <div className="row g-0">
                  <div className="col-5 text-secondary small">Connection Status:</div>
                  <div className="col-7">
                    <span className={`badge ${profile.status === 'Active' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-30' : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-30'}`}>
                      {profile.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Order Card */}
        <div className={profile ? "col-lg-7 col-12" : "col-12"}>
          <div className="glass-panel p-4 h-100">
            <h3 className="text-white fs-5 border-bottom border-secondary-subtle pb-3 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-truck text-orange" style={{ color: '#ff5e36' }}></i> Active Deliveries
            </h3>
            {activeBookings.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-check-circle text-secondary fs-2 d-block mb-2"></i>
                <p className="text-secondary small mb-0">No active cylinder deliveries. Need gas?</p>
                {profile && profile.status === 'Active' && (
                  <Link to="/customer/book" className="btn btn-outline-light btn-sm mt-3 px-3 rounded-pill">
                    Book a Cylinder
                  </Link>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {activeBookings.map(b => (
                  <div key={b.id} className="glass-card p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-white fw-semibold small">Booking ID: #{b.id}</span>
                        <span className={`badge-status ${getStatusBadgeClass(b.status)}`}>{b.status}</span>
                      </div>
                      <div className="text-secondary small">
                        Cylinder Count: <span className="text-white fw-medium">{b.cylinderCount}</span> | Total Cost: <span className="text-white fw-medium">₹ {b.totalAmount}</span>
                      </div>
                      <div className="text-secondary small mt-1">
                        Dealer Agency: <span className="text-white-50">{b.distributorName}</span>
                      </div>
                      {b.deliveryAgentName !== 'Not Assigned' && (
                        <div className="text-secondary small mt-1">
                          Delivery Driver: <span className="text-white-50">{b.deliveryAgentName}</span>
                        </div>
                      )}
                      <div className="text-secondary small mt-1">
                        Delivery Date: <span className="text-warning fw-semibold">{getDeliveryDateDisplay(b)}</span>
                      </div>
                      {b.status === 'OutForDelivery' && b.deliveryOtp && (
                        <div className="mt-2 p-2 rounded border border-warning border-opacity-25 text-warning bg-warning bg-opacity-10 d-inline-block small fw-bold" style={{ fontSize: '0.8rem' }}>
                          <i className="bi bi-shield-lock-fill me-1"></i> Delivery OTP: {b.deliveryOtp}
                        </div>
                      )}
                    </div>
                    {b.status === 'PendingPayment' && (
                      <Link to={`/customer/history`} className="btn btn-gradient-primary btn-sm rounded-pill px-3">
                        Pay Order
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Booking History Table */}
      {bookings.length > 0 && (
        <div className="glass-panel p-4 mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="text-white fs-5 mb-0">Recent Order Activity</h3>
            <Link to="/customer/history" style={{ color: '#ff5e36', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              View History <i className="bi bi-chevron-right"></i>
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table table-custom mb-0">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Order Date</th>
                  <th>Cylinders</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b.id}>
                    <td className="text-white fw-semibold">#{b.id}</td>
                    <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td>{b.cylinderCount}</td>
                    <td>₹ {b.totalAmount}</td>
                    <td>
                      <span className={`badge-status ${getStatusBadgeClass(b.status)}`}>{b.status}</span>
                    </td>
                    <td>
                      {getDeliveryDateDisplay(b)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
