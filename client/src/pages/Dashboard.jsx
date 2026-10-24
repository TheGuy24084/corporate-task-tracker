import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import {
  Kanban,
  ListTodo,
  Clock,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Layers,
  Sparkles,
  Plus,
  X,
  Loader2,
} from 'lucide-react';

const KANBAN_COLUMNS = [
  {
    id: 'To-Do',
    title: 'To-Do',
    description: 'Upcoming tasks awaiting execution',
    accentBorder: 'border-t-indigo-500',
    headerBadge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    icon: ListTodo,
    iconColor: 'text-indigo-400',
    matcher: (status) => {
      const s = String(status || '').trim().toLowerCase();
      return s === 'to-do' || s === 'todo' || s === 'to do' || !status;
    },
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    description: 'Tasks currently in development',
    accentBorder: 'border-t-amber-500',
    headerBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: Clock,
    iconColor: 'text-amber-400',
    matcher: (status) => {
      const s = String(status || '').trim().toLowerCase();
      return (
        s === 'in progress' ||
        s === 'in-progress' ||
        s === 'inprogress' ||
        s === 'progress'
      );
    },
  },
  {
    id: 'Completed',
    title: 'Completed',
    description: 'Tasks finalized and verified',
    accentBorder: 'border-t-emerald-500',
    headerBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    matcher: (status) => {
      const s = String(status || '').trim().toLowerCase();
      return s === 'completed' || s === 'done' || s === 'complete';
    },
  },
];

const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  status: 'To-Do',
  priority: 'Medium',
};

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch tasks on initial mount when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    let ignore = false;

    async function loadTasks() {
      try {
        const response = await api.get('/tasks');
        if (!ignore) {
          const data = response.data;
          const list = Array.isArray(data) ? data : (data?.tasks || []);
          setTasks(list);
          setError('');
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Failed to load tasks from server (/api/tasks).'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  // Open modal with optional prefilled column status
  const openModal = (initialStatus = 'To-Do') => {
    setFormData({
      ...INITIAL_FORM_DATA,
      status: initialStatus,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_DATA);
    setFormError('');
    setIsSubmitting(false);
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/tasks');
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.tasks || []);
      setTasks(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load tasks from server (/api/tasks).'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle task creation form submission (POST /api/tasks)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      setFormError('Task title is required');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      // POST request to /api/tasks
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
      };

      const response = await api.post('/api/tasks', payload);
      const newTask = response.data;

      // Update React state with newly created task
      setTasks((prev) => [newTask, ...prev]);

      closeModal();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Failed to create task. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Callback to update a task in state when status is changed
  const handleUpdateTask = (updatedTask) => {
    const updatedId = updatedTask._id || updatedTask.id;
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        (t._id === updatedId || t.id === updatedId)
          ? { ...t, ...updatedTask }
          : t
      )
    );
  };

  // Callback to remove a task from state when deleted
  const handleDeleteTask = (deletedId) => {
    setTasks((prevTasks) =>
      prevTasks.filter((t) => t._id !== deletedId && t.id !== deletedId)
    );
  };

  // Immediate redirect for unauthenticated state
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Calculate task counts per column
  const todoTasks = tasks.filter((t) => KANBAN_COLUMNS[0].matcher(t.status));
  const inProgressTasks = tasks.filter((t) => KANBAN_COLUMNS[1].matcher(t.status));
  const completedTasks = tasks.filter((t) => KANBAN_COLUMNS[2].matcher(t.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/30 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Kanban className="w-3.5 h-3.5" />
              <span>Project Kanban Board</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Corporate Task Workflow
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Track, organize, and monitor corporate sprints across team deliverables.
              Logged in as <span className="text-slate-200 font-medium">{user?.name || user?.email}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Create Task Button to trigger Modal */}
            <button
              onClick={() => openModal('To-Do')}
              data-testid="create-task-button"
              id="create-task-button"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Create New Task"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>

            {/* Refresh Board Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              title="Refresh Tasks"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Tasks
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {tasks.length}
          </p>
          <span className="text-[11px] text-slate-500">All registered items</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              To-Do
            </span>
            <ListTodo className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {todoTasks.length}
          </p>
          <span className="text-[11px] text-slate-500">Backlog queue</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              In Progress
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {inProgressTasks.length}
          </p>
          <span className="text-[11px] text-slate-500">Active development</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {completedTasks.length}
          </p>
          <span className="text-[11px] text-slate-500">Delivered & verified</span>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold">Notice from Backend API</p>
              <p className="text-xs mt-0.5 text-amber-300/90">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="text-xs font-semibold underline text-amber-300 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Responsive 3-Column Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {KANBAN_COLUMNS.map((column) => {
          let columnTasks = [];
          if (column.id === 'To-Do') columnTasks = todoTasks;
          else if (column.id === 'In Progress') columnTasks = inProgressTasks;
          else if (column.id === 'Completed') columnTasks = completedTasks;

          const ColumnIcon = column.icon;

          return (
            <div
              key={column.id}
              data-testid={`kanban-column-${column.id.toLowerCase().replace(/\s+/g, '-')}`}
              className={`flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800 border-t-4 ${column.accentBorder} p-4 sm:p-5 shadow-lg backdrop-blur-sm min-h-[460px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700/60 flex items-center justify-center">
                    <ColumnIcon className={`w-4 h-4 ${column.iconColor}`} />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-base tracking-tight">
                      {column.title}
                    </h2>
                    <p className="text-[11px] text-slate-500 hidden sm:block">
                      {column.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Add Button per Column */}
                  <button
                    onClick={() => openModal(column.id)}
                    className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={`Add task to ${column.title}`}
                    aria-label={`Add task to ${column.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {/* Column Task Count Badge */}
                  <span
                    data-testid={`column-count-${column.id.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${column.headerBadge}`}
                  >
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-3.5">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-28 rounded-xl bg-slate-800/40 border border-slate-800/60" />
                    <div className="h-28 rounded-xl bg-slate-800/20 border border-slate-800/40" />
                  </div>
                ) : columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task._id || task.id || task.title}
                      task={task}
                      user={user}
                      onUpdateTask={handleUpdateTask}
                      onDeleteTask={handleDeleteTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                ) : (
                  <div className="h-44 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/40 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-600 mb-2">
                      <Sparkles className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-xs font-medium text-slate-400">
                      No tasks in {column.title}
                    </p>
                    <button
                      onClick={() => openModal(column.id)}
                      className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Create a task</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Form to Create a New Task */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="modal-title"
                    className="text-lg font-bold text-white tracking-tight"
                  >
                    Create New Task
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add a work deliverable to your corporate board
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Error Banner */}
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Task Title Input */}
              <div>
                <label
                  htmlFor="task-title"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  id="task-title"
                  name="title"
                  type="text"
                  required
                  autoFocus
                  data-testid="task-title-input"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Implement user authentication flow"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Task Description Textarea */}
              <div>
                <label
                  htmlFor="task-description"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="task-description"
                  name="description"
                  rows={3}
                  data-testid="task-description-input"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Outline key requirements, acceptance criteria, or technical details..."
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Status and Priority Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Initial Status */}
                <div>
                  <label
                    htmlFor="task-status"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Status
                  </label>
                  <select
                    id="task-status"
                    name="status"
                    data-testid="task-status-input"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="To-Do" className="bg-slate-900 text-slate-100">
                      To-Do
                    </option>
                    <option value="In Progress" className="bg-slate-900 text-slate-100">
                      In Progress
                    </option>
                    <option value="Completed" className="bg-slate-900 text-slate-100">
                      Completed
                    </option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label
                    htmlFor="task-priority"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    name="priority"
                    data-testid="task-priority-input"
                    value={formData.priority}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="Low" className="bg-slate-900 text-slate-100">
                      Low (Blue)
                    </option>
                    <option value="Medium" className="bg-slate-900 text-slate-100">
                      Medium (Yellow)
                    </option>
                    <option value="High" className="bg-slate-900 text-slate-100">
                      High (Red)
                    </option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  data-testid="submit-task-button"
                  className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
