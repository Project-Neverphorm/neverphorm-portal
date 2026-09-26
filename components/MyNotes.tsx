'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MyNotes({ userId }: { userId: string }) {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase
      .from('notes')
      .select('content')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => setContent(data?.content ?? ''))
  }, [userId])

  const handleChange = (value: string) => {
    setContent(value)
    setStatus('saving')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const { error } = await supabase.from('notes').upsert({
        user_id: userId,
        content: value,
        updated_at: new Date().toISOString(),
      })
      setStatus(error ? 'error' : 'saved')
    }, 800)
  }

  const statusText = { idle: '', saving: 'Saving...', saved: 'Saved', error: "Couldn't save" }[status]

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm uppercase tracking-wide text-text-secondary">My Notes</h2>
        <span className={`text-xs ${status === 'error' ? 'text-red-400' : 'text-text-secondary'}`}>{statusText}</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Reminders, where you left off, anything..."
        className="w-full min-h-48 bg-elevated/40 border border-border-default rounded-lg p-4 text-sm outline-none focus:border-brand resize-y"
      />
    </div>
  )
}