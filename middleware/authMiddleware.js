import jwt from 'jsonwebtoken';
import user from '../model/User.js';

const validateToken = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;

 
  // Check if Authorization header is present
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1];  // Extract the token
      const jwt_secret = process.env.JWT_SECRET; // Make sure JWT_SECRET is loaded
      // console.log(jwt_secret);
      

      if (!jwt_secret) {
        return res.status(500).send('JWT secret is not configured.');
      }

      // Verify the token
      const decoded = jwt.verify(token, jwt_secret);

      if (!decoded?.id) {
        console.log("No Id");
        
        return res.status(401).send('Token is invalid or expired.');
      }

      // Fetch user from the database
      const userData = await user.findById(decoded.id).select('-password');

      if (!userData) {
        console.log("No Data");
        
        return res.status(404).send('User not found.');
      }

      // Attach user ID to the request object
      req.userId = userData._id;

      // Proceed to the next middleware or route
      next();
    } catch (error) {
      // Handle invalid token or verification error
      console.log(error.message);
      
      return res.status(401).send('Token verification failed: ' + error.message);
    }
  } else {
    // Return error if authorization header is missing
    console.log('no Header');
    
    return res.status(403).send('Authorization failed. No token provided.');
  }
};

export default validateToken;
