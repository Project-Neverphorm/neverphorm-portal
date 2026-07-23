'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { User } from '@supabase/supabase-js'

type Game = {
  id: string
  order_index: number
  title: string
  status: 'Released' | 'In Development' | 'Planned' | 'Concept'
  blurb: string | null
  description: string | null
  engine: string | null
  price: string | null
}

const STATUS_STYLES: Record<Game['status'], string> = {
  'Released': 'bg-green-500/15 text-green-400',
  'In Development': 'bg-brand/15 text-brand',
  'Planned': 'bg-neutral-500/15 text-neutral-300',
  'Concept': 'bg-neutral-700/40 text-neutral-500',
}

const emptyForm = {
  title: '',
  status: 'Planned' as Game['status'],
  blurb: '',
  description: '',
  engine: '',
  price: '',
}

export default function PipelinePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const router = useRouter()

  const loadGames = async () => {
    const { data, error } = await supabase
      .from('pipeline_games')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Failed to load pipeline:', error)
    } else if (data) {
      setGames(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('title')
        .eq('id', user.id)
        .single()
      setIsOwner(profile?.title === 'Studio Head & Creative Director')
    }
    init()
    loadGames()
  }, [router])

  const startEdit = (game: Game) => {
    setEditingId(game.id)
    setAddingNew(false)
    setForm({
      title: game.title,
      status: game.status,
      blurb: game.blurb ?? '',
      description: game.description ?? '',
      engine: game.engine ?? '',
      price: game.price ?? '',
    })
  }

  const startAdd = () => {
    setAddingNew(true)
    setEditingId(null)
    setForm(emptyForm)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setAddingNew(false)
    setForm(emptyForm)
  }

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from('pipeline_games')
      .update({
        title: form.title,
        status: form.status,
        blurb: form.blurb,
        description: form.description,
        engine: form.engine,
        price: form.price,
      })
      .eq('id', id)

    if (error) {
      alert(`Failed to save: ${error.message}`)
      return
    }
    cancelEdit()
    loadGames()
  }

  const saveNew = async () => {
    if (!form.title.trim()) return

    const { error } = await supabase.from('pipeline_games').insert({
      title: form.title.trim(),
      status: form.status,
      blurb: form.blurb,
      description: form.description,
      engine: form.engine,
      price: form.price,
      order_index: games.length,
    })

    if (error) {
      alert(`Failed to add: ${error.message}`)
      return
    }
    cancelEdit()
    loadGames()
  }

  const deleteGame = async (id: string) => {
    const confirmed = window.confirm('Remove this title from the pipeline?')
    if (!confirmed) return

    const { error } = await supabase.from('pipeline_games').delete().eq('id', id)
    if (error) {
      alert(`Failed to delete: ${error.message}`)
      return
    }
    loadGames()
  }

  const moveGame = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= games.length) return

    const a = games[index]
    const b = games[targetIndex]

    await supabase.from('pipeline_games').update({ order_index: b.order_index }).eq('id', a.id)
    await supabase.from('pipeline_games').update({ order_index: a.order_index }).eq('id', b.id)
    loadGames()
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

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold">Pipeline</h1>
            <p className="text-text-secondary text-sm mt-1">
              The full catalog. This is the long game.
            </p>
          </div>
          {isOwner && (
            <button
              onClick={() => { setEditMode(!editMode); cancelEdit() }}
              className={`text-sm rounded px-4 py-2 border transition-colors ${
                editMode
                  ? 'bg-brand text-black border-brand font-semibold'
                  : 'border-neutral-700 hover:border-brand'
              }`}
            >
              {editMode ? 'Done editing' : 'Edit pipeline'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {games.map((game, index) => (
            <div key={game.id} className="border border-border-default rounded-lg p-5 bg-elevated/40">
              {editingId === game.id ? (
                <div className="space-y-3">
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Title"
                    className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Game['status'] })}
                    className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
                  >
                    <option value="Concept">Concept</option>
                    <option value="Planned">Planned</option>
                    <option value="In Development">In Development</option>
                    <option value="Released">Released</option>
                  </select>
                  <input
                    value={form.blurb}
                    onChange={(e) => setForm({ ...form, blurb: e.target.value })}
                    placeholder="One-line tagline"
                    className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Description"
                    rows={3}
                    className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={form.engine}
                      onChange={(e) => setForm({ ...form, engine: e.target.value })}
                      placeholder="Engine"
                      className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                    <input
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="Price"
                      className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => saveEdit(game.id)} className="flex-1 bg-brand text-black font-semibold rounded py-2 text-sm">
                      Save
                    </button>
                    <button onClick={cancelEdit} className="flex-1 border border-neutral-700 rounded py-2 text-sm hover:border-neutral-500">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{game.title}</h3>
                    <span className={`text-xs rounded-full px-2 py-1 shrink-0 ${STATUS_STYLES[game.status]}`}>
                      {game.status}
                    </span>
                  </div>
                  {game.blurb && <p className="text-brand text-sm mb-2">{game.blurb}</p>}
                  {game.description && <p className="text-sm text-neutral-300 mb-3">{game.description}</p>}
                  <div className="flex gap-4 text-xs text-text-secondary">
                    {game.engine && <span>{game.engine}</span>}
                    {game.price && <span>{game.price}</span>}
                  </div>

                  {editMode && (
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border-default">
                      <button onClick={() => moveGame(index, -1)} className="text-xs text-text-secondary hover:text-foreground">↑</button>
                      <button onClick={() => moveGame(index, 1)} className="text-xs text-text-secondary hover:text-foreground">↓</button>
                      <button onClick={() => startEdit(game)} className="text-xs text-brand hover:underline ml-auto">Edit</button>
                      <button onClick={() => deleteGame(game.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {editMode && !addingNew && (
            <button
              onClick={startAdd}
              className="border border-dashed border-neutral-700 hover:border-brand rounded-lg p-5 flex items-center justify-center text-text-secondary hover:text-brand transition-colors min-h-[140px]"
            >
              + Add title
            </button>
          )}

          {addingNew && (
            <div className="border border-border-default rounded-lg p-5 bg-elevated/40 space-y-3">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Title"
                autoFocus
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Game['status'] })}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
              >
                <option value="Concept">Concept</option>
                <option value="Planned">Planned</option>
                <option value="In Development">In Development</option>
                <option value="Released">Released</option>
              </select>
              <input
                value={form.blurb}
                onChange={(e) => setForm({ ...form, blurb: e.target.value })}
                placeholder="One-line tagline"
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.engine}
                  onChange={(e) => setForm({ ...form, engine: e.target.value })}
                  placeholder="Engine"
                  className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Price"
                  className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveNew} className="flex-1 bg-brand text-black font-semibold rounded py-2 text-sm">
                  Add
                </button>
                <button onClick={cancelEdit} className="flex-1 border border-neutral-700 rounded py-2 text-sm hover:border-neutral-500">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}