'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('awaiting credentials')
  const [statusColor, setStatusColor] = useState('bg-[#5C5F66]')
  const [loading, setLoading] = useState(false)

  const updateStatus = (nextEmail: string, nextPw: string) => {
    if (nextEmail.length > 3 && nextPw.length > 0) {
      setStatus('ready to authenticate')
      setStatusColor('bg-[#F2A93B]')
    } else if (nextEmail.length > 0 || nextPw.length > 0) {
      setStatus('entering credentials')
      setStatusColor('bg-[#7A7D84]')
    } else {
      setStatus('awaiting credentials')
      setStatusColor('bg-[#5C5F66]')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('authenticating...')
    setStatusColor('bg-[#F2A93B]')

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
    <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center px-4 font-mono">
      <div className="w-[360px] bg-[#16181C] border border-[#2A2D33] rounded-md overflow-hidden">
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#1C1F24] border-b border-[#2A2D33]">
          <span className="w-2 h-2 rounded-full bg-[#3A3D42]" />
          <span className="w-2 h-2 rounded-full bg-[#3A3D42]" />
          <span className="w-2 h-2 rounded-full bg-[#3A3D42]" />
          <span className="ml-2 text-xs text-[#7A7D84] tracking-wide">
            neverphorm://portal
          </span>
        </div>

        <form onSubmit={handleLogin} className="px-6 pt-6 pb-5">
          <div className="text-xs text-[#5C5F66] mb-1">STUDIO ACCESS</div>
          <div className="text-lg text-[#EDEDED] font-medium mb-4">
            Project Neverphorm
          </div>

          <div className="mb-3.5">
            <label className="block text-xs text-[#7A7D84] mb-1.5">
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
              className="w-full bg-[#0E0F12] border border-[#2A2D33] rounded text-[#EDEDED] text-sm px-2.5 py-2 outline-none focus:border-[#F2A93B]"
            />
          </div>

          <div className="mb-4.5">
            <label className="block text-xs text-[#7A7D84] mb-1.5">
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
              className="w-full bg-[#0E0F12] border border-[#2A2D33] rounded text-[#EDEDED] text-sm px-2.5 py-2 outline-none focus:border-[#F2A93B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F2A93B] rounded py-2.5 text-[#412402] text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'signing in...' : 'sign in'}
          </button>

          <div className="mt-3.5 flex items-center gap-1.5 text-xs text-[#5C5F66]">
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
            <span>{status}</span>
          </div>
        </form>
      </div>
    </div>
  )
}