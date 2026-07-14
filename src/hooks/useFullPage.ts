import { useCallback, useEffect, useRef, useState } from "react";

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
    const target = containerRef.current?.children[index] as HTMLElement | undefined;
    smoothScrollTo(target?.offsetTop ?? index * (containerRef.current?.clientHeight ?? 0));
  }, [totalSections, smoothScrollTo]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const usesNativeTouchScroll = window.matchMedia(
      "(hover: none), (pointer: coarse), (max-width: 768px)",
    ).matches;

    if (usesNativeTouchScroll) {
      let frame: number | undefined;

      const updateCurrentSection = () => {
        frame = undefined;
        const viewportCenter = el.scrollTop + el.clientHeight / 2;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        Array.from(el.children).forEach((child, index) => {
          const section = child as HTMLElement;
          const top = section.offsetTop;
          const bottom = top + section.offsetHeight;
          const distance =
            viewportCenter < top
              ? top - viewportCenter
              : viewportCenter > bottom
                ? viewportCenter - bottom
                : 0;

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setCurrent((previous) =>
          previous === closestIndex ? previous : closestIndex,
        );
      };

      const handleNativeScroll = () => {
        if (frame === undefined) {
          frame = requestAnimationFrame(updateCurrentSection);
        }
      };

      el.addEventListener("scroll", handleNativeScroll, { passive: true });
      updateCurrentSection();

      return () => {
        el.removeEventListener("scroll", handleNativeScroll);
        if (frame !== undefined) cancelAnimationFrame(frame);
      };
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling.current) return;
      if (Math.abs(e.deltaY) < 30) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const next = Math.min(Math.max(current + dir, 0), totalSections - 1);

      if (next === current) return;

      isScrolling.current = true;
      setCurrent(next);
      const target = el.children[next] as HTMLElement | undefined;
      smoothScrollTo(target?.offsetTop ?? next * el.clientHeight);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [current, totalSections, smoothScrollTo]);

  return { current, goTo, containerRef };
}
