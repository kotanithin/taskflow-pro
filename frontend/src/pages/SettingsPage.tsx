import { useEffect, useState } from 'react'
import { LogOut, ShieldCheck, Sparkles } from 'lucide-react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../firebase'
import { getUserProfile, logout, updateUserProfile } from '../services/firebaseService'
import type { UserProfile } from '../types'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!auth) {
      setUser(null)
      setProfile(null)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        getUserProfile(currentUser.uid).then(setProfile)
      }
    })
    return () => unsubscribe()
  }, [])

  const saveProfile = async () => {
    if (!user || !profile) return
    await updateUserProfile(user.uid, profile)
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-fuchsia-500/20 p-2 text-fuchsia-300"><Sparkles size={20} /></div>
        <div>
          <h3 className="text-lg font-semibold">Profile settings</h3>
          <p className="text-sm text-slate-400">Your profile is stored securely in Firestore.</p>
        </div>
      </div>

      {profile && (
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Name" />
          <input className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" value={profile.college} onChange={(e) => setProfile({ ...profile, college: e.target.value })} placeholder="College" />
          <input className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} placeholder="Department" />
          <input className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" value={profile.year} onChange={(e) => setProfile({ ...profile, year: e.target.value })} placeholder="Year" />
          <input className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" value={profile.email} disabled placeholder="Email" />
          <input className="rounded-2xl border border-white/10 bg-slate-800 px-3 py-3" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone" />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={saveProfile} className="rounded-2xl bg-fuchsia-500 px-4 py-3 font-semibold text-white">Save profile</button>
        <button onClick={() => logout()} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800 px-4 py-3"><LogOut size={16} /> Logout</button>
      </div>

      <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
        <div className="flex items-center gap-2"><ShieldCheck size={16} /> Firebase-backed security and persistence are enabled.</div>
      </div>
    </div>
  )
}
