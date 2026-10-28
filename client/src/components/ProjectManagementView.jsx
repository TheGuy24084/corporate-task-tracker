import { useState, useContext } from 'react';
import {
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Loader2,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import AuthContext from '../AuthContext';
import api from '../api/axios';

const DEFAULT_MILESTONES = [
  'Phase 1: Planning',
  'Phase 2: Execution',
  'Phase 3: Launch',
];

/**
 * ProjectManagementView Component
 * Renders structured Milestone & Timeline Project Management:
 * - Project Overview Header (Overall completion %, Total tasks, Overdue tasks count)
 * - Milestone & Timeline Table/List grouped by 'milestone'
 * - Each row shows: Task Title, Priority, Status dropdown (triggering PUT /api/tasks/:id),
 *   Story Points, Due Date (highlighted red if overdue), Visual Progress Bar, and Admin-only Delete button.
 */
export default function ProjectManagementView({
  tasks = [],
  user: propUser,
  onUpdateTask,
  onDeleteTask,
  openModal,
  loading = false,
}) {
  const auth = useContext(AuthContext);
  const currentUser = propUser || auth?.user;
  const isAdmin =
    currentUser?.role === 'Admin' ||
    (typeof currentUser?.role === 'string' &&
      currentUser?.role.toLowerCase() === 'admin');

  // Track status update & delete pending states per task
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Collapsible state per milestone group
  const [collapsedMilestones, setCollapsedMilestones] = useState({});

  const toggleMilestone = (milestone) => {
    setCollapsedMilestones((prev) => ({
      ...prev,
      [milestone]: !prev[milestone],
    }));
  };

  // 1. Project Overview Header Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => String(t.status || '').toLowerCase() === 'completed'
  );
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const [currentTime] = useState(() => Date.now());
  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    if (String(t.status || '').toLowerCase() === 'completed') return false;
    const dueTime = new Date(t.dueDate).getTime();
    return !isNaN(dueTime) && dueTime < currentTime;
  });
  const overdueCount = overdueTasks.length;

  // 2. Group tasks by milestone
  const customMilestones = Array.from(
    new Set(tasks.map((t) => t.milestone).filter(Boolean))
  );
  const allMilestoneKeys = Array.from(
    new Set([...DEFAULT_MILESTONES, ...customMilestones])
  );

  // Status Change Handler (PUT /api/tasks/:id)
  const handleStatusChange = async (task, newStatus) => {
    const taskId = task._id || task.id;
    if (!taskId || newStatus === task.status) return;

    setUpdatingTaskId(taskId);
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      const updated = response?.data || { ...task, status: newStatus };
      if (typeof onUpdateTask === 'function') {
        onUpdateTask(updated);
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to update task status'
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Delete Task Handler (DELETE /api/tasks/:id)
  const handleDeleteTask = async (taskId) => {
    if (!taskId) return;

    setDeletingTaskId(taskId);
    try {
      await api.delete(`/tasks/${taskId}`);
      if (typeof onDeleteTask === 'function') {
        onDeleteTask(taskId);
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete task'
      );
    } finally {
      setDeletingTaskId(null);
    }
  };

  // Helper for priority styling
  const getPriorityConfig = (pri) => {
    const normalized = String(pri || 'Medium').toLowerCase();
    if (normalized === 'high') {
      return {
        label: 'High',
        badge:
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
        dot: 'bg-red-600 dark:bg-red-400',
      };
    }
    if (normalized === 'low') {
      return {
        label: 'Low',
        badge:
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
        dot: 'bg-blue-600 dark:bg-blue-400',
      };
    }
    return {
      label: 'Medium',
      badge:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30',
      dot: 'bg-amber-600 dark:bg-yellow-400',
    };
  };

  // Helper for progress bar percentage and color per status
  const getTaskProgress = (status) => {
    const s = String(status || '').trim().toLowerCase();
    if (s === 'completed' || s === 'done') {
      return { percentage: 100, barColor: 'bg-emerald-500', text: '100% Done' };
    }
    if (s === 'in progress' || s === 'inprogress') {
      return { percentage: 60, barColor: 'bg-amber-500', text: '60% In Progress' };
    }
    if (s === 'to-do' || s === 'todo' || s === 'to do') {
      return { percentage: 25, barColor: 'bg-indigo-500', text: '25% Queued' };
    }
    return { percentage: 10, barColor: 'bg-slate-400 dark:bg-slate-500', text: '10% Backlog' };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Project Overview Header */}
      <div
        data-testid="pm-overview-header"
        className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-white via-cyan-50/40 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-cyan-950/30 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl backdrop-blur-md space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>Project Management Roadmap</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Milestone & Timeline Portfolio
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Track project phases, deliverable deadlines, schedule health, and critical milestones.
            </p>
          </div>

          {/* Overall Progress Stat Ring / Pill */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Overall Health
              </span>
              <span
                data-testid="completion-percentage"
                className="text-2xl font-extrabold text-slate-900 dark:text-white"
              >
                {completionPercentage}%
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Overall Completion Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-300">Total Project Completion</span>
            <span className="text-cyan-700 dark:text-cyan-400 font-bold">
              {completedTasks.length} of {totalTasks} deliverables verified ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Deliverables
              </span>
              <span
                data-testid="total-tasks-count"
                className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block"
              >
                {totalTasks}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
              overdueCount > 0
                ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div>
              <span
                className={`text-xs font-semibold uppercase tracking-wider block ${
                  overdueCount > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Overdue Tasks
              </span>
              <span
                data-testid="overdue-tasks-count"
                className={`text-2xl font-extrabold mt-1 block ${
                  overdueCount > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-slate-900 dark:text-white'
                }`}
              >
                {overdueCount}
              </span>
            </div>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                overdueCount > 0
                  ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
              }`}
            >
              {overdueCount > 0 ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Verified Deliverables
              </span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                {completedTasks.length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Structured Milestone & Timeline Table/List grouped by 'milestone' */}
      <div className="space-y-6">
        {allMilestoneKeys.map((milestoneKey) => {
          const milestoneTasks = tasks.filter(
            (t) => (t.milestone || 'Phase 1: Planning') === milestoneKey
          );
          const mCompleted = milestoneTasks.filter(
            (t) => String(t.status || '').toLowerCase() === 'completed'
          ).length;
          const mPercent =
            milestoneTasks.length > 0
              ? Math.round((mCompleted / milestoneTasks.length) * 100)
              : 0;
          const isCollapsed = Boolean(collapsedMilestones[milestoneKey]);

          return (
            <div
              key={milestoneKey}
              data-testid={`milestone-group-${milestoneKey.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md backdrop-blur-sm overflow-hidden"
            >
              {/* Milestone Group Header */}
              <div
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-200 dark:border-slate-800/80"
                onClick={() => toggleMilestone(milestoneKey)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                        {milestoneKey}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                        {milestoneTasks.length} {milestoneTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {mCompleted} of {milestoneTasks.length} deliverables completed ({mPercent}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Mini Progress Bar for Milestone */}
                  <div className="w-32 hidden md:block">
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${mPercent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMilestone(milestoneKey);
                    }}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                    aria-label={isCollapsed ? 'Expand Milestone' : 'Collapse Milestone'}
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Milestone Task List / Table */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-6 space-y-3 animate-pulse">
                      <div className="h-10 bg-slate-200/60 dark:bg-slate-800/40 rounded-xl" />
                      <div className="h-10 bg-slate-200/40 dark:bg-slate-800/20 rounded-xl" />
                    </div>
                  ) : milestoneTasks.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <th className="py-3 px-4 sm:px-6">Task Title</th>
                          <th className="py-3 px-3">Priority</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3">Points</th>
                          <th className="py-3 px-3">Due Date</th>
                          <th className="py-3 px-4">Progress</th>
                          {isAdmin && (
                            <th className="py-3 px-4 text-right">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                        {milestoneTasks.map((task) => {
                          const taskId = task._id || task.id;
                          const priorityCfg = getPriorityConfig(task.priority);
                          const progress = getTaskProgress(task.status);
                          const isUpdating = updatingTaskId === taskId;
                          const isDeleting = deletingTaskId === taskId;

                          // Check if overdue: has due date, is in the past, and not completed
                          const isOverdue =
                            task.dueDate &&
                            new Date(task.dueDate).getTime() < currentTime &&
                            String(task.status || '').toLowerCase() !== 'completed';

                          const formattedDueDate = task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : null;

                          return (
                            <tr
                              key={taskId || task.title}
                              data-testid="pm-task-row"
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                            >
                              {/* Task Title */}
                              <td className="py-3.5 px-4 sm:px-6">
                                <div className="space-y-0.5">
                                  <span
                                    data-testid="pm-task-title"
                                    className="font-semibold text-slate-900 dark:text-white tracking-tight hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors block"
                                  >
                                    {task.title}
                                  </span>
                                  {task.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-sm">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </td>

                              {/* Priority */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${priorityCfg.badge}`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`}
                                  />
                                  {priorityCfg.label}
                                </span>
                              </td>

                              {/* Status Dropdown */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <div className="relative inline-flex items-center">
                                  <select
                                    data-testid="pm-status-select"
                                    aria-label="Update milestone task status"
                                    value={task.status || 'To-Do'}
                                    disabled={isUpdating}
                                    onChange={(e) =>
                                      handleStatusChange(task, e.target.value)
                                    }
                                    className="text-xs font-semibold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    <option
                                      value="Backlog"
                                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                    >
                                      Backlog
                                    </option>
                                    <option
                                      value="To-Do"
                                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                    >
                                      To-Do
                                    </option>
                                    <option
                                      value="In Progress"
                                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                    >
                                      In Progress
                                    </option>
                                    <option
                                      value="Completed"
                                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                    >
                                      Completed
                                    </option>
                                  </select>
                                  {isUpdating && (
                                    <Loader2 className="w-3.5 h-3.5 ml-1.5 text-cyan-600 dark:text-cyan-400 animate-spin" />
                                  )}
                                </div>
                              </td>

                              {/* Story Points */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <span
                                  data-testid="pm-story-points"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                >
                                  {task.storyPoints ?? 1} SP
                                </span>
                              </td>

                              {/* Due Date (Highlighted red if overdue) */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <div data-testid="pm-due-date">
                                  {formattedDueDate ? (
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                        isOverdue
                                          ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/40 animate-pulse'
                                          : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'
                                      }`}
                                      title={
                                        isOverdue
                                          ? 'Task deadline is past due!'
                                          : `Target deadline: ${formattedDueDate}`
                                      }
                                    >
                                      {isOverdue ? (
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                      ) : (
                                        <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                      )}
                                      <span>{formattedDueDate}</span>
                                      {isOverdue && (
                                        <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                                          (Overdue)
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                                      No deadline
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Visual Progress Bar */}
                              <td className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                                <div
                                  data-testid="pm-progress-bar"
                                  className="space-y-1"
                                >
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                    <span>{progress.text}</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800/80">
                                    <div
                                      className={`h-full ${progress.barColor} rounded-full transition-all duration-300`}
                                      style={{ width: `${progress.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Admin-only Delete Button */}
                              {isAdmin && (
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    data-testid="pm-delete-task-button"
                                    disabled={isDeleting}
                                    onClick={() => handleDeleteTask(taskId)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg shadow-sm border border-red-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                                    title="Delete deliverable (Admin Only)"
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                    <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-950/30">
                      <Clock className="w-5 h-5 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        No tasks assigned to {milestoneKey}
                      </p>
                      {typeof openModal === 'function' && (
                        <button
                          type="button"
                          onClick={() => openModal('To-Do', 'Backlog', milestoneKey)}
                          className="mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Add milestone deliverable</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
