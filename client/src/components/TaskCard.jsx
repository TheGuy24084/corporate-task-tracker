import { useState, useContext } from 'react';
import { User, Calendar, Trash2, Loader2, Zap, Target, MessageSquare } from 'lucide-react';
import AuthContext from '../AuthContext';
import api from '../api/axios';

/**
 * TaskCard Component
 * Reusable card displaying task title, description, color-coded priority badge, creator name,
 * methodology badges (Story Points in Scrum mode, Due Date & Milestone in PM mode),
 * status change dropdown (PUT /api/tasks/:id), and role-based Delete button (DELETE /api/tasks/:id).
 * Priority color codes: Low = Blue, Medium = Yellow, High = Red.
 */
export default function TaskCard({
  task,
  methodology = 'Kanban',
  title: propTitle,
  description: propDescription,
  priority: propPriority,
  createdBy: propCreatedBy,
  creator: propCreator,
  creatorName: propCreatorName,
  createdAt: propCreatedAt,
  user: propUser,
  teamMembers = [],
  onUpdateTask,
  onStatusChange,
  onDeleteTask,
  onDelete,
  onOpenComments,
}) {
  const currentTask = task || {};
  const taskId = currentTask._id || currentTask.id;
  const title = propTitle || currentTask.title || 'Untitled Task';
  const description = propDescription || currentTask.description || '';
  const priority = propPriority || currentTask.priority || 'Medium';
  const createdBy = propCreatedBy || currentTask.createdBy;
  const creator = propCreator || currentTask.creator;
  const creatorName = propCreatorName || currentTask.creatorName;
  const createdAt = propCreatedAt || currentTask.createdAt;
  const sprint = currentTask.sprint || 'Backlog';
  const storyPoints = currentTask.storyPoints ?? 1;
  const milestone = currentTask.milestone || 'General';
  const dueDate = currentTask.dueDate;

  // Resolve current user to determine role
  const auth = useContext(AuthContext);
  const resolveUser = () => {
    if (propUser) return propUser;
    if (auth?.user) return auth.user;
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const currentUser = resolveUser();
  const isAdmin =
    currentUser?.role === 'Admin' ||
    (typeof currentUser?.role === 'string' &&
      currentUser?.role.toLowerCase() === 'admin');

  // Local state for optimistic status tracking and loading states
  const [localStatus, setLocalStatus] = useState(null);
  const currentStatus = localStatus ?? (currentTask.status || 'To-Do');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);

  const assignedTo = currentTask.assignedTo;
  const currentAssigneeId = assignedTo
    ? typeof assignedTo === 'object'
      ? assignedTo._id || assignedTo.id || ''
      : assignedTo
    : '';

  // Handle reassigning task via PUT /api/tasks/:id
  const handleAssigneeChange = async (e) => {
    const newAssigneeId = e.target.value;
    if (!taskId) return;

    setIsReassigning(true);
    try {
      const response = await api.put(`/tasks/${taskId}`, {
        assignedTo: newAssigneeId === '' ? '' : newAssigneeId,
      });
      const updated = response?.data || {
        ...currentTask,
        assignedTo: newAssigneeId
          ? teamMembers.find((m) => (m._id || m.id) === newAssigneeId) || newAssigneeId
          : null,
      };
      if (typeof onUpdateTask === 'function') {
        onUpdateTask(updated);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to reassign task';
      alert(message);
    } finally {
      setIsReassigning(false);
    }
  };

  // Handle changing status via PUT /api/tasks/:id
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!taskId || newStatus === currentStatus) return;

    setLocalStatus(newStatus);
    setIsUpdatingStatus(true);
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      const updated = response?.data || { ...currentTask, status: newStatus };
      setLocalStatus(null);
      if (typeof onUpdateTask === 'function') {
        onUpdateTask(updated);
      }
      if (typeof onStatusChange === 'function') {
        onStatusChange(taskId, newStatus, updated);
      }
    } catch (err) {
      setLocalStatus(null);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to update task status';
      alert(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle deleting task via DELETE /api/tasks/:id
  const handleDelete = async () => {
    if (!taskId) return;

    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/tasks/${taskId}`);
      if (typeof onDeleteTask === 'function') {
        onDeleteTask(taskId);
      }
      if (typeof onDelete === 'function') {
        onDelete(taskId);
      }
      alert('Deleted successfully');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to delete task';
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Resolve the creator's display name
  const resolveCreatorName = () => {
    if (creatorName && typeof creatorName === 'string') {
      return creatorName;
    }
    if (typeof creator === 'string' && creator.trim()) {
      return creator;
    }
    if (typeof creator === 'object' && creator !== null && creator.name) {
      return creator.name;
    }
    if (typeof createdBy === 'object' && createdBy !== null && createdBy.name) {
      return createdBy.name;
    }
    if (typeof createdBy === 'string' && createdBy.trim()) {
      // Check if it's a 24-character hexadecimal Mongo ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(createdBy.trim())) {
        return 'Team Member';
      }
      return createdBy;
    }
    return 'Team Member';
  };

  const displayName = resolveCreatorName();

  // Priority color config: Low = Blue, Medium = Yellow, High = Red
  const getPriorityConfig = (pri) => {
    const normalized = String(pri || 'Medium').trim().toLowerCase();
    if (normalized === 'low') {
      return {
        label: 'Low',
        badgeClass:
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
        dotClass: 'bg-blue-600 dark:bg-blue-400',
      };
    }
    if (normalized === 'high') {
      return {
        label: 'High',
        badgeClass:
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
        dotClass: 'bg-red-600 dark:bg-red-400',
      };
    }
    // Default to Medium (Yellow)
    return {
      label: 'Medium',
      badgeClass:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30',
      dotClass: 'bg-amber-600 dark:bg-yellow-400',
    };
  };

  const priorityConfig = getPriorityConfig(priority);

  // Formatted creation date if available
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      data-testid="task-card"
      className="group relative flex flex-col justify-between rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="space-y-3">
        {/* Priority Badge & Meta Header */}
        <div className="flex items-center justify-between gap-2">
          <span
            data-testid="priority-badge"
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${priorityConfig.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotClass}`} />
            {priorityConfig.label}
          </span>

          {formattedDate && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>{formattedDate}</span>
            </span>
          )}
        </div>

        {/* Scrum Mode Badges: Story Points & Sprint */}
        {methodology === 'Scrum' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span
              data-testid="story-points-badge"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30"
              title={`Story Points: ${storyPoints}`}
            >
              <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>{storyPoints} {Number(storyPoints) === 1 ? 'pt' : 'pts'}</span>
            </span>
            {sprint && (
              <span
                data-testid="sprint-badge"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20"
                title={`Sprint: ${sprint}`}
              >
                <span>{sprint}</span>
              </span>
            )}
          </div>
        )}

        {/* Project Management Mode Badges: Milestone & Due Date */}
        {methodology === 'Project Management' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span
              data-testid="milestone-badge"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30 truncate max-w-[170px]"
              title={`Milestone: ${milestone}`}
            >
              <Target className="w-3 h-3 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
              <span className="truncate">{milestone}</span>
            </span>
            {dueDate ? (
              <span
                data-testid="due-date-badge"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                title={`Due Date: ${new Date(dueDate).toLocaleDateString()}`}
              >
                <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {new Date(dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </span>
            ) : (
              <span
                data-testid="due-date-badge"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40"
              >
                <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span>No deadline</span>
              </span>
            )}
          </div>
        )}

        {/* Task Title */}
        <h4 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors">
          {title}
        </h4>

        {/* Task Description */}
        {description ? (
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
            {description}
          </p>
        ) : (
          <p className="text-xs italic text-slate-400 dark:text-slate-500">No description provided</p>
        )}
      </div>

      {/* Task Actions Bar: Status Dropdown & Role-based Red Delete Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <label
            htmlFor={`status-select-${taskId || title}`}
            className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            Status:
          </label>
          <div className="relative inline-flex items-center">
            <select
              id={`status-select-${taskId || title}`}
              data-testid="status-select"
              aria-label="Change task status"
              value={currentStatus}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer disabled:opacity-50"
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
            {isUpdatingStatus && (
              <Loader2 className="w-3.5 h-3.5 ml-1.5 text-indigo-600 dark:text-indigo-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Conditionally render Delete button ONLY for Admin users */}
        {isAdmin && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            data-testid="delete-task-button"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-600 hover:text-white hover:border-red-600 dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600 active:bg-red-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Delete Task (Admin Only)"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        )}
      </div>

      {/* Assignee Badge & Quick-Reassign Dropdown */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            data-testid="assignee-badge"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 truncate"
            title={`Assigned to: ${task.assignedTo?.name || 'Unassigned'}`}
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0">
              {task.assignedTo?.name ? task.assignedTo.name[0].toUpperCase() : '?'}
            </div>
            <span className="truncate max-w-[120px]">
              {task.assignedTo?.name || 'Unassigned'}
            </span>
          </span>
        </div>

        <div className="relative inline-flex items-center">
          <select
            data-testid="assignee-select"
            aria-label="Reassign task"
            value={currentAssigneeId}
            onChange={handleAssigneeChange}
            disabled={isReassigning}
            className="text-[11px] font-medium bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer disabled:opacity-50"
          >
            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              Unassigned
            </option>
            {teamMembers.map((member) => (
              <option
                key={member._id || member.id}
                value={member._id || member.id}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {member.name}
              </option>
            ))}
          </select>
          {isReassigning && (
            <Loader2 className="w-3 h-3 ml-1 text-indigo-600 dark:text-indigo-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Task Footer: Creator's Name */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
              Created by
            </span>
            <span
              data-testid="task-creator"
              className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[170px]"
            >
              {displayName}
            </span>
          </div>
        </div>

        {/* Comments Button */}
        <button
          type="button"
          data-testid="task-comments-btn"
          onClick={() => onOpenComments?.(currentTask)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all cursor-pointer"
          title="View & add comments"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>{currentTask.comments?.length || 0}</span>
        </button>
      </div>
    </div>
  );
}
