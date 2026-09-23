import { useEffect, useState } from 'react';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import complaintService from '../../services/complaintService';
import { openRazorpayCheckout } from '../../services/razorpayCheckout';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Settle Payment state — no custom form needed anymore, the real
  // Razorpay widget handles all payment method UI itself.
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);

  // Invoice states
  const [invoiceBooking, setInvoiceBooking] = useState(null);

  // Cancel booking states
  const [cancelBooking, setCancelBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Complaint modal states
  const [complaintBooking, setComplaintBooking] = useState(null);
  const [complaintCategory, setComplaintCategory] = useState('LateDelivery');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintError, setComplaintError] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState('');

  const openComplaintModal = (booking) => {
    setComplaintBooking(booking);
    setComplaintCategory('LateDelivery');
    setComplaintDescription('');
    setComplaintError('');
    setComplaintSuccess('');
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setComplaintError('');
    if (complaintDescription.trim().length < 10) {
      setComplaintError('Please describe the issue in at least 10 characters.');
      return;
    }
    setComplaintLoading(true);
    try {
      await complaintService.raiseComplaint(complaintBooking.id, complaintCategory, complaintDescription.trim());
      setComplaintSuccess('Complaint submitted. Our team will review it shortly.');
      setTimeout(() => setComplaintBooking(null), 1800);
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data?.errors;
      setComplaintError(
        (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
        err.response?.data?.message ||
        'Could not submit complaint. Please try again.'
      );
    } finally {
      setComplaintLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getHistory();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to retrieve booking logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
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

  const openCheckout = (booking) => {
    setErrorMsg('');
    setPaymentLoadingId(booking.id);

    openRazorpayCheckout({
      keyId: booking.razorpayKeyId,
      orderId: booking.razorpayOrderId,
      amountInPaise: booking.razorpayAmountInPaise,
      name: 'LPG Cylinder Booking',
      description: `Settle payment for Booking #${booking.id}`,
      onSuccess: async (response) => {
        try {
          await paymentService.verifyPayment(
            booking.id,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            'RAZORPAY'
          );
          setLoading(true);
          await fetchBookings();
        } catch (err) {
          console.error(err);
          const backendErrors = err.response?.data?.errors;
          alert(
            (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
            err.response?.data?.message ||
            'Payment verification failed. If money was deducted, contact support with your booking ID.'
          );
        } finally {
          setPaymentLoadingId(null);
        }
      },
      onError: (message) => {
        setErrorMsg(message);
        setPaymentLoadingId(null);
      },
      onDismiss: () => {
        setPaymentLoadingId(null);
      },
    });
  };

  const showInvoice = (booking) => {
    setInvoiceBooking(booking);
  };

  const openCancelModal = (booking) => {
    setCancelBooking(booking);
    setCancelError('');
  };

  const handleCancelConfirm = async () => {
    if (!cancelBooking) return;
    setCancelLoading(true);
    setCancelError('');
    try {
      await bookingService.cancelBooking(cancelBooking.id);
      setCancelBooking(null);
      setLoading(true);
      await fetchBookings();
    } catch (err) {
      console.error(err);
      setCancelError(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white mb-1">Cylinder Booking History</h2>
          <p className="text-secondary small">Review past orders, complete pending checkouts, and print invoices</p>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">
          {errorMsg}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass-panel p-5 text-center">
          <i className="bi bi-journal-x text-secondary display-3 d-block mb-3"></i>
          <h4 className="text-white">No Bookings Recorded</h4>
          <p className="text-secondary small">You haven't ordered any refill cylinders yet.</p>
        </div>
      ) : (
        <div className="glass-panel p-4">
          <div className="table-responsive">
            <table className="table table-custom mb-0">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Booking Date</th>
                  <th>Cylinders</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th>Assigned Agent</th>
                  <th>Delivery Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className="text-white fw-semibold">#{b.id}</td>
                    <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td>{b.cylinderCount}</td>
                    <td className="text-white fw-medium">₹ {b.totalAmount}</td>
                    <td>
                      <span className={`badge-status ${getStatusBadgeClass(b.status)}`}>{b.status}</span>
                      {b.status === 'OutForDelivery' && b.deliveryOtp && (
                        <div className="mt-1 small fw-bold text-warning" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-shield-lock-fill me-1"></i> OTP: {b.deliveryOtp}
                        </div>
                      )}
                    </td>
                    <td className="text-light-emphasis small">{b.deliveryAgentName}</td>
                    <td>
                      {getDeliveryDateDisplay(b)}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        {b.status === 'PendingPayment' && (
                          <button
                            onClick={() => openCheckout(b)}
                            className="btn btn-gradient-primary btn-sm rounded-pill px-3"
                            disabled={paymentLoadingId === b.id}
                          >
                            {paymentLoadingId === b.id ? (
                              <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                              <><i className="bi bi-wallet2"></i> Pay</>
                            )}
                          </button>
                        )}
                        {b.status !== 'PendingPayment' && b.status !== 'Cancelled' && (
                          <button onClick={() => showInvoice(b)} className="btn btn-outline-light btn-sm rounded-pill px-3">
                            <i className="bi bi-file-text"></i> Invoice
                          </button>
                        )}
                        {(b.status === 'PendingPayment' || b.status === 'Paid') && (
                          <button
                            onClick={() => openCancelModal(b)}
                            className="btn btn-sm rounded-pill px-3"
                            style={{ border: '1px solid rgba(220,38,38,0.35)', color: '#ef4444', background: 'rgba(220,38,38,0.06)' }}
                          >
                            <i className="bi bi-x-circle"></i> Cancel
                          </button>
                        )}
                        {b.status !== 'PendingPayment' && b.status !== 'Cancelled' && (
                          <button onClick={() => openComplaintModal(b)} className="btn btn-outline-warning btn-sm rounded-pill px-3">
                            <i className="bi bi-flag"></i> Complaint
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Details Dialog Modal */}
      {invoiceBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
            <div className="modal-content glass-panel p-4 border border-secondary border-opacity-30">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-white">Invoice Refill Receipt</h5>
                <button type="button" className="btn-close" onClick={() => setInvoiceBooking(null)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="border border-secondary border-opacity-20 p-4 rounded text-white-50" style={{ backgroundColor: '#11151e' }}>
                  <div className="text-center mb-4">
                    <h4 className="text-white display-font mb-0">IGNISGUARD INVOICE</h4>
                    <span className="small">Booking Ref: #{invoiceBooking.id}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 small">
                    <span>Order Date:</span>
                    <span className="text-white">{new Date(invoiceBooking.bookingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 small">
                    <span>Account Connection:</span>
                    <span className="text-white">{invoiceBooking.connectionNumber}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 small">
                    <span>Gas Distribution Agency:</span>
                    <span className="text-white">{invoiceBooking.distributorName}</span>
                  </div>
                  {invoiceBooking.deliveryDate && (
                    <div className="d-flex justify-content-between mb-2 small">
                      <span>Delivery Confirmed:</span>
                      <span className="text-white">{new Date(invoiceBooking.deliveryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <hr className="border-secondary border-opacity-30" />
                  <div className="d-flex justify-content-between text-white fw-bold mb-0">
                    <span>Cylinders (x{invoiceBooking.cylinderCount}):</span>
                    <span>₹ {invoiceBooking.totalAmount}</span>
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-4 gap-2">
                  <button onClick={() => window.print()} className="btn btn-gradient-primary rounded-pill px-4 btn-sm">
                    <i className="bi bi-printer-fill"></i> Print Invoice
                  </button>
                  <button onClick={() => setInvoiceBooking(null)} className="btn btn-outline-secondary rounded-pill px-4 btn-sm">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Cancel Confirmation Modal */}
      {cancelBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content glass-panel p-4 border border-danger border-opacity-20">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill text-danger fs-4"></i>
                  <h5 className="modal-title text-white mb-0">Cancel Booking</h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setCancelBooking(null)} disabled={cancelLoading}></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-secondary small mb-3">
                  Are you sure you want to cancel <span className="text-white fw-semibold">Booking #{cancelBooking.id}</span>?
                </p>
                <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-secondary">Cylinders</span>
                    <span className="text-white">{cancelBooking.cylinderCount}</span>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span className="text-secondary">Amount</span>
                    <span className="text-white fw-semibold">₹ {cancelBooking.totalAmount}</span>
                  </div>
                </div>
                <p className="text-secondary" style={{ fontSize: '0.78rem' }}>
                  <i className="bi bi-info-circle me-1"></i>
                  Cancellation is only possible before a delivery agent is assigned. This action cannot be undone.
                </p>
                {cancelError && (
                  <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-2 mt-2 mb-0">
                    {cancelError}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0 gap-2">
                <button
                  onClick={() => setCancelBooking(null)}
                  className="btn btn-outline-light btn-sm rounded-pill px-4"
                  disabled={cancelLoading}
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="btn btn-sm rounded-pill px-4"
                  style={{ background: '#dc2626', color: '#fff', border: 'none' }}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <><i className="bi bi-x-circle"></i> Yes, Cancel</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Raise Complaint Modal */}
      {complaintBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
            <div className="modal-content glass-panel p-4 border border-warning border-opacity-20">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-flag-fill text-warning fs-5"></i>
                  <h5 className="modal-title text-white mb-0">Raise a Complaint</h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setComplaintBooking(null)} disabled={complaintLoading}></button>
              </div>
              <div className="modal-body py-3">
                <p className="text-secondary small mb-3">
                  Regarding <span className="text-white fw-semibold">Booking #{complaintBooking.id}</span>
                </p>

                {complaintSuccess ? (
                  <div className="alert alert-success border-success-subtle bg-success bg-opacity-10 text-success rounded-3 small p-3 mb-0">
                    <i className="bi bi-check-circle-fill me-2"></i>{complaintSuccess}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitComplaint}>
                    <label className="text-secondary small mb-1 d-block">Category</label>
                    <select
                      className="form-select form-control-custom text-white mb-3"
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      disabled={complaintLoading}
                    >
                      <option value="LateDelivery">Late Delivery</option>
                      <option value="DamagedCylinder">Damaged Cylinder</option>
                      <option value="WrongAmountCharged">Wrong Amount Charged</option>
                      <option value="AgentBehaviour">Delivery Agent Behaviour</option>
                      <option value="LeakageSafety">Leakage / Safety Concern</option>
                      <option value="Other">Other</option>
                    </select>

                    <label className="text-secondary small mb-1 d-block">Describe the issue</label>
                    <textarea
                      className="form-control form-control-custom text-white mb-3"
                      rows="4"
                      placeholder="Please provide details so our team can help resolve this..."
                      value={complaintDescription}
                      onChange={(e) => setComplaintDescription(e.target.value)}
                      disabled={complaintLoading}
                    />

                    {complaintError && (
                      <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-2 mb-3">
                        {complaintError}
                      </div>
                    )}

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        onClick={() => setComplaintBooking(null)}
                        className="btn btn-outline-light btn-sm rounded-pill px-4"
                        disabled={complaintLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-warning btn-sm rounded-pill px-4"
                        disabled={complaintLoading}
                      >
                        {complaintLoading ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          <><i className="bi bi-send"></i> Submit Complaint</>
                        )}
                      </button>
                    </div>
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

export default BookingHistory;
