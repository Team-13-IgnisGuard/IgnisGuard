import { useEffect, useState } from 'react';
import cylinderService from '../../services/cylinderService';
import QrScanner from '../../components/QrScanner';

const STATUS_LABELS = {
  AT_FILLING_PLANT: 'At Filling Plant',
  AT_WAREHOUSE: 'At Warehouse',
  WITH_DISTRIBUTOR: 'With Distributor',
  WITH_DELIVERY_AGENT: 'With Delivery Agent',
  WITH_CUSTOMER: 'With Customer',
  RETURNED_FOR_REFILL: 'Returned for Refill',
};

// The two lifecycle steps a Warehouse Manager is responsible for:
// intake of freshly-filled cylinders into the warehouse, and receiving
// empty/returned cylinders back so they re-enter the refill cycle.
const ACTIONS = [
  { eventType: 'DISPATCH_TO_WAREHOUSE', label: 'Receive from Filling Plant', fromStatus: 'AT_FILLING_PLANT' },
  { eventType: 'RECEIVE_AT_FILLING_PLANT', label: 'Send Empty Cylinder to Plant', fromStatus: 'RETURNED_FOR_REFILL' },
];

const WarehouseDashboard = () => {
  const [cylinders, setCylinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [selectedAction, setSelectedAction] = useState(ACTIONS[0].eventType);
  const [enteredSerialNumber, setEnteredSerialNumber] = useState('');
  const [scannedQrToken, setScannedQrToken] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [historyFor, setHistoryFor] = useState(null);
  const [history, setHistory] = useState([]);

  const loadData = async () => {
    try {
      const cylList = await cylinderService.getAllCylinders();
      setCylinders(cylList);
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

    setScanning(true);
    try {
      const result = await cylinderService.scanCylinder(
        scannedQrToken,
        selectedAction,
        null,
        enteredSerialNumber || null
      );
      setSuccessMsg(result.message);
      setScannedQrToken('');
      setEnteredSerialNumber('');
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

  const warehouseCylinders = cylinders.filter((c) => c.status === 'AT_WAREHOUSE');
  const awaitingIntake = cylinders.filter((c) => c.status === currentAction.fromStatus);

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h2 className="text-white mb-1">Warehouse Manager — Cylinder Intake</h2>
        <p className="text-secondary small">Receive filled cylinders from the plant and process empty returns for refilling.</p>
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

      <div className="row g-3 mb-4">
        <div className="col-lg col-sm-6">
          <div className="glass-panel p-4 h-100">
            <span className="text-secondary small d-block">Currently At Warehouse</span>
            <span className="text-white fs-2 fw-bold d-block my-1">{warehouseCylinders.length}</span>
          </div>
        </div>
        <div className="col-lg col-sm-6">
          <div className="glass-panel p-4 h-100">
            <span className="text-secondary small d-block">Awaiting {currentAction.label}</span>
            <span className="text-white fs-2 fw-bold d-block my-1">{awaitingIntake.length}</span>
          </div>
        </div>
      </div>

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

            {showCamera ? (
              <QrScanner
                active={showCamera}
                onScan={(text) => { setScannedQrToken(text); setShowCamera(false); }}
                onError={(msg) => setErrorMsg(msg)}
              />
            ) : scannedQrToken ? (
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <span className="text-secondary small text-truncate" style={{ maxWidth: '200px' }}>{scannedQrToken}</span>
                <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => { setScannedQrToken(''); setShowCamera(true); }}>
                  Rescan
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn-gradient-secondary btn-sm rounded-pill w-100 mb-3" onClick={() => setShowCamera(true)}>
                Open Camera
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

        {/* Warehouse inventory */}
        <div className="col-lg-7">
          <div className="glass-panel p-4">
            <h5 className="text-white mb-3">Cylinders At Warehouse ({warehouseCylinders.length})</h5>
            {warehouseCylinders.length === 0 ? (
              <p className="text-secondary small mb-0">No cylinders currently at the warehouse.</p>
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
                    {warehouseCylinders.map((c) => (
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

export default WarehouseDashboard;
