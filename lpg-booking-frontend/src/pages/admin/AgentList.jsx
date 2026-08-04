import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await adminService.getAgents();
        setAgents(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to retrieve platform delivery agents list.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
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
        <h2 className="text-white mb-1">Registered Delivery Drivers</h2>
        <p className="text-secondary small">Review delivery agent profiles, vehicle details, availability, and associated dealer agencies</p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">
          {errorMsg}
        </div>
      )}

      {agents.length === 0 ? (
        <div className="glass-panel p-5 text-center">
          <i className="bi bi-truck text-secondary display-3 d-block mb-3"></i>
          <h4 className="text-white">No Delivery Agents Registered</h4>
          <p className="text-secondary small">No delivery agent drivers have been registered under distributor agencies yet.</p>
        </div>
      ) : (
        <div className="glass-panel p-4">
          <div className="table-responsive">
            <table className="table table-custom mb-0">
              <thead>
                <tr>
                  <th>Driver ID</th>
                  <th>Driver Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Vehicle Number</th>
                  <th>Distributor Agency</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a.id}>
                    <td className="text-white fw-semibold">DA-100{a.id}</td>
                    <td className="text-white fw-medium">{a.name}</td>
                    <td>{a.email}</td>
                    <td>{a.phone}</td>
                    <td className="text-light-emphasis small">{a.vehicleNumber}</td>
                    <td className="text-white fw-medium">{a.distributorAgencyName}</td>
                    <td>
                      <span className={`badge ${a.isAvailable ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-30' : 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-30'}`}>
                        {a.isAvailable ? 'Available' : 'Busy'}
                      </span>
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

export default AgentList;
