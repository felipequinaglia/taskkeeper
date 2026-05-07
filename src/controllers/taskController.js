import { getSupabase } from '../supabaseClient.js';
import { saveTaskToDb } from '../services/taskService.js';

export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    const supabase = getSupabase(req.token);

    const newTask = await saveTaskToDb(supabase, userId, title, description);

    res.status(201).json({
      status: 'success',
      data: {
        task: newTask,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const supabase = getSupabase(req.token);

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase(req.token);

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !task) {
      return res.status(404).json({
        status: 'fail',
        message: 'No task found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const supabase = getSupabase(req.token);

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({ title, description, completed })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedTask) {
      return res.status(404).json({
        status: 'fail',
        message: 'No task found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        task: updatedTask,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase(req.token);

    const { error, count } = await supabase
      .from('tasks')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error || count === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No task found with that ID',
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};