import { useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { CalendarDays, ClipboardList, LayoutGrid, LogOut, Settings2, Sparkles, Users } from 'lucide-react'
import { auth } from './firebase'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import GroupsPage from './pages/GroupsPage'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import TasksPage from './pages/TasksPage'
import { logout as firebaseLogout } from './services/firebaseService'

function Layout({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-slate-900/70 p-6 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-fuchsia-500/20 p-2 text-fuchsia-400">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-lg font-semibold">StudyTrack</p>
              <p className="text-sm text-slate-400">Firebase study workspace</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 ${isActive ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-slate-300 hover:bg-slate-800'}`}>
              <LayoutGrid size={18} /> Dashboard
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 ${isActive ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-slate-300 hover:bg-slate-800'}`}>
              <ClipboardList size={18} /> Tasks
            </NavLink>
            <NavLink to="/groups" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 ${isActive ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-slate-300 hover:bg-slate-800'}`}>
              <Users size={18} /> Groups
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 ${isActive ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-slate-300 hover:bg-slate-800'}`}>
              <CalendarDays size={18} /> Calendar
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 ${isActive ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-slate-300 hover:bg-slate-800'}`}>
              <Settings2 size={18} /> Settings
            </NavLink>
          </nav>

          <div className="mt-10 rounded-2xl border border-white/10 bg-slate-800/70 p-4">
            <p className="text-sm font-semibold">Signed in as</p>
            <p className="text-sm text-slate-300">{user?.displayName ?? 'StudyTrack user'}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6">
          <header className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-fuchsia-400">StudyTrack</p>
              <h1 className="text-xl font-semibold">Plan study tasks with friends</h1>
            </div>
            <button onClick={() => onLogout()} className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-200">
              <LogOut size={16} /> Logout
            </button>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function CalendarPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Calendar</p>
        <h2 className="mt-1 text-lg font-semibold">Upcoming study rhythm</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
        <p className="text-slate-400">Your calendar can later sync with Google Calendar or personal reminders.</p>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <div className="flex items-center justify-between rounded-xl bg-slate-900/70 px-3 py-2"><span>Placement revision sprint</span><span className="text-fuchsia-300">Tomorrow</span></div>
          <div className="flex items-center justify-between rounded-xl bg-slate-900/70 px-3 py-2"><span>Group quiz prep</span><span className="text-fuchsia-300">Friday</span></div>
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ user }: { user: User | null }) {
  return user ? <Outlet /> : <Navigate to="/auth" replace />
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!auth) {
      setUser(null)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser))
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (!auth) {
      setUser(null)
      return
    }

    await firebaseLogout()
    setUser(null)
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <HomePage />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route element={<Layout user={user} onLogout={handleLogout} />}>
        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />
    </Routes>
  )
}
