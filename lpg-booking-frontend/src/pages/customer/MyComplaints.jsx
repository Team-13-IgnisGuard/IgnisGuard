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

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await complaintService.getMyComplaints();
        setComplaints(data);
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load your complaints.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

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
        <h2 className="text-white mb-1">My Complaints</h2>
        <p className="text-secondary small">Track the status of issues you've raised about your bookings and deliveries.</p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">
          {errorMsg}
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="glass-panel p-5 text-center">
          <i className="bi bi-flag text-secondary" style={{ fontSize: '2.5rem' }}></i>
          <p className="text-secondary mt-3 mb-0">You haven't raised any complaints. If something goes wrong with a booking, you can report it from Booking History.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {complaints.map((c) => (
            <div key={c.id} className="glass-panel p-4">
              <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                <div>
                  <span className="text-white fw-semibold">Complaint #{c.id}</span>
                  <span className="text-secondary small ms-2">— Booking #{c.bookingId}</span>
                </div>
                <span className={`badge-status ${STATUS_BADGE[c.status] || 'badge-pending'}`}>{c.status}</span>
              </div>
              <p className="text-secondary small mb-1">
                <i className="bi bi-tag me-1"></i>{CATEGORY_LABELS[c.category] || c.category}
              </p>
              <p className="text-white small mb-2">{c.description}</p>
              <p className="text-muted small mb-0">Raised on {new Date(c.createdAt).toLocaleString()}</p>

              {c.adminResponse && (
                <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-secondary small fw-semibold mb-1">
                    <i className="bi bi-reply-fill me-1"></i>Response from our team
                  </p>
                  <p className="text-white small mb-0">{c.adminResponse}</p>
                  {c.resolvedAt && (
                    <p className="text-muted small mt-1 mb-0">Updated {new Date(c.resolvedAt).toLocaleString()}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
