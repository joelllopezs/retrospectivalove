"use client";

import { useEffect, useState } from "react";

export interface ElapsedBreakdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Diferença "de calendário" entre duas datas (não é só ms/segundos convertidos —
 * respeita meses de tamanhos diferentes, ano bissexto, etc.), do jeito que uma
 * pessoa contaria "há quantos anos, meses e dias estamos juntos".
 */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Soma meses a uma data "só dia", arredondando pro último dia do mês quando ele não existe (ex: 31 jan + 1 mês -> 28/29 fev, não "3 de março"). */
function addMonthsClamped(date: Date, months: number): Date {
  const targetIndex = date.getMonth() + months;
  const targetYear = date.getFullYear() + Math.floor(targetIndex / 12);
  const targetMonth = ((targetIndex % 12) + 12) % 12;
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const day = Math.min(date.getDate(), daysInTargetMonth);
  return new Date(targetYear, targetMonth, day);
}

/**
 * Diferença "de calendário" entre duas datas (não é só ms/segundos convertidos —
 * respeita meses de tamanhos diferentes, ano bissexto, etc.), do jeito que uma
 * pessoa contaria "há quantos anos, meses e dias estamos juntos".
 *
 * A matemática de ano/mês/dia é feita só com as datas (meia-noite a meia-noite),
 * separada da matemática de hora/minuto/segundo — evitar misturar as duas foi o
 * que corrigia um bug real com datas como 31 de janeiro (mês sem dia 31 depois).
 */
function diffBreakdown(start: Date, now: Date): ElapsedBreakdown {
  const startDay = startOfDay(start);
  const nowDay = startOfDay(now);

  let totalMonths = (nowDay.getFullYear() - startDay.getFullYear()) * 12 + (nowDay.getMonth() - startDay.getMonth());
  if (nowDay.getDate() < startDay.getDate()) totalMonths -= 1;
  totalMonths = Math.max(totalMonths, 0);

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const anchorDay = addMonthsClamped(startDay, totalMonths);
  let days = Math.round((nowDay.getTime() - anchorDay.getTime()) / 86_400_000);

  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }

  return {
    years,
    months,
    days: Math.max(days, 0),
    hours: Math.max(hours, 0),
    minutes: Math.max(minutes, 0),
    seconds: Math.max(seconds, 0),
  };
}

/** Atualiza a cada segundo. `start === null` (recurso opcional não preenchido) retorna null. */
export function useElapsedTime(start: Date | null): ElapsedBreakdown | null {
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!start) return;
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [start]);

  if (!start) return null;
  return diffBreakdown(start, new Date());
}
