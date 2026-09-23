import { useEffect, useState } from 'react';
import complaintService from '../../services/complaintService';

const CATEGORY_LABELS = {
  LateDelivery: 'Late Delivery',
  DamagedCylinder: 'Damaged Cylinder',
  WrongAmountCharged: 'Wrong Amount Charged',
  AgentBehaviour: 'Delivery Agent Behaviour',
  LeakageSafety: 'Leakage / Safety Concern',
  Other: 'Other',
};

const STATUS_BADGE = {
  Open: 'badge-pending',
  InProgress: 'badge-assigned',
  Resolved: 'badge-delivered',
  Rejected: 'badge-failed',
};

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [activeComplaint, setActiveComplaint] = useState(null);
  const [resolveStatus, setResolveStatus] = useState('InProgress');
  const [adminResponse, setAdminResponse] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveError, setResolveError] = useState('');

  const fetchComplaints = async (status) => {
    setLoading(true);
    try {
      const data = await complaintService.getAllComplaints(status || null);
      setComplaints(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openResolveModal = (complaint) => {
    setActiveComplaint(complaint);
    setResolveStatus('InProgress');
    setAdminResponse('');
    setResolveError('');
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setResolveError('');
    if (adminResponse.trim().length < 5) {
      setResolveError('Please enter a response for the customer (at least 5 characters).');
      return;
    }
    setResolveLoading(true);
    try {
      await complaintService.resolveComplaint(activeComplaint.id, resolveStatus, adminResponse.trim());
      setActiveComplaint(null);
      await fetchComplaints(statusFilter);
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data?.errors;
      setResolveError(
        (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
        err.response?.data?.message ||
        'Could not update complaint.'
      );
    } finally {
      setResolveLoading(false);
    }
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-orange" role="status" style={{ color: '#ff5e36' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const openCount = complaints.filter((c) => c.status === 'Open').length;

  return (
    <div className="animate-fade-in">
      <div className="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div>
          <h2 className="text-white mb-1">Complaint Management</h2>
          <p className="text-secondary small">Review and resolve customer complaints about bookings and deliveries.</p>
        </div>
        <select
          className="form-select form-control-custom text-white"
          style={{ maxWidth: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="Open">Open</option>
          <option value="InProgress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">
          {errorMsg}
        </div>
      )}

      <div className="glass-panel p-4 mb-4">
        <span className="text-secondary small d-block">Open Complaints</span>
        <span className="text-white fs-2 fw-bold d-block my-1">{openCount}</span>
      </div>

      <div className="glass-panel p-4">
        {complaints.length === 0 ? (
          <p className="text-secondary small mb-0">No complaints match this filter.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-borderless align-middle mb-0">
              <thead>
                <tr className="text-secondary small text-uppercase">
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Booking</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Raised</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-top border-secondary border-opacity-10">
                    <td className="text-white">#{c.id}</td>
                    <td className="text-secondary small">{c.customerEmail || '—'}</td>
                    <td className="text-secondary small">#{c.bookingId}</td>
                    <td className="text-secondary small">{CATEGORY_LABELS[c.category] || c.category}</td>
                    <td className="text-secondary small" style={{ maxWidth: '260px' }}>{c.description}</td>
                    <td><span className={`badge-status ${STATUS_BADGE[c.status] || 'badge-pending'}`}>{c.status}</span></td>
                    <td className="text-muted small">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      {(c.status === 'Open' || c.status === 'InProgress') && (
                        <button className="btn btn-gradient-primary btn-sm rounded-pill" onClick={() => openResolveModal(c)}>
                          Respond
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
            <div className="modal-content glass-panel p-4 border border-secondary border-opacity-30">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-white">Respond — Complaint #{activeComplaint.id}</h5>
                <button type="button" className="btn-close" onClick={() => setActiveComplaint(null)} disabled={resolveLoading}></button>
              </div>
              <div className="modal-body py-3">
                <p className="text-secondary small mb-1">{CATEGORY_LABELS[activeComplaint.category] || activeComplaint.category} — Booking #{activeComplaint.bookingId}</p>
                <p className="text-white small mb-3">{activeComplaint.description}</p>

                <form onSubmit={handleResolveSubmit}>
                  <label className="text-secondary small mb-1 d-block">Update Status</label>
                  <select
                    className="form-select form-control-custom text-white mb-3"
                    value={resolveStatus}
                    onChange={(e) => setResolveStatus(e.target.value)}
                    disabled={resolveLoading}
                  >
                    <option value="InProgress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <label className="text-secondary small mb-1 d-block">Response to Customer</label>
                  <textarea
                    className="form-control form-control-custom text-white mb-3"
                    rows="4"
                    placeholder="Explain what was found and/or what action was taken..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    disabled={resolveLoading}
                  />

                  {resolveError && (
                    <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-2 mb-3">
                      {resolveError}
                    </div>
                  )}

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" onClick={() => setActiveComplaint(null)} className="btn btn-outline-light btn-sm rounded-pill px-4" disabled={resolveLoading}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-gradient-primary btn-sm rounded-pill px-4" disabled={resolveLoading}>
                      {resolveLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Save & Notify Customer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
