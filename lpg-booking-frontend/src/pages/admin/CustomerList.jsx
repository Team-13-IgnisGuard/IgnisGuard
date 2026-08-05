import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await adminService.getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to retrieve platform customers list.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleDeleteCustomer = async (customerId, connectionNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete customer connection "${connectionNumber}"? This will delete their user login account, connection profile, and all booking/payment history.`)) {
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await adminService.deleteCustomer(customerId);
      setSuccessMsg(res.message || "Customer connection deleted successfully.");
      setLoading(true);
      const data = await adminService.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to delete customer connection.");
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
        <h2 className="text-white mb-1">Customer Connections</h2>
        <p className="text-secondary small">Review customer profiles, connection credentials, and service areas</p>
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

      {customers.length === 0 ? (
        <div className="glass-panel p-5 text-center">
          <i className="bi bi-people-fill text-secondary display-3 d-block mb-3"></i>
          <h4 className="text-white">No Customer Profiles Setup</h4>
          <p className="text-secondary small">No customer users have set up their connection profiles yet.</p>
        </div>
      ) : (
        <div className="glass-panel p-4">
          <div className="table-responsive">
            <table className="table table-custom mb-0">
              <thead>
                <tr>
                  <th>Connection ID</th>
                  <th>Customer Email</th>
                  <th>Preferred Agency</th>
                  <th>Delivery Address</th>
                  <th>Pin Code</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td className="text-white fw-semibold">{c.connectionNumber}</td>
                    <td>{c.userEmail}</td>
                    <td className="text-white fw-medium">{c.preferredDistributorName}</td>
                    <td className="small text-light-emphasis" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.address}, {c.city}, {c.state}
                    </td>
                    <td>{c.pinCode}</td>
                    <td>
                      <span className={`badge ${c.status === 'Active' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-30' : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-30'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm rounded-circle p-2"
                        style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Delete Customer Connection"
                        onClick={() => handleDeleteCustomer(c.id, c.connectionNumber)}
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

export default CustomerList;
