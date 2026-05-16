import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_super_secret_jwt_key_idr_ai');
      
      if (!decoded.userId) {
        throw new Error('Token payload missing userId');
      }

      req.user = decoded; 
      next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      res.status(401).json({ success: false, error: 'Authentication failed. Please log in again.' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};
