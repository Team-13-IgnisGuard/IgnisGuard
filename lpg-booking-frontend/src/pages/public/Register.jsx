import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [registerPending, setRegisterPending] = useState(false);

  // Input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Navigate only after user state is confirmed in context (eliminates race condition)
  useEffect(() => {
    if (registerPending && user?.role) {
      navigate(`/${user.role.toLowerCase()}/dashboard`, { replace: true });
      setRegisterPending(false);
    }
  }, [registerPending, user, navigate]);

  // If already logged in, redirect immediately to dashboard
  if (user?.role) {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }

  const validateField = (name, value) => {
    let error = '';
    if (name === 'firstName') {
      if (!value) {
        error = 'First name is required.';
      } else if (value.trim().length === 0) {
        error = 'First name is required.';
      } else if (value.trim().length < 2) {
        error = 'First name must be at least 2 characters long.';
      } else if (value.length > 50) {
        error = 'First name cannot exceed 50 characters.';
      } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        error = 'First name can only contain letters, spaces, hyphens, and apostrophes.';
      }
    } else if (name === 'lastName') {
      if (!value) {
        error = 'Last name is required.';
      } else if (value.trim().length === 0) {
        error = 'Last name is required.';
      } else if (value.trim().length < 2) {
        error = 'Last name must be at least 2 characters long.';
      } else if (value.length > 50) {
        error = 'Last name cannot exceed 50 characters.';
      } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        error = 'Last name can only contain letters, spaces, hyphens, and apostrophes.';
      }
    } else if (name === 'email') {
      if (!value) {
        error = 'Email address is required.';
      } else if (value.trim().length === 0) {
        error = 'Email address is required.';
      } else if (value !== value.trim()) {
        error = 'Email cannot contain leading or trailing spaces.';
      } else if (value.length > 100) {
        error = 'Email cannot exceed 100 characters.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address.';
        }
      }
    } else if (name === 'role') {
      if (!value) {
        error = 'Please select a user role.';
      } else if (!['Customer', 'Distributor', 'DeliveryAgent'].includes(value)) {
        error = 'Invalid user role selected.';
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required.';
      } else if (value.length < 8) {
        error = 'Password must be at least 8 characters long.';
      } else if (value.length > 20) {
        error = 'Password cannot exceed 20 characters.';
      } else if (!/[A-Z]/.test(value)) {
        error = 'Password must contain at least one uppercase letter.';
      } else if (!/[a-z]/.test(value)) {
        error = 'Password must contain at least one lowercase letter.';
      } else if (!/\d/.test(value)) {
        error = 'Password must contain at least one number.';
      } else if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(value)) {
        error = 'Password must contain at least one special character.';
      } else if (/\s/.test(value)) {
        error = 'Password cannot contain spaces.';
      }
    } else if (name === 'confirmPassword') {
      if (!value) {
        error = 'Please confirm your password.';
      } else if (value !== password) {
        error = 'Password and Confirm Password do not match.';
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
    if (name === 'firstName') setFirstName(value);
    if (name === 'lastName') setLastName(value);
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);
    if (name === 'role') setRole(value);

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const newTouched = { firstName: true, lastName: true, email: true, password: true, confirmPassword: true, role: true };
    setTouched(newTouched);

    const firstErr = validateField('firstName', firstName);
    const lastErr = validateField('lastName', lastName);
    const emailErr = validateField('email', email);
    const passErr = validateField('password', password);
    const confErr = validateField('confirmPassword', confirmPassword);
    const roleErr = validateField('role', role);

    if (firstErr || lastErr || emailErr || passErr || confErr || roleErr) {
      setErrors({
        firstName: firstErr,
        lastName: lastErr,
        email: emailErr,
        password: passErr,
        confirmPassword: confErr,
        role: roleErr
      });
      return;
    }

    setLoading(true);
    const result = await register(firstName, lastName, email, password, confirmPassword, role);
    setLoading(false);

    if (result.success) {
      setRegisterPending(true);
    } else {
      if (result.error.toLowerCase().includes("already exists") || result.error.toLowerCase().includes("already in use")) {
        setErrors(prev => ({ ...prev, email: "An account with this email already exists." }));
      } else {
        setSubmitError(result.error);
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 my-5 animate-slide-up">
      <div className="glass-panel p-4 p-md-5 w-100" style={{ maxWidth: '520px', border: '1px solid var(--border-color)' }}>
        <div className="text-center mb-4">
          <i className="bi bi-fire display-5" style={{ color: 'var(--primary-color)', filter: 'drop-shadow(0 2px 6px rgba(255, 95, 37, 0.25))' }}></i>
          <h2 className="mt-2 mb-1" style={{ color: 'var(--text-primary)' }}>Create Account</h2>
          <p className="text-secondary small">Register to book cylinders and monitor distribution</p>
        </div>

        {submitError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>{submitError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* First & Last Name */}
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label form-label-custom" htmlFor="firstName">First Name</label>
              <div className="input-group">
                <span className="input-group-text text-secondary" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRight: 'none', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                  <i className="bi bi-person-fill"></i>
                </span>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="off"
                  className={`form-control form-control-custom ${touched.firstName && errors.firstName ? 'is-invalid-custom' : ''}`}
                  style={{ borderLeft: 'none', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
                  placeholder="John"
                  value={firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
              </div>
              {touched.firstName && errors.firstName && (
                <div className="invalid-feedback-custom">{errors.firstName}</div>
              )}
            </div>
            <div className="col-sm-6">
              <label className="form-label form-label-custom" htmlFor="lastName">Last Name</label>
              <div className="input-group">
                <span className="input-group-text text-secondary" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRight: 'none', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                  <i className="bi bi-person-fill"></i>
                </span>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="off"
                  className={`form-control form-control-custom ${touched.lastName && errors.lastName ? 'is-invalid-custom' : ''}`}
                  style={{ borderLeft: 'none', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
                  placeholder="Doe"
                  value={lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
              </div>
              {touched.lastName && errors.lastName && (
                <div className="invalid-feedback-custom">{errors.lastName}</div>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div className="mb-3">
            <label className="form-label form-label-custom" htmlFor="email">Email Address</label>
            <div className="input-group">
              <span className="input-group-text text-secondary" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRight: 'none', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                <i className="bi bi-envelope-fill"></i>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                className={`form-control form-control-custom ${touched.email && errors.email ? 'is-invalid-custom' : ''}`}
                style={{ borderLeft: 'none', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
                placeholder="email@example.com"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
            </div>
            {touched.email && errors.email && (
              <div className="invalid-feedback-custom">{errors.email}</div>
            )}
          </div>

          {/* Role Dropdown */}
          <div className="mb-3">
            <label className="form-label form-label-custom" htmlFor="role">User Role</label>
            <div className="input-group">
              <span className="input-group-text text-secondary" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRight: 'none', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                <i className="bi bi-person-badge-fill"></i>
              </span>
              <select
                id="role"
                name="role"
                className={`form-select form-control-custom form-select-custom ${touched.role && errors.role ? 'is-invalid-custom' : ''}`}
                style={{ borderLeft: 'none', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
                value={role}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              >
                <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Select Role</option>
                <option value="Customer" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Customer (Gas Consumer)</option>
                <option value="Distributor" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Distributor (Gas Dealer)</option>
                <option value="DeliveryAgent" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Delivery Agent</option>
              </select>
            </div>
            {touched.role && errors.role && (
              <div className="invalid-feedback-custom">{errors.role}</div>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label form-label-custom" htmlFor="password">Password</label>
            <div className="input-group">
              <span className="input-group-text text-secondary" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRight: 'none', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`form-control form-control-custom ${touched.password && errors.password ? 'is-invalid-custom' : ''}`}
                style={{ borderLeft: 'none', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
                placeholder="Min 8 characters"
                value={password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
            </div>
            {touched.password && errors.password && (
              <div className="invalid-feedback-custom">{errors.password}</div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label form-label-custom" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text text-secondary" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRight: 'none', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`form-control form-control-custom ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid-custom' : ''}`}
                style={{ borderLeft: 'none', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                disabled={loading}
              />
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="invalid-feedback-custom">{errors.confirmPassword}</div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-100 btn btn-gradient-primary rounded-pill py-2.5 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <>
                <i className="bi bi-person-plus-fill"></i> Sign Up
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 border-top pt-3" style={{ borderColor: 'var(--border-color) !important' }}>
          <p className="text-secondary small mb-0">
            Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
