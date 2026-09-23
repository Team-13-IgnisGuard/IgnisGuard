import { useEffect, useState } from 'react';
import p2pService from '../../services/p2pService';
import cylinderService from '../../services/cylinderService';
import QrScanner from '../../components/QrScanner';

const STATUS_BADGE = {
  Requested: 'badge-pending',
  Approved: 'badge-assigned',
  Active: 'badge-delivery',
  Returned: 'badge-delivered',
  Rejected: 'badge-failed',
  Cancelled: 'badge-cancelled',
};

const P2PTransfer = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // New request form
  const [lenderMobile, setLenderMobile] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  // Per-card action state (approve/reject/cancel spinners)
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Inline scan panel — only one open at a time, keyed by request id + purpose
  const [scanningFor, setScanningFor] = useState(null); // { requestId, eventType }
  const [scannedQrToken, setScannedQrToken] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');

  const fetchRequests = async () => {
    try {
      const data = await p2pService.getMyRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load your transfer requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!/^[6-9][0-9]{9}$/.test(lenderMobile)) {
      setErrorMsg('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setRequestLoading(true);
    try {
      const result = await p2pService.createRequest(lenderMobile);
      setSuccessMsg(result.message);
      setLenderMobile('');
      await fetchRequests();
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data?.errors;
      setErrorMsg(
        (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
        err.response?.data?.message ||
        'Could not send request.'
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoadingId(id);
    setErrorMsg('');
    try {
      if (action === 'approve') await p2pService.approve(id);
      if (action === 'reject') await p2pService.reject(id);
      if (action === 'cancel') await p2pService.cancel(id);
      await fetchRequests();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openScan = (requestId, eventType) => {
    setScanningFor({ requestId, eventType });
    setScannedQrToken('');
    setShowCamera(false);
    setScanError('');
  };

  const handleScanConfirm = async () => {
    if (!scannedQrToken) {
      setScanError("Please scan the cylinder's QR code first.");
      return;
    }
    setScanLoading(true);
    setScanError('');
    try {
      await cylinderService.scanCylinder(scannedQrToken, scanningFor.eventType, scanningFor.requestId, null);
      setSuccessMsg(
        scanningFor.eventType === 'P2P_LEND'
          ? 'Handover confirmed — your neighbor now has the cylinder.'
          : 'Return confirmed — thank you for returning the cylinder.'
      );
      setScanningFor(null);
      await fetchRequests();
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data?.errors;
      setScanError(
        (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
        err.response?.data?.message ||
        'Scan failed — this may have been flagged for review.'
      );
    } finally {
      setScanLoading(false);
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

  const renderActions = (r) => {
    if (r.status === 'Requested' && r.myRole === 'LENDER') {
      return (
        <div className="d-flex gap-2">
          <button className="btn btn-gradient-primary btn-sm rounded-pill px-3" disabled={actionLoadingId === r.id} onClick={() => handleAction(r.id, 'approve')}>
            {actionLoadingId === r.id ? <span className="spinner-border spinner-border-sm"></span> : 'Approve'}
          </button>
          <button className="btn btn-outline-danger btn-sm rounded-pill px-3" disabled={actionLoadingId === r.id} onClick={() => handleAction(r.id, 'reject')}>
            Reject
          </button>
        </div>
      );
    }
    if (r.status === 'Requested' && r.myRole === 'BORROWER') {
      return (
        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={actionLoadingId === r.id} onClick={() => handleAction(r.id, 'cancel')}>
          Cancel Request
        </button>
      );
    }
    if (r.status === 'Approved' && r.myRole === 'LENDER') {
      return (
        <button className="btn btn-gradient-secondary btn-sm rounded-pill px-3" onClick={() => openScan(r.id, 'P2P_LEND')}>
          <i className="bi bi-qr-code-scan me-1"></i>Scan to Hand Over
        </button>
      );
    }
    if (r.status === 'Approved' && r.myRole === 'BORROWER') {
      return <span className="text-secondary small">Waiting for your neighbor to hand over the cylinder…</span>;
    }
    if (r.status === 'Active' && r.myRole === 'BORROWER') {
      return (
        <button className="btn btn-gradient-secondary btn-sm rounded-pill px-3" onClick={() => openScan(r.id, 'P2P_RETURN')}>
          <i className="bi bi-qr-code-scan me-1"></i>Scan to Return
        </button>
      );
    }
    if (r.status === 'Active' && r.myRole === 'LENDER') {
      return <span className="text-secondary small">Cylinder is currently on loan — awaiting return.</span>;
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h2 className="text-white mb-1">Emergency Neighbor Transfer</h2>
        <p className="text-secondary small">Out of gas and your booking is still days away? Request a temporary cylinder swap with a verified neighbor.</p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="alert alert-success border-success-subtle bg-success bg-opacity-10 text-success rounded-3 small p-3 mb-4">
          <i className="bi bi-check-circle-fill me-2"></i>{successMsg}
        </div>
      )}

      <div className="glass-panel p-4 mb-4">
        <h5 className="text-white mb-3">Request a Cylinder from a Neighbor</h5>
        <form onSubmit={handleRequestSubmit} className="d-flex gap-2 flex-wrap">
          <input
            type="text"
            className="form-control form-control-custom text-white"
            style={{ maxWidth: '260px' }}
            placeholder="Neighbor's registered mobile number"
            value={lenderMobile}
            onChange={(e) => setLenderMobile(e.target.value.replace(/\D/g, '').substring(0, 10))}
            disabled={requestLoading}
          />
          <button type="submit" className="btn btn-gradient-primary rounded-pill px-4" disabled={requestLoading}>
            {requestLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Send Request'}
          </button>
        </form>
        <p className="text-muted small mt-2 mb-0">
          Your neighbor must approve before anything changes — no cylinder moves without both of you confirming via QR scan.
        </p>
      </div>

      <div className="glass-panel p-4">
        <h5 className="text-white mb-3">My Transfer Requests</h5>
        {requests.length === 0 ? (
          <p className="text-secondary small mb-0">No transfer requests yet.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {requests.map((r) => (
              <div key={r.id} className="p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                  <div>
                    <span className="text-white fw-semibold">Request #{r.id}</span>
                    <span className="text-secondary small ms-2">
                      You are the {r.myRole === 'LENDER' ? 'lender' : 'borrower'}
                    </span>
                  </div>
                  <span className={`badge-status ${STATUS_BADGE[r.status] || 'badge-pending'}`}>{r.status}</span>
                </div>
                <p className="text-secondary small mb-2">
                  {r.myRole === 'LENDER'
                    ? <>Borrower: <span className="text-white">{r.borrowerName || 'Unknown'}</span> ({r.borrowerConnectionNumber})</>
                    : <>Lender: <span className="text-white">{r.lenderName || 'Unknown'}</span> ({r.lenderConnectionNumber})</>
                  }
                </p>
                <p className="text-muted small mb-2">Requested {new Date(r.requestedAt).toLocaleString()}</p>

                {renderActions(r)}

                {scanningFor && scanningFor.requestId === r.id && (
                  <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', maxWidth: '380px' }}>
                    {showCamera ? (
                      <QrScanner
                        active={showCamera}
                        onScan={(text) => { setScannedQrToken(text); setShowCamera(false); }}
                        onError={(msg) => setScanError(msg)}
                      />
                    ) : scannedQrToken ? (
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-secondary small text-truncate" style={{ maxWidth: '220px' }}>{scannedQrToken}</span>
                        <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => { setScannedQrToken(''); setShowCamera(true); }}>
                          Rescan
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-gradient-secondary btn-sm rounded-pill w-100 mb-2" onClick={() => setShowCamera(true)}>
                        Open Camera
                      </button>
                    )}

                    {scanError && <div className="text-danger small mb-2">{scanError}</div>}

                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={() => setScanningFor(null)} disabled={scanLoading}>
                        Cancel
                      </button>
                      <button type="button" className="btn btn-gradient-primary btn-sm rounded-pill px-3" onClick={handleScanConfirm} disabled={scanLoading}>
                        {scanLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Confirm Scan'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default P2PTransfer;
