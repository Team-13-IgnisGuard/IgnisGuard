import { useEffect, useState } from 'react';
import cylinderService from '../../services/cylinderService';
import CylinderQrImage from '../../components/CylinderQrImage';

const STATUS_LABELS = {
  AT_FILLING_PLANT: 'At Filling Plant',
  AT_WAREHOUSE: 'At Warehouse',
  WITH_DISTRIBUTOR: 'With Distributor',
  WITH_DELIVERY_AGENT: 'With Delivery Agent',
  WITH_CUSTOMER: 'With Customer',
  RETURNED_FOR_REFILL: 'Returned for Refill',
};

const SuperAdminDashboard = () => {
  const [cylinders, setCylinders] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [serialInput, setSerialInput] = useState('');
  const [registering, setRegistering] = useState(false);
  const [lastRegistered, setLastRegistered] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const [historyFor, setHistoryFor] = useState(null);
  const [history, setHistory] = useState([]);

  const loadData = async () => {
    try {
      const [cylList, flaggedList] = await Promise.all([
        cylinderService.getAllCylinders(),
        cylinderService.getFlaggedEvents(),
      ]);
      setCylinders(cylList);
      setFlagged(flaggedList);
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!serialInput.trim()) {
      setErrorMsg('Please enter the engraved serial number.');
      return;
    }
    if (serialInput.trim().length < 5 || serialInput.trim().length > 50) {
      setErrorMsg('Engraved serial number must be between 5 and 50 characters.');
      return;
    }
    setRegistering(true);
    try {
      const result = await cylinderService.registerCylinder(serialInput.trim());
      setLastRegistered(result.cylinder);
      setSuccessMsg(`Cylinder #${result.cylinder.id} registered and QR assigned.`);
      setSerialInput('');
      await loadData();
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data?.errors;
      setErrorMsg(
        (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
        err.response?.data?.message ||
        'Cylinder registration failed.'
      );
    } finally {
      setRegistering(false);
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

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h2 className="text-white mb-1">Super Admin — Cylinder Tracking</h2>
        <p className="text-secondary small">Register new cylinders, assign QR codes, and audit their full lifecycle.</p>
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
            <span className="text-secondary small d-block">Total Cylinders</span>
            <span className="text-white fs-2 fw-bold d-block my-1">{cylinders.length}</span>
          </div>
        </div>
        <div className="col-lg col-sm-6">
          <div className="glass-panel p-4 h-100">
            <span className="text-secondary small d-block">Flagged / Suspicious Scans</span>
            <span className="text-white fs-2 fw-bold d-block my-1">{flagged.length}</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Register new cylinder */}
        <div className="col-lg-4">
          <div className="glass-panel p-4">
            <h5 className="text-white mb-3">Register New Cylinder</h5>
            <form onSubmit={handleRegister}>
              <label className="text-secondary small mb-1 d-block">Manufacturer-Engraved Serial Number</label>
              <input
                type="text"
                className="form-control form-control-custom text-white mb-3"
                placeholder="e.g. ENG-2026-00417"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
              />
              <button type="submit" className="btn btn-gradient-primary w-100 rounded-pill py-2" disabled={registering}>
                {registering ? <span className="spinner-border spinner-border-sm"></span> : 'Register & Generate QR'}
              </button>
            </form>

            {lastRegistered && (
              <div className="mt-4 text-center">
                <p className="text-secondary small mb-2">
                  QR for Cylinder #{lastRegistered.id} (Serial: {lastRegistered.engravedSerialNumber})
                </p>
                <CylinderQrImage
                  token={lastRegistered.qrToken}
                  showDownload
                  fileName={`cylinder-qr-${lastRegistered.engravedSerialNumber || lastRegistered.id}`}
                />
                <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                  <p className="text-muted small mb-0 text-break" style={{ maxWidth: '260px' }}>{lastRegistered.qrToken}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(lastRegistered.qrToken);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                >
                  <i className={`bi ${copiedToken ? 'bi-check-lg' : 'bi-clipboard'} me-1`}></i>
                  {copiedToken ? 'Copied!' : 'Copy token'}
                </button>
                <p className="text-muted small mt-1 mb-0">
                  Use this button rather than selecting the text manually — the token is long and an incomplete selection will fail scanning.
                </p>
              </div>
            )}
          </div>

          {/* Flagged events panel */}
          <div className="glass-panel p-4 mt-4">
            <h5 className="text-white mb-3"><i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>Flagged Scans</h5>
            {flagged.length === 0 ? (
              <p className="text-secondary small mb-0">No suspicious activity detected.</p>
            ) : (
              <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                {flagged.map((ev) => (
                  <div key={ev.id} className="border-bottom border-secondary border-opacity-25 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-danger small fw-semibold">{ev.flagReason}</span>
                      <span className="text-muted small">Cyl #{ev.cylinderId}</span>
                    </div>
                    <span className="text-secondary small">
                      {ev.eventType} by {ev.scannedByRole} ({ev.scannedByUserId}) — {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cylinder list */}
        <div className="col-lg-8">
          <div className="glass-panel p-4">
            <h5 className="text-white mb-3">All Cylinders</h5>
            {cylinders.length === 0 ? (
              <p className="text-secondary small mb-0">No cylinders registered yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-borderless align-middle mb-0">
                  <thead>
                    <tr className="text-secondary small text-uppercase">
                      <th>ID</th>
                      <th>Serial No.</th>
                      <th>Status</th>
                      <th>Assigned Booking</th>
                      <th>Last Scan</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cylinders.map((c) => (
                      <tr key={c.id} className="border-top border-secondary border-opacity-10">
                        <td className="text-white">#{c.id}</td>
                        <td className="text-secondary small">{c.engravedSerialNumber}</td>
                        <td>
                          <span className="badge-status badge-delivered small">
                            {STATUS_LABELS[c.status] || c.status}
                          </span>
                        </td>
                        <td className="text-secondary small">{c.assignedBookingId ? `#${c.assignedBookingId}` : '—'}</td>
                        <td className="text-muted small">{c.lastScanAt ? new Date(c.lastScanAt).toLocaleString() : '—'}</td>
                        <td>
                          <button className="btn btn-outline-secondary btn-sm rounded-pill me-2" onClick={() => setLastRegistered(c)}>
                            QR
                          </button>
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
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {history.map((ev) => (
                    <div key={ev.id} className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 py-2">
                      <div>
                        <span className={`small fw-semibold ${ev.suspicious ? 'text-danger' : 'text-white'}`}>
                          {ev.eventType} {ev.suspicious && `(Flagged: ${ev.flagReason})`}
                        </span>
                        <br />
                        <span className="text-secondary small">
                          {ev.fromStatus} → {ev.toStatus} · by {ev.scannedByRole} ({ev.scannedByUserId})
                        </span>
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

export default SuperAdminDashboard;
