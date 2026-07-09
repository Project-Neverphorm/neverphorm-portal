// lib/usePresence.tsx

'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Keeps the current user's `last_seen` timestamp fresh while they have
 * the app open. Call this once in a layout or top-level page so it runs
 * for the whole session.
 */
export function usePresence() {
  useEffect(() => {
    const updateLastSeen = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id)
    }

    // Update immediately on mount (page load)
    updateLastSeen()

    // Then keep updating every 30 seconds while the tab is open
    const interval = setInterval(updateLastSeen, 30000)

    return () => clearInterval(interval)
  }, [])
}

/**
 * Given a last_seen timestamp, returns whether that user counts as
 * "online" right now. Anyone active within the last 2 minutes counts.
 */
export function isOnline(lastSeen: string | null): boolean {
  if (!lastSeen) return false
  const diffMs = Date.now() - new Date(lastSeen).getTime()
  return diffMs < 2 * 60 * 1000 // 2 minutes
}