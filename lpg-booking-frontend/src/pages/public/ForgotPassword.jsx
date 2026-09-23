import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password Reset, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation & Alert states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value) {
        error = 'Email address is required.';
      } else if (value.trim().length === 0) {
        error = 'Email address is required.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address.';
        }
      }
    } else if (name === 'otp') {
      if (!value.trim()) {
        error = 'OTP is required.';
      } else if (value.trim().length !== 6 || !/^\d+$/.test(value)) {
        error = 'OTP must be a 6-digit number.';
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
    if (name === 'email') setEmail(value);
    if (name === 'otp') setOtp(value);
    if (name === 'password') setPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldError }));
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    const emailErr = validateField('email', email);
    setTouched({ email: true });

    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }

    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      setLoading(false);
      if (result.isSuccess) {
        setSuccessMsg(result.message || 'OTP sent successfully.');
        setStep(2);
        setTouched({});
        setErrors({});
      } else {
        setApiError(result.errors?.[0] || 'Failed to request OTP.');
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.message || 'An error occurred. Please try again.';
      setApiError(msg);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    const otpErr = validateField('otp', otp);
    setTouched({ otp: true });

    if (otpErr) {
      setErrors({ otp: otpErr });
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyOtp(email, otp);
      setLoading(false);
      if (result.isSuccess) {
        setSuccessMsg('OTP verified successfully! Please set your new password below.');
        setStep(3);
        setTouched({});
        setErrors({});
      } else {
        setApiError(result.errors?.[0] || 'Verification failed.');
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.message || 'Invalid OTP code. Please try again.';
      setApiError(msg);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    const passErr = validateField('password', password);
    const confErr = validateField('confirmPassword', confirmPassword);

    setTouched({ password: true, confirmPassword: true });

    if (passErr || confErr) {
      setErrors({ password: passErr, confirmPassword: confErr });
      return;
    }

    setLoading(true);
    try {
      const result = await authService.resetPassword(email, otp, password);
      setLoading(false);
      if (result.isSuccess) {
        setSuccessMsg('Your password has been reset successfully. Redirecting you to login...');
        setStep(4);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setApiError(result.errors?.[0] || 'Failed to reset password.');
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.message || 'An error occurred. Please try again.';
      setApiError(msg);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 animate-slide-up">
      <div className="glass-panel p-4 p-md-5 w-100" style={{ maxWidth: '500px', border: '1px solid var(--border-color)' }}>
        
        {step === 1 && (
          <>
            <div className="text-center mb-4">
              <i className="bi bi-shield-lock-fill display-5" style={{ color: 'var(--primary-color)', filter: 'drop-shadow(0 2px 6px rgba(255, 95, 37, 0.25))' }}></i>
              <h2 className="mt-2 mb-1" style={{ color: 'var(--text-primary)' }}>Recover Password</h2>
              <p className="text-secondary small">We'll verify your email and send you a 6-digit OTP</p>
            </div>

            {apiError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>{apiError}</div>
              </div>
            )}

            <form onSubmit={handleRequestOtp} noValidate>
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

              <button
                type="submit"
                className="w-100 btn btn-gradient-primary rounded-pill py-2.5 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <i className="bi bi-send-fill"></i> Send OTP Code
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-4">
              <i className="bi bi-shield-check display-5" style={{ color: 'var(--primary-color)', filter: 'drop-shadow(0 2px 6px rgba(255, 95, 37, 0.25))' }}></i>
              <h2 className="mt-2 mb-1" style={{ color: 'var(--text-primary)' }}>Enter OTP</h2>
              <p className="text-secondary small">Provide the 6-digit OTP code sent to your email</p>
            </div>


            {successMsg && (
              <div className="alert alert-success d-flex align-items-center gap-2 border-success-subtle bg-success bg-opacity-10 text-success rounded-3 small p-3 mb-4" role="alert">
                <i className="bi bi-check-circle-fill fs-5"></i>
                <div>{successMsg}</div>
              </div>
            )}

            {apiError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>{apiError}</div>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} noValidate>
              {/* Account Email (Readonly helper) */}
              <div className="mb-3">
                <label className="form-label form-label-custom" htmlFor="email-readonly">Account Email</label>
                <div className="input-group">
                  <span className="input-group-text text-secondary" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRight: 'none', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', opacity: 0.85 }}>
                    <i className="bi bi-person-fill"></i>
                  </span>
                  <input
                    id="email-readonly"
                    type="text"
                    readOnly
                    className="form-control form-control-custom"
                    style={{ borderLeft: 'none', borderTopLeftRadius: '0', borderBottomLeftRadius: '0', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)', opacity: 0.85 }}
                    value={email}
                  />
                </div>
              </div>

              {/* OTP Input */}
              <div className="mb-4">
                <label className="form-label form-label-custom" htmlFor="otp">6-Digit OTP Code</label>
                <div className="input-group">
                  <span className="input-group-text text-secondary" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRight: 'none', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                    <i className="bi bi-ticket-perforated-fill"></i>
                  </span>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength="6"
                    autoComplete="off"
                    className={`form-control form-control-custom text-center ${touched.otp && errors.otp ? 'is-invalid-custom' : ''}`}
                    style={{ borderLeft: 'none', borderTopLeftRadius: '0', borderBottomLeftRadius: '0', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 'bold' }}
                    placeholder="------"
                    value={otp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                  />
                </div>
                {touched.otp && errors.otp && (
                  <div className="invalid-feedback-custom">{errors.otp}</div>
                )}
              </div>

              <button
                type="submit"
                className="w-100 btn btn-gradient-primary rounded-pill py-2.5 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <i className="bi bi-patch-check-fill"></i> Verify OTP
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center mb-4">
              <i className="bi bi-lock-fill display-5" style={{ color: 'var(--primary-color)', filter: 'drop-shadow(0 2px 6px rgba(255, 95, 37, 0.25))' }}></i>
              <h2 className="mt-2 mb-1" style={{ color: 'var(--text-primary)' }}>Set New Password</h2>
              <p className="text-secondary small">Enter and confirm your new password below</p>
            </div>

            {successMsg && (
              <div className="alert alert-success d-flex align-items-center gap-2 border-success-subtle bg-success bg-opacity-10 text-success rounded-3 small p-3 mb-4" role="alert">
                <i className="bi bi-check-circle-fill fs-5"></i>
                <div>{successMsg}</div>
              </div>
            )}

            {apiError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 small p-3 mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>{apiError}</div>
              </div>
            )}

            <form onSubmit={handleResetPassword} noValidate>
              {/* Password */}
              <div className="mb-3">
                <label className="form-label form-label-custom" htmlFor="password">New Password</label>
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
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                  />
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="invalid-feedback-custom">{errors.confirmPassword}</div>
                )}
              </div>

              <button
                type="submit"
                className="w-100 btn btn-gradient-primary rounded-pill py-2.5 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill"></i> Reset Password
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {step === 4 && (
          <div className="text-center py-4">
            <i className="bi bi-check-circle-fill display-1 text-success animate-scale-up d-block mb-3"></i>
            <h2 style={{ color: 'var(--text-primary)' }}>Password Reset!</h2>
            <p className="text-secondary mt-2">{successMsg}</p>
            <div className="mt-4">
              <Link to="/login" className="btn btn-gradient-primary rounded-pill px-4 py-2 text-decoration-none">
                Go to Login Immediately
              </Link>
            </div>
          </div>
        )}

        {step < 4 && (
          <div className="text-center mt-4 border-top pt-3" style={{ borderColor: 'var(--border-color) !important' }}>
            <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
              <i className="bi bi-arrow-left me-1"></i> Back to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
