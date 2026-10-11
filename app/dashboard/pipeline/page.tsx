'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import type { User } from '@supabase/supabase-js'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Game = {
  id: string
  order_index: number
  title: string
  status: 'Released' | 'In Development' | 'Planned' | 'Concept' | 'Paused'
  blurb: string | null
  description: string | null
  engine: string | null
  price: string | null
  platforms: string | null
}

type FormState = {
  title: string
  status: Game['status']
  blurb: string
  description: string
  engine: string
  price: string
  platforms: string
}

const STATUS_STYLES: Record<Game['status'], string> = {
  'Released': 'bg-green-500/15 text-green-400',
  'In Development': 'bg-brand/15 text-brand',
  'Planned': 'bg-neutral-500/15 text-neutral-300',
  'Concept': 'bg-neutral-700/40 text-neutral-500',
  'Paused': 'bg-purple-500/15 text-purple-400',
}

const STATUSES: Game['status'][] = ['Concept', 'Planned', 'In Development', 'Released', 'Paused']

const emptyForm: FormState = {
  title: '',
  status: 'Planned',
  blurb: '',
  description: '',
  engine: '',
  price: '',
  platforms: '',
}

const inputClass =
  'w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand'

function GameForm({
  form,
  setForm,
  onSave,
  onCancel,
  saveLabel,
  autoFocus = false,
}: {
  form: FormState
  setForm: (f: FormState) => void
  onSave: () => void
  onCancel: () => void
  saveLabel: string
  autoFocus?: boolean
}) {
  return (
    <div className="space-y-3">
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Title"
        autoFocus={autoFocus}
        className={inputClass}
      />
      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value as Game['status'] })}
        className={inputClass}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <input
        value={form.blurb}
        onChange={(e) => setForm({ ...form, blurb: e.target.value })}
        placeholder="One-line tagline"
        className={inputClass}
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
        rows={5}
        className={`${inputClass} resize-y`}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          value={form.engine}
          onChange={(e) => setForm({ ...form, engine: e.target.value })}
          placeholder="Engine"
          className={inputClass}
        />
        <input
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Price"
          className={inputClass}
        />
        <input
          value={form.platforms}
          onChange={(e) => setForm({ ...form, platforms: e.target.value })}
          placeholder="Platforms"
          className={`${inputClass} col-span-2`}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onSave} className="flex-1 bg-brand text-black font-semibold rounded py-2 text-sm">
          {saveLabel}
        </button>
        <button onClick={onCancel} className="flex-1 border border-neutral-700 rounded py-2 text-sm hover:border-neutral-500">
          Cancel
        </button>
      </div>
    </div>
  )
}

function GameView({
  game,
  position,
  editMode,
  handle,
  onEdit,
  onDelete,
  overlay = false,
}: {
  game: Game
  position: number
  editMode: boolean
  handle?: React.ReactNode
  onEdit?: () => void
  onDelete?: () => void
  overlay?: boolean
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {editMode && handle}
          {editMode && <span className="text-xs font-semibold text-text-secondary">#{position}</span>}
          <h3 className="font-semibold text-lg truncate">{game.title}</h3>
        </div>
        <span className={`text-xs rounded-full px-2 py-1 shrink-0 ${STATUS_STYLES[game.status]}`}>
          {game.status}
        </span>
      </div>
      {game.blurb && <p className="text-brand text-sm mb-2">{game.blurb}</p>}
      {game.description && <p className="text-sm text-neutral-300 mb-3">{game.description}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        {game.engine && <span>{game.engine}</span>}
        {game.price && <span>{game.price}</span>}
        {game.platforms && <span>{game.platforms}</span>}
      </div>

      {editMode && !overlay && (
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border-default">
          <button onClick={onEdit} className="text-xs text-brand hover:underline ml-auto">Edit</button>
          <button onClick={onDelete} className="text-xs text-red-400 hover:underline">Delete</button>
        </div>
      )}
    </>
  )
}

function SortableGameCard({
  game,
  position,
  editMode,
  isEditingThis,
  form,
  setForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  game: Game
  position: number
  editMode: boolean
  isEditingThis: boolean
  form: FormState
  setForm: (f: FormState) => void
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id, disabled: !editMode || isEditingThis })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const handle = (
    <button
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Drag to reorder ${game.title}`}
      className="cursor-grab active:cursor-grabbing touch-none rounded px-1 text-lg leading-none text-text-secondary hover:text-foreground hover:bg-neutral-800"
    >
      ⠿
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-border-default rounded-lg p-5 bg-elevated/40 ${isDragging ? 'opacity-30' : ''}`}
    >
      {isEditingThis ? (
        <GameForm
          form={form}
          setForm={setForm}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          saveLabel="Save"
        />
      ) : (
        <GameView
          game={game}
          position={position}
          editMode={editMode}
          handle={handle}
          onEdit={onStartEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}

export default function PipelinePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const router = useRouter()

  const [hasSigned, setHasSigned] = useState<boolean | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const saveCounter = useRef(0)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

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

      const { data: signature } = await supabase
        .from('pipeline_nda_signatures')
        .select('id')
        .eq('user_id', user.id)
        .single()
      setHasSigned(!!signature)

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

  const handleSign = async () => {
    if (!agreed || fullName.trim().length < 2 || !user) return
    setSubmitting(true)

    const { error } = await supabase
      .from('pipeline_nda_signatures')
      .insert({ user_id: user.id, full_name: fullName.trim() })

    if (!error) setHasSigned(true)
    setSubmitting(false)
  }

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
      platforms: game.platforms ?? '',
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
        platforms: form.platforms,
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

    const nextIndex = games.reduce((max, g) => Math.max(max, g.order_index), -1) + 1

    const { error } = await supabase.from('pipeline_games').insert({
      title: form.title.trim(),
      status: form.status,
      blurb: form.blurb,
      description: form.description,
      engine: form.engine,
      price: form.price,
      platforms: form.platforms,
      order_index: nextIndex,
    })

    if (error) {
      alert(`Failed to add: ${error.message}`)
      return
    }
    cancelEdit()
    loadGames()
  }

  const persistOrder = async (next: Game[], previous: Game[]) => {
    const thisSave = ++saveCounter.current
    setSavingOrder(true)
    setOrderError(null)

    const { error } = await supabase.rpc('reorder_pipeline_games', {
      ids: next.map((g) => g.id),
    })

    if (thisSave !== saveCounter.current) return
    setSavingOrder(false)

    if (error) {
      console.error('Failed to save order:', error)
      setGames(previous)
      setOrderError('Could not save the new order, so it was reverted. Try again.')
    }
  }

  const deleteGame = async (id: string) => {
    const confirmed = window.confirm('Remove this title from the pipeline?')
    if (!confirmed) return

    const { error } = await supabase.from('pipeline_games').delete().eq('id', id)
    if (error) {
      alert(`Failed to delete: ${error.message}`)
      return
    }

    const remaining = games.filter((g) => g.id !== id)
    setGames(remaining)
    await supabase.rpc('reorder_pipeline_games', { ids: remaining.map((g) => g.id) })
    loadGames()
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const previous = games
    const oldIndex = games.findIndex((g) => g.id === active.id)
    const newIndex = games.findIndex((g) => g.id === over.id)
    const next = arrayMove(games, oldIndex, newIndex).map((g, i) => ({ ...g, order_index: i }))

    setGames(next)
    persistOrder(next, previous)
  }

  const activeGame = games.find((g) => g.id === activeId) ?? null
  const activePosition = activeGame ? games.indexOf(activeGame) + 1 : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  // Signature Block
  if (hasSigned === false) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-16">
          <h1 className="text-2xl font-bold mb-4">Confidentiality Agreement</h1>
          <div className="border border-border-default rounded-lg p-6 mb-6 text-sm text-neutral-300 space-y-3 bg-elevated/40">
            <p>
              The Pipeline section contains unreleased game concepts, titles, pricing,
              platform plans, and production timelines internal to Project Neverphorm.
            </p>
            <p>
              By signing below, you agree not to share, discuss, or disclose any
              information from the Pipeline page outside the studio, including on social
              media, with press, or with anyone not currently part of the team, unless
              explicitly authorized by studio leadership.
            </p>
          </div>

          <label className="flex items-start gap-2 mb-4 text-sm">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            I have read and agree to keep this information confidential.
          </label>

          <label className="block text-xs text-text-secondary mb-1">
            Type your full name to sign
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="w-full bg-background border border-border-default rounded px-3 py-2 mb-4 text-sm outline-none focus:border-brand"
          />

          <button
            onClick={handleSign}
            disabled={!agreed || fullName.trim().length < 2 || submitting}
            className="bg-brand text-black rounded px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Signing...' : 'Sign and Continue'}
          </button>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full px-6 lg:px-10 2xl:px-16 py-10">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold">Pipeline</h1>
            <p className="text-text-secondary text-sm mt-1 max-w-3xl">
              The full catalog. This is the long game. The first few are in order, the rest are not in order.
              Some games did not make this list while realistically weighing out survivability and weakness of idea/concept.
            </p>
          </div>
          {isOwner && (
            <button
              onClick={() => { setEditMode(!editMode); cancelEdit() }}
              className={`text-sm rounded px-4 py-2 border transition-colors shrink-0 ${
                editMode
                  ? 'bg-brand text-black border-brand font-semibold'
                  : 'border-neutral-700 hover:border-brand'
              }`}
            >
              {editMode ? 'Done editing' : 'Edit pipeline'}
            </button>
          )}
        </div>

        {editMode && (
          <div className="flex items-center justify-between mt-6 text-xs">
            <span className="text-text-secondary">
              Drag the ⠿ handle to reorder. Changes save automatically.
            </span>
            <span className={savingOrder ? 'text-brand' : 'text-text-secondary'}>
              {savingOrder ? 'Saving...' : 'Saved'}
            </span>
          </div>
        )}
        {orderError && <p className="mt-2 text-xs text-red-400">{orderError}</p>}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={games.map((g) => g.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4">
              {games.map((game, index) => (
                <SortableGameCard
                  key={game.id}
                  game={game}
                  position={index + 1}
                  editMode={editMode}
                  isEditingThis={editingId === game.id}
                  form={form}
                  setForm={setForm}
                  onStartEdit={() => startEdit(game)}
                  onSaveEdit={() => saveEdit(game.id)}
                  onCancelEdit={cancelEdit}
                  onDelete={() => deleteGame(game.id)}
                />
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
                <div className="border border-border-default rounded-lg p-5 bg-elevated/40">
                  <GameForm
                    form={form}
                    setForm={setForm}
                    onSave={saveNew}
                    onCancel={cancelEdit}
                    saveLabel="Add"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeGame ? (
              <div className="border border-brand rounded-lg p-5 bg-elevated shadow-2xl cursor-grabbing">
                <GameView game={activeGame} position={activePosition} editMode overlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <Footer />
    </div>
  )
}