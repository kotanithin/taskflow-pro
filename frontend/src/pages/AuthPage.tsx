import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Sparkles, UserPlus } from 'lucide-react'
import { signInWithEmail, signInWithGoogle, signUpWithEmail, resetPassword } from '../services/firebaseService'
import { auth, isFirebaseConfigured } from '../firebase'

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (!isFirebaseConfigured || !auth) throw new Error('Firebase is not configured')
      if (mode === 'signup') {
        await signUpWithEmail(email, password, name)
        setMessage('Account created. Please verify your email before continuing.')
      } else {
        await signInWithEmail(email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      setError('')
      setLoading(true)
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!email) {
      setError('Enter your email to receive a reset link')
      return
    }
    try {
      await resetPassword(email)
      setMessage('Password reset email sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-300">
            <Sparkles size={16} /> StudyTrack • Collaborative learning
          </div>
          <h1 className="text-4xl font-semibold sm:text-5xl">Plan, study, and grow together with your real study circle.</h1>
          <p className="max-w-xl text-lg text-slate-400">Create groups, assign tasks, track hours, upload notes, and keep every study session aligned from one secure workspace.</p>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/40">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-fuchsia-400">Welcome back</p>
              <h2 className="text-xl font-semibold">{mode === 'login' ? 'Sign in to StudyTrack' : 'Create your account'}</h2>
            </div>
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sm text-fuchsia-300">
              {mode === 'login' ? 'Need an account?' : 'Have an account?'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3" placeholder="Full name" required />
            )}
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3" type="email" placeholder="Email" required />
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3" type="password" placeholder="Password" required />
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-fuchsia-500 px-4 py-3 font-semibold text-white">
              <Mail size={18} /> {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-emerald-400">{message}</p>}
          {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

          <button onClick={handleGoogle} disabled={loading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm">
            <UserPlus size={18} /> Continue with Google
          </button>

          <button onClick={handleReset} className="mt-2 text-sm text-slate-400">Forgot password?</button>
        </div>
      </div>
    </div>
  )
}
