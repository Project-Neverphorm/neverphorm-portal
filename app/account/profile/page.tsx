'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { TabHeader } from '@/components/account/AccountUI'

type Profile = {
  id: string
  full_name: string
  title: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return // layout handles the redirect
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, title')
        .eq('id', user.id)
        .single()
      setProfile(profile)

      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
      return
    }

    setNewPassword('')
    setConfirmPassword('')
    setMessage({ type: 'success', text: 'Password updated.' })
  }

  if (loading) {
    return <p className="text-text-secondary text-sm">Loading...</p>
  }

  const initials = (profile?.full_name ?? user?.email ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <TabHeader title="Profile" description="Your info and login details." />

      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-full bg-brand text-black font-bold flex items-center justify-center text-lg shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold">{profile?.full_name ?? 'Team member'}</p>
          <p className="text-sm text-text-secondary">{profile?.title}</p>
          <p className="text-sm text-text-secondary">{user?.email}</p>
        </div>
      </div>

      <div className="border-t border-border-default pt-8">
        <h2 className="text-sm uppercase tracking-wide text-text-secondary mb-4">Change password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full bg-elevated border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={8}
              className="w-full bg-elevated border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          {message && (
            <p className={`text-sm ${message.type === 'success' ? 'text-brand' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand text-black font-semibold rounded py-2 text-sm mt-2 disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </>
  )
}