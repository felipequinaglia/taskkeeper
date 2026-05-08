import { useEffect, useState } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

const Tasks = () => {
  const { tasks, fetchTasks } = useTasks();
  const [error,          setError]          = useState<string | null>(null);
  const [success,        setSuccess]        = useState<string | null>(null);
  const [editingId,      setEditingId]      = useState<string | null>(null);
  const [updatedTitle,   setUpdatedTitle]   = useState('');
  const [updatedDesc,    setUpdatedDesc]    = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2500);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      flash('Task deleted.');
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleUpdate = async (id: string, completed: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(
        `/api/tasks/${id}`,
        { title: updatedTitle, description: updatedDesc, completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      flash('Task updated.');
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  const handleToggle = async (task: Task) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(
        `/api/tasks/${task.id}`,
        { ...task, completed: !task.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setUpdatedTitle(task.title);
    setUpdatedDesc(task.description);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setUpdatedTitle('');
    setUpdatedDesc('');
  };

  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '1lh' }}>
        <pre className="tk-accent" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
{`╔══════════════════════════════════╗
║   TASK MANAGEMENT PROTOCOL       ║
╚══════════════════════════════════╝`}
        </pre>
        <p className="tk-dim">
          &gt; TOTAL: {total} &nbsp;|&nbsp; COMPLETED: {completed} &nbsp;|&nbsp; PENDING: {total - completed}
        </p>
      </div>

      {error && (
        <div className="tk-banner error" style={{ marginBottom: '1lh' }}>
          [ERROR] {error}&nbsp;
          <button
            size-="small"
            variant-="danger"
            onClick={() => setError(null)}
          >
            [X]
          </button>
        </div>
      )}

      {success && (
        <div className="tk-banner info" style={{ marginBottom: '1lh' }}>
          [OK] {success}
        </div>
      )}

      {tasks.length === 0 ? (
        <div box-="square" className="tk-empty">
          <p>[NO TASKS FOUND]</p>
          <p className="tk-dim" style={{ marginTop: '0.5lh', marginBottom: '1lh' }}>
            USE CHAT INTERFACE TO CREATE NEW TASKS
          </p>
          <button
            size-="small"
            variant-="accent"
            onClick={() => navigate('/chat')}
          >
            [ GO TO CHAT ]
          </button>
        </div>
      ) : (
        <div className="tk-task-list">
          {tasks.map((task, index) => (
            <div key={task.id} box-="square">

              {/* Task header row */}
              <div className="tk-task-header">
                <span className="tk-accent tk-bold">
                  TASK #{String(index + 1).padStart(3, '0')}
                </span>
                <span is-="badge" variant-={task.completed ? 'accent' : 'foreground2'}>
                  {task.completed ? 'COMPLETED' : 'ACTIVE'}
                </span>
              </div>

              {editingId === task.id ? (
                /* ── Edit mode ── */
                <div className="tk-task-body tk-form-stack">
                  <div className="tk-form-group">
                    <label className="tk-form-label">&gt; TITLE:</label>
                    <input
                      type="text"
                      value={updatedTitle}
                      onChange={e => setUpdatedTitle(e.target.value)}
                      className="tk-full"
                    />
                  </div>
                  <div className="tk-form-group">
                    <label className="tk-form-label">&gt; DESCRIPTION:</label>
                    <textarea
                      value={updatedDesc}
                      onChange={e => setUpdatedDesc(e.target.value)}
                      rows={3}
                      className="tk-full"
                    />
                  </div>
                  <div className="tk-row">
                    <button
                      size-="small"
                      variant-="accent"
                      onClick={() => handleUpdate(task.id, task.completed)}
                    >
                      [SAVE]
                    </button>
                    <button
                      size-="small"
                      variant-="foreground2"
                      onClick={cancelEditing}
                    >
                      [CANCEL]
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <div className="tk-task-body">
                  <div className="tk-task-check-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggle(task)}
                      />
                      <div>
                        <p className={`tk-bold ${task.completed ? 'tk-dim tk-strike' : ''}`}>
                          &gt; {task.title}
                        </p>
                        {task.description && (
                          <p className="tk-dim" style={{ marginTop: '0.3lh' }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Action row */}
              {editingId !== task.id && (
                <div className="tk-task-actions">
                  <button
                    size-="small"
                    variant-="foreground2"
                    onClick={() => startEditing(task)}
                  >
                    [EDIT]
                  </button>
                  <button
                    size-="small"
                    variant-="danger"
                    onClick={() => handleDelete(task.id)}
                  >
                    [DELETE]
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
