import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // Returns AuthResultDto: { token, email, role, userId, isSuccess }
  },

  register: async (firstName, lastName, email, password, confirmPassword, role) => {
    const response = await api.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role,
    });
    return response.data; // Returns AuthResultDto
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data; // Returns { userId, email, role }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data; // Returns ForgotPasswordResultDto
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data; // Returns { isSuccess, message }
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data; // Returns ResetPasswordResultDto
  },
};

export default authService;
