import { useEffect, useState } from 'react';
import cylinderService from '../../services/cylinderService';
import bookingService from '../../services/bookingService';
import QrScanner from '../../components/QrScanner';

const STATUS_LABELS = {
  AT_FILLING_PLANT: 'At Filling Plant',
  AT_WAREHOUSE: 'At Warehouse',
  WITH_DISTRIBUTOR: 'With Distributor',
  WITH_DELIVERY_AGENT: 'With Delivery Agent',
  WITH_CUSTOMER: 'With Customer',
  RETURNED_FOR_REFILL: 'Returned for Refill',
};

const ACTIONS = [
  { eventType: 'DISPATCH_TO_DISTRIBUTOR', label: 'Receive from Warehouse', needsBooking: false },
  { eventType: 'HANDOVER_TO_AGENT', label: 'Hand Over to Delivery Agent', needsBooking: true },
  { eventType: 'RETURN_TO_DISTRIBUTOR', label: 'Accept Return (Failed Delivery)', needsBooking: false },
  { eventType: 'RECEIVE_AT_FILLING_PLANT', label: 'Send Empty Back to Plant', needsBooking: false },
];

const CylinderTracking = () => {
  const [cylinders, setCylinders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [selectedAction, setSelectedAction] = useState(ACTIONS[0].eventType);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [enteredSerialNumber, setEnteredSerialNumber] = useState('');
  const [scannedQrToken, setScannedQrToken] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [historyFor, setHistoryFor] = useState(null);
  const [history, setHistory] = useState([]);

  const loadData = async () => {
    try {
      const [cylList, bookingList] = await Promise.all([
        cylinderService.getMyCylinders(),
        bookingService.getDistributorBookings(),
      ]);
      setCylinders(cylList);
      setBookings(bookingList);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load cylinder tracking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentAction = ACTIONS.find((a) => a.eventType === selectedAction);

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!scannedQrToken) {
      setErrorMsg("Please scan the cylinder's QR code first.");
      return;
    }
    if (currentAction.needsBooking && !selectedBookingId) {
      setErrorMsg('Please select the booking this cylinder is being allocated to.');
      return;
    }

    setScanning(true);
    try {
      const result = await cylinderService.scanCylinder(
        scannedQrToken,
        selectedAction,
        currentAction.needsBooking ? parseInt(selectedBookingId) : null,
        enteredSerialNumber || null
      );
      setSuccessMsg(result.message);
      setScannedQrToken('');
      setEnteredSerialNumber('');
      setSelectedBookingId('');
      await loadData();
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data?.errors;
      setErrorMsg(
        (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
        err.response?.data?.message ||
        'Scan failed — this event may have been flagged for review.'
      );
    } finally {
      setScanning(false);
    }
  };

  const viewHistory = async (id) => {
    setHistoryFor(id);
    try {
      const events = await cylinderService.getHistory(id);
      setHistory(events);
    } catch (err) {
      console.error(err);
      setHistory([]);
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

  const atAgency = cylinders.filter((c) => c.status === 'WITH_DISTRIBUTOR');
  const withMyAgents = cylinders.filter((c) => c.status === 'WITH_DELIVERY_AGENT');
  const withCustomers = cylinders.filter((c) => c.status === 'WITH_CUSTOMER');
  const awaitingRefill = cylinders.filter((c) => c.status === 'RETURNED_FOR_REFILL');

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h2 className="text-white mb-1">Cylinder Tracking</h2>
        <p className="text-secondary small">Scan cylinders as they move through your agency — from warehouse intake to agent handover.</p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success border-success-subtle bg-success bg-opacity-10 text-success rounded-3 small p-3 mb-4">
          <i className="bi bi-check-circle-fill me-2"></i>{successMsg}
        </div>
      )}

      <div className="row g-4">
        {/* Scan panel */}
        <div className="col-lg-5">
          <div className="glass-panel p-4">
            <h5 className="text-white mb-3">Scan Cylinder</h5>

            <label className="text-secondary small mb-1 d-block">Action</label>
            <select
              className="form-select form-control-custom text-white mb-3"
              value={selectedAction}
              onChange={(e) => { setSelectedAction(e.target.value); setScannedQrToken(''); }}
            >
              {ACTIONS.map((a) => (
                <option key={a.eventType} value={a.eventType}>{a.label}</option>
              ))}
            </select>

            {currentAction.needsBooking && (
              <>
                <label className="text-secondary small mb-1 d-block">Booking to Allocate</label>
                <select
                  className="form-select form-control-custom text-white mb-3"
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                >
                  <option value="">Select booking...</option>
                  {bookings.filter(b => ['Assigned', 'Paid'].includes(b.status)).map((b) => (
                    <option key={b.id} value={b.id}>#{b.id} — {b.status}</option>
                  ))}
                </select>
              </>
            )}

            {showCamera ? (
              <div className="scanner-container-custom">
                {/* Visual Viewfinder Frame Overlays */}
                <div className="scanner-viewfinder">
                  <div className="scanner-bracket scanner-bracket-tl"></div>
                  <div className="scanner-bracket scanner-bracket-tr"></div>
                  <div className="scanner-bracket scanner-bracket-bl"></div>
                  <div className="scanner-bracket scanner-bracket-br"></div>
                  <div className="scanner-laser"></div>
                  <div className="position-absolute bottom-0 text-center py-2 w-100 text-white small" style={{ zIndex: 11, background: 'rgba(0,0,0,0.6)' }}>
                    Align cylinder QR code inside guide box
                  </div>
                </div>
                <QrScanner
                  active={showCamera}
                  onScan={(text) => { setScannedQrToken(text); setShowCamera(false); }}
                  onError={(msg) => setErrorMsg(msg)}
                />
              </div>
            ) : scannedQrToken ? (
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                <span className="text-secondary small text-truncate" style={{ maxWidth: '200px' }}>{scannedQrToken}</span>
                <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => { setScannedQrToken(''); setShowCamera(true); }}>
                  Rescan
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn-gradient-secondary btn-sm rounded-pill w-100 mb-3" onClick={() => setShowCamera(true)}>
                <i className="bi bi-camera-fill me-1"></i> Open Scanner Camera
              </button>
            )}

            <input
              type="text"
              placeholder="Engraved serial no. (optional cross-check)"
              className="form-control form-control-custom text-white mb-3 small"
              value={enteredSerialNumber}
              onChange={(e) => setEnteredSerialNumber(e.target.value)}
            />

            <button
              type="button"
              className="btn btn-gradient-primary w-100 rounded-pill py-2"
              onClick={handleScanSubmit}
              disabled={scanning}
            >
              {scanning ? <span className="spinner-border spinner-border-sm"></span> : 'Confirm Scan'}
            </button>
          </div>
        </div>

        {/* Full chain-of-custody visibility for this distributor */}
        <div className="col-lg-7">
          {[
            { title: 'At My Agency', list: atAgency, empty: 'No cylinders currently at your agency.' },
            { title: 'With My Delivery Agents', list: withMyAgents, empty: 'No cylinders currently out with your agents.' },
            { title: 'With Customers', list: withCustomers, empty: 'No cylinders currently with your customers.' },
            { title: 'Awaiting Refill Pickup', list: awaitingRefill, empty: 'No cylinders awaiting refill collection.' },
          ].map((group) => (
            <div className="glass-panel p-4 mb-4" key={group.title}>
              <h5 className="text-white mb-3">{group.title} ({group.list.length})</h5>
              {group.list.length === 0 ? (
                <p className="text-secondary small mb-0">{group.empty}</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-borderless align-middle mb-0">
                    <thead>
                      <tr className="text-secondary small text-uppercase">
                        <th>ID</th>
                        <th>Serial No.</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.list.map((c) => (
                        <tr key={c.id} className="border-top border-secondary border-opacity-10">
                          <td className="text-white">#{c.id}</td>
                          <td className="text-secondary small">{c.engravedSerialNumber}</td>
                          <td><span className="badge-status badge-delivered small">{STATUS_LABELS[c.status]}</span></td>
                          <td>
                            <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => viewHistory(c.id)}>
                              History
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {historyFor && (
            <div className="glass-panel p-4 mt-4">
              <h5 className="text-white mb-3">Lifecycle History — Cylinder #{historyFor}</h5>
              {history.length === 0 ? (
                <p className="text-secondary small mb-0">No scan events recorded yet.</p>
              ) : (
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {history.map((ev) => (
                    <div key={ev.id} className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 py-2">
                      <div>
                        <span className={`small fw-semibold ${ev.suspicious ? 'text-danger' : 'text-white'}`}>
                          {ev.eventType} {ev.suspicious && `(Flagged: ${ev.flagReason})`}
                        </span>
                        <br />
                        <span className="text-secondary small">{ev.fromStatus} → {ev.toStatus}</span>
                      </div>
                      <span className="text-muted small">{new Date(ev.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CylinderTracking;
