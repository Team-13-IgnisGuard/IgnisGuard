import { useEffect, useState } from 'react';
import bookingService from '../../services/bookingService';

const AdminBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const data = await bookingService.getAllBookings();
        setBookings(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to retrieve system-wide booking registry.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllBookings();
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
      <div className="mb-4">
        <h2 className="text-white mb-1">Booking Audit Logs</h2>
        <p className="text-secondary small">Review system transactions, checkout verification reference codes, and status logs</p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">
          {errorMsg}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass-panel p-5 text-center">
          <i className="bi bi-journal-x text-secondary display-3 d-block mb-3"></i>
          <h4 className="text-white">No System Transactions</h4>
          <p className="text-secondary small">No customer booking orders have been registered in the database yet.</p>
        </div>
      ) : (
        <div className="glass-panel p-4">
          <div className="table-responsive">
            <table className="table table-custom mb-0">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Order Date</th>
                  <th>Customer Email</th>
                  <th>Distributor Agency</th>
                  <th>Refill Qty</th>
                  <th>Charged Amount</th>
                  <th>Status</th>
                  <th>Fulfillment Driver</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className="text-white fw-semibold">#{b.id}</td>
                    <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td>{b.customerEmail}</td>
                    <td className="text-white fw-medium">{b.distributorName}</td>
                    <td>{b.cylinderCount}</td>
                    <td className="text-white fw-medium">₹ {b.totalAmount}</td>
                    <td>
                      <span className={`badge-status ${getStatusBadgeClass(b.status)}`}>{b.status}</span>
                    </td>
                    <td className="text-light-emphasis small">{b.deliveryAgentName}</td>
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

export default AdminBookingList;
