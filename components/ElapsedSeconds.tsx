"use client";

import { useEffect, useState } from "react";

// Counts up the seconds since it appeared, so a long step visibly isn't stuck.
export default function ElapsedSeconds() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  return <span className="tabular-nums">{seconds}s</span>;
}
