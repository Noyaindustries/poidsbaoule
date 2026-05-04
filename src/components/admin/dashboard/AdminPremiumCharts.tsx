import { useId, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

export type DayTrendPoint = {
  label: string;
  count: number;
  amount: number;
};

const PIE_PALETTE = [
  '#CC2200',
  '#E8600A',
  '#F5A623',
  '#C4482A',
  '#059669',
  '#0D9488',
  '#7C6A58',
];

function formatFcfa(n: number) {
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} F`;
}

type RechartsTooltipPayload<T> = {
  dataKey?: string | number;
  value?: number;
  payload?: T;
};

type WeekTooltipProps = {
  active?: boolean;
  payload?: RechartsTooltipPayload<DayTrendPoint>[];
  label?: string;
};

function WeekTooltip({ active, payload, label }: WeekTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as DayTrendPoint;
  const count = row?.count ?? payload.find((p) => p.dataKey === 'count')?.value ?? 0;
  const amount = row?.amount ?? payload.find((p) => p.dataKey === 'amount')?.value ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'min-w-[200px] rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_24px_80px_-12px_rgba(79,68,55,0.35)]',
        'backdrop-blur-xl backdrop-saturate-150'
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{label}</p>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-stone-500">Commandes</span>
          <span className="font-semibold tabular-nums text-[#CC2200]">{Number(count)}</span>
        </div>
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-stone-500">CA encaissé</span>
          <span className="font-semibold tabular-nums text-emerald-700">{formatFcfa(Number(amount))}</span>
        </div>
      </div>
    </motion.div>
  );
}

type CatRow = { name: string; value: number; fill: string };

type CategoryTooltipProps = {
  active?: boolean;
  payload?: RechartsTooltipPayload<CatRow>[];
};

function CategoryTooltip({ active, payload }: CategoryTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const row = p.payload as CatRow;
  return (
    <div
      className={cn(
        'rounded-xl border border-stone-200/80 bg-white/95 px-3 py-2 text-sm shadow-lg backdrop-blur-md'
      )}
    >
      <span className="font-medium text-stone-800">{row.name}</span>
      <span className="ml-2 tabular-nums text-stone-500">{row.value} pièce(s)</span>
    </div>
  );
}

function buildCategorySlices(products: Product[]): CatRow[] {
  const m = new Map<string, number>();
  for (const p of products) {
    const c = p.category?.trim() || 'Sans catégorie';
    m.set(c, (m.get(c) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([name, value], i) => ({
      name,
      value,
      fill: PIE_PALETTE[i % PIE_PALETTE.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
}

type Props = {
  last7Days: DayTrendPoint[];
  products: Product[];
  className?: string;
};

/**
 * Bloc graphiques admin : vue 7 jours (barres + aire) et donut catalogue.
 */
export function DashboardPremiumCharts({ last7Days, products, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const chartData = useMemo(() => last7Days.map((d) => ({ ...d })), [last7Days]);
  const pieData = useMemo(() => buildCategorySlices(products), [products]);
  const totalPieces = products.length;
  const maxCount = Math.max(1, ...last7Days.map((d) => d.count));
  const maxAmount = Math.max(1, ...last7Days.map((d) => d.amount));

  const barGradId = `pb-bar-${uid}`;
  const areaFillId = `pb-area-${uid}`;

  return (
    <div className={cn('grid grid-cols-1 gap-4 xl:grid-cols-5', className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="xl:col-span-3"
      >
        <Card
          className={cn(
            'relative overflow-hidden rounded-[28px] border border-stone-200/90',
            'bg-gradient-to-br from-white via-[#FFFCF7] to-[#FAF6EF]',
            'shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_32px_64px_-24px_rgba(79,68,55,0.18)]'
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 0%, rgba(204,34,0,0.08) 0%, transparent 45%),
                radial-gradient(circle at 90% 10%, rgba(5,150,105,0.07) 0%, transparent 40%)`,
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <CardHeader className="relative z-10 flex flex-row flex-wrap items-start justify-between gap-3 border-b border-stone-200/60 pb-4 pt-6 px-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#CC2200]/80">
                <Sparkles className="h-3.5 w-3.5" />
                Performance
              </div>
              <CardTitle className="font-serif text-2xl font-bold tracking-tight text-stone-900 md:text-[1.65rem]">
                Activité & encaissements
              </CardTitle>
              <p className="max-w-xl text-sm leading-relaxed text-stone-500">
                Volume de commandes et CA encaissé sur les 7 derniers jours — lecture immédiate des pics et creux.
              </p>
            </div>
            <div className="flex shrink-0 gap-6 rounded-2xl border border-stone-200/80 bg-white/60 px-4 py-3 backdrop-blur-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Commandes</p>
                <p className="text-lg font-semibold tabular-nums text-[#CC2200]">{last7Days.reduce((s, d) => s + d.count, 0)}</p>
              </div>
              <div className="w-px bg-stone-200" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">CA 7 j.</p>
                <p className="text-lg font-semibold tabular-nums text-emerald-700">
                  {formatFcfa(last7Days.reduce((s, d) => s + d.amount, 0))}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 px-2 pb-2 pt-2 sm:px-4 sm:pb-4">
            <div className="h-[min(52vw,320px)] min-h-[240px] w-full sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 4 }} barGap={4}>
                  <defs>
                    <linearGradient id={barGradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F08A5d" stopOpacity={0.95} />
                      <stop offset="55%" stopColor="#E8600A" stopOpacity={0.92} />
                      <stop offset="100%" stopColor="#A31E0A" stopOpacity={0.98} />
                    </linearGradient>
                    <linearGradient id={areaFillId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
                      <stop offset="45%" stopColor="#10b981" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 10"
                    vertical={false}
                    stroke="#E8E4DE"
                    strokeOpacity={0.9}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8B7A66', fontSize: 11, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    width={32}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A33A20', fontSize: 10, fontWeight: 600 }}
                    domain={[0, Math.ceil(maxCount * 1.15)]}
                    allowDecimals={false}
                    tickFormatter={(v) => `${v}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    width={44}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#047857', fontSize: 10, fontWeight: 600 }}
                    domain={[0, Math.ceil(maxAmount * 1.1)]}
                    tickFormatter={(v) => {
                      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                      if (v >= 1000) return `${Math.round(v / 1000)}k`;
                      return `${v}`;
                    }}
                  />
                  <Tooltip
                    content={<WeekTooltip />}
                    cursor={{ fill: 'rgba(204, 34, 0, 0.06)', radius: 12 }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    name="Commandes"
                    fill={`url(#${barGradId})`}
                    radius={[12, 12, 6, 6]}
                    maxBarSize={52}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="amount"
                    name="CA encaissé"
                    stroke="#059669"
                    strokeWidth={2.8}
                    fill={`url(#${areaFillId})`}
                    dot={{
                      r: 5,
                      strokeWidth: 2.5,
                      stroke: '#fff',
                      fill: '#059669',
                    }}
                    activeDot={{
                      r: 7,
                      strokeWidth: 2,
                      stroke: '#fff',
                      fill: '#10b981',
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-6 border-t border-stone-200/50 px-4 py-3 text-[11px] text-stone-500">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-b from-[#F08A5d] to-[#A31E0A]" />
                Commandes / jour
              </span>
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-6 rounded-full bg-emerald-600" />
                CA encaissé (courbe)
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="xl:col-span-2"
      >
        <Card
          className={cn(
            'relative h-full min-h-[280px] overflow-hidden rounded-[28px] border border-stone-200/90',
            'bg-gradient-to-b from-white to-[#FAF9F7]',
            'shadow-[0_32px_64px_-28px_rgba(79,68,55,0.2)]'
          )}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#CC2200]/[0.06] blur-3xl"
            aria-hidden
          />
          <CardHeader className="relative z-10 border-b border-stone-200/60 px-6 pb-4 pt-6">
            <CardTitle className="font-serif text-xl font-bold text-stone-900">Répartition catalogue</CardTitle>
            <p className="text-sm text-stone-500">Produits par catégorie (top 7)</p>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-6 pt-2">
            {pieData.length === 0 ? (
              <p className="py-12 text-center text-sm text-stone-400">Aucun produit à afficher.</p>
            ) : (
              <>
                <div className="relative h-[220px] w-full max-w-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {pieData.map((_, i) => (
                          <filter key={`shadow-${i}`} id={`pie-shadow-${uid}-${i}`} height="200%" width="200%" x="-50%" y="-50%">
                            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#362E24" floodOpacity="0.12" />
                          </filter>
                        ))}
                      </defs>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius="58%"
                        outerRadius="82%"
                        paddingAngle={3}
                        dataKey="value"
                        cornerRadius={8}
                        stroke="#fff"
                        strokeWidth={3}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={entry.fill}
                            style={{ filter: `url(#pie-shadow-${uid}-${index})` }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CategoryTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Total</p>
                    <p className="font-serif text-3xl font-bold tabular-nums text-stone-900">{totalPieces}</p>
                    <p className="text-[10px] font-medium text-stone-500">pièces</p>
                  </div>
                </div>
                <ul className="mt-4 grid w-full max-w-sm grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {pieData.map((row) => (
                    <li
                      key={row.name}
                      className="flex items-center justify-between gap-2 rounded-xl border border-stone-200/60 bg-white/70 px-3 py-2 text-xs backdrop-blur-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: row.fill }} />
                        <span className="truncate font-medium text-stone-800">{row.name}</span>
                      </span>
                      <span className="shrink-0 tabular-nums font-semibold text-stone-600">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
