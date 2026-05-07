import { useEffect, useState } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
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
  const [error, setError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

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

      toast({
        title: '[SUCCESS]',
        description: 'Task deleted successfully',
      });
      fetchTasks();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete task.';
      setError(errorMsg);
      toast({
        variant: 'destructive',
        title: '[ERROR]',
        description: errorMsg,
      });
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
      toast({
        title: '[SUCCESS]',
        description: 'Task updated successfully',
      });
      fetchTasks();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update task.';
      setError(errorMsg);
      toast({
        variant: 'destructive',
        title: '[ERROR]',
        description: errorMsg,
      });
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
      const errorMsg = err.response?.data?.message || 'Failed to update task.';
      setError(errorMsg);
      toast({
        variant: 'destructive',
        title: '[ERROR]',
        description: errorMsg,
      });
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setUpdatedTitle(task.title);
    setUpdatedDescription(task.description);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setUpdatedTitle('');
    setUpdatedDescription('');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6 border-2 border-white p-4">
        <pre className="text-primary text-xs leading-tight">
{`╔════════════════════════════════════╗
║    TASK MANAGEMENT PROTOCOL        ║
╚════════════════════════════════════╝`}
        </pre>
        <p className="text-muted-foreground text-xs mt-2">
          &gt; TOTAL TASKS: {tasks.length} | COMPLETED: {tasks.filter(t => t.completed).length}
        </p>
      </div>

      {error && (
        <div className="border border-destructive p-3 mb-6">
          <p className="text-destructive text-xs">[ERROR] {error}</p>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="border-2 border-white p-12 text-center">
          <p className="text-muted-foreground text-sm mb-2">[NO TASKS FOUND]</p>
          <p className="text-xs text-muted-foreground mb-6">
            USE CHAT INTERFACE TO CREATE NEW TASKS
          </p>
          <Button 
            onClick={() => navigate('/chat')}
            className="bg-primary text-black hover:bg-primary/80 border-2 border-primary rounded-none font-bold"
          >
            [ GO TO CHAT ]
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={task.id} className="border-2 border-white bg-black">
              <div className="border-b border-white p-3 flex items-center justify-between">
                <p className="text-primary text-xs font-bold">
                  TASK #{String(index + 1).padStart(3, '0')}
                </p>
                <p className={`text-xs ${task.completed ? 'text-primary' : 'text-accent'}`}>
                  [STATUS: {task.completed ? 'COMPLETED' : 'ACTIVE'}]
                </p>
              </div>

              {editingTaskId === task.id ? (
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-white text-xs mb-2">&gt; TITLE:</p>
                    <Input
                      type="text"
                      value={updatedTitle}
                      onChange={(e) => setUpdatedTitle(e.target.value)}
                      className="bg-black text-white border-white rounded-none"
                    />
                  </div>
                  <div>
                    <p className="text-white text-xs mb-2">&gt; DESCRIPTION:</p>
                    <Textarea
                      value={updatedDescription}
                      onChange={(e) => setUpdatedDescription(e.target.value)}
                      rows={3}
                      className="bg-black text-white border-white rounded-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateTask(task.id, task.completed)}
                      className="bg-primary text-black hover:bg-primary/80 border-2 border-primary rounded-none font-bold"
                    >
                      [ SAVE ]
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      className="border-2 border-white text-white hover:bg-white hover:text-black rounded-none"
                    >
                      [ CANCEL ]
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleComplete(task)}
                      className="mt-1 border-white data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-none"
                    />
                    <div className="flex-1">
                      <h3 className={`text-white font-bold mb-2 ${task.completed ? 'line-through' : ''}`}>
                        &gt; {task.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-white pt-3">
                    <Button
                      onClick={() => startEditing(task)}
                      className="border border-white text-white hover:bg-white hover:text-black rounded-none text-xs"
                      size="sm"
                    >
                      [ EDIT ]
                    </Button>
                    <Button
                      onClick={() => handleDeleteTask(task.id)}
                      className="border border-destructive text-destructive hover:bg-destructive hover:text-white rounded-none text-xs"
                      size="sm"
                    >
                      [ DELETE ]
                    </Button>
                  </div>
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
