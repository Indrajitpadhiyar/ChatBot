import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email },
    process.env.JWT_SECRET || 'my_super_secret_jwt_key_idr_ai',
    { expiresIn: '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, picture: user.picture, theme: user.theme, plan: user.plan }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, error: 'Please login with Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, picture: user.picture, theme: user.theme, plan: user.plan }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { credential, access_token } = req.body;

    let email, name, picture, googleId;

    if (credential) {
      // Verify ID Token (Standard GoogleLogin component)
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else if (access_token) {
      // Verify Access Token (Custom Button useGoogleLogin flow)
      const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
      const payload = await res.json();
      if (!payload.email) throw new Error('Invalid access token');
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else {
      return res.status(400).json({ success: false, error: 'Token missing' });
    }

    let user = await User.findOne({ email });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = user.picture || picture;
        await user.save();
      }
    } else {
      user = await User.create({ googleId, email, name, picture });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        theme: user.theme,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

export const saveTheme = async (req, res) => {
  try {
    const { email, theme } = req.body;
    if (!email || !theme) {
      return res.status(400).json({ success: false, error: 'Missing email or theme' });
    }
    const user = await User.findOneAndUpdate({ email }, { theme }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, theme: user.theme });
  } catch (error) {
    console.error('Save theme error:', error);
    res.status(500).json({ success: false, error: 'Failed to save theme' });
  }
};
