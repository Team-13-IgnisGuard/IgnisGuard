import { useEffect, useState } from 'react';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Settle Payment Modal States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  
  // Invoice states
  const [invoiceBooking, setInvoiceBooking] = useState(null);

  // Cancel booking states
  const [cancelBooking, setCancelBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

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

  // Card validations
  const validateCard = (name, value) => {
    let error = '';
    if (name === 'cardNumber') {
      if (!value) {
        error = 'Card number is required.';
      } else if (!/^\d{16}$/.test(value.replace(/\s+/g, ''))) {
        error = 'Please enter a valid 16-digit credit card number.';
      }
    } else if (name === 'cardExpiry') {
      if (!value) {
        error = 'Expiry date is required.';
      } else {
        const match = value.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/);
        if (!match) {
          error = 'Expiry date must be in MM/YY format.';
        } else {
          const month = parseInt(match[1], 10);
          const year = parseInt(match[2], 10);
          
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear() % 100;
          
          if (year < currentYear || (year === currentYear && month < currentMonth)) {
            error = 'Expiry date must be in the future.';
          }
        }
      }
    } else if (name === 'cardCvv') {
      if (!value) {
        error = 'CVV is required.';
      } else if (!/^\d{3}$/.test(value)) {
        error = 'CVV must be exactly 3 digits.';
      }
    }
    return error;
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') setCardNumber(value.replace(/\D/g, '').substring(0, 16));
    if (name === 'cardExpiry') {
      let val = value.replace(/\D/g, '');
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
      }
      setCardExpiry(val.substring(0, 5));
    }
    if (name === 'cardCvv') setCardCvv(value.replace(/\D/g, '').substring(0, 3));

    if (touched[name]) {
      const err = validateCard(name, value);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const openPaymentModal = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setTouched({});
    setErrors({});
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    const newTouched = { cardNumber: true, cardExpiry: true, cardCvv: true };
    setTouched(newTouched);

    const cardErr = validateCard('cardNumber', cardNumber);
    const expErr = validateCard('cardExpiry', cardExpiry);
    const cvvErr = validateCard('cardCvv', cardCvv);

    if (cardErr || expErr || cvvErr) {
      setErrors({ cardNumber: cardErr, cardExpiry: expErr, cardCvv: cvvErr });
      return;
    }

    setPaymentLoading(true);
    try {
      await paymentService.verifyPayment(
        selectedBooking.id,
        selectedBooking.razorpayOrderId,
        `pay_sim_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        `sig_sim_${Math.random().toString(36).substring(2, 12).toUpperCase()}`
      );
      setShowPaymentModal(false);
      setLoading(true);
      await fetchBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Payment failed.');
    } finally {
      setPaymentLoading(false);
    }
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
                          <button onClick={() => openPaymentModal(b)} className="btn btn-gradient-primary btn-sm rounded-pill px-3">
                            <i className="bi bi-wallet2"></i> Pay
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settle Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content glass-panel p-4 border border-secondary border-opacity-30">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-white">Razorpay Secure Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)} disabled={paymentLoading}></button>
              </div>
              <div className="modal-body text-secondary small py-4">
                <p>Settle payment for Booking: <span className="text-white fw-semibold">#{selectedBooking.id}</span></p>
                <div className="d-flex justify-content-between mb-4 bg-secondary p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <span>Amount to Settle:</span>
                  <span className="text-orange fw-bold" style={{ color: '#ff5e36' }}>₹ {selectedBooking.totalAmount}</span>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  <div className="mb-3">
                    <label className="form-label form-label-custom" htmlFor="cardNumber">16-Digit Card Number</label>
                    <input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      className={`form-control form-control-custom ${touched.cardNumber && errors.cardNumber ? 'is-invalid-custom' : ''}`}
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={handleCardChange}
                      onBlur={() => setTouched({ ...touched, cardNumber: true })}
                      disabled={paymentLoading}
                    />
                    {touched.cardNumber && errors.cardNumber && (
                      <div className="invalid-feedback-custom">{errors.cardNumber}</div>
                    )}
                  </div>
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <label className="form-label form-label-custom" htmlFor="cardExpiry">Expiry Date</label>
                      <input
                        id="cardExpiry"
                        name="cardExpiry"
                        type="text"
                        className={`form-control form-control-custom ${touched.cardExpiry && errors.cardExpiry ? 'is-invalid-custom' : ''}`}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleCardChange}
                        onBlur={() => setTouched({ ...touched, cardExpiry: true })}
                        disabled={paymentLoading}
                      />
                      {touched.cardExpiry && errors.cardExpiry && (
                        <div className="invalid-feedback-custom">{errors.cardExpiry}</div>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label form-label-custom" htmlFor="cardCvv">CVV Code</label>
                      <input
                        id="cardCvv"
                        name="cardCvv"
                        type="password"
                        className={`form-control form-control-custom ${touched.cardCvv && errors.cardCvv ? 'is-invalid-custom' : ''}`}
                        placeholder="123"
                        value={cardCvv}
                        onChange={handleCardChange}
                        onBlur={() => setTouched({ ...touched, cardCvv: true })}
                        disabled={paymentLoading}
                      />
                      {touched.cardCvv && errors.cardCvv && (
                        <div className="invalid-feedback-custom">{errors.cardCvv}</div>
                      )}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success w-100 rounded-pill py-2.5 d-flex align-items-center justify-content-center gap-2" disabled={paymentLoading}>
                    {paymentLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <>
                        <i className="bi bi-wallet2"></i> Pay ₹ {selectedBooking.totalAmount}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
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
    </div>
  );
};

export default BookingHistory;
