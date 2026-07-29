import { useEffect, useState } from 'react'
import { Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../firebase'
import { createTask, deleteTask, listenToTasks, updateTask } from '../services/firebaseService'
import type { StudyTask, TaskPriority, TaskStatus } from '../types'

const emptyForm = {
  title: '',
  description: '',
  createdBy: '',
  createdByName: '',
  assignedTo: '',
  assignedToName: '',
  priority: 'medium' as TaskPriority,
  status: 'todo' as TaskStatus,
  dueDate: '',
  startDate: '',
  estimatedHours: '',
  actualHours: '',
  subject: '',
  tags: [] as string[],
  checklist: [] as Array<{ id: string; label: string; done: boolean }>,
  reminder: false,
  repeat: 'none',
  memberIds: [] as string[],
  archived: false,
}

export default function TasksPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!auth) {
      setUser(null)
      setTasks([])
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const stop = listenToTasks(currentUser.uid, setTasks)
        return () => stop()
      }
    })
    return () => unsubscribe()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return
    await createTask({
      ...form,
      createdBy: user.uid,
      createdByName: user.displayName ?? user.email ?? 'StudyTrack User',
      assignedTo: user.uid,
      assignedToName: user.displayName ?? user.email ?? 'StudyTrack User',
      memberIds: [user.uid],
    })
    setForm(emptyForm)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Plus size={18} className="text-fuchsia-400" />
          <h3 className="text-lg font-semibold">Create task</h3>
        </div>
        <input className="w-full rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <input className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <select className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <input className="w-full rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <button className="w-full rounded-2xl bg-fuchsia-500 px-4 py-3 font-semibold text-white">Save task</button>
      </form>

      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tasks</h3>
          <span className="text-sm text-slate-400">Firebase sync</span>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-2xl border border-white/10 bg-slate-800/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-slate-400">{task.subject} • {task.priority}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'todo' : 'completed' })} className="rounded-full bg-fuchsia-500/20 p-2 text-fuchsia-300"><CheckCircle2 size={16} /></button>
                  <button onClick={() => deleteTask(task.id)} className="rounded-full bg-rose-500/20 p-2 text-rose-300"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
