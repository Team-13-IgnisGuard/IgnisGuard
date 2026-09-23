import api from './api';

const customerService = {
  getProfile: async () => {
    const response = await api.get('/customer/profile');
    return response.data; // Returns CustomerResponseDto
  },

  completeProfile: async (profileData) => {
    const response = await api.post('/customer/profile', profileData);
    return response.data; // Returns CustomerResponseDto
  },

  updateProfile: async (profileData) => {
    // Only address/city/state/pinCode/mobileNumber — connection number and
    // preferred distributor are locked after initial setup, see EditProfile.jsx
    const response = await api.put('/customer/profile', profileData);
    return response.data; // Returns CustomerResponseDto
  },

  getDistributors: async () => {
    const response = await api.get('/customer/distributors');
    return response.data; // Returns array of { id, agencyName, address, contactNumber, currentStock }
  },
};

export default customerService;
