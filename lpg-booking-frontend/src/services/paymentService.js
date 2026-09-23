import api from './api';

const paymentService = {
  verifyPayment: async (bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod) => {
    const response = await api.post('/payment/verify', {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
    });
    return response.data; // Returns { message, booking }
  },
};

export default paymentService;
