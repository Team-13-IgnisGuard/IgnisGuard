import api from './api';

const p2pService = {
  createRequest: async (lenderMobileNumber) => {
    const response = await api.post('/customer/p2p/request', { lenderMobileNumber });
    return response.data; // Returns { message, request }
  },

  getMyRequests: async () => {
    const response = await api.get('/customer/p2p/my-requests');
    return response.data; // Returns array of P2PTransferResponseDto
  },

  approve: async (id) => {
    const response = await api.post(`/customer/p2p/${id}/approve`);
    return response.data;
  },

  reject: async (id) => {
    const response = await api.post(`/customer/p2p/${id}/reject`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/customer/p2p/${id}/cancel`);
    return response.data;
  },
};

export default p2pService;
