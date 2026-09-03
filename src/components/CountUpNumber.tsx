"use client";

import { useCountUp } from "@/lib/hooks/useCountUp";
import { formatNumber } from "@/lib/utils/format";

export function CountUpNumber({ value, durationMs }: { value: number; durationMs?: number }) {
  const animated = useCountUp(value, durationMs);
  return <>{formatNumber(animated)}</>;
}
