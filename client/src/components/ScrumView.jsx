import { useState } from 'react';
import {
  Zap,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Loader2,
} from 'lucide-react';
import TaskCard from './TaskCard';
import api from '../api/axios';

const SPRINT_COLUMNS = [
  {
    id: 'To-Do',
    title: 'To-Do',
    description: 'Committed tasks for this sprint',
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
    description: 'Actively in development',
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
    description: 'Sprint goal verified & done',
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

/**
 * ScrumView Component
 * Renders Agile Scrum Sprint Management:
 * - Sprint Selector ('Sprint 1', 'Sprint 2')
 * - Sprint Velocity Counter (Completed vs Total Story Points)
 * - Collapsible Product Backlog (with quick "Move to Sprint" action)
 * - 3-Column Active Sprint Board ('To-Do', 'In Progress', 'Completed')
 */
export default function ScrumView({
  tasks = [],
  user,
  onUpdateTask,
  onDeleteTask,
  openModal,
  loading = false,
}) {
  const [selectedSprint, setSelectedSprint] = useState('Sprint 1');
  const [isBacklogExpanded, setIsBacklogExpanded] = useState(true);
  const [movingTaskId, setMovingTaskId] = useState(null);

  // Active Sprint Tasks
  const sprintTasks = tasks.filter(
    (t) => (t.sprint || 'Backlog') === selectedSprint
  );

  // Backlog Tasks (tasks with sprint === 'Backlog' or undefined)
  const backlogTasks = tasks.filter(
    (t) => !t.sprint || t.sprint === 'Backlog'
  );

  // Sprint Velocity Story Points Calculation
  const totalSprintPoints = sprintTasks.reduce(
    (sum, t) => sum + (Number(t.storyPoints) || 1),
    0
  );
  const completedSprintPoints = sprintTasks
    .filter((t) => String(t.status || '').toLowerCase() === 'completed')
    .reduce((sum, t) => sum + (Number(t.storyPoints) || 1), 0);

  const velocityPercentage =
    totalSprintPoints > 0
      ? Math.round((completedSprintPoints / totalSprintPoints) * 100)
      : 0;

  // Move task from Backlog into the currently selected sprint via PUT /api/tasks/:id
  const handleMoveToSprint = async (task) => {
    const taskId = task._id || task.id;
    if (!taskId) return;

    setMovingTaskId(taskId);
    try {
      const response = await api.put(`/tasks/${taskId}`, {
        sprint: selectedSprint,
        status: task.status === 'Backlog' ? 'To-Do' : task.status || 'To-Do',
      });
      const updated = response.data || {
        ...task,
        sprint: selectedSprint,
        status: task.status === 'Backlog' ? 'To-Do' : task.status || 'To-Do',
      };
      if (typeof onUpdateTask === 'function') {
        onUpdateTask(updated);
      }
    } catch (err) {
      console.error('Failed to move task to sprint:', err);
      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to move task into active sprint'
      );
    } finally {
      setMovingTaskId(null);
    }
  };

  // Helper for priority badges in backlog
  const getPriorityBadge = (pri) => {
    const normalized = String(pri || 'Medium').toLowerCase();
    if (normalized === 'high') {
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
    if (normalized === 'low') {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Scrum Control Panel: Sprint Selector & Sprint Velocity Counter */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Sprint Selector */}
        <div className="space-y-2">
          <label
            htmlFor="sprint-select"
            className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Active Sprint Iteration</span>
          </label>
          <div
            data-testid="sprint-selector"
            className="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800"
          >
            {['Sprint 1', 'Sprint 2'].map((sprintName) => {
              const isActive = selectedSprint === sprintName;
              return (
                <button
                  key={sprintName}
                  type="button"
                  data-testid={`sprint-tab-${sprintName.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedSprint(sprintName)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {sprintName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sprint Velocity Counter */}
        <div
          data-testid="sprint-velocity-counter"
          className="flex-1 lg:max-w-md p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Sprint Velocity: {selectedSprint}</span>
            </span>
            <span className="text-xs font-bold text-white">
              {completedSprintPoints} / {totalSprintPoints} SP ({velocityPercentage}%)
            </span>
          </div>

          {/* Velocity Progress Bar */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${velocityPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{sprintTasks.length} active sprint tasks</span>
            <span>Target: {totalSprintPoints} story points</span>
          </div>
        </div>
      </div>

      {/* Collapsible Product Backlog Section */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm overflow-hidden">
        {/* Backlog Header Bar */}
        <div
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
          onClick={() => setIsBacklogExpanded((prev) => !prev)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight">
                  Product Backlog
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {backlogTasks.length} items
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  •{' '}
                  {backlogTasks.reduce(
                    (sum, t) => sum + (Number(t.storyPoints) || 1),
                    0
                  )}{' '}
                  Total SP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unallocated backlog items ready to commit to sprints
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="toggle-backlog-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsBacklogExpanded((prev) => !prev);
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label={isBacklogExpanded ? 'Collapse Backlog' : 'Expand Backlog'}
          >
            {isBacklogExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Backlog Item List */}
        {isBacklogExpanded && (
          <div className="p-4 sm:p-5 border-t border-slate-800/80 space-y-3">
            {backlogTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {backlogTasks.map((task) => {
                  const taskId = task._id || task.id;
                  const isMoving = movingTaskId === taskId;

                  return (
                    <div
                      key={taskId || task.title}
                      data-testid={`backlog-item-${taskId}`}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 flex flex-col justify-between gap-3 shadow-sm transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority || 'Medium'}
                          </span>
                          <span
                            data-testid="story-points-badge"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30"
                          >
                            <Zap className="w-3 h-3 text-purple-400" />
                            <span>{task.storyPoints ?? 1} SP</span>
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-white tracking-tight leading-snug">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">
                          {task.milestone || 'General'}
                        </span>

                        <button
                          type="button"
                          data-testid={`move-to-sprint-${taskId}`}
                          disabled={isMoving}
                          onClick={() => handleMoveToSprint(task)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                          title={`Move task into ${selectedSprint}`}
                        >
                          {isMoving ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Moving...</span>
                            </>
                          ) : (
                            <>
                              <span>Move to {selectedSprint}</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
                <Sparkles className="w-5 h-5 mx-auto text-slate-500 mb-2" />
                <p className="text-xs font-semibold text-slate-300">
                  Product Backlog is clear!
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  All current tasks are committed to active sprints.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3-Column Active Sprint Board ('To-Do', 'In Progress', 'Completed') */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{selectedSprint} Execution Board</span>
              <span className="text-xs font-normal text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                Active Sprint
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Only showing deliverables committed to {selectedSprint}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {SPRINT_COLUMNS.map((column) => {
            const columnTasks = sprintTasks.filter((t) =>
              column.matcher(t.status)
            );
            const columnPoints = columnTasks.reduce(
              (sum, t) => sum + (Number(t.storyPoints) || 1),
              0
            );
            const ColumnIcon = column.icon;

            return (
              <div
                key={column.id}
                data-testid={`scrum-column-${column.id.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800 border-t-4 ${column.accentBorder} p-4 sm:p-5 shadow-lg backdrop-blur-sm min-h-[460px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700/60 flex items-center justify-center">
                      <ColumnIcon className={`w-4 h-4 ${column.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base tracking-tight">
                        {column.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {columnPoints} Story Points
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {typeof openModal === 'function' && (
                      <button
                        type="button"
                        onClick={() => openModal(column.id)}
                        className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={`Add task to ${column.title}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${column.headerBadge}`}
                    >
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Tasks */}
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
                        methodology="Scrum"
                        user={user}
                        onUpdateTask={onUpdateTask}
                        onDeleteTask={onDeleteTask}
                        onDelete={onDeleteTask}
                      />
                    ))
                  ) : (
                    <div className="h-44 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/40 flex flex-col items-center justify-center text-center p-4">
                      <Sparkles className="w-5 h-5 text-slate-500 mb-2" />
                      <p className="text-xs font-medium text-slate-400">
                        No tasks in {column.title} for {selectedSprint}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Move items from Product Backlog above
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
