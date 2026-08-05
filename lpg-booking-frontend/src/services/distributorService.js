import api from './api';

const distributorService = {
  getProfile: async () => {
    const response = await api.get('/distributor/profile');
    return response.data; // Returns Distributor profile
  },

  completeProfile: async (profileData) => {
    const response = await api.post('/distributor/profile', profileData);
    return response.data; // Returns updated Distributor profile
  },

  getAgents: async () => {
    const response = await api.get('/distributor/agents');
    return response.data; // Returns array of { id, name, phone, vehicleNumber, isAvailable }
  },

  addAgent: async (agentData) => {
    const response = await api.post('/distributor/agents', agentData);
    return response.data; // Returns { message, agent }
  },

  deleteAgent: async (id) => {
    const response = await api.delete(`/distributor/agents/${id}`);
    return response.data; // Returns { message }
  },
};

export default distributorService;
