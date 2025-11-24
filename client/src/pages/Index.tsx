import React, { useEffect, useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import api from '../api';
import styles from './Index.module.css';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

const Index: React.FC = () => {
  const { tasks, fetchTasks } = useTasks();
  const [error, setError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDeleteTask = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      await api.delete(`/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleUpdateTask = async (id: string, completed: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      await api.patch(
        `/api/tasks/${id}`,
        { title: updatedTitle, description: updatedDescription, completed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingTaskId(null);
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };
  
    const handleToggleComplete = async (task: Task) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      await api.patch(
        `/api/tasks/${task.id}`,
        { ...task, completed: !task.completed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setUpdatedTitle(task.title);
    setUpdatedDescription(task.description);
  };

  return (
    <div className={styles.taskContainer}>
      <h1>Your Tasks</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {tasks.length === 0 && <p>No tasks added yet. Go to the chat to add a new task.</p>}
      <ul className={styles.taskList}>
        {tasks.map((task) => (
          <li key={task.id} className={`${styles.taskItem} ${task.completed ? styles.completedTask : ''}`}>
            {editingTaskId === task.id ? (
              <div>
                <input
                  type="text"
                  value={updatedTitle}
                  onChange={(e) => setUpdatedTitle(e.target.value)}
                />
                <input
                  type="text"
                  value={updatedDescription}
                  onChange={(e) => setUpdatedDescription(e.target.value)}
                />
                <button onClick={() => handleUpdateTask(task.id, task.completed)}>Save</button>
                <button onClick={() => setEditingTaskId(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <h2>{task.title}</h2>
                <p>{task.description}</p>
                <p>Completed: {task.completed ? 'Yes' : 'No'}</p>
                <button onClick={() => handleToggleComplete(task)}>
                  {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                </button>
                <button onClick={() => startEditing(task)}>Edit</button>
                <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Index;