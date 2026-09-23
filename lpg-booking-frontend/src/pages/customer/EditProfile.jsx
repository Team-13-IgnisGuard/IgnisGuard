import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';

const EditProfile = () => {
  const navigate = useNavigate();

  // Editable fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // Read-only / locked fields — KYC-critical, can never change after initial
  // profile setup. Displayed for reference only, never sent back on update.
  const [connectionNumber, setConnectionNumber] = useState('');
  const [preferredDistributorName, setPreferredDistributorName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

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
        const profile = await customerService.getProfile();
        setAddress(profile.address);
        setCity(profile.city);
        setState(profile.state);
        setPinCode(profile.pinCode);
        setMobileNumber(profile.mobileNumber || '');
        setConnectionNumber(profile.connectionNumber);
        setPreferredDistributorName(profile.preferredDistributorName || '');
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setEmail(profile.email || '');
      } catch (profileErr) {
        console.warn("No profile found to edit, redirecting to creation", profileErr);
        navigate('/customer/complete-profile');
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

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMsg('');

    setTouched({ address: true, city: true, state: true, pinCode: true, mobileNumber: true });

    const addrErr = validateField('address', address);
    const cityErr = validateField('city', city);
    const stateErr = validateField('state', state);
    const pinErr = validateField('pinCode', pinCode);
    const mobileErr = validateField('mobileNumber', mobileNumber);

    if (addrErr || cityErr || stateErr || pinErr || mobileErr) {
      setErrors({ address: addrErr, city: cityErr, state: stateErr, pinCode: pinErr, mobileNumber: mobileErr });
      return;
    }

    setLoading(true);
    try {
      // Only the non-critical fields are ever sent — connection number and
      // preferred distributor are locked after initial setup and can't be
      // changed from this form at all, by design.
      await customerService.updateProfile({ address, city, state, pinCode, mobileNumber });
      setSuccessMsg('Your contact details have been updated successfully.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data?.errors;
      const msg =
        (Array.isArray(backendErrors) && backendErrors.join(', ')) ||
        err.response?.data?.message ||
        'Failed to update profile values.';
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

  const lockedFieldStyle = { backgroundColor: 'rgba(255,255,255,0.03)', opacity: 0.7, cursor: 'not-allowed' };

  return (
    <div className="container py-4 d-flex justify-content-center align-items-center animate-slide-up">
      <div className="glass-panel p-4 p-md-5 w-100" style={{ maxWidth: '640px' }}>
        <h2 className="text-white mb-1">Edit Account Profile</h2>
        <p className="text-secondary small border-bottom border-secondary-subtle pb-3 mb-4">
          Mobile number and address can be updated below. Connection number, name, email, and preferred distributor are locked after setup — contact support if any of those need to change.
        </p>

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
          {/* Locked identity fields */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label form-label-custom">Registered Name <i className="bi bi-lock-fill text-muted ms-1" style={{ fontSize: '0.75rem' }}></i></label>
              <input
                type="text"
                className="form-control form-control-custom text-muted"
                value={firstName && lastName ? `${firstName} ${lastName}` : ''}
                disabled
                style={lockedFieldStyle}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label form-label-custom">Email Address <i className="bi bi-lock-fill text-muted ms-1" style={{ fontSize: '0.75rem' }}></i></label>
              <input
                type="text"
                className="form-control form-control-custom text-muted"
                value={email || ''}
                disabled
                style={lockedFieldStyle}
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label form-label-custom">Connection Number <i className="bi bi-lock-fill text-muted ms-1" style={{ fontSize: '0.75rem' }}></i></label>
              <input
                type="text"
                className="form-control form-control-custom text-muted"
                value={connectionNumber}
                disabled
                style={lockedFieldStyle}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label form-label-custom">Preferred Distributor <i className="bi bi-lock-fill text-muted ms-1" style={{ fontSize: '0.75rem' }}></i></label>
              <input
                type="text"
                className="form-control form-control-custom text-muted"
                value={preferredDistributorName}
                disabled
                style={lockedFieldStyle}
              />
            </div>
          </div>

          <hr className="border-secondary-subtle my-4" />

          {/* Editable fields */}
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
