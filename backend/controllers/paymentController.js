const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpay;

const getRazorpayInstance = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key') {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// Create order for UPI/Razorpay payment
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, method } = req.body;

    const instance = getRazorpayInstance();

    // If Razorpay not configured, return demo order
    if (!instance) {
      const demoOrderId = 'order_' + crypto.randomBytes(12).toString('hex');
      return res.status(200).json({
        success: true,
        data: {
          id: demoOrderId,
          amount: Math.round(amount * 100),
          currency,
          status: 'created',
          demo: true,
          upi: {
            method: method || 'upi',
            apps: ['google_pay', 'phonepe', 'paytm', 'bhim', 'other_upi']
          }
        }
      });
    }

    const order = await instance.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        method: method || 'upi',
      }
    });

    res.status(200).json({
      success: true,
      data: {
        ...order,
        upi: {
          method: method || 'upi',
          apps: ['google_pay', 'phonepe', 'paytm', 'bhim', 'other_upi']
        }
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const instance = getRazorpayInstance();

    // If demo mode
    if (!instance) {
      return res.status(200).json({
        success: true,
        message: 'Payment verified (demo mode)',
        data: {
          paymentId: razorpay_payment_id || 'pay_demo_' + crypto.randomBytes(8).toString('hex'),
          orderId: razorpay_order_id || 'order_demo',
          status: 'paid'
        }
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          status: 'paid'
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const instance = getRazorpayInstance();

    if (!instance) {
      return res.status(200).json({
        success: true,
        data: { status: 'captured', amount: 0 }
      });
    }

    const payment = await instance.payments.fetch(paymentId);
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Refund payment
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;
    const instance = getRazorpayInstance();

    if (!instance) {
      return res.status(200).json({
        success: true,
        message: 'Refund initiated (demo mode)',
        data: { id: 'ref_demo_' + Date.now(), status: 'processed' }
      });
    }

    const refund = await instance.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    res.status(200).json({ success: true, data: refund });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPI apps configuration
exports.getUpiApps = async (req, res) => {
  try {
    const upiApps = [
      {
        id: 'google_pay',
        name: 'Google Pay',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Google_Pay_Logo.svg/200px-Google_Pay_Logo.svg.png',
        enabled: true
      },
      {
        id: 'phonepe',
        name: 'PhonePe',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/PhonePe_Logo.svg/200px-PhonePe_Logo.svg.png',
        enabled: true
      },
      {
        id: 'paytm',
        name: 'Paytm',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo.svg/200px-Paytm_Logo.svg.png',
        enabled: true
      },
      {
        id: 'bhim',
        name: 'BHIM UPI',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/BHIM_SVG_Logo.svg/200px-BHIM_SVG_Logo.svg.png',
        enabled: true
      },
      {
        id: 'other_upi',
        name: 'Other UPI',
        icon: '',
        enabled: true
      }
    ];

    res.status(200).json({ success: true, data: upiApps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
