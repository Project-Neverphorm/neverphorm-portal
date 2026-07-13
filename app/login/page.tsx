'use client' // Next.js by default renders pages on the server. But this page needs interactivity (typing, clicking, state changes), which requires it to run in the browser. This directive tells Next.js "run this one client-side."

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // useState - these are React "state variables." Every time someone types in the email field, email updates and the component re-renders to reflect it. Same for password, error messages, and loading state.
  // handleLogin - this function runs when the form submits. It calls supabase.auth.signInWithPassword(), which checks the email/password against what's stored in Supabase's auth system (the user you just created manually).
  // router.push('/dashboard') -  if login succeeds, we redirect to /dashboard (which we'll build next).
  // className stuff is Tailwind,  utility classes that style directly in the markup instead of separate CSS files.

  {/*}
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    router.push('/dashboard')
  }
    */}

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleLogin}
        className="bg-surface p-8 rounded-lg w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Project Neverphorm Portal
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-elevated text-foreground"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-elevated text-foreground"
          required
        />

        {errorMsg && (
          <p className="text-red-500 text-sm mb-4">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-foreground py-2 rounded"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  )
}