// Shared building blocks so every account tab looks the same.

export function TabHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        <p className="text-text-secondary text-sm">{description}</p>
      </div>
      {action}
    </header>
  )
}

export function Card({
  title,
  action,
  className = '',
  children,
}: {
  title?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={`bg-elevated border border-border-default rounded-lg p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-xs uppercase tracking-wide text-text-secondary">{title}</h2>
          )}
          {action}
        </div>
      )}
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  )
}

export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-secondary mb-0.5">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border-default py-2 last:border-0 sm:flex-row sm:justify-between">
      <span className="text-text-secondary">{label}</span>
      <span>{value}</span>
    </div>
  )
}

export function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="bg-elevated border border-border-default rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
        {icon && <span className="text-brand">{icon}</span>}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-text-secondary mt-1">{hint}</p>}
    </div>
  )
}

type Tone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger'

const toneClasses: Record<Tone, string> = {
  brand: 'bg-brand/15 text-brand border-brand/30',
  neutral: 'bg-background text-text-secondary border-border-default',
  success: 'bg-green-500/15 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}

export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="h-2 w-full rounded-full bg-background overflow-hidden">
      <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded border border-dashed border-border-default px-4 py-8 text-center text-sm text-text-secondary">
      {message}
    </div>
  )
}

export function Acknowledge({ label }: { label: string }) {
  // TODO: save to Supabase (user_id, document, version, acknowledged_at)
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" className="h-4 w-4 accent-brand" />
      {label}
    </label>
  )
}

export function Table({
  headers,
  rows,
}: {
  headers: string[]
  rows: React.ReactNode[][]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-text-secondary">
          <tr>
            {headers.map((h) => (
              <th key={h} className="py-2 pr-4 font-normal whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border-default">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 pr-4 whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ExampleTag() {
  return <Badge tone="warning">Example data</Badge>
}