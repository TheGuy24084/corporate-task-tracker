import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  Mail,
  Lock,
  Camera,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Upload,
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function ProfileModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return createPortal(
    <ProfileModalContent onClose={onClose} />,
    document.body
  );
}

function ProfileModalContent({ onClose }) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Close on Escape key press & prevent background scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Process image file and generate optimized data URL
  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large (maximum 10MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        try {
          // Resize image to max 400x400 to keep base64 payload light and fast
          const maxDim = 400;
          let width = img.width || maxDim;
          let height = img.height || maxDim;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const optimized = canvas.toDataURL('image/jpeg', 0.88);
          setAvatar(optimized);
          setError('');
        } catch {
          // Fallback to raw data url if canvas has issue
          setAvatar(dataUrl);
          setError('');
        }
      };
      img.onerror = () => {
        setAvatar(dataUrl);
        setError('');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset file input so re-selecting same image works
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = (e) => {
    e?.preventDefault();
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:image/')) {
      setError('Please enter a valid image URL starting with http://, https://, or data:image/');
      return;
    }
    setAvatar(url);
    setImageUrlInput('');
    setShowUrlInput(false);
    setError('');
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    setImageUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name cannot be empty');
      return;
    }

    if (!email.trim()) {
      setError('Email address cannot be empty');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: avatar || '',
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.put('/auth/profile', payload);
      const updatedUser = res.data?.user;

      if (updatedUser && typeof updateUser === 'function') {
        updateUser(updatedUser);
      }

      showToast('Profile credentials updated successfully', 'success');
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const userInitial = name ? name[0].toUpperCase() : user?.name?.[0]?.toUpperCase() || '?';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-900/75 dark:bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-scale-up text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                User Profile & Credentials
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View credentials and personalize your avatar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-shake"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Profile Picture Upload Card */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Avatar Preview & Direct Click */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer flex-shrink-0"
                  title="Click to change profile picture"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile Avatar"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-indigo-500 shadow-md ring-4 ring-indigo-500/15"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white font-bold text-3xl flex items-center justify-center shadow-md ring-4 ring-indigo-500/15">
                      {userInitial}
                    </div>
                  )}

                  {/* Camera Overlay Badge */}
                  <div className="absolute inset-0 rounded-full bg-slate-900/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[10px] font-semibold">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Change</span>
                  </div>

                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-indigo-600 text-white shadow-md border-2 border-white dark:border-slate-900">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Upload & Action Details */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex items-center justify-center sm:justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Profile Picture
                    </h3>
                    {avatar && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        Custom Avatar Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Upload a custom profile photo (PNG, JPG, WebP) or enter an image link. Appears on all your tasks and comments.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      id="avatar-file-input"
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                      data-testid="avatar-file-input"
                    />
                    <button
                      type="button"
                      data-testid="upload-avatar-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{avatar ? 'Upload New Photo' : 'Upload Photo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{showUrlInput ? 'Hide Link' : 'Paste Image Link'}</span>
                    </button>

                    {avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {/* Image Link Input Row */}
                  {showUrlInput && (
                    <div className="pt-2 flex items-center gap-2 animate-fade-in">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Role Badge */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>Assigned Role</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] ${
                  user?.role === 'Admin'
                    ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                    : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                }`}
              >
                {user?.role || 'User'}
              </span>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-name"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="profile-name"
                  data-testid="profile-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-email"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="profile-email"
                  data-testid="profile-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  placeholder="your.email@company.com"
                />
              </div>
            </div>

            {/* Password Section Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{showPasswordSection ? 'Keep Current Password' : 'Change Password'}</span>
              </button>
            </div>

            {showPasswordSection && (
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Update Password
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPasswords ? 'Hide' : 'Show'}</span>
                  </button>
                </div>

                {/* Current Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="current-password"
                    className="text-[11px] font-medium text-slate-600 dark:text-slate-400"
                  >
                    Current Password (optional if unchanged)
                  </label>
                  <input
                    id="current-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter current password"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="new-password"
                    className="text-[11px] font-medium text-slate-600 dark:text-slate-400"
                  >
                    New Password (min 6 characters)
                  </label>
                  <input
                    id="new-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter new password"
                  />
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="confirm-password"
                    className="text-[11px] font-medium text-slate-600 dark:text-slate-400"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/80 dark:bg-slate-950/60">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              data-testid="save-profile-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
