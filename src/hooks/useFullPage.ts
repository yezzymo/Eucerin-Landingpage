import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives the section-dot navigation on top of native CSS scroll-snap.
 *
 * There is deliberately no wheel/touch hijacking here anymore — the browser's
 * own scroll-snap engine handles snapping between sections, and it naturally
 * lets you keep scrolling *inside* a section if that section is taller than
 * the viewport (e.g. the scroll-driven video runway). We only listen to the
 * native `scroll` event to figure out which section is currently active, and
 * use `scrollIntoView` to jump to a section when a nav dot is clicked.
 */
export function useFullPage(totalSections: number) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (index: number) => {
      const el = containerRef.current;
      if (!el || index < 0 || index >= totalSections) return;

      const target = el.children[index] as HTMLElement | undefined;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [totalSections],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let frame: number | undefined;
    let lastTouchY = 0;

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

    const handleScroll = () => {
      if (frame === undefined) {
        frame = requestAnimationFrame(updateCurrentSection);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? 0;
    };

    const preventBottomOverscroll = (event: TouchEvent) => {
      const currentTouchY = event.touches[0]?.clientY;
      if (currentTouchY === undefined) return;

      const isAtBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      const isTryingToScrollFurtherDown = currentTouchY < lastTouchY;

      if (isAtBottom && isTryingToScrollFurtherDown) {
        event.preventDefault();
      }

      lastTouchY = currentTouchY;
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", preventBottomOverscroll, {
      passive: false,
    });
    updateCurrentSection();

    return () => {
      el.removeEventListener("scroll", handleScroll);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", preventBottomOverscroll);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [totalSections]);

  return { current, goTo, containerRef };
}
