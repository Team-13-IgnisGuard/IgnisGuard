import { useEffect, useState } from 'react';
import bookingService from '../../services/bookingService';
import distributorService from '../../services/distributorService';

const BookingAssignment = () => {
  const [bookings, setBookings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Assignment Modal States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Filter state
  const [filter, setFilter] = useState('All'); // All, Paid, Assigned, OutForDelivery, Delivered

  const loadData = async () => {
    try {
      const list = await bookingService.getDistributorBookings();
      setBookings(list);
      
      const drivers = await distributorService.getAgents();
      setAgents(drivers);
      if (drivers.length > 0) {
        setSelectedAgentId(drivers[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to retrieve booking list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PendingPayment': return 'badge-pending';
      case 'Paid': return 'badge-paid';
      case 'Assigned': return 'badge-assigned';
      case 'OutForDelivery': return 'badge-delivery';
      case 'Delivered': return 'badge-delivered';
      case 'DeliveryFailed': return 'badge-failed';
      default: return 'badge-cancelled';
    }
  };

  const handleOpenAssignModal = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleAssignConfirm = async (e) => {
    e.preventDefault();
    if (!selectedAgentId) return;

    setModalLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await bookingService.assignAgent(selectedBooking.id, parseInt(selectedAgentId));
      setShowModal(false);
      setSuccessMsg(`Driver successfully assigned to Order #${selectedBooking.id}!`);
      setLoading(true);
      await loadData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Assignment failed. Check agent availability and stock reserves.');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'All') return true;
    return b.status === filter;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-orange" role="status" style={{ color: '#ff5e36' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white mb-1">Bookings Queue</h2>
          <p className="text-secondary small">Dispatch cylinder delivery agents and monitor active transactions</p>
        </div>
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

      {/* Filters bar */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['All', 'Paid', 'Assigned', 'OutForDelivery', 'Delivered'].map(status => (
          <button
            key={status}
            className={`btn btn-sm rounded-pill px-3 ${filter === status ? 'btn-gradient-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(status)}
          >
            {status === 'All' ? 'All Orders' : status}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="glass-panel p-5 text-center">
          <i className="bi bi-list-stars text-secondary display-3 d-block mb-3"></i>
          <h4 className="text-white">No Bookings Found</h4>
          <p className="text-secondary small">No bookings match the selected status filter.</p>
        </div>
      ) : (
        <div className="glass-panel p-4">
          <div className="table-responsive">
            <table className="table table-custom mb-0">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer Connection</th>
                  <th>Delivery Address</th>
                  <th>Cylinders</th>
                  <th>Status</th>
                  <th>Driver Assigned</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id}>
                    <td className="text-white fw-semibold">#{b.id}</td>
                    <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td>
                      <div className="text-white small fw-medium">{b.customerEmail}</div>
                      <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>{b.connectionNumber}</div>
                    </td>
                    <td className="small text-light-emphasis" style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.address}, {b.city}
                    </td>
                    <td>{b.cylinderCount}</td>
                    <td>
                      <span className={`badge-status ${getStatusBadgeClass(b.status)}`}>{b.status}</span>
                    </td>
                    <td className="text-light-emphasis small">{b.deliveryAgentName}</td>
                    <td className="text-end">
                      {b.status === 'Paid' && (
                        <button 
                          onClick={() => handleOpenAssignModal(b)} 
                          className="btn btn-gradient-primary btn-sm rounded-pill px-3"
                        >
                          <i className="bi bi-person-plus-fill"></i> Assign Driver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showModal && selectedBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content glass-panel p-4 border border-secondary border-opacity-30">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-white">Assign Driver to Order #{selectedBooking.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} disabled={modalLoading}></button>
              </div>
              
              <div className="modal-body py-4">
                {agents.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-warning small mb-3">No delivery drivers registered in your agency database.</p>
                    <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => setShowModal(false)}>Close</button>
                  </div>
                ) : (
                  <form onSubmit={handleAssignConfirm}>
                    <div className="mb-4">
                      <label className="form-label form-label-custom" htmlFor="driverSelect">Select Driver</label>
                      <select
                        id="driverSelect"
                        className="form-select form-control-custom"
                        value={selectedAgentId}
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        disabled={modalLoading}
                      >
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.vehicleNumber}) - {a.isAvailable ? 'Available' : 'Busy'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-success w-100 rounded-pill py-2.5 fw-semibold"
                      disabled={modalLoading}
                    >
                      {modalLoading ? <span className="spinner-border spinner-border-sm"></span> : "Confirm Assignment"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingAssignment;
