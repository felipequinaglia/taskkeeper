import db from '../db.js';
import { saveTaskToDb } from '../services/taskService.js';

export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id; // Assuming user information is available in req.user from authentication middleware

    const newTask = await saveTaskToDb(userId, title, description);

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
    const userId = req.user.id; // Assuming user information is available in req.user from authentication middleware

    const tasks = await db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

    res.status(200).json({
      status: 'success',
      results: tasks.rows.length,
      data: {
        tasks: tasks.rows,
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
    const userId = req.user.id; // Assuming user information is available in req.user from authentication middleware

    const task = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);

    if (!task.rows.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'No task found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        task: task.rows[0],
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
    const userId = req.user.id; // Assuming user information is available in req.user from authentication middleware

    const updatedTask = await db.query(
      'UPDATE tasks SET title = $1, description = $2, completed = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, description, completed, id, userId]
    );

    if (!updatedTask.rows.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'No task found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        task: updatedTask.rows[0],
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
    const userId = req.user.id; // Assuming user information is available in req.user from authentication middleware

    const deletedTask = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);

    if (!deletedTask.rows.length) {
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