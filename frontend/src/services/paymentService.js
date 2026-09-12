import api from './api';

export const paymentService = {
  async createOrder(amount, method = 'upi') {
    const { data } = await api.post('/payments/create-order', { amount, method });
    return data;
  },

  async verifyPayment(paymentData) {
    const { data } = await api.post('/payments/verify', paymentData);
    return data;
  },

  async getPaymentStatus(paymentId) {
    const { data } = await api.get(`/payments/status/${paymentId}`);
    return data;
  },

  async refundPayment(paymentId, amount) {
    const { data } = await api.post('/payments/refund', { paymentId, amount });
    return data;
  },

  async getUpiApps() {
    const { data } = await api.get('/payments/upi-apps');
    return data;
  },

  // Initialize Razorpay checkout
  openRazorpayCheckout(orderData, upiMethod) {
    return new Promise((resolve, reject) => {
      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'demo_key',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'RTE Foods',
        description: 'Order Payment',
        order_id: orderData.id,
        method: 'upi',
        upi: {
          flow: 'intent',
          vpa: upiMethod === 'other_upi' ? '' : undefined,
        },
        prefill: {
          name: orderData.userName || '',
          email: orderData.userEmail || '',
          contact: orderData.userPhone || '',
        },
        theme: {
          color: '#FF6B00',
        },
        handler: function (response) {
          resolve(response);
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled'));
          },
        },
      };

      // Check if Razorpay is loaded
      if (typeof window.Razorpay !== 'undefined') {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Demo mode - simulate payment
        setTimeout(() => {
          resolve({
            razorpay_order_id: orderData.id,
            razorpay_payment_id: 'pay_demo_' + Date.now(),
            razorpay_signature: 'demo_signature_' + Date.now(),
          });
        }, 1500);
      }
    });
  }
};

export default paymentService;
