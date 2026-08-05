import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import distributorService from '../../services/distributorService';
import bookingService from '../../services/bookingService';

const DistributorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [agentsCount, setAgentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Setup profile inputs state
  const [agencyName, setAgencyName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [inventoryCapacity, setInventoryCapacity] = useState(500);
  const [currentStock, setCurrentStock] = useState(200);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  const fetchDashboardData = async () => {
    try {
      try {
        const profileData = await distributorService.getProfile();
        setProfile(profileData);
        // Pre-fill
        setAgencyName(profileData.agencyName);
        setAddress(profileData.address);
        setContactNumber(profileData.contactNumber);
        setInventoryCapacity(profileData.inventoryCapacity);
        setCurrentStock(profileData.currentStock);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setProfile(null);
        } else {
          throw err;
        }
      }

      // Fetch bookings & agents if profile exists
      if (localStorage.getItem('lpg_token')) {
        const bookingsList = await bookingService.getDistributorBookings();
        setBookings(bookingsList);

        const agentsList = await distributorService.getAgents();
        setAgentsCount(agentsList.length);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'agencyName') {
      if (!value.trim()) error = 'Agency Name is required.';
    } else if (name === 'address') {
      if (!value.trim()) error = 'Agency Address is required.';
    } else if (name === 'contactNumber') {
      if (!value.trim()) {
        error = 'Contact Number is required.';
      } else if (!/^\d{10}$/.test(value)) {
        error = 'Contact number must be exactly 10 digits.';
      }
    } else if (name === 'inventoryCapacity') {
      if (value <= 0) error = 'Capacity must be positive.';
    } else if (name === 'currentStock') {
      if (value < 0) {
        error = 'Stock cannot be negative.';
      } else if (parseInt(value) > parseInt(inventoryCapacity)) {
        error = 'Current stock cannot exceed capacity.';
      }
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const err = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'agencyName') setAgencyName(value);
    if (name === 'address') setAddress(value);
    if (name === 'contactNumber') setContactNumber(value.replace(/\D/g, ''));
    if (name === 'inventoryCapacity') setInventoryCapacity(value);
    if (name === 'currentStock') setCurrentStock(value);

    if (touched[name]) {
      const err = validateField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const newTouched = {
      agencyName: true,
      address: true,
      contactNumber: true,
      inventoryCapacity: true,
      currentStock: true,
    };
    setTouched(newTouched);

    const nameErr = validateField('agencyName', agencyName);
    const addrErr = validateField('address', address);
    const phoneErr = validateField('contactNumber', contactNumber);
    const capErr = validateField('inventoryCapacity', inventoryCapacity);
    const stockErr = validateField('currentStock', currentStock);

    if (nameErr || addrErr || phoneErr || capErr || stockErr) {
      setFormErrors({
        agencyName: nameErr,
        address: addrErr,
        contactNumber: phoneErr,
        inventoryCapacity: capErr,
        currentStock: stockErr,
      });
      return;
    }

    setSetupLoading(true);
    try {
      const payload = {
        agencyName,
        address,
        contactNumber,
        inventoryCapacity: parseInt(inventoryCapacity),
        currentStock: parseInt(currentStock),
      };
      await distributorService.completeProfile(payload);
      setLoading(true);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit profile setup.');
    } finally {
      setSetupLoading(false);
    }
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

  // Statistics summaries
  const pendingAssignments = bookings.filter(b => b.status === 'Paid').length;
  const outForDeliveryCount = bookings.filter(b => b.status === 'OutForDelivery').length;
  const deliveredCount = bookings.filter(b => b.status === 'Delivered').length;

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white mb-1">Distributor Dashboard</h2>
          <p className="text-secondary small">Manage agency setup, gas stocks, and fulfillment</p>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">
          {errorMsg}
        </div>
      )}

      {/* Profile Check: Setup Required */}
      {!profile ? (
        <div className="glass-panel p-4 p-md-5">
          <div className="mb-4">
            <h4 className="text-warning display-font fs-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> Setup Agency Profile
            </h4>
            <p className="text-secondary small">
              You must register your agency name, warehouse address, and maximum cylinder storage capacity before dispatching deliveries.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} noValidate>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label form-label-custom" htmlFor="agencyName">Agency Name</label>
                <input
                  id="agencyName"
                  name="agencyName"
                  type="text"
                  className={`form-control form-control-custom ${touched.agencyName && formErrors.agencyName ? 'is-invalid-custom' : ''}`}
                  placeholder="e.g. Bharat Gas Station"
                  value={agencyName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={setupLoading}
                />
                {touched.agencyName && formErrors.agencyName && (
                  <div className="invalid-feedback-custom">{formErrors.agencyName}</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label form-label-custom" htmlFor="contactNumber">Contact Phone Number</label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="text"
                  maxLength="10"
                  className={`form-control form-control-custom ${touched.contactNumber && formErrors.contactNumber ? 'is-invalid-custom' : ''}`}
                  placeholder="9988776655"
                  value={contactNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={setupLoading}
                />
                {touched.contactNumber && formErrors.contactNumber && (
                  <div className="invalid-feedback-custom">{formErrors.contactNumber}</div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label form-label-custom" htmlFor="address">Warehouse Address</label>
              <textarea
                id="address"
                name="address"
                rows="3"
                className={`form-control form-control-custom ${touched.address && formErrors.address ? 'is-invalid-custom' : ''}`}
                placeholder="Warehouse plot details, industrial sector, city"
                value={address}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={setupLoading}
              ></textarea>
              {touched.address && formErrors.address && (
                <div className="invalid-feedback-custom">{formErrors.address}</div>
              )}
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label form-label-custom" htmlFor="inventoryCapacity">Inventory Limit (Cylinders)</label>
                <input
                  id="inventoryCapacity"
                  name="inventoryCapacity"
                  type="number"
                  className={`form-control form-control-custom ${touched.inventoryCapacity && formErrors.inventoryCapacity ? 'is-invalid-custom' : ''}`}
                  value={inventoryCapacity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={setupLoading}
                />
                {touched.inventoryCapacity && formErrors.inventoryCapacity && (
                  <div className="invalid-feedback-custom">{formErrors.inventoryCapacity}</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label form-label-custom" htmlFor="currentStock">Current Stock Count</label>
                <input
                  id="currentStock"
                  name="currentStock"
                  type="number"
                  className={`form-control form-control-custom ${touched.currentStock && formErrors.currentStock ? 'is-invalid-custom' : ''}`}
                  value={currentStock}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={setupLoading}
                />
                {touched.currentStock && formErrors.currentStock && (
                  <div className="invalid-feedback-custom">{formErrors.currentStock}</div>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-gradient-primary rounded-pill px-4" disabled={setupLoading}>
              {setupLoading ? <span className="spinner-border spinner-border-sm" role="status"></span> : "Save Agency Profile"}
            </button>
          </form>
        </div>
      ) : (
        /* Distributor Dashboard Grid Stats */
        <>
          <div className="row g-4 mb-4">
            {/* Inventory Status Card */}
            <div className="col-md-3 col-sm-6 col-12">
              <div className="glass-panel p-4 stat-card-customer">
                <span className="text-secondary small d-block">Available Stock</span>
                <span className="text-white fs-2 fw-bold d-block my-1">{profile.currentStock}</span>
                <span className="text-muted small">Out of capacity: {profile.inventoryCapacity}</span>
              </div>
            </div>

            {/* Pending Assignment Stats */}
            <div className="col-md-3 col-sm-6 col-12">
              <div className="glass-panel p-4 stat-card-distributor">
                <span className="text-secondary small d-block">Paid, Unassigned</span>
                <span className="text-white fs-2 fw-bold d-block my-1">{pendingAssignments}</span>
                <span className="text-muted small">Requires agent assignment</span>
              </div>
            </div>

            {/* Out for delivery Stats */}
            <div className="col-md-3 col-sm-6 col-12">
              <div className="glass-panel p-4 stat-card-agent">
                <span className="text-secondary small d-block">Out for Delivery</span>
                <span className="text-white fs-2 fw-bold d-block my-1">{outForDeliveryCount}</span>
                <span className="text-muted small">Refills currently on vehicles</span>
              </div>
            </div>

            {/* Delivered Count */}
            <div className="col-md-3 col-sm-6 col-12">
              <div className="glass-panel p-4 stat-card-admin">
                <span className="text-secondary small d-block">Delivered Orders</span>
                <span className="text-white fs-2 fw-bold d-block my-1">{deliveredCount}</span>
                <span className="text-muted small">Total bookings fulfilled</span>
              </div>
            </div>
          </div>

          {/* Quick Info & Actions layout */}
          <div className="row g-4">
            <div className="col-lg-6 col-12">
              <div className="glass-panel p-4 h-100">
                <h3 className="text-white fs-5 border-bottom border-secondary-subtle pb-3 mb-3">Agency Info</h3>
                <div className="d-flex flex-column gap-3 text-secondary small">
                  <div className="row">
                    <div className="col-4">Agency Name:</div>
                    <div className="col-8 text-white fw-medium">{profile.agencyName}</div>
                  </div>
                  <div className="row">
                    <div className="col-4">Contact Phone:</div>
                    <div className="col-8 text-white fw-medium">{profile.contactNumber}</div>
                  </div>
                  <div className="row">
                    <div className="col-4">Office Location:</div>
                    <div className="col-8 text-white-50">{profile.address}</div>
                  </div>
                  <div className="row">
                    <div className="col-4">Delivery Drivers:</div>
                    <div className="col-8 text-white fw-medium">{agentsCount} active agents</div>
                  </div>
                </div>
                <div className="d-flex gap-3 mt-4 pt-2 border-top border-secondary-subtle">
                  <Link to="/distributor/agents" className="btn btn-outline-light btn-sm rounded-pill px-3">
                    <i className="bi bi-people-fill"></i> Manage Agents
                  </Link>
                  <Link to="/distributor/bookings" className="btn btn-gradient-primary btn-sm rounded-pill px-3">
                    <i className="bi bi-list-task"></i> View Bookings
                  </Link>
                </div>
              </div>
            </div>

            {/* Stock Level Warning Panel */}
            <div className="col-lg-6 col-12">
              <div className="glass-panel p-4 h-100 d-flex flex-column">
                <h3 className="text-white fs-5 border-bottom border-secondary-subtle pb-3 mb-3">Refill Stock Status</h3>
                
                <div className="my-auto py-2">
                  <div className="d-flex justify-content-between text-secondary mb-2 small">
                    <span>Stock Capacity Bar</span>
                    <span className="text-white fw-semibold">{((profile.currentStock / profile.inventoryCapacity) * 100).toFixed(0)}% Fill</span>
                  </div>
                  <div className="progress bg-dark rounded-pill" style={{ height: '14px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div 
                      className={`progress-bar rounded-pill ${profile.currentStock < 50 ? 'bg-danger' : 'bg-success'}`}
                      role="progressbar" 
                      style={{ width: `${(profile.currentStock / profile.inventoryCapacity) * 100}%` }}
                      aria-valuenow={profile.currentStock} 
                      aria-valuemin="0" 
                      aria-valuemax={profile.inventoryCapacity}
                    ></div>
                  </div>
                  {profile.currentStock < 50 && (
                    <div className="alert alert-danger bg-danger bg-opacity-10 border-danger-subtle text-danger rounded-3 small p-3 mt-3 mb-0">
                      <i className="bi bi-exclamation-octagon-fill me-2"></i>
                      **CRITICAL STOCK WARNING**: Cylinder reserves are below 50. Please ask the Administrator to adjust stock levels immediately.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DistributorDashboard;
