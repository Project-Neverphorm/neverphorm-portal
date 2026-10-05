import { Badge, Card, ExampleTag, InfoRow, ProgressBar, StatTile, Table, TabHeader } from '@/components/account/AccountUI'
import { ClockIcon, DownloadIcon, FileIcon, TrendingIcon, WalletIcon } from '@/components/account/icons'

// Placeholder numbers (all net). Replace with Supabase data later.
const monthly = [
  { m: 'Jan', v: 0 }, { m: 'Feb', v: 0 }, { m: 'Mar', v: 0 }, { m: 'Apr', v: 0 },
  { m: 'May', v: 8937 }, { m: 'Jun', v: 4290 }, { m: 'Jul', v: 2860 }, { m: 'Aug', v: 2502 },
  { m: 'Sep', v: 2145 }, { m: 'Oct', v: 2145 }, { m: 'Nov', v: 2502 }, { m: 'Dec', v: 2860 },
]
const maxMonth = Math.max(...monthly.map((x) => x.v))

const statements = [
  ['Dec 2026', 'Duskline', '$22,000', '20%', '$4,400.00', 'Example'],
  ['Nov 2026', 'Duskline', '$19,250', '20%', '$3,850.00', 'Example'],
  ['Oct 2026', 'Duskline', '$16,500', '20%', '$3,300.00', 'Example'],
]

const usd = (n: number) => `$${n.toLocaleString()}`

export default function PayPage() {
  return (
    <div className="space-y-4">
      <TabHeader
        title="Pay & Paystubs"
        description="How you're paid, when payouts happen, and your statement history. All figures are net."
        action={<ExampleTag />}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Pay type" value="Rev share" hint="Switches to salary at milestone" icon={<WalletIcon />} />
        <StatTile label="Your share" value="20%" hint="Of net revenue, per title" icon={<TrendingIcon />} />
        <StatTile label="Earned this year" value="$0.00" hint="No releases yet" icon={<FileIcon />} />
        <StatTile label="Next payout" value="—" hint="After first release" icon={<ClockIcon />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Monthly earnings" action={<ExampleTag />} className="lg:col-span-2">
          <div className="flex items-end gap-2 h-48">
            {monthly.map((x) => (
              <div key={x.m} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className="w-full rounded-t bg-brand/80 min-h-[3px]"
                  style={{ height: `${maxMonth ? (x.v / maxMonth) * 100 : 0}%` }}
                  title={usd(x.v)}
                />
                <span className="text-[10px] text-text-secondary">{x.m}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-4">
            Sales are front-loaded: launch month is the biggest, then it settles, with bumps during seasonal sales.
          </p>
        </Card>

        <Card title="How payouts work">
          <ol className="space-y-4">
            {[
              ['Players buy the game', 'Platforms keep their cut and handle refunds.'],
              ['Stores pay the studio', 'About 30 days after each month closes.'],
              ['Your share is calculated', '20% of that month’s net revenue per title.'],
              ['You get paid', 'Monthly, once platform funds arrive.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-brand text-black text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="text-text-secondary text-xs">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Statements & paystubs" className="lg:col-span-2" action={<ExampleTag />}>
          <Table
            headers={['Period', 'Title', 'Net revenue', 'Share', 'Your payout', 'Status', '']}
            rows={statements.map((r) => [
              r[0], r[1], r[2], r[3],
              <span key="p" className="font-semibold">{r[4]}</span>,
              <Badge key="b" tone="warning">{r[5]}</Badge>,
              <button key="d" disabled className="text-text-secondary disabled:opacity-50" title="Coming soon">
                <DownloadIcon className="w-4 h-4" />
              </button>,
            ])}
          />
        </Card>

        <div className="space-y-4">
          <Card title="Payout method">
            <InfoRow label="Method" value="Direct deposit" />
            <InfoRow label="Account" value="Not set up" />
            <InfoRow label="Paid by" value="Project Neverphorm LLC" />
          </Card>

          <Card title="Tax documents">
            <ul className="space-y-2">
              {['W-9 (collaborator info)', '1099-NEC (yearly)', 'W-2 (after salary switch)'].map((d) => (
                <li key={d} className="flex items-center justify-between">
                  <span>{d}</span>
                  <Badge>Not available</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card title="Road to salary" action={<ExampleTag />}>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-5">
            <p className="text-text-secondary">
              The team moves from revenue share to an annual salary once the studio can pay everyone
              reliably, even in a slow year. Both targets below need to be hit.
            </p>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span>Net revenue, last 12 months</span>
                <span className="text-text-secondary">$0 / $340,000</span>
              </div>
              <ProgressBar value={0} max={340000} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span>Studio safety reserve</span>
                <span className="text-text-secondary">$0 / $274,000</span>
              </div>
              <ProgressBar value={0} max={274000} />
            </div>
          </div>
          <div className="space-y-2">
            <InfoRow label="Target starting salary" value="~$72,000 / yr" />
            <InfoRow label="Benefits" value="Vision" />
            <InfoRow label="Launch bonuses" value="PLB & OLP" />
            <InfoRow label="Old titles" value="Keep your share" />
          </div>
        </div>
      </Card>
    </div>
  )
}