import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { amount, planName } = req.body;

    if (!amount || !planName) {
      return res.status(400).json({ success: false, error: 'Amount and plan name are required.' });
    }

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planName,
        userId: req.user.userId,
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, error: 'Failed to create Razorpay order.' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planName,
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update user plan
      const user = await User.findById(req.user.userId);
      if (user) {
        user.plan = planName.toLowerCase();
        await user.save();

        res.status(200).json({
          success: true,
          message: 'Payment verified and plan upgraded successfully.',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            theme: user.theme,
            plan: user.plan
          }
        });
      } else {
        res.status(404).json({ success: false, error: 'User not found.' });
      }
    } else {
      res.status(400).json({ success: false, error: 'Invalid payment signature.' });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify payment.' });
  }
};
