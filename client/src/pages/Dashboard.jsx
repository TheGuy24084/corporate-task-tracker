import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import ScrumView from '../components/ScrumView';
import ProjectManagementView from '../components/ProjectManagementView';
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
  Search,
  Filter,
  RotateCcw,
  Zap,
  Calendar,
  Target,
} from 'lucide-react';

const METHODOLOGIES = [
  {
    id: 'Kanban',
    title: 'Kanban Board',
    subtitle: 'Continuous flow',
    icon: Kanban,
  },
  {
    id: 'Scrum',
    title: 'Scrum Mode',
    subtitle: 'Sprints, Backlog & Story Points',
    icon: Zap,
  },
  {
    id: 'Project Management',
    title: 'Project Management',
    subtitle: 'Milestones, Timelines & Deadlines',
    icon: Calendar,
  },
];

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
      return s === 'to-do' || s === 'todo' || s === 'to do' || s === 'backlog' || !status;
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
  sprint: 'Backlog',
  storyPoints: 1,
  milestone: 'Phase 1: Planning',
  dueDate: '',
};

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Methodology Switcher State: 'Kanban' | 'Scrum' | 'Project Management'
  const [methodology, setMethodology] = useState('Kanban');

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Check if any filter is active
  const isFiltered = Boolean(searchQuery.trim() || priorityFilter !== 'All' || statusFilter !== 'All');

  // Reset all filters to default
  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('All');
    setStatusFilter('All');
  };

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

  // Open modal with optional prefilled column status, sprint, and milestone
  const openModal = (
    initialStatus = 'To-Do',
    initialSprint,
    initialMilestone
  ) => {
    setFormData({
      ...INITIAL_FORM_DATA,
      status: initialStatus,
      sprint:
        initialSprint ||
        (methodology === 'Scrum' ? 'Sprint 1' : 'Backlog'),
      milestone: initialMilestone || 'Phase 1: Planning',
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
        sprint: formData.sprint || 'Backlog',
        storyPoints: Number(formData.storyPoints) || 1,
        milestone: formData.milestone || 'Phase 1: Planning',
        dueDate: formData.dueDate || undefined,
      };

      const response = await api.post('/tasks', payload);
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

  // Filter tasks dynamically by Search Query (Title/Description), Priority, and Status
  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q));

    const matchesPriority =
      priorityFilter === 'All' ||
      (t.priority && t.priority.toLowerCase() === priorityFilter.toLowerCase());

    let matchesStatus = true;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Backlog') {
        matchesStatus = String(t.status || '').trim().toLowerCase() === 'backlog';
      } else {
        const targetCol = KANBAN_COLUMNS.find((col) => col.id === statusFilter);
        matchesStatus = targetCol ? targetCol.matcher(t.status) : t.status === statusFilter;
      }
    }

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Calculate task counts per column from filtered tasks
  const todoTasks = filteredTasks.filter((t) => KANBAN_COLUMNS[0].matcher(t.status));
  const inProgressTasks = filteredTasks.filter((t) => KANBAN_COLUMNS[1].matcher(t.status));
  const completedTasks = filteredTasks.filter((t) => KANBAN_COLUMNS[2].matcher(t.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Methodology Switcher Segmented Control */}
      <div
        data-testid="methodology-switcher"
        className="p-1.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-2"
      >
        {METHODOLOGIES.map((item) => {
          const isActive = methodology === item.id;
          const ItemIcon = item.icon;
          const testId = `methodology-tab-${item.id.toLowerCase().replace(/\s+/g, '-')}`;

          return (
            <button
              key={item.id}
              type="button"
              id={testId}
              data-testid={testId}
              onClick={() => setMethodology(item.id)}
              aria-selected={isActive}
              className={`relative flex items-center gap-3 p-3 sm:py-3.5 sm:px-4 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <ItemIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-sm font-bold tracking-tight truncate ${
                    isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {item.title}
                </span>
                <span
                  className={`text-xs truncate ${
                    isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              {methodology === 'Scrum' ? (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Scrum Mode</span>
                </>
              ) : methodology === 'Project Management' ? (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Project Management</span>
                </>
              ) : (
                <>
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Project Kanban Board</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {methodology === 'Scrum'
                ? 'Sprint & Velocity Management'
                : methodology === 'Project Management'
                ? 'Milestones & Project Roadmaps'
                : 'Corporate Task Workflow'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              {methodology === 'Scrum'
                ? 'Manage sprint iterations, estimate effort with story points, and commit backlog deliverables.'
                : methodology === 'Project Management'
                ? 'Monitor cross-phase milestones, track project schedules, and enforce critical path deadlines.'
                : 'Track, organize, and monitor corporate continuous flow across team deliverables.'}{' '}
              Logged in as <span className="text-slate-900 dark:text-slate-200 font-medium">{user?.name || user?.email}</span>.
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
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              title="Refresh Tasks"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-500 dark:text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards based on Methodology */}
      {methodology === 'Scrum' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Total Story Points
              </span>
              <Zap className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {tasks.reduce((sum, t) => sum + (Number(t.storyPoints) || 1), 0)} pts
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Estimated effort across tasks</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Backlog Items
              </span>
              <ListTodo className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {tasks.filter((t) => t.sprint === 'Backlog' || t.status === 'Backlog').length}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Uncommitted queue</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                In Sprint Dev
              </span>
              <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {inProgressTasks.length}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Active sprint velocity</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Delivered Velocity
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {completedTasks.reduce((sum, t) => sum + (Number(t.storyPoints) || 1), 0)} pts
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Completed story points</span>
          </div>
        </div>
      ) : methodology === 'Project Management' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                Deliverables
              </span>
              <Target className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {tasks.length}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Project scope items</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Active Milestones
              </span>
              <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {new Set(tasks.map((t) => t.milestone || 'Phase 1: Planning')).size}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Project phase tracks</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Deadlines Scheduled
              </span>
              <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {tasks.filter((t) => Boolean(t.dueDate)).length}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Target milestones with due dates</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Delivered
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {completedTasks.length}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Milestones verified</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Total Tasks
              </span>
              <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {tasks.length}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">All registered items</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                To-Do
              </span>
              <ListTodo className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {todoTasks.length}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Backlog queue</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                In Progress
              </span>
              <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {inProgressTasks.length}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Active development</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Completed
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {completedTasks.length}
            </p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Delivered & verified</span>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
            <div>
              <p className="font-semibold">Notice from Backend API</p>
              <p className="text-xs mt-0.5 text-amber-700/90 dark:text-amber-300/90">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="text-xs font-semibold underline text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Task Filter & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input Field */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="search-input"
              data-testid="search-input"
              aria-label="Filter tasks by title or keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or filter tasks by title..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Clear search query"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="status-filter"
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden sm:inline"
              >
                Status:
              </label>
              <select
                id="status-filter"
                data-testid="status-filter"
                aria-label="Filter tasks by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
              >
                <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Statuses</option>
                <option value="Backlog" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Backlog</option>
                <option value="To-Do" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">To-Do</option>
                <option value="In Progress" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">In Progress</option>
                <option value="Completed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="priority-filter"
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden sm:inline"
              >
                Priority:
              </label>
              <select
                id="priority-filter"
                data-testid="priority-filter"
                aria-label="Filter tasks by priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
              >
                <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Priorities</option>
                <option value="High" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">High (Red)</option>
                <option value="Medium" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Medium (Yellow)</option>
                <option value="Low" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Low (Blue)</option>
              </select>
            </div>

            {/* Reset / Clear Filters Button */}
            {isFiltered && (
              <button
                type="button"
                id="clear-filters"
                data-testid="clear-filters"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Summary & Results Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>
              {isFiltered ? (
                <>
                  Showing <strong className="text-slate-900 dark:text-white">{filteredTasks.length}</strong> of{' '}
                  <strong className="text-slate-900 dark:text-white">{tasks.length}</strong> tasks matching criteria
                </>
              ) : (
                <>
                  Showing all <strong className="text-slate-900 dark:text-white">{tasks.length}</strong> tasks across sprints
                </>
              )}
            </span>
          </div>

          {isFiltered && (
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              Filters Active
            </span>
          )}
        </div>
      </div>

      {/* Methodology Dynamic Views */}
      {methodology === 'Scrum' ? (
        <ScrumView
          tasks={filteredTasks}
          user={user}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          openModal={openModal}
          loading={loading}
        />
      ) : methodology === 'Project Management' ? (
        <ProjectManagementView
          tasks={filteredTasks}
          user={user}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          openModal={openModal}
          loading={loading}
        />
      ) : (
        /* Responsive 3-Column Kanban Board Layout */
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
                className={`flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 border-t-4 ${column.accentBorder} p-4 sm:p-5 shadow-lg backdrop-blur-sm min-h-[460px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center">
                      <ColumnIcon className={`w-4 h-4 ${column.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                        {column.title}
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                        {column.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick Add Button per Column */}
                    <button
                      onClick={() => openModal(column.id)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
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
                      <div className="h-28 rounded-xl bg-slate-200/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/60" />
                      <div className="h-28 rounded-xl bg-slate-200/40 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/40" />
                    </div>
                  ) : columnTasks.length > 0 ? (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task._id || task.id || task.title}
                        task={task}
                        methodology={methodology}
                        user={user}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  ) : (
                    <div className="h-44 rounded-xl border border-dashed border-slate-300 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/40 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                        <Sparkles className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {isFiltered ? `No ${column.title} tasks match filter` : `No tasks in ${column.title}`}
                      </p>
                      {isFiltered ? (
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Clear filters</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openModal(column.id)}
                          className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create a task</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form to Create a New Task */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 dark:from-indigo-500/20 to-purple-500/10 dark:to-purple-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="modal-title"
                    className="text-lg font-bold text-slate-900 dark:text-white tracking-tight"
                  >
                    Create New Task
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add a work deliverable to your corporate board
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Error Banner */}
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Task Title Input */}
              <div>
                <label
                  htmlFor="task-title"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Task Title <span className="text-rose-500 dark:text-rose-400">*</span>
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Task Description Textarea */}
              <div>
                <label
                  htmlFor="task-description"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Status and Priority Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Initial Status */}
                <div>
                  <label
                    htmlFor="task-status"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Status
                  </label>
                  <select
                    id="task-status"
                    name="status"
                    data-testid="task-status-input"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="Backlog" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      Backlog
                    </option>
                    <option value="To-Do" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      To-Do
                    </option>
                    <option value="In Progress" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      In Progress
                    </option>
                    <option value="Completed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      Completed
                    </option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label
                    htmlFor="task-priority"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    name="priority"
                    data-testid="task-priority-input"
                    value={formData.priority}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="Low" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      Low (Blue)
                    </option>
                    <option value="Medium" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      Medium (Yellow)
                    </option>
                    <option value="High" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      High (Red)
                    </option>
                  </select>
                </div>
              </div>

              {/* Sprint & Story Points Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sprint */}
                <div>
                  <label
                    htmlFor="task-sprint"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Sprint
                  </label>
                  <select
                    id="task-sprint"
                    name="sprint"
                    data-testid="task-sprint-input"
                    value={formData.sprint}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="Backlog" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      Backlog
                    </option>
                    <option value="Sprint 1" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      Sprint 1
                    </option>
                    <option value="Sprint 2" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      Sprint 2
                    </option>
                  </select>
                </div>

                {/* Story Points */}
                <div>
                  <label
                    htmlFor="task-story-points"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Story Points
                  </label>
                  <select
                    id="task-story-points"
                    name="storyPoints"
                    data-testid="task-story-points-input"
                    value={formData.storyPoints}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value={1} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      1 Point
                    </option>
                    <option value={2} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      2 Points
                    </option>
                    <option value={3} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      3 Points
                    </option>
                    <option value={5} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      5 Points
                    </option>
                    <option value={8} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      8 Points
                    </option>
                    <option value={13} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      13 Points
                    </option>
                  </select>
                </div>
              </div>

              {/* Milestone & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Milestone */}
                <div>
                  <label
                    htmlFor="task-milestone"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Milestone
                  </label>
                  <select
                    id="task-milestone"
                    name="milestone"
                    data-testid="task-milestone-input"
                    value={formData.milestone}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="Phase 1: Planning" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      Phase 1: Planning
                    </option>
                    <option value="Phase 2: Execution" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      Phase 2: Execution
                    </option>
                    <option value="Phase 3: Launch" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      Phase 3: Launch
                    </option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label
                    htmlFor="task-due-date"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Due Date
                  </label>
                  <input
                    id="task-due-date"
                    name="dueDate"
                    type="date"
                    data-testid="task-due-date-input"
                    value={formData.dueDate}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
