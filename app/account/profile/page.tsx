'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Badge, Card, Field, ProgressBar, StatTile, Table, TabHeader } from '@/components/account/AccountUI'
import { AwardIcon, CheckIcon, LinkIcon, StarIcon, ToolIcon } from '@/components/account/icons'
import { getLevelInfo } from '@/lib/levels'

type Profile = {
  id: string
  full_name: string | null
  title: string | null
  status: string | null
  department: string | null
  employment: string | null
  start_date: string | null
  location: string | null
  time_zone: string | null
  preferred_contact: string | null
  availability: string | null
  bio: string | null
  favorite_games: string | null
  skills: string[] | null
  portfolio_url: string | null
  github_url: string | null
  artstation_url: string | null
  discord_handle: string | null
}

// Only the fields team members are allowed to edit (matches the DB column grants)
type Draft = {
  full_name: string
  location: string
  time_zone: string
  preferred_contact: string
  availability: string
  bio: string
  favorite_games: string
  skills: string // comma separated while editing
  portfolio_url: string
  github_url: string
  artstation_url: string
  discord_handle: string
}

const PROFILE_SELECT =
  'id, full_name, title, status, department, employment, start_date, location, time_zone, preferred_contact, availability, bio, favorite_games, skills, portfolio_url, github_url, artstation_url, discord_handle'

const NOT_SET = 'Not set'

const inputClass =
  'w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand'

function toDraft(p: Profile): Draft {
  return {
    full_name: p.full_name ?? '',
    location: p.location ?? '',
    time_zone: p.time_zone ?? '',
    preferred_contact: p.preferred_contact ?? '',
    availability: p.availability ?? '',
    bio: p.bio ?? '',
    favorite_games: p.favorite_games ?? '',
    skills: (p.skills ?? []).join(', '),
    portfolio_url: p.portfolio_url ?? '',
    github_url: p.github_url ?? '',
    artstation_url: p.artstation_url ?? '',
    discord_handle: p.discord_handle ?? '',
  }
}

// Returns a clean URL, null if empty, or undefined if invalid
function normalizeUrl(raw: string): string | null | undefined {
  const value = raw.trim()
  if (!value) return null
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    return new URL(withProtocol).toString()
  } catch {
    return undefined
  }
}

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

function formatStartDate(date: string | null) {
  if (!date) return NOT_SET
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalXP, setTotalXP] = useState(0)
  const [tasksDone, setTasksDone] = useState(0)

  // Edit mode: draft is null when not editing
  const [draft, setDraft] = useState<Draft | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const editing = draft !== null

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return // layout handles the redirect
      setUser(user)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT)
        .eq('id', user.id)
        .single()
      if (profileError) console.error('Failed to load profile:', profileError)
      setProfile(profile)

      // Real XP from the permanent ledger (same source as the dashboard).
      // Each xp_log row = one completed task, and it survives archive cleanup.
      const { data: xpRows, error: xpError } = await supabase
        .from('xp_log')
        .select('xp')
        .eq('assigned_to_id', user.id)

      if (xpError) {
        console.error('Failed to load XP log:', xpError)
      } else if (xpRows) {
        setTotalXP(xpRows.reduce((sum: number, row: { xp: number }) => sum + row.xp, 0))
        setTasksDone(xpRows.length)
      }

      setLoading(false)
    }
    loadProfile()
  }, [])

  const updateDraft = (key: keyof Draft) => (value: string) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d))

  const startEditing = () => {
    if (!profile) return
    setEditError(null)
    setDraft(toDraft(profile))
  }

  const cancelEditing = () => {
    setEditError(null)
    setDraft(null)
  }

  const handleSaveProfile = async () => {
    if (!profile || !draft) return
    setEditError(null)

    const full_name = draft.full_name.trim()
    if (!full_name) {
      setEditError('Name is required.')
      return
    }

    const links = {
      portfolio_url: normalizeUrl(draft.portfolio_url),
      github_url: normalizeUrl(draft.github_url),
      artstation_url: normalizeUrl(draft.artstation_url),
    }
    if (Object.values(links).includes(undefined)) {
      setEditError('One of your links is not a valid URL.')
      return
    }

    const clean = (v: string) => v.trim() || null

    const update = {
      full_name,
      location: clean(draft.location),
      time_zone: clean(draft.time_zone),
      preferred_contact: clean(draft.preferred_contact),
      availability: clean(draft.availability),
      bio: clean(draft.bio),
      favorite_games: clean(draft.favorite_games),
      skills: draft.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20),
      ...links,
      discord_handle: clean(draft.discord_handle),
      updated_at: new Date().toISOString(),
    }

    setSavingProfile(true)
    const { data, error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', profile.id)
      .select(PROFILE_SELECT)
      .single()
    setSavingProfile(false)

    if (error) {
      console.error('Failed to save profile:', error)
      setEditError('Could not save your profile. Try again.')
      return
    }

    setProfile(data)
    setDraft(null)
  }

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

  const levelInfo = getLevelInfo(totalXP)
  const name = profile?.full_name || 'Team member'
  const title = profile?.title || 'Role title'
  const initials = (profile?.full_name || user?.email || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const status = (profile?.status || 'active').toLowerCase()
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)
  const skills = profile?.skills ?? []

  const links = [
    { label: 'Portfolio', url: profile?.portfolio_url },
    { label: 'GitHub', url: profile?.github_url },
    { label: 'ArtStation', url: profile?.artstation_url },
  ]
    .filter((l): l is { label: string; url: string } => Boolean(l.url))
    .map((l) => ({ label: l.label, text: displayUrl(l.url), href: l.url }))

  if (profile?.discord_handle) {
    links.push({ label: 'Discord', text: profile.discord_handle, href: '' })
  }

  return (
    <div className="space-y-4">
      <TabHeader
        title="Profile"
        description="Your info, how you appear on the studio site, and your login details."
        action={
          editing ? (
            <div className="flex gap-2">
              <button
                onClick={cancelEditing}
                disabled={savingProfile}
                className="border border-border-default rounded px-4 py-2 text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="bg-brand text-black font-semibold rounded px-4 py-2 text-sm disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <button
              onClick={startEditing}
              disabled={!profile}
              className="bg-brand text-black font-semibold rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              Edit profile
            </button>
          )
        }
      />

      {editError && <p className="text-sm text-red-400">{editError}</p>}

      {/* Row 1: identity + details */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-brand text-black font-bold flex items-center justify-center text-4xl ring-4 ring-background mb-4">
              {initials}
            </div>
            <p className="text-xl font-bold">{name}</p>
            <p className="text-brand text-sm mb-1">{title}</p>
            <p className="text-text-secondary text-xs mb-4">{user?.email}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge tone={status === 'active' ? 'success' : undefined}>● {statusLabel}</Badge>
              {profile?.department && <Badge tone="brand">{profile.department}</Badge>}
              {profile?.start_date && <Badge>Since {formatStartDate(profile.start_date)}</Badge>}
            </div>
          </div>
        </Card>

        <Card title="Bio & details" className="lg:col-span-2">
          {editing && draft ? (
            <>
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                <EditField label="Full name" value={draft.full_name} onChange={updateDraft('full_name')} />
                <Field label="Title" value={title} />
                <Field label="Department" value={profile?.department || NOT_SET} />
                <Field label="Start date" value={formatStartDate(profile?.start_date ?? null)} />
                <Field label="Employment" value={profile?.employment || NOT_SET} />
                <EditField label="Location" value={draft.location} onChange={updateDraft('location')} placeholder="Illinois, USA" />
                <EditField label="Time zone" value={draft.time_zone} onChange={updateDraft('time_zone')} placeholder="Central (CT)" />
                <EditField label="Preferred contact" value={draft.preferred_contact} onChange={updateDraft('preferred_contact')} placeholder="Discord" />
                <EditField label="Availability" value={draft.availability} onChange={updateDraft('availability')} placeholder="Evenings & weekends" />
              </div>
              <p className="text-xs text-text-secondary mt-3">
                Title, department, start date, and employment are set by the Studio Head.
              </p>
              <div className="mt-5 pt-5 border-t border-border-default grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5">Team page bio</label>
                  <textarea
                    value={draft.bio}
                    onChange={(e) => updateDraft('bio')(e.target.value)}
                    rows={4}
                    maxLength={600}
                    placeholder="What you do at Neverphorm, what you love making, and a fun fact or two."
                    className={inputClass}
                  />
                  <p className="text-xs text-text-secondary mt-1 text-right">{draft.bio.length}/600</p>
                </div>
                <EditField label="Favorite games" value={draft.favorite_games} onChange={updateDraft('favorite_games')} maxLength={200} />
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Full name" value={name} />
                <Field label="Title" value={title} />
                <Field label="Department" value={profile?.department || NOT_SET} />
                <Field label="Start date" value={formatStartDate(profile?.start_date ?? null)} />
                <Field label="Employment" value={profile?.employment || NOT_SET} />
                <Field label="Location" value={profile?.location || NOT_SET} />
                <Field label="Time zone" value={profile?.time_zone || NOT_SET} />
                <Field label="Preferred contact" value={profile?.preferred_contact || NOT_SET} />
                <Field label="Availability" value={profile?.availability || NOT_SET} />
              </div>
              <div className="mt-5 pt-5 border-t border-border-default grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Team page bio</p>
                  <p className="text-text-secondary whitespace-pre-line">
                    {profile?.bio || 'No bio yet. Click Edit profile to add one.'}
                  </p>
                </div>
                <Field label="Favorite games" value={profile?.favorite_games || NOT_SET} />
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Row 2: quick stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Level" value={levelInfo.level} hint="Personal level" icon={<StarIcon />} />
        <StatTile label="Total XP" value={totalXP} hint={`${levelInfo.needed - levelInfo.progress} XP to next level`} icon={<AwardIcon />} />
        <StatTile label="Tasks done" value={tasksDone} hint="All time" icon={<CheckIcon />} />
        <StatTile label="Titles credited" value={1} hint="Shipped or in progress" icon={<ToolIcon />} />
      </div>

      {/* Row 3: progress + skills + links */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Level progress">
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-bold">Lvl {levelInfo.level}</p>
            <p className="text-text-secondary text-xs">
              {levelInfo.progress} / {levelInfo.needed} XP
            </p>
          </div>
          <ProgressBar value={levelInfo.progress} max={levelInfo.needed} />
          <p className="text-text-secondary text-xs mt-3">
            XP comes from completed tasks (25 to 45 XP each). Level 1 takes 300 XP, and each level
            after needs 150 more than the last.
          </p>
        </Card>

        <Card title="Skills & tools">
          {editing && draft ? (
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Comma separated</label>
              <textarea
                value={draft.skills}
                onChange={(e) => updateDraft('skills')(e.target.value)}
                rows={4}
                placeholder="Unity, Blender, Figma"
                className={inputClass}
              />
              <p className="text-xs text-text-secondary mt-1">Up to 20 skills.</p>
            </div>
          ) : skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">No skills added yet.</p>
          )}
        </Card>

        <Card title="Links">
          {editing && draft ? (
            <div className="space-y-3">
              <EditField label="Portfolio" value={draft.portfolio_url} onChange={updateDraft('portfolio_url')} placeholder="yourportfolio.com" maxLength={300} />
              <EditField label="GitHub" value={draft.github_url} onChange={updateDraft('github_url')} placeholder="github.com/username" maxLength={300} />
              <EditField label="ArtStation" value={draft.artstation_url} onChange={updateDraft('artstation_url')} placeholder="artstation.com/username" maxLength={300} />
              <EditField label="Discord" value={draft.discord_handle} onChange={updateDraft('discord_handle')} placeholder="username" maxLength={40} />
            </div>
          ) : links.length > 0 ? (
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.label} className="flex items-center gap-3">
                  <span className="text-brand"><LinkIcon className="w-4 h-4" /></span>
                  <div className="min-w-0">
                    <p className="text-xs text-text-secondary">{l.label}</p>
                    {l.href ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="truncate block hover:text-brand">
                        {l.text}
                      </a>
                    ) : (
                      <p className="truncate">{l.text}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary text-sm">No links added yet.</p>
          )}
        </Card>
      </div>

      {/* Row 4: credits + password */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Game credits" className="lg:col-span-2">
          <Table
            headers={['Title', 'Your role', 'Status', 'Credited as']}
            rows={[
              ['Duskline', title, <Badge key="s1" tone="brand">In development</Badge>, name],
              ['Next title', 'TBD', <Badge key="s2">Planned</Badge>, 'TBD'],
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
                className={inputClass}
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
                className={inputClass}
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

function EditField({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 80,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
}) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={inputClass}
      />
    </div>
  )
}