import api from './api';

const complaintService = {
  raiseComplaint: async (bookingId, category, description) => {
    const response = await api.post('/customer/complaints', { bookingId, category, description });
    return response.data; // Returns { message, complaint }
  },

  getMyComplaints: async () => {
    const response = await api.get('/customer/complaints');
    return response.data; // Returns array of ComplaintResponseDto
  },

  getAllComplaints: async (status = null) => {
    const response = await api.get('/admin/complaints', { params: status ? { status } : {} });
    return response.data; // Returns array of ComplaintResponseDto
  },

  resolveComplaint: async (id, status, adminResponse) => {
    const response = await api.put(`/admin/complaints/${id}/resolve`, { status, adminResponse });
    return response.data; // Returns { message, complaint }
  },
};

export default complaintService;
