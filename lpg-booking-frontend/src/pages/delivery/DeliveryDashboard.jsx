import { useEffect, useState } from 'react';
import bookingService from '../../services/bookingService';
import cylinderService from '../../services/cylinderService';
import QrScanner from '../../components/QrScanner';

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Delivery details state
  const [activeDeliveryDetail, setActiveDeliveryDetail] = useState(null);

  // OTP + Cylinder QR Verification modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpBookingId, setOtpBookingId] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [scannedQrToken, setScannedQrToken] = useState('');
  const [enteredSerialNumber, setEnteredSerialNumber] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [qrError, setQrError] = useState('');

  // Refill pickup — collecting an empty cylinder back from a customer
  const [refillQrToken, setRefillQrToken] = useState('');
  const [showRefillCamera, setShowRefillCamera] = useState(false);
  const [refillLoading, setRefillLoading] = useState(false);
  const [refillMsg, setRefillMsg] = useState('');
  const [refillError, setRefillError] = useState('');

  const fetchDeliveries = async () => {
    try {
      const list = await bookingService.getAgentDeliveries();
      setDeliveries(list);
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data?.errors;
      setErrorMsg(
        (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
        err.response?.data?.message ||
        'Failed to retrieve assigned deliveries registry.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleStatusUpdate = async (bookingId, nextStatus) => {
    if (nextStatus === 'DeliveryFailed') {
      if (!window.confirm("Are you sure you want to mark this delivery as failed?")) {
        return;
      }
    }
    setActionLoadingId(bookingId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await bookingService.updateDeliveryStatus(bookingId, nextStatus);
      setSuccessMsg(`Order #${bookingId} successfully updated to status: ${nextStatus}`);
      await fetchDeliveries();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Status update failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenConfirmModal = (bookingId) => {
    setOtpBookingId(bookingId);
    setEnteredOtp('');
    setOtpError('');
    setScannedQrToken('');
    setEnteredSerialNumber('');
    setShowCamera(false);
    setQrError('');
    setShowOtpModal(true);
  };

  const handleQrScanSuccess = (decodedText) => {
    setScannedQrToken(decodedText);
    setShowCamera(false);
    setQrError('');
  };

  const handleRefillPickupSubmit = async () => {
    setRefillError('');
    setRefillMsg('');
    if (!refillQrToken) {
      setRefillError("Please scan the cylinder's QR code first.");
      return;
    }
    setRefillLoading(true);
    try {
      const result = await cylinderService.scanCylinder(refillQrToken, 'PICKUP_FOR_REFILL', null, null);
      setRefillMsg(result.message || 'Empty cylinder collected for refill.');
      setRefillQrToken('');
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data?.errors;
      setRefillError(
        (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
        err.response?.data?.message ||
        'Could not record the refill pickup — this scan may have been flagged for review.'
      );
    } finally {
      setRefillLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }
    if (!scannedQrToken) {
      setOtpError("Please scan the cylinder's QR code before confirming delivery.");
      return;
    }
    setOtpError('');
    setActionLoadingId(otpBookingId);
    try {
      await bookingService.updateDeliveryStatus(otpBookingId, 'Delivered', enteredOtp, scannedQrToken, enteredSerialNumber || null);
      setSuccessMsg(`Order #${otpBookingId} delivered successfully! Cylinder verified via QR + OTP.`);
      setShowOtpModal(false);
      await fetchDeliveries();
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data?.errors;
      setOtpError(
        (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
        err.response?.data?.message ||
        "Verification failed. Please try again."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

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

  // Active dispatches vs Completed runs
  const activeRuns = deliveries.filter(d => d.status !== 'Delivered');
  const completedRuns = deliveries.filter(d => d.status === 'Delivered');

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h2 className="text-white mb-1">Agent Delivery Runs</h2>
        <p className="text-secondary small">Review assigned cylinder shipments and coordinate route handovers</p>
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

      {/* Refill pickup — collect an empty cylinder back from a customer */}
      <div className="glass-panel p-4 mb-4">
        <h3 className="text-white fs-5 border-bottom border-secondary-subtle pb-3 mb-3">
          <i className="bi bi-arrow-repeat me-2"></i>Collect Empty Cylinder (Refill Pickup)
        </h3>
        <p className="text-secondary small mb-3">
          When collecting an empty cylinder from a customer for refilling, scan its QR here to move it back into the refill cycle.
        </p>

        {refillError && (
          <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-3">
            {refillError}
          </div>
        )}
        {refillMsg && (
          <div className="alert alert-success border-success-subtle bg-success bg-opacity-10 text-success rounded-3 small p-3 mb-3">
            <i className="bi bi-check-circle-fill me-2"></i>{refillMsg}
          </div>
        )}

        {showRefillCamera ? (
          <QrScanner
            active={showRefillCamera}
            onScan={(text) => { setRefillQrToken(text); setShowRefillCamera(false); }}
            onError={(msg) => setRefillError(msg)}
          />
        ) : refillQrToken ? (
          <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', maxWidth: '400px' }}>
            <span className="text-secondary small text-truncate" style={{ maxWidth: '260px' }}>{refillQrToken}</span>
            <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => { setRefillQrToken(''); setShowRefillCamera(true); }}>
              Rescan
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-gradient-secondary btn-sm rounded-pill" style={{ maxWidth: '220px' }} onClick={() => { setRefillError(''); setShowRefillCamera(true); }}>
            <i className="bi bi-camera-fill me-1"></i>Scan Empty Cylinder QR
          </button>
        )}

        {refillQrToken && (
          <button
            type="button"
            className="btn btn-gradient-primary rounded-pill py-2 px-4 mt-3 d-block"
            onClick={handleRefillPickupSubmit}
            disabled={refillLoading}
          >
            {refillLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Confirm Refill Pickup'}
          </button>
        )}
      </div>

      {/* Main grids */}
      <div className="row g-4">
        {/* Active deliveries panel */}
        <div className="col-lg-8 col-12">
          <div className="glass-panel p-4 h-100">
            <h3 className="text-white fs-5 border-bottom border-secondary-subtle pb-3 mb-3">Active Shipments</h3>
            {activeRuns.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-patch-check-fill text-success display-3 d-block mb-3"></i>
                <h4 className="text-white">All Clear!</h4>
                <p className="text-secondary small mb-0">No active cylinder deliveries are currently on your schedule.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {activeRuns.map(run => (
                  <div key={run.id} className="glass-card p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-white fw-bold">Order ID: #{run.id}</span>
                        <span className={`badge-status ${getStatusBadgeClass(run.status)}`}>{run.status}</span>
                      </div>
                      <div className="text-secondary small">
                        Connection: <span className="text-white fw-medium">{run.connectionNumber}</span> | Quantity: <span className="text-white fw-medium">{run.cylinderCount}</span>
                      </div>
                      <div className="text-secondary small mt-1">
                        Address: <span className="text-white-50">{run.address}, {run.city}</span>
                      </div>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button 
                        onClick={() => setActiveDeliveryDetail(run)} 
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                        disabled={actionLoadingId !== null}
                      >
                        Details
                      </button>
                      
                      {run.status === 'Assigned' && (
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(run.id, 'OutForDelivery')}
                            className="btn btn-gradient-secondary btn-sm rounded-pill px-3"
                            disabled={actionLoadingId !== null}
                          >
                            {actionLoadingId === run.id ? <span className="spinner-border spinner-border-sm"></span> : "Out For Delivery"}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(run.id, 'DeliveryFailed')}
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            disabled={actionLoadingId !== null}
                          >
                            Mark Failed
                          </button>
                        </div>
                      )}

                      {run.status === 'OutForDelivery' && (
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleOpenConfirmModal(run.id)}
                            className="btn btn-success btn-sm rounded-pill px-3"
                            disabled={actionLoadingId !== null}
                          >
                            Confirm Delivery
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(run.id, 'DeliveryFailed')}
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            disabled={actionLoadingId !== null}
                          >
                            Mark Failed
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Completed dispatches */}
        <div className="col-lg-4 col-12">
          <div className="glass-panel p-4 h-100">
            <h3 className="text-white fs-5 border-bottom border-secondary-subtle pb-3 mb-3">Completed Shifts</h3>
            {completedRuns.length === 0 ? (
              <p className="text-secondary small text-center py-4">No completed runs recorded in this session.</p>
            ) : (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {completedRuns.map(run => (
                  <div key={run.id} className="p-2 border-bottom border-secondary-subtle d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-white small fw-semibold d-block">Order ID: #{run.id}</span>
                      <span className="text-secondary small d-block">Delivered on: {run.deliveryDate ? new Date(run.deliveryDate).toLocaleDateString() : '-'}</span>
                    </div>
                    <span className="badge-status badge-delivered small">Delivered</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery details dialog modal */}
      {activeDeliveryDetail && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content glass-panel p-4 border border-secondary border-opacity-30">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-white">Cylinder Shipment Details</h5>
                <button type="button" className="btn-close" onClick={() => setActiveDeliveryDetail(null)}></button>
              </div>
              <div className="modal-body py-4 text-secondary small">
                <div className="d-flex flex-column gap-3 bg-secondary p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <div className="d-flex justify-content-between">
                    <span>Order Reference ID:</span>
                    <span className="text-white fw-bold">#{activeDeliveryDetail.id}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Consumer Connection Number:</span>
                    <span className="text-white fw-semibold">{activeDeliveryDetail.connectionNumber}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Cylinder Refills Count:</span>
                    <span className="text-white fw-semibold">{activeDeliveryDetail.cylinderCount}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Total Cash to Collect:</span>
                    <span className="text-orange fw-bold" style={{ color: '#ff5e36' }}>₹ {activeDeliveryDetail.totalAmount}</span>
                  </div>
                  <hr className="border-secondary my-1" />
                  <div className="d-flex flex-column gap-1">
                    <span>Service Delivery Address:</span>
                    <span className="text-white-50">{activeDeliveryDetail.address}, {activeDeliveryDetail.city}, {activeDeliveryDetail.state} - {activeDeliveryDetail.pinCode}</span>
                  </div>
                </div>
                
                <div className="d-flex justify-content-end mt-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-4" onClick={() => setActiveDeliveryDetail(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cylinder QR + Doorstep OTP Verification Modal */}
      {showOtpModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content glass-panel p-4 border border-secondary border-opacity-30">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-white">Confirm Delivery</h5>
                <button type="button" className="btn-close" onClick={() => setShowOtpModal(false)}></button>
              </div>
              <div className="modal-body py-3">
                <p className="text-secondary small text-center mb-3">
                  Both checks are required: the QR scan confirms this is the <em>correct cylinder</em>,
                  the OTP confirms this is the <em>correct customer</em>.
                </p>

                {/* Step 1: Cylinder QR scan */}
                <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-white small fw-semibold">
                      <i className="bi bi-qr-code-scan me-1"></i> 1. Scan Cylinder QR
                    </span>
                    {scannedQrToken && <span className="badge-status badge-delivered small">Scanned ✓</span>}
                  </div>

                  {showCamera ? (
                    <QrScanner
                      active={showCamera}
                      onScan={handleQrScanSuccess}
                      onError={(msg) => setQrError(msg)}
                    />
                  ) : scannedQrToken ? (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary small text-truncate" style={{ maxWidth: '220px' }}>
                        {scannedQrToken}
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm rounded-pill"
                        onClick={() => { setScannedQrToken(''); setShowCamera(true); }}
                      >
                        Rescan
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-gradient-secondary btn-sm rounded-pill w-100"
                      onClick={() => { setQrError(''); setShowCamera(true); }}
                    >
                      Open Camera
                    </button>
                  )}
                  {qrError && <div className="text-danger small mt-2">{qrError}</div>}

                  <input
                    type="text"
                    placeholder="Engraved serial no. (optional cross-check)"
                    className="form-control form-control-custom text-white small mt-2"
                    value={enteredSerialNumber}
                    onChange={(e) => setEnteredSerialNumber(e.target.value)}
                  />
                </div>

                {/* Step 2: OTP */}
                <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-white small fw-semibold d-block mb-2">
                    <i className="bi bi-shield-check me-1"></i> 2. Enter Customer OTP
                  </span>
                  <form onSubmit={handleVerifyOtpSubmit}>
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="123456"
                      className="form-control form-control-custom text-center fs-4 fw-bold text-white"
                      style={{ letterSpacing: '0.2em' }}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    />
                    {otpError && (
                      <div className="text-danger small mt-2">{otpError}</div>
                    )}
                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="submit"
                        className="btn btn-gradient-primary w-100 rounded-pill py-2"
                        disabled={actionLoadingId !== null}
                      >
                        {actionLoadingId !== null ? <span className="spinner-border spinner-border-sm"></span> : "Verify & Complete"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100 rounded-pill py-2"
                        onClick={() => setShowOtpModal(false)}
                        disabled={actionLoadingId !== null}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
