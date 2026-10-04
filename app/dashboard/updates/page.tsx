import Navbar from '@/components/Navbar'
import { UPDATES } from '@/lib/updates'

export default function UpdatesPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">Updates</h1>
        <p className="text-sm text-text-secondary mb-8">
          What&apos;s new and changed in the portal.
        </p>

        <div className="space-y-4">
          {UPDATES.map((update) => (
            <div
              key={`${update.date}-${update.title}`}
              className="bg-elevated border border-border-default rounded-lg p-5"
            >
              <p className="text-xs text-text-secondary mb-1">
                {new Date(`${update.date}T00:00:00`).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <h2 className="font-semibold mb-3">{update.title}</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
                {update.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}