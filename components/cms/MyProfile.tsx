// components/cms/MyProfile.tsx

'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Member = {
  id: string
  name: string
  role: string | null
  bio: string | null
  favorite_games: string | null
  photo_url: string | null
}

const inputClass =
  'w-full rounded-lg border border-border-default bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500'

export default function MyProfile() {
  const [member, setMember] = useState<Member | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [favoriteGames, setFavoriteGames] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setLoading(false)
      return
    }
    setUserId(user.id)

    const { data, error } = await supabase
      .from('team_members')
      .select('id, name, role, bio, favorite_games, photo_url')
      .eq('email', user.email.toLowerCase())
      .maybeSingle()

    if (error) setError(error.message)
    if (data) {
      setMember(data)
      setBio(data.bio ?? '')
      setFavoriteGames(data.favorite_games ?? '')
      setPhotoUrl(data.photo_url ?? '')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const uploadPhoto = async (file: File) => {
    if (!userId) return
    setUploading(true)
    setError(null)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('team-photos').upload(path, file, { cacheControl: '3600' })
    if (error) {
      setError(error.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('team-photos').getPublicUrl(path)
    setPhotoUrl(data.publicUrl)
    setUploading(false)
  }

  const save = async () => {
    if (!member) return
    setSaving(true)
    setError(null)
    setSaved(false)

    const { error } = await supabase
      .from('team_members')
      .update({
        bio: bio.trim() || null,
        favorite_games: favoriteGames.trim() || null,
        photo_url: photoUrl || null,
      })
      .eq('id', member.id)

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return <p className="text-sm text-text-secondary">Loading your profile...</p>

  if (!member) {
    return (
      <div className="rounded-lg border border-border-default p-6">
        <h1 className="text-xl font-bold mb-2">My Profile</h1>
        <p className="text-sm text-text-secondary">
          Your portal account isn&apos;t linked to a team profile yet. Ask Cody to add your login email to your team card.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">My Profile · projectneverphorm.com/about</h1>
        <p className="mt-1 text-sm text-text-secondary">
          This is what shows on the public Meet the Team page. Changes go live as soon as you save.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Editor */}
        <div className="rounded-lg border border-border-default p-6">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 text-2xl text-neutral-400">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                member.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="space-y-1">
              <label className="block cursor-pointer text-sm text-brand hover:underline">
                {uploading ? 'Uploading...' : photoUrl ? 'Change photo' : 'Upload photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
                />
              </label>
              {photoUrl && (
                <button onClick={() => setPhotoUrl('')} className="block text-xs text-neutral-500 hover:text-red-400">
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs text-text-secondary">Name and role (ask Cody to change these)</p>
              <p className="text-sm">
                {member.name}
                {member.role && <span className="text-text-secondary"> · {member.role}</span>}
              </p>
            </div>
            <textarea
              className={`${inputClass} min-h-36`}
              placeholder="Your bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Favorite games"
              value={favoriteGames}
              onChange={(e) => setFavoriteGames(e.target.value)}
            />
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <div className="mt-5 flex items-center justify-end gap-3">
            {saved && <span className="text-sm text-green-400">Saved, it&apos;s live.</span>}
            <button
              onClick={save}
              disabled={saving || uploading}
              className="bg-brand text-black text-sm font-semibold rounded px-4 py-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <p className="mb-3 text-xs uppercase tracking-wider text-neutral-500">Preview</p>
          <div className="flex gap-6 rounded-lg border border-border-default p-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 text-3xl text-neutral-400">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                member.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold">{member.name}</p>
              {member.role && <p className="text-sm text-brand">{member.role}</p>}
              {bio && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{bio}</p>}
              {favoriteGames && (
                <p className="mt-3 text-sm text-text-secondary">
                  <span className="font-semibold text-foreground">Favorite games:</span> {favoriteGames}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}