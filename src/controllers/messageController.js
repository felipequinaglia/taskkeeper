import { getSupabase } from '../supabaseClient.js';

export const getMessages = async (req, res) => {
  try {
    const supabase = getSupabase(req.token);
    const { limit = 20, offset = 0 } = req.query;

    const { data: messages, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      results: messages.length,
      total: count,
      messages: messages.reverse(), // Reverse to show in chronological order on the UI
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
