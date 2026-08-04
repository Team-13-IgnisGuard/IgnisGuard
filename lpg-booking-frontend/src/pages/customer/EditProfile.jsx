import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';

const EditProfile = () => {
  const navigate = useNavigate();

  // Input states
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [connectionNumber, setConnectionNumber] = useState('');
  const [preferredDistributorId, setPreferredDistributorId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Dropdowns list
  const [distributors, setDistributors] = useState([]);

  // UI state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const dists = await customerService.getDistributors();
        setDistributors(dists);

        try {
          const profile = await customerService.getProfile();
          setAddress(profile.address);
          setCity(profile.city);
          setState(profile.state);
          setPinCode(profile.pinCode);
          setMobileNumber(profile.mobileNumber || '');
          setConnectionNumber(profile.connectionNumber);
          setFirstName(profile.firstName || '');
          setLastName(profile.lastName || '');
          setEmail(profile.email || '');
          if (profile.preferredDistributorId) {
            setPreferredDistributorId(profile.preferredDistributorId.toString());
          } else if (dists.length > 0) {
            setPreferredDistributorId(dists[0].id.toString());
          }
        } catch (profileErr) {
          console.warn("No profile found to edit, redirecting to creation", profileErr);
          navigate('/customer/complete-profile');
        }
      } catch (err) {
        console.error("Failed to load edit profile dependencies", err);
        setSubmitError("Failed to fetch profile settings. Please refresh.");
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'address') {
      if (!value.trim()) error = 'Service address is required.';
    } else if (name === 'city') {
      if (!value.trim()) error = 'City is required.';
    } else if (name === 'state') {
      if (!value.trim()) error = 'State is required.';
    } else if (name === 'pinCode') {
      if (!value.trim()) {
        error = 'Pin Code is required.';
      } else if (!/^\d{6}$/.test(value)) {
        error = 'Pin Code must be exactly 6 digits.';
      }
    } else if (name === 'mobileNumber') {
      if (!value.trim()) {
        error = 'Mobile number is required — used to send your delivery OTP by SMS.';
      } else if (!/^[6-9]\d{9}$/.test(value)) {
        error = 'Enter a valid 10-digit Indian mobile number.';
      }
    } else if (name === 'connectionNumber') {
      if (!value.trim()) error = 'Connection number is required.';
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldError = validateField(name, value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldError }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'address') setAddress(value);
    if (name === 'city') setCity(value);
    if (name === 'state') setState(value);
    if (name === 'pinCode') setPinCode(value);
    if (name === 'mobileNumber') setMobileNumber(value.replace(/\D/g, '').substring(0, 10));
    if (name === 'connectionNumber') setConnectionNumber(value);
    if (name === 'preferredDistributorId') setPreferredDistributorId(value);

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMsg('');

    const newTouched = {
      address: true,
      city: true,
      state: true,
      pinCode: true,
      mobileNumber: true,
      connectionNumber: true,
    };
    setTouched(newTouched);

    const addrErr = validateField('address', address);
    const cityErr = validateField('city', city);
    const stateErr = validateField('state', state);
    const pinErr = validateField('pinCode', pinCode);
    const mobileErr = validateField('mobileNumber', mobileNumber);
    const connErr = validateField('connectionNumber', connectionNumber);

    if (addrErr || cityErr || stateErr || pinErr || mobileErr || connErr) {
      setErrors({
        address: addrErr,
        city: cityErr,
        state: stateErr,
        pinCode: pinErr,
        mobileNumber: mobileErr,
        connectionNumber: connErr,
      });
      return;
    }

    setLoading(true);
    try {
      await customerService.completeProfile({
        address,
        city,
        state,
        pinCode,
        mobileNumber,
        connectionNumber,
        preferredDistributorId: parseInt(preferredDistributorId),
      });
      setSuccessMsg('Your gas connection profile has been updated successfully.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to update profile values.';
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-orange" role="status" style={{ color: '#ff5e36' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 d-flex justify-content-center align-items-center animate-slide-up">
      <div className="glass-panel p-4 p-md-5 w-100" style={{ maxWidth: '640px' }}>
        <h2 className="text-white mb-1">Edit Account Profile</h2>
        <p className="text-secondary small border-bottom border-secondary-subtle pb-3 mb-4">Edit details linked to your gas consumer connection</p>

        {submitError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>{submitError}</div>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success d-flex align-items-center gap-2 border-success-subtle bg-success bg-opacity-10 text-success rounded-3 small p-3 mb-4">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <div>{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Registered Identity (Read-only) */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label form-label-custom">Registered Name</label>
              <input
                type="text"
                className="form-control form-control-custom text-muted"
                value={firstName && lastName ? `${firstName} ${lastName}` : ''}
                disabled
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', opacity: 0.7 }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label form-label-custom">Email Address</label>
              <input
                type="text"
                className="form-control form-control-custom text-muted"
                value={email || ''}
                disabled
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', opacity: 0.7 }}
              />
            </div>
          </div>
          {/* Connection Number & Preferred Dealer */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label form-label-custom" htmlFor="connectionNumber">Connection Number</label>
              <input
                id="connectionNumber"
                name="connectionNumber"
                type="text"
                className={`form-control form-control-custom ${touched.connectionNumber && errors.connectionNumber ? 'is-invalid-custom' : ''}`}
                placeholder="CN-1029384"
                value={connectionNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.connectionNumber && errors.connectionNumber && (
                <div className="invalid-feedback-custom">{errors.connectionNumber}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label form-label-custom" htmlFor="preferredDistributorId">Preferred Distributor</label>
              <select
                id="preferredDistributorId"
                name="preferredDistributorId"
                className="form-select form-control-custom"
                value={preferredDistributorId}
                onChange={handleChange}
                disabled={loading}
              >
                {distributors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.agencyName} (Stock: {d.currentStock})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address textarea */}
          <div className="mb-3">
            <label className="form-label form-label-custom" htmlFor="address">Service/Delivery Address</label>
            <textarea
              id="address"
              name="address"
              rows="3"
              className={`form-control form-control-custom ${touched.address && errors.address ? 'is-invalid-custom' : ''}`}
              placeholder="Building name, Floor, Flat number, Street address"
              value={address}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
            ></textarea>
            {touched.address && errors.address && (
              <div className="invalid-feedback-custom">{errors.address}</div>
            )}
          </div>

          {/* City, State, Pincode */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label form-label-custom" htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                className={`form-control form-control-custom ${touched.city && errors.city ? 'is-invalid-custom' : ''}`}
                value={city}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.city && errors.city && (
                <div className="invalid-feedback-custom">{errors.city}</div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label form-label-custom" htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                className={`form-control form-control-custom ${touched.state && errors.state ? 'is-invalid-custom' : ''}`}
                value={state}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.state && errors.state && (
                <div className="invalid-feedback-custom">{errors.state}</div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label form-label-custom" htmlFor="pinCode">Pin Code</label>
              <input
                id="pinCode"
                name="pinCode"
                type="text"
                maxLength="6"
                className={`form-control form-control-custom ${touched.pinCode && errors.pinCode ? 'is-invalid-custom' : ''}`}
                value={pinCode}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.pinCode && errors.pinCode && (
                <div className="invalid-feedback-custom">{errors.pinCode}</div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label form-label-custom" htmlFor="mobileNumber">Mobile Number</label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="text"
                maxLength="10"
                className={`form-control form-control-custom ${touched.mobileNumber && errors.mobileNumber ? 'is-invalid-custom' : ''}`}
                placeholder="9876543210"
                value={mobileNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.mobileNumber && errors.mobileNumber && (
                <div className="invalid-feedback-custom">{errors.mobileNumber}</div>
              )}
            </div>
          </div>

          <div className="d-flex gap-3">
            <button
              type="submit"
              className="btn btn-gradient-primary rounded-pill px-4 py-2.5 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <i className="bi bi-save2-fill"></i> Save Updates
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-light rounded-pill px-4"
              onClick={() => navigate('/customer/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
