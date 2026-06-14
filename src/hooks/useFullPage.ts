import { useEffect, useRef, useState, useCallback } from 'react';

export function useFullPage(totalSections: number, scrollingSpeed = 700) {
  const [current, setCurrent] = useState(0);
  const isScrolling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const smoothScrollTo = useCallback((target: number, duration = scrollingSpeed) => {
    const el = containerRef.current;
    if (!el) return;

    const start = el.scrollTop;
    const change = target - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const ease =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      el.scrollTop = start + change * ease;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isScrolling.current = false;
      }
    };

    requestAnimationFrame(animate);
  }, [scrollingSpeed]);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= totalSections || isScrolling.current) return;

    isScrolling.current = true;
    setCurrent(index);
    smoothScrollTo(index * window.innerHeight);
  }, [totalSections, smoothScrollTo]);

  useEffect(() => {
    let touchStart = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling.current) return;
      if (Math.abs(e.deltaY) < 30) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const next = Math.min(Math.max(current + dir, 0), totalSections - 1);

      if (next === current) return;

      isScrolling.current = true;
      setCurrent(next);
      smoothScrollTo(next * window.innerHeight);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling.current) return;

      const delta = touchStart - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 40) return;

      const dir = delta > 0 ? 1 : -1;
      const next = Math.min(Math.max(current + dir, 0), totalSections - 1);

      if (next === current) return;

      isScrolling.current = true;
      setCurrent(next);
      smoothScrollTo(next * window.innerHeight);
    };

    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [current, totalSections, smoothScrollTo]);

  return { current, goTo, containerRef };
}