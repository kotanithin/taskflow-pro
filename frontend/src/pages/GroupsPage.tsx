import { useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../firebase'
import { createGroup, listenToGroups } from '../services/firebaseService'
import type { StudyGroup } from '../types'

const emptyGroup = {
  name: '',
  description: '',
  ownerId: '',
  memberIds: [] as string[],
  avatarUrl: '',
  bannerUrl: '',
  inviteCode: '',
}

export default function GroupsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [form, setForm] = useState(emptyGroup)

  useEffect(() => {
    if (!auth) {
      setUser(null)
      setGroups([])
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const stop = listenToGroups(currentUser.uid, setGroups)
        return () => stop()
      }
    })
    return () => unsubscribe()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return
    await createGroup({
      ...form,
      ownerId: user.uid,
      memberIds: [user.uid],
      inviteCode: `group-${Date.now()}`,
    })
    setForm(emptyGroup)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Plus size={18} className="text-fuchsia-400" />
          <h3 className="text-lg font-semibold">Create study group</h3>
        </div>
        <input className="w-full rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" placeholder="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="w-full rounded-2xl bg-fuchsia-500 px-4 py-3 font-semibold text-white">Create group</button>
      </form>

      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your groups</h3>
          <span className="text-sm text-slate-400">Real collaboration</span>
        </div>
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-white/10 bg-slate-800/70 p-3">
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
  )
}
