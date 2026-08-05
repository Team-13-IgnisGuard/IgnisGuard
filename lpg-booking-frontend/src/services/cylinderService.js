import api from './api';

const cylinderService = {
  registerCylinder: async (engravedSerialNumber) => {
    const response = await api.post('/distributor/cylinders/register', { engravedSerialNumber });
    return response.data; // Returns { message, cylinder }
  },

  scanCylinder: async (qrToken, eventType, bookingId = null, enteredSerialNumber = null) => {
    const response = await api.post('/distributor/cylinders/scan', {
      qrToken, eventType, bookingId, enteredSerialNumber,
    });
    return response.data; // Returns { message, cylinder }
  },

  getCylinder: async (id) => {
    const response = await api.get(`/distributor/cylinders/${id}`);
    return response.data;
  },

  getAllCylinders: async () => {
    const response = await api.get('/distributor/cylinders');
    return response.data; // Returns array of all cylinders
  },

  getMyCylinders: async () => {
    const response = await api.get('/distributor/cylinders/mine');
    return response.data; // Returns cylinders currently in this distributor's chain of custody
  },

  getHistory: async (id) => {
    const response = await api.get(`/distributor/cylinders/${id}/history`);
    return response.data; // Returns array of scan events, newest first
  },

  getFlaggedEvents: async () => {
    const response = await api.get('/distributor/cylinders/flagged');
    return response.data;
  },
};

export default cylinderService;
