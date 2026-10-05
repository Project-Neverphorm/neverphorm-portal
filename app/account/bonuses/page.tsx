import { Badge, Card, ExampleTag, InfoRow, StatTile, Table, TabHeader } from '@/components/account/AccountUI'
import { AwardIcon, ClockIcon, StarIcon, TrendingIcon } from '@/components/account/icons'

const tiers = [
  {
    name: 'Below projection',
    short: 'No bonus',
    tone: 'border-t-red-500',
    detail:
      "The PLB is our minimum target. Missing it means the studio can't afford a fair bonus for everyone, so no bonus is paid for that launch.",
  },
  {
    name: 'PLB',
    short: 'Projected Launch Bonus',
    tone: 'border-t-brand',
    detail: 'The launch meets its projection. Everyone on the title receives the base bonus.',
  },
  {
    name: 'OLP',
    short: 'Outperformed-Launch-Projection',
    tone: 'border-t-green-500',
    detail: 'The launch beats its projection. Everyone on the title receives the upgraded bonus.',
  },
]

const steps = [
  ['Projection set', 'Before launch, the studio sets a 30-day net revenue projection.'],
  ['30-day window', 'Net revenue from the first 30 days after release is tracked.'],
  ['Result decided', 'Below projection, PLB, or OLP based on that number.'],
  ['Bonus paid', 'Around 60 days after release, once platform funds arrive.'],
]

export default function BonusesPage() {
  return (
    <div className="space-y-4">
      <TabHeader
        title="Bonuses"
        description="Launch bonuses are paid on top of regular pay and are judged on each game's first 30 days."
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Bonuses earned" value="$0.00" hint="All time" icon={<AwardIcon />} />
        <StatTile label="Launches" value="0" hint="Titles you worked on" icon={<StarIcon />} />
        <StatTile label="PLB / OLP hits" value="0 / 0" hint="Launch results" icon={<TrendingIcon />} />
        <StatTile label="Next launch" value="Duskline" hint="Date TBD" icon={<ClockIcon />} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className={`bg-elevated border border-border-default border-t-4 ${t.tone} rounded-lg p-5`}>
            <p className="text-xl font-bold">{t.name}</p>
            <p className="text-xs text-text-secondary mb-3">{t.short}</p>
            <p className="text-sm text-text-secondary">{t.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="How it's measured" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map(([t, d], i) => (
              <div key={t} className="rounded-lg bg-background border border-border-default p-4">
                <span className="w-6 h-6 rounded-full bg-brand text-black text-xs font-bold flex items-center justify-center mb-3">
                  {i + 1}
                </span>
                <p className="font-semibold mb-1">{t}</p>
                <p className="text-text-secondary text-xs">{d}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Example launch" action={<ExampleTag />}>
          <InfoRow label="Projection (30 days)" value="$1,000,000 net" />
          <InfoRow label="Actual (30 days)" value="$1,300,000 net" />
          <InfoRow label="Result" value={<Badge tone="success">OLP</Badge>} />
          <InfoRow label="Bonus pool" value="25% of 30-day net" />
          <p className="text-text-secondary text-xs mt-3">
            The pool is split equally among everyone on the title. Bonuses are taxed as regular income.
          </p>
        </Card>
      </div>

      <Card title="Launch results" action={<ExampleTag />}>
        <Table
          headers={['Title', 'Released', 'Projection', '30-day net', 'Result', 'Your bonus']}
          rows={[
            ['Duskline', 'TBD', '—', '—', <Badge key="a">Upcoming</Badge>, '—'],
            ['Example title', 'Example', '$500,000', '$520,000', <Badge key="b" tone="brand">PLB</Badge>, '$0.00'],
            ['Example title', 'Example', '$300,000', '$250,000', <Badge key="c" tone="danger">Missed</Badge>, '$0.00'],
          ]}
        />
      </Card>
    </div>
  )
}