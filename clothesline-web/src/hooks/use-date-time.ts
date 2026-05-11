"use client";

import { useState, useEffect } from "react";

export function useDateTime() {
  const [time, setTime] = useState<Date>(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Menghindari hidrasi error dengan memastikan state mounted
    const raf = requestAnimationFrame(() => {
      setIsMounted(true);
    });

    const tick = () => setTime(new Date());
    
    // Inisialisasi detik pertama
    tick();

    // Update setiap detik
    const timer = setInterval(tick, 1000);

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { time, isMounted };
}