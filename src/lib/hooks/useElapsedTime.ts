"use client";

import { useEffect, useState } from "react";

function calculateElapsed(startTime: number) {
  const now = new Date();
  const start = new Date(startTime);

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months--;

    const previousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    ).getDate();

    days += previousMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }


  const diff = now.getTime() - start.getTime();


  const totalSeconds = Math.floor(diff / 1000);

  const seconds = totalSeconds % 60;

  const totalMinutes = Math.floor(totalSeconds / 60);

  const minutes = totalMinutes % 60;

  const totalHours = Math.floor(totalMinutes / 60);

  const hours = totalHours % 24;


  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
  };
}


export function useElapsedTime(startTime?: number | Date) {

  const [elapsed, setElapsed] = useState(() =>
    calculateElapsed(
      startTime instanceof Date
        ? startTime.getTime()
        : startTime ?? Date.now()
    )
  );


  useEffect(() => {

    const start =
      startTime instanceof Date
        ? startTime.getTime()
        : startTime ?? Date.now();


    const interval = setInterval(() => {

      setElapsed(
        calculateElapsed(start)
      );

    }, 1000);


    return () =>
      clearInterval(interval);


  }, [startTime]);


  return elapsed;
}