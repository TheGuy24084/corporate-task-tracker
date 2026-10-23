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
  Layers,
  Sparkles,
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

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

                {/* Column Task Count Badge */}
                <span
                  data-testid={`column-count-${column.id.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${column.headerBadge}`}
                >
                  {columnTasks.length}
                </span>
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
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {column.id === 'To-Do'
                        ? 'New tasks will appear here'
                        : `Tasks marked "${column.title}" will appear here`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
