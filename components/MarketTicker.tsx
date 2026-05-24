import { MarketItem } from "./getMarketData";

type MarketTickerProps = {
  items: MarketItem[];
  source: string;
  updatedAt: string;
};

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const timeFormatter = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
});

const MarketTicker = ({ items, source, updatedAt }: MarketTickerProps) => {
  if (!items.length) return null;

  const updatedLabel = updatedAt ? timeFormatter.format(new Date(updatedAt)) : "";

  return (
    <section className="border-b border-neutral-300 bg-white">
      <div className="ui-sans mx-auto flex max-w-[1180px] flex-col gap-3 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="border border-neutral-950 px-2 py-1 text-xs font-bold uppercase tracking-[0.16em]">
            Piyasa
          </span>
          {items.map((item) => (
            <div key={item.code} className="flex items-baseline gap-2">
              <span className="font-bold">{item.code}/TRY</span>
              <span className="tabular-nums text-neutral-900">{currencyFormatter.format(item.value)}</span>
              {typeof item.change === "number" && (
                <span className={item.change >= 0 ? "text-emerald-700" : "text-red-700"}>
                  %{currencyFormatter.format(item.change)}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="text-xs text-neutral-500">
          {source}
          {updatedLabel ? ` · ${updatedLabel}` : ""}
        </div>
      </div>
    </section>
  );
};

export default MarketTicker;
