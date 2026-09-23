import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import bookingService from '../../services/bookingService';

const AdminDashboard = () => {
  const [distributors, setDistributors] = useState([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Stock adjustment inputs state
  const [selectedDistributorId, setSelectedDistributorId] = useState('');
  const [stockToLoad, setStockToLoad] = useState(100);
  const [formError, setFormError] = useState('');
  const [touched, setTouched] = useState(false);
  const [agentsCount, setAgentsCount] = useState(0);

  const loadData = async () => {
    try {
      const distsList = await adminService.getDistributors();
      setDistributors(distsList);
      if (distsList.length > 0) {
        setSelectedDistributorId(distsList[0].id.toString());
      }

      const custsList = await adminService.getCustomers();
      setCustomersCount(custsList.length);

      const agentsList = await adminService.getAgents();
      setAgentsCount(agentsList.length);

      const bookingsList = await bookingService.getAllBookings();
      setBookings(bookingsList);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load platform-wide metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setFormError('');
    setSuccessMsg('');

    const quantity = parseInt(stockToLoad);
    if (isNaN(quantity) || quantity <= 0) {
      setFormError('Stock replenishment quantity must be greater than zero.');
      return;
    }

    const selectedDist = distributors.find(d => d.id.toString() === selectedDistributorId);
    if (selectedDist) {
      if (selectedDist.currentStock + quantity > selectedDist.inventoryCapacity) {
        setFormError(`Cannot replenish stock. The current stock (${selectedDist.currentStock}) plus the replenishment amount (${quantity}) would exceed the agency's maximum capacity of ${selectedDist.inventoryCapacity} cylinders. The maximum number of cylinders you can add is ${selectedDist.inventoryCapacity - selectedDist.currentStock}.`);
        return;
      }
    }

    setBtnLoading(true);
    try {
      const result = await adminService.adjustStock(parseInt(selectedDistributorId), quantity);
      setSuccessMsg(`Inventory replenished! Distributor agency '${result.agencyName}' current stock is now: ${result.newStock}`);
      setStockToLoad(100);
      setTouched(false);
      setLoading(true);
      await loadData();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Stock adjustment request failed.');
    } finally {
      setBtnLoading(false);
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

  // Stats summaries
  const totalBookings = bookings.length;
  const totalAmountBilled = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h2 className="text-white mb-1">Administrative Dashboard</h2>
        <p className="text-secondary small">System operations overview, stock replenishment logistics, and booking audits</p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success border-success-subtle bg-success bg-opacity-10 text-success rounded-3 small p-3 mb-4">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMsg}
        </div>
      )}

      {/* Admin stats */}
      <div className="row g-3 mb-4">
        <div className="col-lg col-sm-6">
          <div className="glass-panel p-4 stat-card-customer h-100">
            <span className="text-secondary small d-block">Distributor Agencies</span>
            <span className="text-white fs-2 fw-bold d-block my-1">{distributors.length}</span>
            <span className="text-muted small">Registered in system</span>
          </div>
        </div>
        <div className="col-lg col-sm-6">
          <div className="glass-panel p-4 stat-card-distributor h-100">
            <span className="text-secondary small d-block">Consumer Connections</span>
            <span className="text-white fs-2 fw-bold d-block my-1">{customersCount}</span>
            <span className="text-muted small">Profiles completed</span>
          </div>
        </div>
        <div className="col-lg col-sm-6">
          <div className="glass-panel p-4 stat-card-agent h-100" style={{ borderLeft: '3px solid #06b6d4' }}>
            <span className="text-secondary small d-block">Delivery Agents</span>
            <span className="text-white fs-2 fw-bold d-block my-1">{agentsCount}</span>
            <span className="text-muted small">Registered agents</span>
          </div>
        </div>
        <div className="col-lg col-sm-6">
          <div className="glass-panel p-4 stat-card-customer h-100" style={{ borderLeft: '3px solid #10b981' }}>
            <span className="text-secondary small d-block">Total Gas Bookings</span>
            <span className="text-white fs-2 fw-bold d-block my-1">{totalBookings}</span>
            <span className="text-muted small">Processed orders</span>
          </div>
        </div>
        <div className="col-lg col-sm-6">
          <div className="glass-panel p-4 stat-card-admin h-100">
            <span className="text-secondary small d-block">Revenue Tracked</span>
            <span className="text-white fs-2 fw-bold d-block my-1">₹ {totalAmountBilled.toFixed(2)}</span>
            <span className="text-muted small">Payments validated</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Stock Load replenishment form */}
        <div className="col-lg-6 col-12">
          <div className="glass-panel p-4 h-100">
            <h3 className="text-white fs-5 border-bottom border-secondary-subtle pb-3 mb-3">
              <i className="bi bi-box-seam text-orange" style={{ color: '#ff5e36' }}></i> Replenish Distributor Stock
            </h3>
            
            {formError && (
              <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-2 mb-3">
                {formError}
              </div>
            )}

            {distributors.length === 0 ? (
              <p className="text-secondary small">No registered distributors found to replenish.</p>
            ) : (
              <form onSubmit={handleStockSubmit}>
                <div className="mb-3">
                  <label className="form-label form-label-custom" htmlFor="distributorSelect">Select Distributor Agency</label>
                  <select
                    id="distributorSelect"
                    className="form-select form-control-custom"
                    value={selectedDistributorId}
                    onChange={(e) => setSelectedDistributorId(e.target.value)}
                    disabled={btnLoading}
                  >
                    {distributors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.agencyName} (Current Stock: {d.currentStock} / Capacity: {d.inventoryCapacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label form-label-custom" htmlFor="stockQuantity">Cylinders to Replenish</label>
                  <input
                    id="stockQuantity"
                    type="number"
                    min="1"
                    className={`form-control form-control-custom ${touched && formError ? 'is-invalid-custom' : ''}`}
                    value={stockToLoad}
                    onChange={(e) => setStockToLoad(e.target.value)}
                    onBlur={() => setTouched(true)}
                    disabled={btnLoading}
                  />
                </div>

                <button type="submit" className="btn btn-gradient-primary rounded-pill px-4" disabled={btnLoading}>
                  {btnLoading ? <span className="spinner-border spinner-border-sm"></span> : "Approve Stock Replenishment"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Low inventory alert warnings */}
        <div className="col-lg-6 col-12">
          <div className="glass-panel p-4 h-100">
            <h3 className="text-white fs-5 border-bottom border-secondary-subtle pb-3 mb-3">Warehouse Stock Alerts</h3>
            {distributors.filter(d => d.currentStock < 50).length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-shield-check text-success display-4 d-block mb-2"></i>
                <p className="text-secondary small">All distributors are holding stable refill stock levels.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {distributors.filter(d => d.currentStock < 50).map(d => (
                  <div key={d.id} className="p-3 border border-danger border-opacity-10 rounded-3 bg-danger bg-opacity-10 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-white fw-semibold small d-block">{d.agencyName}</span>
                      <span className="text-secondary small">Contact: {d.contactNumber}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-danger fw-bold d-block fs-5">{d.currentStock}</span>
                      <span className="text-secondary small">Refills left</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
