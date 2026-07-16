// app/dashboard/cms/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { User } from '@supabase/supabase-js'

type Game = {
  id: string
  title: string
  tagline: string | null
  description: string | null
  engine: string | null
  price: number | null
  genre: string | null
  status: 'in_development' | 'coming_soon' | 'released'
  cover_image_url: string | null
  sort_order: number
}

type Update = {
  id: string
  title: string
  body: string
  category: string | null
  cover_image_url: string | null
  game_id: string | null
  published_at: string
}

const emptyGame = {
  title: '', tagline: '', description: '', engine: '', price: '', genre: '',
  status: 'in_development' as Game['status'], cover_image_url: '', sort_order: 0,
}

const emptyUpdate = {
  title: '', body: '', category: '', cover_image_url: '', game_id: '', published_at: '',
}

export default function CMSPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [tab, setTab] = useState<'games' | 'updates'>('games')

  const [games, setGames] = useState<Game[]>([])
  const [updates, setUpdates] = useState<Update[]>([])

  const [gameForm, setGameForm] = useState(emptyGame)
  const [editingGameId, setEditingGameId] = useState<string | null>(null)
  const [showGameForm, setShowGameForm] = useState(false)

  const [updateForm, setUpdateForm] = useState(emptyUpdate)
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null)
  const [showUpdateForm, setShowUpdateForm] = useState(false)

  const loadGames = async () => {
    const { data } = await supabase.from('games').select('*').order('sort_order', { ascending: true })
    if (data) setGames(data)
  }

  const loadUpdates = async () => {
    const { data } = await supabase.from('updates').select('*').order('published_at', { ascending: false })
    if (data) setUpdates(data)
  }

  useEffect(() => {
    loadGames()
    loadUpdates()
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [router])

  const openNewGame = () => {
    setGameForm(emptyGame)
    setEditingGameId(null)
    setShowGameForm(true)
  }

  const openEditGame = (g: Game) => {
    setGameForm({
      title: g.title, tagline: g.tagline ?? '', description: g.description ?? '',
      engine: g.engine ?? '', price: g.price?.toString() ?? '', genre: g.genre ?? '',
      status: g.status, cover_image_url: g.cover_image_url ?? '', sort_order: g.sort_order,
    })
    setEditingGameId(g.id)
    setShowGameForm(true)
  }

  const saveGame = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: gameForm.title.trim(),
      tagline: gameForm.tagline || null,
      description: gameForm.description || null,
      engine: gameForm.engine || null,
      price: gameForm.price ? Number(gameForm.price) : null,
      genre: gameForm.genre || null,
      status: gameForm.status,
      cover_image_url: gameForm.cover_image_url || null,
      sort_order: gameForm.sort_order,
      updated_at: new Date().toISOString(),
    }

    const { error } = editingGameId
      ? await supabase.from('games').update(payload).eq('id', editingGameId)
      : await supabase.from('games').insert(payload)

    if (error) {
      alert(`Failed to save: ${error.message}`)
      return
    }
    setShowGameForm(false)
    loadGames()
  }

  const deleteGame = async (id: string) => {
    if (!window.confirm('Delete this game? This removes it from the live site.')) return
    await supabase.from('games').delete().eq('id', id)
    loadGames()
  }

  const openNewUpdate = () => {
    setUpdateForm({ ...emptyUpdate, published_at: new Date().toISOString().slice(0, 10) })
    setEditingUpdateId(null)
    setShowUpdateForm(true)
  }

  const openEditUpdate = (u: Update) => {
    setUpdateForm({
      title: u.title, body: u.body, category: u.category ?? '',
      cover_image_url: u.cover_image_url ?? '', game_id: u.game_id ?? '', published_at: u.published_at,
    })
    setEditingUpdateId(u.id)
    setShowUpdateForm(true)
  }

  const saveUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: updateForm.title.trim(),
      body: updateForm.body.trim(),
      category: updateForm.category || null,
      cover_image_url: updateForm.cover_image_url || null,
      game_id: updateForm.game_id || null,
      published_at: updateForm.published_at,
    }

    const { error } = editingUpdateId
      ? await supabase.from('updates').update(payload).eq('id', editingUpdateId)
      : await supabase.from('updates').insert(payload)

    if (error) {
      alert(`Failed to save: ${error.message}`)
      return
    }
    setShowUpdateForm(false)
    loadUpdates()
  }

  const deleteUpdate = async (id: string) => {
    if (!window.confirm('Delete this update? This removes it from the live site.')) return
    await supabase.from('updates').delete().eq('id', id)
    loadUpdates()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="flex gap-2 px-10 pt-8">
        {(['games', 'updates'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 rounded border transition-colors ${
              tab === t ? 'bg-brand text-black border-brand font-semibold' : 'border-neutral-700 text-text-secondary hover:text-foreground'
            }`}
          >
            {t === 'games' ? 'Games' : 'Updates'}
          </button>
        ))}
      </div>

      <div className="px-10 py-8">

        {tab === 'games' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold">Games — projectneverphorm.com/games</h1>
              <button onClick={openNewGame} className="bg-brand text-black text-sm font-semibold rounded px-4 py-2">
                + Add game
              </button>
            </div>

            <div className="divide-y divide-neutral-800 border border-border-default rounded-lg">
              {games.length === 0 && <p className="text-sm text-text-secondary p-4">No games yet.</p>}
              {games.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-sm">{g.title}</p>
                    <p className="text-xs text-text-secondary">
                      {g.status.replace('_', ' ')} {g.price ? `· $${g.price}` : ''} {g.engine ? `· ${g.engine}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button onClick={() => openEditGame(g)} className="text-brand hover:underline">Edit</button>
                    <button onClick={() => deleteGame(g.id)} className="text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'updates' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold">Updates — projectneverphorm.com/updates</h1>
              <button onClick={openNewUpdate} className="bg-brand text-black text-sm font-semibold rounded px-4 py-2">
                + Add update
              </button>
            </div>

            <div className="divide-y divide-neutral-800 border border-border-default rounded-lg">
              {updates.length === 0 && <p className="text-sm text-text-secondary p-4">No updates yet.</p>}
              {updates.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-sm">{u.title}</p>
                    <p className="text-xs text-text-secondary">
                      {new Date(u.published_at).toLocaleDateString()} {u.category ? `· ${u.category}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button onClick={() => openEditUpdate(u)} className="text-brand hover:underline">Edit</button>
                    <button onClick={() => deleteUpdate(u.id)} className="text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showGameForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-lg bg-elevated border border-border-default rounded-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">{editingGameId ? 'Edit game' : 'Add game'}</h3>
              <button onClick={() => setShowGameForm(false)} className="text-text-secondary hover:text-foreground">✕</button>
            </div>
            <form onSubmit={saveGame} className="space-y-3">
              <input required placeholder="Title" value={gameForm.title}
                onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm" />
              <input placeholder="Tagline" value={gameForm.tagline}
                onChange={(e) => setGameForm({ ...gameForm, tagline: e.target.value })}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm" />
              <textarea placeholder="Description" value={gameForm.description} rows={4}
                onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Engine" value={gameForm.engine}
                  onChange={(e) => setGameForm({ ...gameForm, engine: e.target.value })}
                  className="bg-background border border-border-default rounded px-3 py-2 text-sm" />
                <input placeholder="Genre" value={gameForm.genre}
                  onChange={(e) => setGameForm({ ...gameForm, genre: e.target.value })}
                  className="bg-background border border-border-default rounded px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Price (e.g. 29.99)" value={gameForm.price}
                  onChange={(e) => setGameForm({ ...gameForm, price: e.target.value })}
                  className="bg-background border border-border-default rounded px-3 py-2 text-sm" />
                <select value={gameForm.status}
                  onChange={(e) => setGameForm({ ...gameForm, status: e.target.value as Game['status'] })}
                  className="bg-background border border-border-default rounded px-3 py-2 text-sm">
                  <option value="in_development">In Development</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="released">Released</option>
                </select>
              </div>
              <input placeholder="Cover image URL" value={gameForm.cover_image_url}
                onChange={(e) => setGameForm({ ...gameForm, cover_image_url: e.target.value })}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm" />
              <input type="number" placeholder="Sort order (lower = first)" value={gameForm.sort_order}
                onChange={(e) => setGameForm({ ...gameForm, sort_order: Number(e.target.value) })}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm" />
              <button type="submit" className="w-full bg-brand text-black font-semibold rounded py-2 text-sm mt-2">
                {editingGameId ? 'Save changes' : 'Add game'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showUpdateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-lg bg-elevated border border-border-default rounded-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">{editingUpdateId ? 'Edit update' : 'Add update'}</h3>
              <button onClick={() => setShowUpdateForm(false)} className="text-text-secondary hover:text-foreground">✕</button>
            </div>
            <form onSubmit={saveUpdate} className="space-y-3">
              <input required placeholder="Title" value={updateForm.title}
                onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm" />
              <textarea required placeholder="Body" value={updateForm.body} rows={6}
                onChange={(e) => setUpdateForm({ ...updateForm, body: e.target.value })}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Category (e.g. Dev Log)" value={updateForm.category}
                  onChange={(e) => setUpdateForm({ ...updateForm, category: e.target.value })}
                  className="bg-background border border-border-default rounded px-3 py-2 text-sm" />
                <input type="date" value={updateForm.published_at}
                  onChange={(e) => setUpdateForm({ ...updateForm, published_at: e.target.value })}
                  className="bg-background border border-border-default rounded px-3 py-2 text-sm" />
              </div>
              <select value={updateForm.game_id}
                onChange={(e) => setUpdateForm({ ...updateForm, game_id: e.target.value })}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm">
                <option value="">No linked game</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
              <input placeholder="Cover image URL" value={updateForm.cover_image_url}
                onChange={(e) => setUpdateForm({ ...updateForm, cover_image_url: e.target.value })}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm" />
              <button type="submit" className="w-full bg-brand text-black font-semibold rounded py-2 text-sm mt-2">
                {editingUpdateId ? 'Save changes' : 'Post update'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}