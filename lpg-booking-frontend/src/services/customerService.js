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

  getDistributors: async () => {
    const response = await api.get('/customer/distributors');
    return response.data; // Returns array of { id, agencyName, address, contactNumber, currentStock }
  },
};

export default customerService;
