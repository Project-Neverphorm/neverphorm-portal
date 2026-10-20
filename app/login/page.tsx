'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('awaiting credentials')
  const [statusColor, setStatusColor] = useState('bg-text-muted')
  const [loading, setLoading] = useState(false)

  const updateStatus = (nextEmail: string, nextPw: string) => {
    if (nextEmail.length > 3 && nextPw.length > 0) {
      setStatus('ready to authenticate')
      setStatusColor('bg-brand')
    } else if (nextEmail.length > 0 || nextPw.length > 0) {
      setStatus('entering credentials')
      setStatusColor('bg-text-secondary')
    } else {
      setStatus('awaiting credentials')
      setStatusColor('bg-text-muted')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('authenticating...')
    setStatusColor('bg-brand')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setStatus(error.message.toLowerCase())
      setStatusColor('bg-[#E24B4A]')
      setLoading(false)
      return
    }

    setStatus('access granted')
    setStatusColor('bg-[#6FCF97]')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 font-mono">
      <div className="w-[360px] bg-surface border border-border-default rounded-md overflow-hidden">
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-elevated border-b border-border-default">
          <span className="w-2 h-2 rounded-full bg-text-muted" />
          <span className="w-2 h-2 rounded-full bg-text-muted" />
          <span className="w-2 h-2 rounded-full bg-text-muted" />
          <span className="ml-2 text-xs text-text-secondary tracking-wide">
            neverphorm://portal
          </span>
        </div>

        <form onSubmit={handleLogin} className="px-6 pt-6 pb-5">
          <div className="text-xs text-text-muted mb-1">STUDIO ACCESS</div>
          <div className="text-lg text-foreground font-medium mb-4">
            Project Neverphorm
          </div>

          <div className="mb-3.5">
            <label className="block text-xs text-text-secondary mb-1.5">
              &gt; email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                updateStatus(e.target.value, password)
              }}
              placeholder="you@projectneverphorm.com"
              required
              className="w-full bg-background border border-border-default rounded text-foreground text-sm px-2.5 py-2 outline-none focus:border-brand"
            />
          </div>

          <div className="mb-4.5">
            <label className="block text-xs text-text-secondary mb-1.5">
              &gt; password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                updateStatus(email, e.target.value)
              }}
              placeholder="••••••••••••"
              required
              className="w-full bg-background border border-border-default rounded text-foreground text-sm px-2.5 py-2 outline-none focus:border-brand"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand rounded py-2.5 text-background text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'signing in...' : 'sign in'}
          </button>

          <div className="mt-3.5 flex items-center gap-1.5 text-xs text-text-muted">
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
            <span>{status}</span>
          </div>
        </form>
      </div>
    </div>
  )
}