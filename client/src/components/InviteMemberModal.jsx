import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Send,
  Users,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import api from '../api/axios';

export default function InviteMemberModal({
  isOpen = true,
  onClose,
  onInviteSuccess,
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('User');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [teamError, setTeamError] = useState(null);

  // Fetch team members and pending invitations
  const fetchTeamData = async () => {
    setIsLoadingTeam(true);
    setTeamError(null);
    try {
      const response = await api.get('/api/team/members');
      const data = response.data || {};
      const userList = Array.isArray(data)
        ? data
        : data.users || data.members || [];
      const invitationList = data.invitations || [];
      setMembers(userList);
      setInvitations(invitationList);
    } catch (err) {
      console.error('Failed to fetch team data:', err);
      setTeamError(err.response?.data?.message || 'Failed to load team data');
    } finally {
      setIsLoadingTeam(false);
    }
  };

  // Fetch team data on open/mount
  useEffect(() => {
    let ignore = false;
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setIsLoadingTeam(true);
        const response = await api.get('/api/team/members');
        if (!ignore) {
          const data = response.data || {};
          const userList = Array.isArray(data)
            ? data
            : data.users || data.members || [];
          const invitationList = data.invitations || [];
          setMembers(userList);
          setInvitations(invitationList);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to fetch team data:', err);
          setTeamError(err.response?.data?.message || 'Failed to load team data');
        }
      } finally {
        if (!ignore) {
          setIsLoadingTeam(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Submit invitation form
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setFormError('Email is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setSuccessInfo(null);

    const targetEmail = email.trim().toLowerCase();

    try {
      const response = await api.post('/api/team/invite', {
        email: targetEmail,
        role,
      });

      setSuccessInfo({
        message: response.data?.message || `Invitation sent successfully to ${targetEmail}`,
        previewUrl: response.data?.previewUrl || null,
        inviteLink: response.data?.inviteLink || null,
      });

      setEmail('');
      setRole('User');

      // Refresh team members and pending invitations list immediately
      await fetchTeamData();

      if (onInviteSuccess) {
        onInviteSuccess(response.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to send invitation. Please try again.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose?.();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 dark:from-indigo-500/20 to-purple-500/10 dark:to-purple-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="invite-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Team Management & Invitations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Invite colleagues and oversee current workspace members
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invite Form */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Invite New Team Member
            </h4>
          </div>

          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Email Input */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all disabled:opacity-60"
                />
              </div>

              {/* Role Selector */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all disabled:opacity-60 cursor-pointer"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Invitation...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Invitation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Alert */}
        {formError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* Success Alert with Ethereal preview link */}
        {successInfo && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm space-y-2 animate-fade-in"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">{successInfo.message}</p>
                {successInfo.previewUrl && (
                  <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-emerald-500/20 mt-2">
                    <a
                      href={successInfo.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Preview Sent Email</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      (Nodemailer Ethereal sandbox preview)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Team Members & Pending Invitations Section */}
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Team Overview
            </h4>
            <button
              type="button"
              onClick={fetchTeamData}
              disabled={isLoadingTeam}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Refresh team members and invitations"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTeam ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {teamError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
              <span>{teamError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Team Members Column */}
            <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Team Members
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {members.length}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {isLoadingTeam && members.length === 0 ? (
                  <div className="flex items-center justify-center py-6 text-slate-400 dark:text-slate-500 text-xs gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading members...</span>
                  </div>
                ) : members.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
                    No team members found
                  </p>
                ) : (
                  members.map((member) => (
                    <div
                      key={member._id || member.email}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 shadow-xs">
                          {(member.name || member.email || 'U')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {member.name || 'Unnamed Member'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${
                          member.role === 'Admin'
                            ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
                            : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {member.role || 'User'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Invitations Column */}
            <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Pending Invitations
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {invitations.length}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {isLoadingTeam && invitations.length === 0 ? (
                  <div className="flex items-center justify-center py-6 text-slate-400 dark:text-slate-500 text-xs gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading invitations...</span>
                  </div>
                ) : invitations.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
                    No pending invitations
                  </p>
                ) : (
                  invitations.map((invitation) => (
                    <div
                      key={invitation._id || invitation.token || invitation.email}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {invitation.email}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            <span>
                              {invitation.invitedBy?.name
                                ? `By ${invitation.invitedBy.name}`
                                : 'Pending'}
                            </span>
                            {invitation.createdAt && (
                              <>
                                <span>•</span>
                                <span>{new Date(invitation.createdAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800">
                          Pending
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                            invitation.role === 'Admin'
                              ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
                              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {invitation.role}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
}

export { InviteMemberModal };
