import { supabase } from '../supabaseClient.js';

export const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.',
      });
    }

    // 2) Verification token & Check if user still exists
    // Supabase's getUser verifies the JWT and returns the user data
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token or user does no longer exist.',
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    // We attach the user and the token to the request object. 
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: 'Authentication failed.',
    });
  }
};
