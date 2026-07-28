import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { CalendarDays, ClipboardList, LayoutGrid, LogOut, Plus, Sparkles, Users } from 'lucide-react'
import { auth, db, googleProvider, isFirebaseConfigured } from './firebase'
import type { StudyGroup, StudyTask, TaskPriority, TaskStatus } from './types'

const TASKS_STORAGE_KEY = 'studytrack.tasks'
const GROUPS_STORAGE_KEY = 'studytrack.groups'
const USER_STORAGE_KEY = 'studytrack.user'

const emptyTask = {
  title: '',
  description: '',
  group: 'Aptitude',
  assignedTo: '',
  createdBy: '',
  priority: 'medium' as TaskPriority,
  status: 'todo' as TaskStatus,
  dueDate: '',
  progress: 0,
  remarks: '',
}

function readStoredTasks(): StudyTask[] {
  const raw = localStorage.getItem(TASKS_STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as StudyTask[]
  } catch {
    return []
  }
}

function writeStoredTasks(tasks: StudyTask[]) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
}

function readStoredGroups(): StudyGroup[] {
  const raw = localStorage.getItem(GROUPS_STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as StudyGroup[]
  } catch {
    return []
  }
}

function writeStoredGroups(groups: StudyGroup[]) {
  localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups))
}

function getDemoUser(): User {
  return { uid: 'demo-user', displayName: 'Demo Friend', email: 'demo@studytrack.local' } as User
}

function Layout({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const navigate = useNavigate()

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
              <p className="text-sm text-slate-400">Friend study planner</p>
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
          </nav>

          <div className="mt-10 rounded-2xl border border-white/10 bg-slate-800/70 p-4">
            <p className="text-sm font-semibold">Signed in as</p>
            <p className="text-sm text-slate-300">{user?.displayName ?? 'Friend'}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6">
          <header className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-fuchsia-400">StudyTrack</p>
              <h1 className="text-xl font-semibold">Plan study tasks with friends</h1>
            </div>
            <button onClick={() => { onLogout(); navigate('/login') }} className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-200">
              <LogOut size={16} /> Logout
            </button>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function DashboardPage() {
  const [tasks, setTasks] = useState<StudyTask[]>([])

  useEffect(() => {
    if (!db) {
      setTasks(readStoredTasks())
      return
    }

    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })))
    })
    return () => unsub()
  }, [])

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.status === 'done').length
    const pending = total - completed
    const today = new Date().toISOString().slice(0, 10)
    const dueToday = tasks.filter((task) => task.dueDate === today).length
    const dueWeek = tasks.filter((task) => task.dueDate && task.dueDate >= today).length
    return { total, completed, pending, dueToday, dueWeek }
  }, [tasks])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/15 via-slate-900/80 to-slate-900/70 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Momentum</p>
            <h2 className="mt-2 text-2xl font-semibold">Your study rhythm is looking strong.</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Keep your plan visible, break work into small wins, and share progress with your study circle.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
            <p className="font-medium">Focus for today</p>
            <p className="mt-1 text-fuchsia-300">{stats.pending} tasks still open</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Total Tasks', value: stats.total },
          { label: 'Completed', value: stats.completed },
          { label: 'Pending', value: stats.pending },
          { label: 'Due Today', value: stats.dueToday },
          { label: 'Due This Week', value: stats.dueWeek },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/30">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent tasks</h2>
          <span className="text-sm text-slate-400">Updated in real time</span>
        </div>
        <div className="space-y-3">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="rounded-xl border border-white/10 bg-slate-800/70 p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{task.title}</p>
                <span className="rounded-full bg-fuchsia-500/20 px-2 py-1 text-sm text-fuchsia-300">{task.status}</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{task.group} • {task.assignedTo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TasksPage() {
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [form, setForm] = useState(emptyTask)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const stored = localStorage.getItem(USER_STORAGE_KEY)
      setUser(stored ? JSON.parse(stored) : getDemoUser())
      return
    }

    const unsub = onAuthStateChanged(auth!, (currentUser) => setUser(currentUser))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!db) {
      setTasks(readStoredTasks())
      return
    }

    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })))
    })
    return () => unsub()
  }, [])

  const syncTasks = (nextTasks: StudyTask[]) => {
    setTasks(nextTasks)
    writeStoredTasks(nextTasks)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return

    const newTask: StudyTask = {
      id: `temp-${Date.now()}`,
      ...form,
      createdBy: user.displayName || user.email || 'friend',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (db) {
      await addDoc(collection(db, 'tasks'), {
        ...form,
        createdBy: user.displayName || user.email || 'friend',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } else {
      syncTasks([newTask, ...tasks])
    }

    setForm(emptyTask)
  }

  const updateStatus = async (id: string, status: TaskStatus) => {
    if (db) {
      await updateDoc(doc(db, 'tasks', id), { status, updatedAt: new Date().toISOString() })
      return
    }

    syncTasks(tasks.map((task) => (task.id === id ? { ...task, status, updatedAt: new Date().toISOString() } : task)))
  }

  const deleteTask = async (id: string) => {
    if (db) {
      await deleteDoc(doc(db, 'tasks', id))
      return
    }

    syncTasks(tasks.filter((task) => task.id !== id))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Plan</p>
          <h2 className="mt-1 text-lg font-semibold">Add a study task</h2>
        </div>
        <div className="space-y-3">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2" placeholder="Task name" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2" placeholder="Description" />
          <input value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2" placeholder="Study group" />
          <input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2" placeholder="Assigned to" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })} className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2">
              <option value="todo">To Do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
          </div>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2" />
          <input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2" placeholder="Progress %" />
          <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2" placeholder="Remarks" />
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-fuchsia-500 px-4 py-2 font-semibold text-slate-950">
            <Plus size={16} /> Add Task
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your study board</h2>
          <span className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-2 py-1 text-sm text-fuchsia-300">Live board</span>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-white/10 bg-slate-800/70 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-slate-400">{task.group} • {task.assignedTo}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(task.id, 'todo')} className="rounded-lg bg-slate-700 px-2 py-1 text-xs">Todo</button>
                  <button onClick={() => updateStatus(task.id, 'doing')} className="rounded-lg bg-slate-700 px-2 py-1 text-xs">Doing</button>
                  <button onClick={() => updateStatus(task.id, 'done')} className="rounded-lg bg-slate-700 px-2 py-1 text-xs">Done</button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                <span>Due {task.dueDate || 'No date'}</span>
                <span>{task.progress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-fuchsia-500" style={{ width: `${task.progress}%` }} />
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={() => deleteTask(task.id)} className="text-sm text-rose-400">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!db) {
      setGroups(readStoredGroups())
      return
    }

    const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      setGroups(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })))
    })
    return () => unsub()
  }, [])

  const addGroup = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return

    const newGroup: StudyGroup = {
      id: `group-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
    }

    if (db) {
      await addDoc(collection(db, 'groups'), {
        name,
        description,
        createdAt: new Date().toISOString(),
      })
    } else {
      const nextGroups = [newGroup, ...groups]
      setGroups(nextGroups)
      writeStoredGroups(nextGroups)
    }

    setName('')
    setDescription('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <form onSubmit={addGroup} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Circle</p>
          <h2 className="mt-1 text-lg font-semibold">Create a study group</h2>
        </div>
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2" placeholder="Group name" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2" placeholder="Description" />
          <button type="submit" className="rounded-xl bg-fuchsia-500 px-4 py-2 font-semibold text-slate-950">Create</button>
        </div>
      </form>

      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Groups</h2>
          <span className="text-sm text-slate-400">Shared with friends</span>
        </div>
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="rounded-xl border border-white/10 bg-slate-800/70 p-3">
              <p className="font-medium">{group.name}</p>
              <p className="text-sm text-slate-400">{group.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CalendarPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Calendar</p>
        <h2 className="mt-1 text-lg font-semibold">Calendar view</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
        <p className="text-slate-400">You can add calendar reminders later or connect Google Calendar.</p>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <div className="flex items-center justify-between rounded-xl bg-slate-900/70 px-3 py-2"><span>Mock review session</span><span className="text-fuchsia-300">Tomorrow</span></div>
          <div className="flex items-center justify-between rounded-xl bg-slate-900/70 px-3 py-2"><span>Group quiz prep</span><span className="text-fuchsia-300">Friday</span></div>
        </div>
      </div>
    </div>
  )
}

function LoginPage({ onLogin, demoMode }: { onLogin: () => Promise<void>; demoMode: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await onLogin()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-fuchsia-950/30">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">StudyTrack</p>
          <h1 className="mt-2 text-2xl font-semibold">Study with your friends</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in with Google to share tasks and keep your study plan organized.</p>
          {demoMode ? <p className="mt-3 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-3 text-sm text-fuchsia-200">Firebase is not configured yet, so this session is running in demo mode locally.</p> : null}
        </div>
        <button onClick={handleSubmit} disabled={loading} className="w-full rounded-xl bg-fuchsia-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-fuchsia-400 disabled:opacity-60">
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>
        {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const stored = localStorage.getItem(USER_STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        const demoUser = getDemoUser()
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoUser))
        setUser(demoUser)
      }
      return
    }

    const unsub = onAuthStateChanged(auth!, (currentUser) => setUser(currentUser))
    return () => unsub()
  }, [])

  const login = async () => {
    if (!isFirebaseConfigured) {
      const demoUser = getDemoUser()
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoUser))
      setUser(demoUser)
      return
    }

    await signInWithPopup(auth!, googleProvider)
  }

  const logout = async () => {
    if (!isFirebaseConfigured) {
      localStorage.removeItem(USER_STORAGE_KEY)
      setUser(null)
      return
    }

    await signOut(auth!)
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={login} demoMode={!isFirebaseConfigured} />} />
      <Route element={<Layout user={user} onLogout={logout} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
