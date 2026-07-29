import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock3, ListTodo, Users, TrendingUp } from 'lucide-react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../firebase'
import { listenToTasks, listenToGroups, listenToStudyLogs, listenToNotifications, getUserProfile } from '../services/firebaseService'
import type { StudyGroup, StudyLog, StudyTask, UserProfile } from '../types'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [logs, setLogs] = useState<StudyLog[]>([])
  const [, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!auth) {
      setUser(null)
      setProfile(null)
      setTasks([])
      setGroups([])
      setLogs([])
      setNotifications([])
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        getUserProfile(currentUser.uid).then(setProfile)
        if (currentUser && typeof window !== 'undefined') {
          const stopTasks = listenToTasks(currentUser.uid, setTasks)
          const stopGroups = listenToGroups(currentUser.uid, setGroups)
          const stopLogs = listenToStudyLogs(currentUser.uid, setLogs)
          const stopNotifications = listenToNotifications(currentUser.uid, setNotifications)
          return () => {
            stopTasks()
            stopGroups()
            stopLogs()
            stopNotifications()
          }
        }
      }
    })
    return () => unsubscribe()
  }, [])

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'completed').length
    const pending = tasks.filter((task) => task.status !== 'completed' && !task.archived).length
    const overdue = tasks.filter((task) => task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10)).length
    const studyHours = logs.reduce((sum, log) => sum + log.hours, 0)
    return { completed, pending, overdue, studyHours }
  }, [tasks, logs])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/15 via-slate-900/80 to-slate-900/70 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Welcome back</p>
            <h2 className="mt-2 text-2xl font-semibold">{profile?.name ?? user?.displayName ?? 'StudyTrack Member'}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Your study plan is synced live from Firebase. Create tasks, join groups, and monitor progress from a single workspace.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
            <p className="font-medium">Today’s focus</p>
            <p className="mt-1 text-fuchsia-300">{stats.pending} active tasks</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tasks', value: tasks.length, icon: ListTodo },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2 },
          { label: 'Overdue', value: stats.overdue, icon: Clock3 },
          { label: 'Study Hours', value: `${stats.studyHours}h`, icon: TrendingUp },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{item.label}</p>
                <Icon size={18} className="text-fuchsia-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent activity</h3>
            <Link to="/tasks" className="text-sm text-fuchsia-300">Open tasks</Link>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-xl border border-white/10 bg-slate-800/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-slate-400">{task.subject} • {task.priority}</p>
                  </div>
                  <span className="rounded-full bg-fuchsia-500/20 px-2 py-1 text-sm text-fuchsia-300">{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your groups</h3>
            <Link to="/groups" className="text-sm text-fuchsia-300">Manage</Link>
          </div>
          <div className="space-y-3">
            {groups.map((group) => (
              <div key={group.id} className="rounded-xl border border-white/10 bg-slate-800/70 p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-fuchsia-500/20 p-2 text-fuchsia-300"><Users size={16} /></div>
                  <div>
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-slate-400">{group.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
