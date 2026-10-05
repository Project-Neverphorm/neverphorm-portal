'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Badge, Card, Field, ProgressBar, StatTile, Table, TabHeader } from '@/components/account/AccountUI'
import { AwardIcon, CheckIcon, LinkIcon, StarIcon, ToolIcon } from '@/components/account/icons'

type Profile = {
  id: string
  full_name: string
  title: string
}

// Placeholder content until these fields live in Supabase
const placeholder = {
  department: 'Production',
  startDate: 'Oct 2026',
  location: 'Illinois, USA',
  timezone: 'Central (CT)',
  employment: 'Collaborator · Revenue share',
  contact: 'Discord',
  availability: 'Evenings & weekends',
  bio: 'Short bio shown on the studio site team page. Talk about what you do at Neverphorm, what you love making, and a fun fact or two.',
  favoriteGames: 'Hollow Knight, Inside, Celeste',
  skills: ['Unity', 'Unreal Engine', 'Blender', 'Figma', 'Clip Studio Paint', 'GitHub', 'Notion', 'Photoshop'],
  links: [
    { label: 'Portfolio', value: 'yourportfolio.com' },
    { label: 'GitHub', value: 'github.com/username' },
    { label: 'ArtStation', value: 'artstation.com/username' },
    { label: 'Discord', value: 'username' },
  ],
  level: 3,
  xp: 640,
  xpNext: 1000,
  tasksDone: 24,
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

  const name = profile?.full_name ?? 'Team member'
  const initials = (profile?.full_name ?? user?.email ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-4">
      <TabHeader
        title="Profile"
        description="Your info, how you appear on the studio site, and your login details."
        action={
          <button
            disabled
            className="bg-brand text-black font-semibold rounded px-4 py-2 text-sm disabled:opacity-50"
            title="Coming soon"
          >
            Edit profile
          </button>
        }
      />

      {/* Row 1: identity + details */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-brand text-black font-bold flex items-center justify-center text-4xl ring-4 ring-background mb-4">
              {initials}
            </div>
            <p className="text-xl font-bold">{name}</p>
            <p className="text-brand text-sm mb-1">{profile?.title ?? 'Role title'}</p>
            <p className="text-text-secondary text-xs mb-4">{user?.email}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge tone="success">● Active</Badge>
              <Badge tone="brand">{placeholder.department}</Badge>
              <Badge>Since {placeholder.startDate}</Badge>
            </div>
          </div>
        </Card>

        <Card title="Bio & details" className="lg:col-span-2">
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Full name" value={name} />
            <Field label="Title" value={profile?.title ?? 'Role title'} />
            <Field label="Department" value={placeholder.department} />
            <Field label="Start date" value={placeholder.startDate} />
            <Field label="Employment" value={placeholder.employment} />
            <Field label="Location" value={placeholder.location} />
            <Field label="Time zone" value={placeholder.timezone} />
            <Field label="Preferred contact" value={placeholder.contact} />
            <Field label="Availability" value={placeholder.availability} />
          </div>
          <div className="mt-5 pt-5 border-t border-border-default grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-text-secondary mb-1">Team page bio</p>
              <p className="text-text-secondary">{placeholder.bio}</p>
            </div>
            <Field label="Favorite games" value={placeholder.favoriteGames} />
          </div>
        </Card>
      </div>

      {/* Row 2: quick stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Level" value={placeholder.level} hint="Studio progression" icon={<StarIcon />} />
        <StatTile label="Total XP" value={placeholder.xp} hint={`${placeholder.xpNext - placeholder.xp} XP to next level`} icon={<AwardIcon />} />
        <StatTile label="Tasks done" value={placeholder.tasksDone} hint="All time" icon={<CheckIcon />} />
        <StatTile label="Titles credited" value={1} hint="Shipped or in progress" icon={<ToolIcon />} />
      </div>

      {/* Row 3: progress + skills + links */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Level progress">
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-bold">Lv {placeholder.level}</p>
            <p className="text-text-secondary text-xs">
              {placeholder.xp} / {placeholder.xpNext} XP
            </p>
          </div>
          <ProgressBar value={placeholder.xp} max={placeholder.xpNext} />
          <p className="text-text-secondary text-xs mt-3">
            XP comes from completed tasks. Light tasks earn 25 XP, heavy tasks earn up to 45 XP.
          </p>
        </Card>

        <Card title="Skills & tools">
          <div className="flex flex-wrap gap-2">
            {placeholder.skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </Card>

        <Card title="Links">
          <ul className="space-y-3">
            {placeholder.links.map((l) => (
              <li key={l.label} className="flex items-center gap-3">
                <span className="text-brand"><LinkIcon className="w-4 h-4" /></span>
                <div className="min-w-0">
                  <p className="text-xs text-text-secondary">{l.label}</p>
                  <p className="truncate">{l.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Row 4: credits + password */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Game credits" className="lg:col-span-2">
          <Table
            headers={['Title', 'Your role', 'Status', 'Credited as']}
            rows={[
              ['Duskline', profile?.title ?? 'Role title', <Badge key="s1" tone="brand">In development</Badge>, name],
              ['Next title', 'TBD', <Badge key="s2">Planned</Badge>, '—'],
            ]}
          />
        </Card>

        <Card title="Change password">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
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
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
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
              className="w-full bg-brand text-black font-semibold rounded py-2 text-sm disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}