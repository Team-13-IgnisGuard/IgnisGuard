import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

const DistributorList = () => {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const data = await adminService.getDistributors();
        setDistributors(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to retrieve platform distributors registry.");
      } finally {
        setLoading(false);
      }
    };
    fetchDistributors();
  }, []);

  const handleDeleteDistributor = async (distributorId, agencyName) => {
    if (!window.confirm(`Are you sure you want to permanently delete distributor "${agencyName}"? This will delete their user login account, distributor profile, all registered delivery agents, and all booking/payment history.`)) {
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await adminService.deleteDistributor(distributorId);
      setSuccessMsg(res.message || "Distributor agency deleted successfully.");
      setLoading(true);
      const data = await adminService.getDistributors();
      setDistributors(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to delete distributor agency.");
    } finally {
      setLoading(false);
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
        <h2 className="text-white mb-1">Distributor Registry</h2>
        <p className="text-secondary small">Monitor platform-registered distribution hubs and inventory levels</p>
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

      {distributors.length === 0 ? (
        <div className="glass-panel p-5 text-center">
          <i className="bi bi-shop text-secondary display-3 d-block mb-3"></i>
          <h4 className="text-white">No Distributors Found</h4>
          <p className="text-secondary small">No distributor profiles have been created on this platform yet.</p>
        </div>
      ) : (
        <div className="glass-panel p-4">
          <div className="table-responsive">
            <table className="table table-custom mb-0">
              <thead>
                <tr>
                  <th>Agency Name</th>
                  <th>Contact Number</th>
                  <th>Warehouse Location</th>
                  <th>Refill Stock Status</th>
                  <th>Total Capacity</th>
                  <th>Alerts</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {distributors.map(d => (
                  <tr key={d.id}>
                    <td className="text-white fw-semibold">{d.agencyName}</td>
                    <td>{d.contactNumber}</td>
                    <td className="small text-light-emphasis" style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.address}
                    </td>
                    <td className="fw-semibold text-white">
                      <span className={d.currentStock < 50 ? 'text-danger fw-bold' : 'text-success'}>
                        {d.currentStock}
                      </span>
                    </td>
                    <td>{d.inventoryCapacity}</td>
                    <td>
                      {d.currentStock < 50 ? (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-30 small">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i> Low Stock
                        </span>
                      ) : (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-30 small">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm rounded-circle p-2"
                        style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Delete Distributor Agency"
                        onClick={() => handleDeleteDistributor(d.id, d.agencyName)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorList;
