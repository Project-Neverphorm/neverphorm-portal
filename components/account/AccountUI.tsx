// Shared building blocks so every account tab looks the same.

export function TabHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      <p className="text-text-secondary text-sm">{description}</p>
    </header>
  )
}

export function Card({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-4 bg-elevated border border-border-default rounded-lg p-5">
      {title && (
        <h2 className="text-sm uppercase tracking-wide text-text-secondary mb-4">
          {title}
        </h2>
      )}
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  )
}

export function InfoRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border-default py-2 last:border-0 sm:flex-row sm:justify-between">
      <span className="text-text-secondary">{label}</span>
      <span>{value}</span>
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
    <label className="mt-2 flex items-center gap-2 text-sm">
      <input type="checkbox" className="h-4 w-4 accent-brand" />
      {label}
    </label>
  )
}