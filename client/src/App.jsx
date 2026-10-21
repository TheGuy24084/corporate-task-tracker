import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import { ListTodo, Shield, Users } from 'lucide-react'

function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
        Enterprise Task Management
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
        Streamline Corporate Projects <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          with Real-time Precision
        </span>
      </h1>
      <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Corporate Task Tracker empowers cross-functional teams to collaborate seamlessly, track milestones, and deliver high-impact deliverables on schedule.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/login"
          className="px-6 py-3 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-[1.02]"
        >
          Sign In
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
            <ListTodo className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Task Organization</h3>
          <p className="text-sm text-slate-400">Organize and prioritize sprints, deliverables, and team deadlines with clarity.</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Team Collaboration</h3>
          <p className="text-sm text-slate-400">Keep team members aligned with role-based access, assignments, and updates.</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Secure & Scalable</h3>
          <p className="text-sm text-slate-400">Enterprise-ready authentication and persistent data tracking built for scale.</p>
        </div>
      </div>
    </div>
  )
}

function DashboardPlaceholder() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
        Overview
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Dashboard</h2>
      <p className="text-slate-400 max-w-md mx-auto mb-8">
        Welcome to the task dashboard. Connect with the backend API to manage and monitor ongoing tasks.
      </p>
      <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-slate-500">
        Dashboard content will be displayed here.
      </div>
    </div>
  )
}

function LoginPlaceholder() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Account Login</h2>
        <p className="text-sm text-slate-400 text-center mb-6">
          Sign in to access your corporate task workspace.
        </p>
        <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/50 text-slate-500 text-center text-sm">
          Authentication form placeholder
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<DashboardPlaceholder />} />
            <Route path="/login" element={<LoginPlaceholder />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
