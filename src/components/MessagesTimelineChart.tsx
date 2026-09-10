"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimelineEntry } from "@/lib/analytics/timeline";
import { formatMonthLabel } from "@/lib/utils/format";

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0 || !label) return null;

  return (
    <div className="rounded-xl border border-paper/10 bg-ink px-3 py-2 shadow-lg">
      <p className="font-body text-xs text-muted">{formatMonthLabel(label)}</p>
      <p className="font-body text-sm font-semibold text-paper">
        {(payload[0].value ?? 0).toLocaleString("pt-BR")} mensagens
      </p>
    </div>
  );
}

export function MessagesTimelineChart({ series }: { series: TimelineEntry[] }) {
  if (series.length === 0) return null;

  // Poucos meses = pontos crus não ajudam muita coisa, mas ainda vale mostrar a linha.
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="timelineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--rose)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--rose)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--paper)" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonthLabel}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={36}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--gold)", strokeWidth: 1 }} />
          <Area type="monotone" dataKey="count" stroke="var(--gold)" strokeWidth={2} fill="url(#timelineFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
