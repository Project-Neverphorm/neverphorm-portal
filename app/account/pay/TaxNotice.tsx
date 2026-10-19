

// components/pay/TaxNotice.tsx
type TaxNoticeProps = {
    payoutAmount: number;   // this person's payout for the month
    setAsideRate?: number;  // defaults to 30%
  };
  
  const formatUSD = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  
  export default function TaxNotice({
    payoutAmount,
    setAsideRate = 0.3,
  }: TaxNoticeProps) {
    const setAside = Math.round(payoutAmount * setAsideRate);
    const percent = Math.round(setAsideRate * 100);
    const hasPayout = payoutAmount > 0;
  
    return (
      <div
        role="alert"
        className="rounded-2xl border-2 border-orange-500 bg-orange-500/10 p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-black"
          >
            !
          </span>
  
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-orange-400">
              Set money aside for taxes
            </h3>
  
            <p className="text-sm leading-relaxed text-zinc-200">
              Your payouts are 1099 contractor income, so{" "}
              <span className="font-semibold text-white">
                no taxes are taken out
              </span>
              . You owe self-employment tax plus income tax on everything you
              earn from the studio. Set aside about{" "}
              <span className="font-semibold text-white">{percent}%</span> of
              every payout.
            </p>
  
            {hasPayout ? (
              <div className="rounded-xl bg-black/40 p-4">
                <p className="text-sm text-zinc-300">
                  This month you earned{" "}
                  <span className="font-semibold text-white">
                    {formatUSD(payoutAmount)}
                  </span>
                  .
                </p>
                <p className="mt-1 text-base font-semibold text-orange-300">
                  Set aside {formatUSD(setAside)} for your taxes.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-black/40 p-4">
                <p className="text-sm text-zinc-300">
                  Example: a {formatUSD(10360)} payout means setting aside{" "}
                  <span className="font-semibold text-orange-300">
                    {formatUSD(Math.round(10360 * setAsideRate))}
                  </span>
                  .
                </p>
              </div>
            )}
  
            <p className="text-xs text-zinc-400">
              This is a rule of thumb, not tax advice. Check with a tax
              professional about your situation and whether you need to make
              quarterly estimated payments. This is an example of what we all will need to do.
              Realistically, we plan on looking into CPAs (Certified Professional Account) when the time comes.
            </p>
          </div>
        </div>
      </div>
    );
  }