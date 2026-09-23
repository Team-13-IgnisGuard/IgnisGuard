import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import customerService from '../../services/customerService';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import { openRazorpayCheckout } from '../../services/razorpayCheckout';

const BookCylinder = () => {
  const navigate = useNavigate();

  // Profile status check
  const [profile, setProfile] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Form input states
  const [cylinderCount] = useState(1);

  // Checkout state
  const [bookingDetails, setBookingDetails] = useState(null);

  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [canBook, setCanBook] = useState(true);

  const CylinderPrice = 950.00;

  // Must match booking.refill-gap-minutes in booking-service's application.yml.
  // This is a client-side pre-check only (for instant feedback) — the backend
  // enforces the real rule independently on every booking attempt.
  const REFILL_GAP_MINUTES = 2;

  const formatGapDuration = (minutes) => {
    if (minutes >= 1440) {
      const days = Math.ceil(minutes / 1440);
      return `${days} day${days === 1 ? '' : 's'}`;
    } else if (minutes >= 60) {
      const hours = Math.ceil(minutes / 60);
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    const mins = Math.ceil(minutes);
    return `${mins} minute${mins === 1 ? '' : 's'}`;
  };

  useEffect(() => {
    const checkProfileAndHistory = async () => {
      try {
        const data = await customerService.getProfile();
        setProfile(data);
        if (data.status === 'Suspended') {
          setErrorMsg("Your gas connection has been suspended. Cylinder booking is disabled.");
          setCanBook(false);
          setPageLoading(false);
          return;
        }

        // A customer may only have one active booking at a time — check this
        // before the time-gap policy, mirroring the backend's check order.
        const ACTIVE_STATUSES = ['PendingPayment', 'Paid', 'Assigned', 'OutForDelivery'];
        const history = await bookingService.getHistory();
        const activeBooking = history.find(b => ACTIVE_STATUSES.includes(b.status));
        if (activeBooking) {
          setErrorMsg(`You already have an active booking (#${activeBooking.id}, status: ${activeBooking.status}). Please wait for it to be delivered and returned before booking another cylinder.`);
          setCanBook(false);
          setPageLoading(false);
          return;
        }

        // Check refill gap policy
        const nonCancelled = history.filter(b => b.status !== 'Cancelled');
        if (nonCancelled.length > 0) {
          const lastBooking = nonCancelled[0]; // Sorted by date desc from backend API
          const lastBookingDate = new Date(lastBooking.bookingDate);
          const currentDate = new Date();
          const diffMinutes = Math.abs(currentDate - lastBookingDate) / (1000 * 60);

          if (diffMinutes < REFILL_GAP_MINUTES) {
            const remainingMinutes = REFILL_GAP_MINUTES - diffMinutes;
            setErrorMsg(`Minimum gap between refills is ${formatGapDuration(REFILL_GAP_MINUTES)}. You can book another cylinder in ${formatGapDuration(remainingMinutes)}.`);
            setCanBook(false);
          }
        }
      } catch (err) {
        console.error("Failed to load profile/history", err);
        if (err.response && err.response.status === 404) {
          setErrorMsg("Please complete your connection profile before booking a cylinder.");
        } else {
          setErrorMsg("Failed to retrieve connection settings. Try again later.");
        }
      } finally {
        setPageLoading(false);
      }
    };
    checkProfileAndHistory();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const booking = await bookingService.createBooking(cylinderCount);
      setBookingDetails(booking);
      // Immediately open the real Razorpay checkout — the booking already
      // carries a real order created against Razorpay's API.
      openCheckout(booking);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Cylinder booking failed.');
    } finally {
      setLoading(false);
    }
  };

  const openCheckout = (booking) => {
    setErrorMsg('');
    setPaymentLoading(true);

    openRazorpayCheckout({
      keyId: booking.razorpayKeyId,
      orderId: booking.razorpayOrderId,
      amountInPaise: booking.razorpayAmountInPaise,
      name: 'LPG Cylinder Booking',
      description: `Booking #${booking.id} — Refill Cylinder`,
      prefill: {
        contact: profile?.mobileNumber || '',
      },
      onSuccess: async (response) => {
        try {
          await paymentService.verifyPayment(
            booking.id,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            'RAZORPAY'
          );
          setSuccessMsg(`Payment completed! Booking ID: #${booking.id} is confirmed.`);
          setTimeout(() => navigate('/customer/dashboard'), 2000);
        } catch (err) {
          console.error(err);
          const backendErrors = err.response?.data?.errors;
          setErrorMsg(
            (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
            err.response?.data?.message ||
            'Payment verification failed. If money was deducted, contact support with your booking ID.'
          );
        } finally {
          setPaymentLoading(false);
        }
      },
      onError: (message) => {
        setErrorMsg(message);
        setPaymentLoading(false);
      },
      onDismiss: () => {
        setPaymentLoading(false);
        setErrorMsg('Payment window closed. Your booking is saved as Pending Payment — you can retry from Booking History.');
      },
    });
  };

  if (pageLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-orange" role="status" style={{ color: '#ff5e36' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const isSuspended = profile && profile.status === 'Suspended';
  const hasNoProfile = !profile;

  return (
    <div className="container py-4 d-flex justify-content-center align-items-center animate-slide-up">
      <div className="glass-panel p-4 p-md-5 w-100" style={{ maxWidth: '580px' }}>
        <h2 className="text-white mb-1">Book Refill Cylinder</h2>
        <p className="text-secondary small border-bottom border-secondary-subtle pb-3 mb-4">Request a new LPG delivery to your service address</p>

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center gap-2 border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success d-flex align-items-center gap-2 border-success-subtle bg-success bg-opacity-10 text-success rounded-3 small p-3 mb-4">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <div>{successMsg}</div>
          </div>
        )}

        {hasNoProfile ? (
          <div className="text-center py-4">
            <p className="text-secondary small mb-3">You must complete your connection profile settings first.</p>
            <Link to="/customer/complete-profile" className="btn btn-gradient-primary rounded-pill px-4">
              Complete Profile Setup
            </Link>
          </div>
        ) : isSuspended ? (
          <div className="text-center py-4">
            <p className="text-secondary small">Your account connection is suspended. Booking refills is prohibited.</p>
            <Link to="/customer/dashboard" className="btn btn-outline-light rounded-pill px-4 mt-3">
              Go to Dashboard
            </Link>
          </div>
        ) : bookingDetails && bookingDetails.status === 'PendingPayment' ? (
          /* Booking created, waiting on the Razorpay widget (or it was dismissed) */
          <div className="text-center py-4">
            <div className="glass-card p-3 mb-4 text-start">
              <span className="text-secondary small d-block">Booking #{bookingDetails.id}</span>
              <span className="text-white fw-semibold fs-5">₹ {bookingDetails.totalAmount}</span>
              <span className="text-secondary small d-block mt-1">Status: Pending Payment</span>
            </div>
            <button
              type="button"
              className="btn btn-gradient-primary w-100 rounded-pill py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
              onClick={() => openCheckout(bookingDetails)}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <><i className="bi bi-shield-fill-check"></i> Pay with Razorpay</>
              )}
            </button>
            <p className="text-muted small mt-3 mb-0">
              You can also complete this payment later from Booking History.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit}>
            {/* Distributor Details read-only */}
            <div className="glass-card p-3 mb-4">
              <span className="text-secondary small d-block">Distributor Agency</span>
              <span className="text-white fw-semibold fs-5">{profile.preferredDistributorName}</span>
              <span className="text-secondary small d-block mt-2">Delivery Address</span>
              <span className="text-white-50 small">{profile.address}, {profile.city}, {profile.state} - {profile.pinCode}</span>
            </div>

            {/* Cylinder Count */}
            <div className="mb-4">
              <label className="form-label form-label-custom" htmlFor="cylinderCount">Cylinder Refills Count</label>
              <div className="d-flex align-items-center gap-3">
                <span className="fs-3 fw-bold text-white px-2">1</span>
                <span className="text-muted small ms-auto">(Exactly 1 cylinder per booking policy)</span>
              </div>
            </div>

            {/* Cost Details */}
            <div className="border-top border-secondary-subtle pt-3 mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Refill Price (x{cylinderCount})</span>
                <span className="text-white">₹ {(CylinderPrice * cylinderCount).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">GST & Delivery Charges</span>
                <span className="text-success small fw-semibold">FREE</span>
              </div>
              <hr className="border-secondary-subtle" />
              <div className="d-flex justify-content-between">
                <span className="text-white fw-bold">Total Amount Due</span>
                <span className="text-orange fw-bold fs-4" style={{ color: '#ff5e36' }}>₹ {(CylinderPrice * cylinderCount).toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-gradient-primary w-100 rounded-pill py-2.5 display-font fs-5 d-flex align-items-center justify-content-center gap-2"
              disabled={loading || !canBook}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <>
                  <i className="bi bi-cart-check-fill"></i> Proceed to Checkout
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookCylinder;
