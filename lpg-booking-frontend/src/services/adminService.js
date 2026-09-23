import api from './api';

const adminService = {
  getDistributors: async () => {
    const response = await api.get('/admin/distributors');
    return response.data; // Returns array of Distributors
  },

  getCustomers: async () => {
    const response = await api.get('/admin/customers');
    return response.data; // Returns array of Customer Profiles
  },

  getAgents: async () => {
    const response = await api.get('/admin/agents');
    return response.data; // Returns array of Delivery Agents
  },

  adjustStock: async (distributorId, stockCount) => {
    const response = await api.post(`/admin/distributors/${distributorId}/stock`, stockCount);
    return response.data; // Returns { message, agencyName, newStock }
  },

  deleteCustomer: async (id) => {
    const response = await api.delete(`/admin/customers/${id}`);
    return response.data;
  },

  deleteDistributor: async (id) => {
    const response = await api.delete(`/admin/distributors/${id}`);
    return response.data;
  },
};

export default adminService;
