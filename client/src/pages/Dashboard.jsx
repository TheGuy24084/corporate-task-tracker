import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import {
  LayoutDashboard,
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ListTodo,
  CheckSquare,
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState('');

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoadingTasks(true);
    setTaskError('');
    try {
      const response = await api.get('/tasks');
      setTasks(response.data?.tasks || response.data || []);
    } catch (error) {
      setTaskError(
        error.response?.data?.message ||
          'Failed to fetch tasks. Ensure the backend server is running on port 5000.'
      );
    } finally {
      setLoadingTasks(false);
    }
  }, [token]);

  useEffect(() => {
    let ignore = false;

    async function loadTasks() {
      if (!token) return;
      try {
        const response = await api.get('/tasks');
        if (!ignore) {
          setTasks(response.data?.tasks || response.data || []);
        }
      } catch (error) {
        if (!ignore) {
          setTaskError(
            error.response?.data?.message ||
              'Failed to fetch tasks. Ensure the backend server is running on port 5000.'
          );
        }
      }
    }

    loadTasks();

    return () => {
      ignore = true;
    };
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-400 mb-6">
            You need to be logged in with a valid JWT token to view the dashboard and manage tasks.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all text-sm"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-sm"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Session Active
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                  isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                <Shield className="w-3 h-3" />
                {user?.role || 'User'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Team Member'}!
            </h1>
            <p className="text-sm text-slate-400">
              Logged in as <span className="text-slate-300 font-medium">{user?.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTasks}
              disabled={loadingTasks}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
              title="Refresh Tasks"
            >
              <RefreshCw className={`w-4 h-4 ${loadingTasks ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Axios Interceptor Status & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Token Interceptor Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Axios Interceptor
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-base font-semibold text-white">Bearer Auth Attached</h3>
          </div>
          <p className="text-xs text-slate-400 font-mono break-all bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 mt-2">
            Authorization: Bearer {token ? `${token.substring(0, 24)}...` : 'None'}
          </p>
        </div>

        {/* User Identity Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Identity
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-base font-semibold text-white">{user?.name}</h3>
          <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>Permissions:</span>
            <span className="font-semibold text-slate-200">
              {isAdmin ? 'Full Administrative Access' : 'Standard User Access'}
            </span>
          </div>
        </div>

        {/* Task Metric Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tasks Assigned
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{tasks.length}</span>
            <span className="text-xs text-slate-400">items loaded</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Loaded via Axios instance with Bearer interceptor
          </p>
        </div>
      </div>

      {/* Task List / API verification section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Corporate Tasks</h2>
              <p className="text-xs text-slate-400">
                Connected to backend <code className="text-indigo-400">GET /api/tasks</code>
              </p>
            </div>
          </div>
        </div>

        {taskError && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold">API Note</p>
              <p className="text-xs mt-0.5 text-amber-300/90">{taskError}</p>
            </div>
          </div>
        )}

        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div
                key={task._id || task.id}
                className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">{task.title}</h3>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      task.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : task.status === 'In Progress'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {task.status || 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-3">
            <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">
              {loadingTasks ? 'Loading tasks from server...' : 'No tasks created yet.'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your JWT token was successfully attached to the API request header.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
