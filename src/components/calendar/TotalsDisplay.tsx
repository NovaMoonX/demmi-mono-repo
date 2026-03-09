import { NutrientTotals } from '@/lib/calendar';
import { Card } from '@moondreamsdev/dreamer-ui/components';

function TotalItem({
  label,
  value,
  emoji,
  sub,
}: {
  label: string;
  value: string;
  emoji: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground/70 mt-0.5">{sub}</div>}
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function TotalsCard({ totals, dayCount }: { totals: NutrientTotals; dayCount: number }) {
  const showAvg = dayCount > 1;
  const avg = showAvg
    ? {
        calories: totals.calories / dayCount,
        protein: totals.protein / dayCount,
        carbs: totals.carbs / dayCount,
        fat: totals.fat / dayCount,
        fiber: totals.fiber / dayCount,
        price: totals.price / dayCount,
      }
    : null;

  const avgSub = (formatted: string): string | undefined =>
    avg ? formatted : undefined;

  return (
    <Card className="mb-6 p-5">
      <h2 className="text-base font-semibold text-foreground mb-4">
        {showAvg ? `Totals · ${dayCount}-Day Period` : 'Totals for Period'}
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        <TotalItem label="Calories" value={`${Math.round(totals.calories)} kcal`} emoji="🔥" sub={avgSub(`~${Math.round(avg?.calories ?? 0)} kcal/day`)} />
        <TotalItem label="Price" value={`$${totals.price.toFixed(2)}`} emoji="💰" sub={avgSub(`~$${(avg?.price ?? 0).toFixed(2)}/day`)} />
        <TotalItem label="Protein" value={`${Math.round(totals.protein)}g`} emoji="💪" sub={avgSub(`~${Math.round(avg?.protein ?? 0)}g/day`)} />
        <TotalItem label="Carbs" value={`${Math.round(totals.carbs)}g`} emoji="🌾" sub={avgSub(`~${Math.round(avg?.carbs ?? 0)}g/day`)} />
        <TotalItem label="Fat" value={`${Math.round(totals.fat)}g`} emoji="🥑" sub={avgSub(`~${Math.round(avg?.fat ?? 0)}g/day`)} />
        <TotalItem label="Fiber" value={`${Math.round(totals.fiber)}g`} emoji="🥦" sub={avgSub(`~${Math.round(avg?.fiber ?? 0)}g/day`)} />
      </div>
    </Card>
  );
}