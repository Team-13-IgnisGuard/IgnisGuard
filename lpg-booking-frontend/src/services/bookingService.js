import api from './api';

const bookingService = {
  createBooking: async (cylinderCount) => {
    const response = await api.post('/booking', { cylinderCount });
    return response.data; // Returns BookingResponseDto
  },

  getHistory: async () => {
    const response = await api.get('/booking/history');
    return response.data; // Returns array of BookingResponseDto
  },

  getBookingDetails: async (id) => {
    const response = await api.get(`/booking/${id}`);
    return response.data; // Returns BookingResponseDto
  },

  getDistributorBookings: async () => {
    const response = await api.get('/distributor/bookings');
    return response.data; // Returns array of BookingResponseDto
  },

  assignAgent: async (bookingId, agentId) => {
    const response = await api.post(`/distributor/bookings/${bookingId}/assign`, { agentId });
    return response.data; // Returns { message, booking }
  },

  getAgentDeliveries: async () => {
    const response = await api.get('/deliveryagent/deliveries');
    return response.data; // Returns array of BookingResponseDto
  },

  updateDeliveryStatus: async (bookingId, status, otp = null, cylinderQrToken = null, enteredSerialNumber = null) => {
    const response = await api.post(`/deliveryagent/deliveries/${bookingId}/status`, {
      status, otp, cylinderQrToken, enteredSerialNumber,
    });
    return response.data; // Returns { message, booking }
  },

  getAgentProfile: async () => {
    const response = await api.get('/deliveryagent/profile');
    return response.data; // Returns delivery agent profile details
  },

  updateAgentLocation: async (latitude, longitude) => {
    // Fire-and-forget-ish: caller decides how to handle failures (usually
    // just skip this tick, since it repeats every few seconds anyway).
    const response = await api.post('/deliveryagent/location', { latitude, longitude });
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await api.post(`/booking/${bookingId}/cancel`);
    return response.data; // Returns { message, booking }
  },

  getAllBookings: async () => {
    const response = await api.get('/admin/bookings');
    return response.data; // Returns array of BookingResponseDto
  },
};

export default bookingService;
