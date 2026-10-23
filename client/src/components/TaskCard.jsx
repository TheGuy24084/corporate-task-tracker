import { User, Calendar, Tag } from 'lucide-react';

/**
 * TaskCard Component
 * Reusable card displaying task title, description, color-coded priority badge, and creator name.
 * Priority color codes: Low = Blue, Medium = Yellow, High = Red.
 */
export default function TaskCard({
  task,
  title: propTitle,
  description: propDescription,
  priority: propPriority,
  createdBy: propCreatedBy,
  creator: propCreator,
  creatorName: propCreatorName,
  createdAt: propCreatedAt,
}) {
  const currentTask = task || {};
  const title = propTitle || currentTask.title || 'Untitled Task';
  const description = propDescription || currentTask.description || '';
  const priority = propPriority || currentTask.priority || 'Medium';
  const createdBy = propCreatedBy || currentTask.createdBy;
  const creator = propCreator || currentTask.creator;
  const creatorName = propCreatorName || currentTask.creatorName;
  const createdAt = propCreatedAt || currentTask.createdAt;

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
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        dotClass: 'bg-blue-400',
      };
    }
    if (normalized === 'high') {
      return {
        label: 'High',
        badgeClass: 'bg-red-500/10 text-red-400 border-red-500/30',
        dotClass: 'bg-red-400',
      };
    }
    // Default to Medium (Yellow)
    return {
      label: 'Medium',
      badgeClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      dotClass: 'bg-yellow-400',
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
      className="group relative flex flex-col justify-between rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200"
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
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{formattedDate}</span>
            </span>
          )}
        </div>

        {/* Task Title */}
        <h4 className="text-base font-semibold text-white tracking-tight leading-snug group-hover:text-indigo-200 transition-colors">
          {title}
        </h4>

        {/* Task Description */}
        {description ? (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
            {description}
          </p>
        ) : (
          <p className="text-xs italic text-slate-600">No description provided</p>
        )}
      </div>

      {/* Task Footer: Creator's Name */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-indigo-400">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Created by
            </span>
            <span
              data-testid="task-creator"
              className="text-xs font-medium text-slate-200 truncate max-w-[170px]"
            >
              {displayName}
            </span>
          </div>
        </div>

        <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
          <Tag className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
