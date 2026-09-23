import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Inputs state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validations state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loginPending, setLoginPending] = useState(false);

  // Get path to redirect back to (exclude /unauthorized to avoid loops)
  const from = location.state?.from?.pathname;
  const safeTo = from && from !== '/unauthorized' ? from : null;

  // Navigate only after user state is confirmed in context (eliminates race condition)
  useEffect(() => {
    if (loginPending && user?.role) {
      const dest = safeTo || `/${user.role.toLowerCase()}/dashboard`;
      navigate(dest, { replace: true });
      setLoginPending(false);
    }
  }, [loginPending, user, safeTo, navigate]);

  // If already logged in, redirect immediately to dashboard
  if (user?.role) {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }

  // Validate single input field
  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email address is required.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address.';
        }
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required.';
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
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);

    // Validate on the fly if touched
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Mark all as touched
    const newTouched = { email: true, password: true };
    setTouched(newTouched);

    // Validate all
    const emailErr = validateField('email', email);
    const passErr = validateField('password', password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return; // Stop submission
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Set flag — useEffect above will navigate once user state is confirmed
      setLoginPending(true);
    } else {
      setSubmitError(result.error);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 animate-slide-up">
      <div className="glass-panel p-4 p-md-5 w-100" style={{ maxWidth: '480px', border: '1px solid var(--border-color)' }}>
        <div className="text-center mb-4">
          <i className="bi bi-fire display-5" style={{ color: 'var(--primary-color)', filter: 'drop-shadow(0 2px 6px rgba(255, 95, 37, 0.25))' }}></i>
          <h2 className="mt-2 mb-1" style={{ color: 'var(--text-primary)' }}>Welcome Back</h2>
          <p className="text-secondary small">Login to manage your LPG cylinder connections</p>
        </div>

        {submitError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>{submitError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Address */}
          <div className="mb-4">
            <label className="form-label form-label-custom" htmlFor="email">Email Address</label>
            <div className="input-group">
              <span className="input-group-text text-secondary" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRight: 'none', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                <i className="bi bi-envelope-fill"></i>
              </span>
              <input
                id="email"
                name="email"
                type="email"
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

          {/* Password */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label form-label-custom mb-0" htmlFor="password">Password</label>
              <Link to="/forgot-password" style={{ color: 'var(--primary-color)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</Link>
            </div>
            <div className="input-group">
              <span className="input-group-text text-secondary" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRight: 'none', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                className={`form-control form-control-custom ${touched.password && errors.password ? 'is-invalid-custom' : ''}`}
                style={{ borderLeft: 'none', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
                placeholder="••••••••"
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
                <i className="bi bi-box-arrow-in-right"></i> Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 border-top pt-3" style={{ borderColor: 'var(--border-color) !important' }}>
          <p className="text-secondary small mb-0">
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
