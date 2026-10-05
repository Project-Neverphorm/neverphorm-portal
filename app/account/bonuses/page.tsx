import { Card, EmptyState, TabHeader } from '@/components/account/AccountUI'

const tiers = [
  {
    name: 'Below projection',
    detail:
      "No bonus for that launch. The PLB is our minimum target, and missing it means the studio can't afford a fair bonus for everyone.",
  },
  {
    name: 'PLB · Projected Launch Bonus',
    detail: 'The launch meets its projection. Everyone receives the base bonus.',
  },
  {
    name: 'OLP · Outperformed-Launch-Projection',
    detail: 'The launch beats its projection. Everyone receives the upgraded bonus.',
  },
]

// TODO: load from Supabase (title, release date, result, bonus amount)
const launches: {
  title: string
  released: string
  result: 'Missed' | 'PLB' | 'OLP'
  bonus: string
}[] = []

export default function BonusesPage() {
  return (
    <>
      <TabHeader
        title="Bonuses"
        description="Launch bonuses are on top of regular pay and are judged on each game's first 30 days."
      />

      <Card title="Bonus tiers">
        <div className="space-y-3">
          {tiers.map((tier) => (
            <div key={tier.name}>
              <p className="font-semibold">{tier.name}</p>
              <p className="text-text-secondary">{tier.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-text-secondary">
          Bonuses are paid after launch revenue arrives from the platforms,
          usually around 60 days after release.
        </p>
      </Card>

      <Card title="Launch results">
        {launches.length === 0 ? (
          <EmptyState message="No launches yet. Each release's result and bonus will be listed here." />
        ) : (
          <table className="w-full text-left">
            <thead className="text-text-secondary">
              <tr>
                <th className="py-2 font-normal">Title</th>
                <th className="py-2 font-normal">Released</th>
                <th className="py-2 font-normal">Result</th>
                <th className="py-2 font-normal">Bonus</th>
              </tr>
            </thead>
            <tbody>
              {launches.map((l) => (
                <tr key={l.title} className="border-t border-border-default">
                  <td className="py-2">{l.title}</td>
                  <td className="py-2">{l.released}</td>
                  <td className="py-2">{l.result}</td>
                  <td className="py-2">{l.bonus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  )
}