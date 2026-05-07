import { supabase } from '../supabaseClient.js';

const createSendToken = (session, user, statusCode, res) => {
  res.status(statusCode).json({
    status: 'success',
    token: session.access_token,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
      },
    },
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide name, email, and password for registration.' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) throw error;

    if (!data.session) {
      return res.status(201).json({
        status: 'success',
        message: 'Registration successful! Please check your email for confirmation.',
      });
    }

    createSendToken(data.session, data.user, 201, res);
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    createSendToken(data.session, data.user, 200, res);
  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: error.message || 'Incorrect email or password.',
    });
  }
};
