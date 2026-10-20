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

type Scope = 'Tiny' | 'Small' | 'Medium' | 'Big' | 'Massive'

type Game = {
  id: string
  order_index: number
  in_lineup: boolean
  title: string
  status: 'Released' | 'In Development' | 'Planned' | 'Concept' | 'Paused'
  scope: Scope | null
  blurb: string | null
  description: string | null
  engine: string | null
  price: string | null
  platforms: string | null
}

type FormState = {
  title: string
  status: Game['status']
  scope: Scope | ''
  blurb: string
  description: string
  engine: string
  price: string
  platforms: string
}

type Section = 'lineup' | 'catalog'

const STATUS_STYLES: Record<Game['status'], string> = {
  'Released': 'bg-green-500/15 text-green-400',
  'In Development': 'bg-brand/15 text-brand',
  'Planned': 'bg-neutral-500/15 text-neutral-300',
  'Concept': 'bg-neutral-700/40 text-neutral-500',
  'Paused': 'bg-purple-500/15 text-purple-400',
}

const STATUSES: Game['status'][] = ['Concept', 'Planned', 'In Development', 'Released', 'Paused']

const SCOPES: Scope[] = ['Tiny', 'Small', 'Medium', 'Big', 'Massive']

const SCOPE_STYLES: Record<Scope, string> = {
  'Tiny': 'border-neutral-600 text-neutral-400',
  'Small': 'border-sky-500/50 text-sky-300',
  'Medium': 'border-amber-500/50 text-amber-300',
  'Big': 'border-orange-500/50 text-orange-300',
  'Massive': 'border-red-500/50 text-red-300',
}

const emptyForm: FormState = {
  title: '',
  status: 'Planned',
  scope: '',
  blurb: '',
  description: '',
  engine: '',
  price: '',
  platforms: '',
}

const inputClass =
  'w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand'

const gridClass = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'

const cardClass = 'border border-border-default rounded-lg p-5 bg-elevated/40'

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
      <div className="grid grid-cols-2 gap-3">
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as Game['status'] })}
          className={inputClass}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={form.scope}
          onChange={(e) => setForm({ ...form, scope: e.target.value as Scope | '' })}
          className={inputClass}
        >
          <option value="">Scope...</option>
          {SCOPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
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
  onToggleSection,
  overlay = false,
}: {
  game: Game
  position?: number
  editMode: boolean
  handle?: React.ReactNode
  onEdit?: () => void
  onDelete?: () => void
  onToggleSection?: () => void
  overlay?: boolean
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {editMode && handle}
          {position !== undefined && (
            <span className="text-xs font-semibold text-brand">#{position}</span>
          )}
          <h3 className="font-semibold text-lg truncate">{game.title}</h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {game.scope && (
            <span className={`text-xs rounded-full px-2 py-0.5 border ${SCOPE_STYLES[game.scope]}`}>
              {game.scope}
            </span>
          )}
          <span className={`text-xs rounded-full px-2 py-1 ${STATUS_STYLES[game.status]}`}>
            {game.status}
          </span>
        </div>
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
          <button onClick={onToggleSection} className="text-xs text-text-secondary hover:text-foreground">
            {game.in_lineup ? 'Move to catalog' : 'Move to production order'}
          </button>
          <button onClick={onEdit} className="text-xs text-brand hover:underline ml-auto">Edit</button>
          <button onClick={onDelete} className="text-xs text-red-400 hover:underline">Delete</button>
        </div>
      )}
    </>
  )
}

type CardProps = {
  game: Game
  editMode: boolean
  isEditingThis: boolean
  form: FormState
  setForm: (f: FormState) => void
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
  onToggleSection: () => void
}

function SortableGameCard({ position, ...props }: CardProps & { position: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.game.id, disabled: !props.editMode || props.isEditingThis })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const handle = (
    <button
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Drag to reorder ${props.game.title}`}
      className="cursor-grab active:cursor-grabbing touch-none rounded px-1 text-lg leading-none text-text-secondary hover:text-foreground hover:bg-neutral-800"
    >
      ⠿
    </button>
  )

  return (
    <div ref={setNodeRef} style={style} className={`${cardClass} ${isDragging ? 'opacity-30' : ''}`}>
      {props.isEditingThis ? (
        <GameForm
          form={props.form}
          setForm={props.setForm}
          onSave={props.onSaveEdit}
          onCancel={props.onCancelEdit}
          saveLabel="Save"
        />
      ) : (
        <GameView
          game={props.game}
          position={position}
          editMode={props.editMode}
          handle={handle}
          onEdit={props.onStartEdit}
          onDelete={props.onDelete}
          onToggleSection={props.onToggleSection}
        />
      )}
    </div>
  )
}

function StaticGameCard(props: CardProps) {
  return (
    <div className={cardClass}>
      {props.isEditingThis ? (
        <GameForm
          form={props.form}
          setForm={props.setForm}
          onSave={props.onSaveEdit}
          onCancel={props.onCancelEdit}
          saveLabel="Save"
        />
      ) : (
        <GameView
          game={props.game}
          editMode={props.editMode}
          onEdit={props.onStartEdit}
          onDelete={props.onDelete}
          onToggleSection={props.onToggleSection}
        />
      )}
    </div>
  )
}

function SectionHeader({ title, subtitle, count }: { title: string; subtitle: string; count: number }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4 pb-2 border-b border-border-default">
      <div>
        <h2 className="text-lg font-bold">
          {title} <span className="text-text-secondary font-normal text-sm">({count})</span>
        </h2>
        <p className="text-text-secondary text-xs mt-0.5">{subtitle}</p>
      </div>
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
  const [addingTo, setAddingTo] = useState<Section | null>(null)
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

  const lineup = games
    .filter((g) => g.in_lineup)
    .sort((a, b) => a.order_index - b.order_index)

  const catalog = games
    .filter((g) => !g.in_lineup)
    .sort((a, b) => a.title.localeCompare(b.title))

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
    setAddingTo(null)
    setForm({
      title: game.title,
      status: game.status,
      scope: game.scope ?? '',
      blurb: game.blurb ?? '',
      description: game.description ?? '',
      engine: game.engine ?? '',
      price: game.price ?? '',
      platforms: game.platforms ?? '',
    })
  }

  const startAdd = (section: Section) => {
    setAddingTo(section)
    setEditingId(null)
    setForm(emptyForm)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setAddingTo(null)
    setForm(emptyForm)
  }

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from('pipeline_games')
      .update({
        title: form.title,
        status: form.status,
        scope: form.scope || null,
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
    if (!form.title.trim() || !addingTo) return
    const toLineup = addingTo === 'lineup'

    const { error } = await supabase.from('pipeline_games').insert({
      title: form.title.trim(),
      status: form.status,
      scope: form.scope || null,
      blurb: form.blurb,
      description: form.description,
      engine: form.engine,
      price: form.price,
      platforms: form.platforms,
      in_lineup: toLineup,
      order_index: toLineup ? lineup.length : 0,
    })

    if (error) {
      alert(`Failed to add: ${error.message}`)
      return
    }
    cancelEdit()
    loadGames()
  }

  const renumberLineup = async (ids: string[]) => {
    return supabase.rpc('reorder_pipeline_games', { ids })
  }

  const toggleSection = async (game: Game) => {
    if (game.in_lineup) {
      const { error } = await supabase
        .from('pipeline_games')
        .update({ in_lineup: false, order_index: 0 })
        .eq('id', game.id)
      if (error) {
        alert(`Failed to move: ${error.message}`)
        return
      }
      await renumberLineup(lineup.filter((g) => g.id !== game.id).map((g) => g.id))
    } else {
      const { error } = await supabase
        .from('pipeline_games')
        .update({ in_lineup: true, order_index: lineup.length })
        .eq('id', game.id)
      if (error) {
        alert(`Failed to move: ${error.message}`)
        return
      }
    }
    loadGames()
  }

  const deleteGame = async (game: Game) => {
    const confirmed = window.confirm(`Remove ${game.title} from the pipeline?`)
    if (!confirmed) return

    const { error } = await supabase.from('pipeline_games').delete().eq('id', game.id)
    if (error) {
      alert(`Failed to delete: ${error.message}`)
      return
    }

    if (game.in_lineup) {
      await renumberLineup(lineup.filter((g) => g.id !== game.id).map((g) => g.id))
    }
    loadGames()
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const previous = games
    const oldIndex = lineup.findIndex((g) => g.id === active.id)
    const newIndex = lineup.findIndex((g) => g.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const nextLineup = arrayMove(lineup, oldIndex, newIndex).map((g, i) => ({ ...g, order_index: i }))
    setGames([...nextLineup, ...games.filter((g) => !g.in_lineup)])

    const thisSave = ++saveCounter.current
    setSavingOrder(true)
    setOrderError(null)

    const { error } = await renumberLineup(nextLineup.map((g) => g.id))

    if (thisSave !== saveCounter.current) return
    setSavingOrder(false)

    if (error) {
      console.error('Failed to save order:', error)
      setGames(previous)
      setOrderError('Could not save the new order, so it was reverted. Try again.')
    }
  }

  const cardProps = (game: Game): CardProps => ({
    game,
    editMode,
    isEditingThis: editingId === game.id,
    form,
    setForm,
    onStartEdit: () => startEdit(game),
    onSaveEdit: () => saveEdit(game.id),
    onCancelEdit: cancelEdit,
    onDelete: () => deleteGame(game),
    onToggleSection: () => toggleSection(game),
  })

  const addSlot = (section: Section) =>
    editMode && (
      addingTo === section ? (
        <div className={cardClass}>
          <GameForm
            form={form}
            setForm={setForm}
            onSave={saveNew}
            onCancel={cancelEdit}
            saveLabel="Add"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => startAdd(section)}
          className="border border-dashed border-neutral-700 hover:border-brand rounded-lg p-5 flex items-center justify-center text-text-secondary hover:text-brand transition-colors min-h-[140px]"
        >
          {section === 'lineup' ? '+ Add to production order' : '+ Add to catalog'}
        </button>
      )
    )

  const activeGame = lineup.find((g) => g.id === activeId) ?? null
  const activePosition = activeGame ? lineup.indexOf(activeGame) + 1 : 0

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
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Pipeline</h1>
            <p className="text-text-secondary text-sm mt-1 max-w-3xl">
              The full catalog. This is the long game. Some games did not make this list while
              realistically weighing out survivability and weakness of idea/concept.
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

        {/* 👉 PASTE #2 HERE */}
        <aside className="md:hidden mb-8 border border-brand/40 rounded-lg p-5 bg-elevated/40">
          <h2 className="text-xs uppercase tracking-wide text-brand mb-2">Announcements</h2>
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none" aria-hidden="true">🔒</span>
            <p className="text-sm text-neutral-300">Will not reveal until after our 3rd game.</p>
          </div>
        </aside>

        {/* Production Order */}
        <section className="mb-12">
          <SectionHeader
            title="Production Order"
            subtitle="Locked in. These ship in this order."
            count={lineup.length}
          />

          {editMode && (
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-text-secondary">Drag the ⠿ handle to reorder. Changes save automatically.</span>
              <span className={savingOrder ? 'text-brand' : 'text-text-secondary'}>
                {savingOrder ? 'Saving...' : 'Saved'}
              </span>
            </div>
          )}
          {orderError && <p className="mb-3 text-xs text-red-400">{orderError}</p>}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={lineup.map((g) => g.id)} strategy={rectSortingStrategy}>
              <div className={gridClass}>
                {lineup.map((game, index) => (
                  <SortableGameCard key={game.id} position={index + 1} {...cardProps(game)} />
                ))}
                {addSlot('lineup')}
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

          {lineup.length === 0 && !editMode && (
            <p className="text-sm text-text-secondary">Nothing locked in yet.</p>
          )}
        </section>

        {/* Catalog */}
        <section>
          <SectionHeader
            title="Catalog"
            subtitle="The long game. Not in any particular order."
            count={catalog.length}
          />
          <div className={gridClass}>
            {catalog.map((game) => (
              <StaticGameCard key={game.id} {...cardProps(game)} />
            ))}
            {addSlot('catalog')}
          </div>

          {catalog.length === 0 && !editMode && (
            <p className="text-sm text-text-secondary">No other titles yet.</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}