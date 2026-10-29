import { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Trash2,
  AtSign,
  MessageSquare,
  Loader2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

/**
 * TaskCommentsModal Component
 * Modal dialog for task comments, activity feed, and @mentions
 */
export default function TaskCommentsModal({
  isOpen,
  onClose,
  task,
  teamMembers = [],
  onUpdateTask,
}) {
  const { user: authUser } = useAuth();
  const currentUser = authUser;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isAdmin =
    currentUser?.role === 'Admin' ||
    (typeof currentUser?.role === 'string' &&
      currentUser.role.toLowerCase() === 'admin');

  const [newCommentText, setNewCommentText] = useState('');
  const [selectedMentionIds, setSelectedMentionIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [error, setError] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');

  const commentsEndRef = useRef(null);
  const textareaRef = useRef(null);

  const comments = task?.comments || [];

  // Scroll to bottom when comments change
  useEffect(() => {
    if (isOpen) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [task?.comments, isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const taskId = task._id || task.id;

  // Insert @MemberName into textarea and add member._id to mention IDs
  const handleSelectMention = (member) => {
    const memberName = member.name || 'Member';
    const memberId = member._id || member.id;

    // Check if textarea currently has an active @ query
    const cursorPosition = textareaRef.current?.selectionStart ?? newCommentText.length;
    const textBefore = newCommentText.slice(0, cursorPosition);
    const textAfter = newCommentText.slice(cursorPosition);

    // Replace the trailing @query with @MemberName
    const atIndex = textBefore.lastIndexOf('@');
    let updatedText = '';

    if (atIndex !== -1 && showMentionDropdown) {
      updatedText = `${textBefore.slice(0, atIndex)}@${memberName} ${textAfter}`;
    } else {
      // Append mention
      const needsSpace =
        newCommentText.length > 0 && !newCommentText.endsWith(' ');
      updatedText = `${newCommentText}${needsSpace ? ' ' : ''}@${memberName} `;
    }

    setNewCommentText(updatedText);
    setSelectedMentionIds((prev) => new Set(prev).add(memberId));
    setShowMentionDropdown(false);
    setMentionFilter('');

    // Refocus textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // Handle typing inside textarea to detect @ triggers
  const handleTextChange = (e) => {
    const value = e.target.value;
    setNewCommentText(value);
    if (error) setError('');

    const cursorPosition = e.target.selectionStart;
    const textBefore = value.slice(0, cursorPosition);
    const atIndex = textBefore.lastIndexOf('@');

    if (atIndex !== -1) {
      const query = textBefore.slice(atIndex + 1);
      // Ensure no spaces in the query for autocomplete
      if (!query.includes(' ') && !query.includes('\n')) {
        setMentionFilter(query.toLowerCase());
        setShowMentionDropdown(true);
        return;
      }
    }

    setShowMentionDropdown(false);
    setMentionFilter('');
  };

  // Submit new comment
  const handleSubmitComment = async (e) => {
    e?.preventDefault();
    const trimmedText = newCommentText.trim();
    if (!trimmedText || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const mentionsPayload = Array.from(selectedMentionIds);
      const res = await api.post(`/tasks/${taskId}/comments`, {
        text: trimmedText,
        mentions: mentionsPayload,
      });

      const updatedTask = res.data;
      setNewCommentText('');
      setSelectedMentionIds(new Set());
      setShowMentionDropdown(false);

      if (typeof onUpdateTask === 'function') {
        onUpdateTask(updatedTask);
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to post comment'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!commentId || deletingCommentId) return;

    setDeletingCommentId(commentId);
    try {
      const res = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
      const updatedTask = res.data;

      if (typeof onUpdateTask === 'function') {
        onUpdateTask(updatedTask);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(
        err.response?.data?.message || err.message || 'Failed to delete comment'
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  // Parse comment text and wrap @Mentions in styled pills
  const renderCommentContent = (text) => {
    if (!text) return null;

    // Regex to capture words starting with @
    const parts = text.split(/(@[a-zA-Z0-9_\-.]+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded-md font-semibold text-xs bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 shadow-2xs"
          >
            <AtSign className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            <span>{part.slice(1)}</span>
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Filter teammates for @ autocomplete dropdown
  const filteredTeammates = teamMembers.filter((m) => {
    if (!mentionFilter) return true;
    const nameMatch = m.name?.toLowerCase().includes(mentionFilter);
    const emailMatch = m.email?.toLowerCase().includes(mentionFilter);
    return nameMatch || emailMatch;
  });

  // Priority color config
  const getPriorityBadge = (priority) => {
    const pri = String(priority || 'Medium').toLowerCase();
    if (pri === 'high') {
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30';
    }
    if (pri === 'low') {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30';
    }
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
  };

  // Status color config
  const getStatusBadge = (status) => {
    const s = String(status || 'To-Do').toLowerCase();
    if (s === 'completed') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
    }
    if (s === 'in progress') {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
    }
    if (s === 'backlog') {
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30';
  };

  const assigneeName = task.assignedTo?.name || 'Unassigned';
  const assigneeInitial = task.assignedTo?.name
    ? task.assignedTo.name[0].toUpperCase()
    : '?';

  return (
    <div
      data-testid="task-comments-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Task Details Summary */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 rounded-md">
                  <MessageSquare className="w-3 h-3" />
                  Task Discussion
                </span>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                    task.status
                  )}`}
                >
                  {task.status || 'To-Do'}
                </span>

                {/* Priority Badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadge(
                    task.priority
                  )}`}
                >
                  {task.priority || 'Medium'}
                </span>

                {/* Assignee Badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0">
                    {assigneeInitial}
                  </div>
                  <span className="truncate max-w-[120px]">{assigneeName}</span>
                </span>
              </div>

              {/* Task Title */}
              <h2
                data-testid="comment-task-title"
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight truncate"
              >
                {task.title}
              </h2>

              {task.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              data-testid="close-comments-modal-btn"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Comments Activity Feed */}
        <div
          data-testid="comments-feed"
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[46vh] min-h-[180px] bg-white dark:bg-slate-900"
        >
          {comments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs mt-1">
                Be the first to leave a message or @mention a teammate!
              </p>
            </div>
          ) : (
            comments.map((comment, index) => {
              const commentId = comment._id;
              const authorName = comment.author?.name || 'Team Member';
              const authorRole = comment.author?.role || 'User';
              const authorInitial = authorName[0]?.toUpperCase() || '?';

              const authorId = comment.author?._id || comment.author;
              const isCommentAuthor = String(authorId) === String(currentUserId);
              const canDelete = isCommentAuthor || isAdmin;
              const isDeleting = deletingCommentId === commentId;

              const formattedTime = comment.createdAt
                ? new Date(comment.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now';

              return (
                <div
                  key={commentId || index}
                  data-testid="comment-item"
                  className="flex items-start gap-3 group animate-fade-in"
                >
                  {/* Author Avatar Circle */}
                  {comment.author?.avatar ? (
                    <img
                      src={comment.author.avatar}
                      alt={authorName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-indigo-400 shadow-sm mt-0.5"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      {authorInitial}
                    </div>
                  )}

                  {/* Comment Bubble */}
                  <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-3.5 sm:p-4 text-xs transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {authorName}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border ${
                            authorRole === 'Admin'
                              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30'
                              : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          }`}
                        >
                          {authorRole}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formattedTime}
                        </span>
                      </div>

                      {/* Delete Button for Author or Admin */}
                      {canDelete && (
                        <button
                          type="button"
                          data-testid="delete-comment-btn"
                          disabled={isDeleting}
                          onClick={() => handleDeleteComment(commentId)}
                          title="Delete comment"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Comment Body with Styled @Mentions */}
                    <div className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                      {renderCommentContent(comment.text)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-4 py-2 bg-rose-50 dark:bg-rose-500/10 border-t border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer: Quick @Mention Pill Bar & Input Box */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 relative">
          {/* Quick Mention Member Pill Bar */}
          {teamMembers.length > 0 && (
            <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
                <AtSign className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                Mention:
              </span>
              {teamMembers.map((member) => {
                const memberId = member._id || member.id;
                const isSelected = selectedMentionIds.has(memberId);
                return (
                  <button
                    key={memberId}
                    type="button"
                    onClick={() => handleSelectMention(member)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors flex-shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }`}
                  >
                    <span>@{member.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Autocomplete Dropdown when user types @ */}
          {showMentionDropdown && filteredTeammates.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 divide-y divide-slate-100 dark:divide-slate-800/80 animate-fade-in">
              <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950/60">
                Mention a team member
              </div>
              {filteredTeammates.map((member) => (
                <button
                  key={member._id || member.id}
                  type="button"
                  onClick={() => handleSelectMention(member)}
                  className="w-full p-2.5 text-left flex items-center gap-2.5 hover:bg-indigo-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {member.name ? member.name[0].toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {member.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {member.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Message Input Box Form */}
          <form onSubmit={handleSubmitComment} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                data-testid="comment-input"
                rows={2}
                value={newCommentText}
                onChange={handleTextChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
                placeholder="Write a comment or type @ to mention someone (Press Enter to post)..."
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
              />
            </div>

            <button
              type="submit"
              data-testid="send-comment-btn"
              disabled={!newCommentText.trim() || isSubmitting}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Post comment"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
