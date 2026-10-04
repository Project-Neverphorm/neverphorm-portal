import Link from 'next/link'
import { UPDATES } from '@/lib/updates'

export default function Footer() {
  const latest = UPDATES[0]

  return (
    <footer className="border-t border-border-default px-6 py-6 text-xs text-text-secondary">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} Project Neverphorm LLC · Internal use only</p>

        {latest && (
          <Link href="/dashboard/updates" className="hover:text-brand transition-colors">
            Last updated{' '}
            {new Date(`${latest.date}T00:00:00`).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {' · '}See what&apos;s new →
          </Link>
        )}
      </div>
    </footer>
  )
}