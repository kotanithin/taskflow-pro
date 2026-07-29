import { CheckCircle2, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  'Firebase Authentication and Firestore sync',
  'Collaborative task assignment and progress tracking',
  'Group-based study planning and notifications',
  'Secure file uploads and profile management',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-20 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-300">
            <Sparkles size={16} /> StudyTrack • Production-ready study collaboration
          </div>
          <h1 className="text-4xl font-semibold sm:text-6xl">Plan smarter, study together, and land every placement with confidence.</h1>
          <p className="max-w-2xl text-lg text-slate-400">StudyTrack is a secure, Firebase-backed platform for friends to create groups, assign tasks, upload notes, and track progress for placements, interviews, and exams.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth" className="rounded-2xl bg-fuchsia-500 px-5 py-3 font-semibold text-white">Get started</Link>
            <Link to="/dashboard" className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-3 font-semibold text-slate-200">Explore dashboard</Link>
          </div>
        </div>
        <div className="flex-1 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/40">
          <div className="grid gap-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/70 p-3">
                <CheckCircle2 size={18} className="text-fuchsia-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Users, title: 'Real collaboration', text: 'Create groups and invite friends that matter.' },
            { icon: Zap, title: 'Live progress', text: 'Track tasks and study hours in real time.' },
            { icon: ShieldCheck, title: 'Secure by design', text: 'All data lives in Firebase with authenticated access.' },
          ].map((item) => {
            const Icon = item.icon
            return <div key={item.title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6"><Icon className="mb-3 text-fuchsia-400" size={24} /><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm text-slate-400">{item.text}</p></div>
          })}
        </div>
      </section>
    </div>
  )
}
