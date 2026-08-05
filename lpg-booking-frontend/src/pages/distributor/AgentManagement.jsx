import { useEffect, useState } from 'react';
import distributorService from '../../services/distributorService';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form inputs state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const fetchAgents = async () => {
    try {
      const list = await distributorService.getAgents();
      setAgents(list);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to retrieve delivery agents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const validateField = (nameField, value) => {
    let error = '';
    if (nameField === 'email') {
      if (!value.trim()) {
        error = 'Agent email address is required.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = 'Invalid email format.';
      }
    } else if (nameField === 'password') {
      if (!value) {
        error = 'Agent password is required.';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters.';
      }
    } else if (nameField === 'name') {
      if (!value.trim()) error = 'Agent name is required.';
    } else if (nameField === 'phone') {
      if (!value.trim()) {
        error = 'Phone number is required.';
      } else if (!/^\d{10}$/.test(value)) {
        error = 'Phone number must be exactly 10 digits.';
      }
    } else if (nameField === 'vehicleNumber') {
      if (!value.trim()) error = 'Vehicle number is required.';
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name: fName, value } = e.target;
    setTouched(prev => ({ ...prev, [fName]: true }));
    const err = validateField(fName, value);
    setErrors(prev => ({ ...prev, [fName]: err }));
  };

  const handleChange = (e) => {
    const { name: fName, value } = e.target;
    if (fName === 'email') setEmail(value);
    if (fName === 'password') setPassword(value);
    if (fName === 'name') setName(value);
    if (fName === 'phone') setPhone(value.replace(/\D/g, ''));
    if (fName === 'vehicleNumber') setVehicleNumber(value);

    if (touched[fName]) {
      const err = validateField(fName, value);
      setErrors(prev => ({ ...prev, [fName]: err }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const newTouched = { email: true, password: true, name: true, phone: true, vehicleNumber: true };
    setTouched(newTouched);

    const emailErr = validateField('email', email);
    const passErr = validateField('password', password);
    const nameErr = validateField('name', name);
    const phoneErr = validateField('phone', phone);
    const vehErr = validateField('vehicleNumber', vehicleNumber);

    if (emailErr || passErr || nameErr || phoneErr || vehErr) {
      setErrors({ email: emailErr, password: passErr, name: nameErr, phone: phoneErr, vehicleNumber: vehErr });
      return;
    }

    setBtnLoading(true);
    try {
      await distributorService.addAgent({
        email,
        password,
        name,
        phone,
        vehicleNumber,
      });
      setSuccessMsg(`Delivery agent '${name}' registered successfully!`);
      // Reset inputs
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setVehicleNumber('');
      setTouched({});
      setErrors({});
      // Reload
      await fetchAgents();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to register delivery agent. Email might be already in use.');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId, agentName) => {
    if (!window.confirm(`Are you sure you want to permanently delete delivery agent "${agentName}"?`)) {
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await distributorService.deleteAgent(agentId);
      setSuccessMsg(res.message || "Delivery agent deleted successfully.");
      await fetchAgents();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to delete delivery agent.";
      setErrorMsg(msg);
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
        <h2 className="text-white mb-1">Manage Delivery Agents</h2>
        <p className="text-secondary small">Register and monitor delivery agents registered under your agency</p>
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

      <div className="row g-4">
        {/* Register Agent Form */}
        <div className="col-lg-5 col-12">
          <div className="glass-panel p-4">
            <h3 className="text-white fs-5 border-bottom border-secondary-subtle pb-3 mb-3">Register New Driver</h3>
            
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label form-label-custom" htmlFor="name">Agent Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`form-control form-control-custom ${touched.name && errors.name ? 'is-invalid-custom' : ''}`}
                  placeholder="Vijay Patil"
                  value={name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={btnLoading}
                />
                {touched.name && errors.name && (
                  <div className="invalid-feedback-custom">{errors.name}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label form-label-custom" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  className={`form-control form-control-custom ${touched.email && errors.email ? 'is-invalid-custom' : ''}`}
                  placeholder="agent@lpgbooking.com"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={btnLoading}
                />
                {touched.email && errors.email && (
                  <div className="invalid-feedback-custom">{errors.email}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label form-label-custom" htmlFor="password">Login Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className={`form-control form-control-custom ${touched.password && errors.password ? 'is-invalid-custom' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={btnLoading}
                />
                {touched.password && errors.password && (
                  <div className="invalid-feedback-custom">{errors.password}</div>
                )}
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label form-label-custom" htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    maxLength="10"
                    className={`form-control form-control-custom ${touched.phone && errors.phone ? 'is-invalid-custom' : ''}`}
                    placeholder="9988776655"
                    value={phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={btnLoading}
                  />
                  {touched.phone && errors.phone && (
                    <div className="invalid-feedback-custom">{errors.phone}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label form-label-custom" htmlFor="vehicleNumber">Vehicle Number</label>
                  <input
                    id="vehicleNumber"
                    name="vehicleNumber"
                    type="text"
                    className={`form-control form-control-custom ${touched.vehicleNumber && errors.vehicleNumber ? 'is-invalid-custom' : ''}`}
                    placeholder="MH-12-AB-1234"
                    value={vehicleNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={btnLoading}
                  />
                  {touched.vehicleNumber && errors.vehicleNumber && (
                    <div className="invalid-feedback-custom">{errors.vehicleNumber}</div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-gradient-primary w-100 rounded-pill py-2.5" disabled={btnLoading}>
                {btnLoading ? <span className="spinner-border spinner-border-sm"></span> : "Register Agent Credentials"}
              </button>
            </form>
          </div>
        </div>

        {/* Agents Grid List */}
        <div className="col-lg-7 col-12">
          <div className="glass-panel p-4 h-100">
            <h3 className="text-white fs-5 border-bottom border-secondary-subtle pb-3 mb-3">Registered Agency Drivers</h3>
            {agents.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-people text-secondary display-4 d-block mb-2"></i>
                <p className="text-secondary small">No delivery agents registered yet. Use the registration form to add drivers.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-custom mb-0">
                  <thead>
                    <tr>
                      <th>Driver Name</th>
                      <th>Phone</th>
                      <th>Vehicle</th>
                      <th>Availability</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map(a => (
                      <tr key={a.id}>
                        <td className="text-white fw-semibold">{a.name}</td>
                        <td>{a.phone}</td>
                        <td className="text-light-emphasis small">{a.vehicleNumber}</td>
                        <td>
                          <span className={`badge ${a.isAvailable ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-30' : 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-30'}`}>
                            {a.isAvailable ? 'Available' : 'Busy'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm rounded-circle p-2"
                            style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Delete Agent Driver"
                            onClick={() => handleDeleteAgent(a.id, a.name)}
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentManagement;
