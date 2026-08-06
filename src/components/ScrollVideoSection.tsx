import { useEffect, useRef, useState } from "react";

const VIDEO_SRC =
  "https://9da97esnbfzl3gah.public.blob.vercel-storage.com/eucerin-mood-film-scroll.mp4";
const MIN_SEEK_DIFFERENCE = 1 / 120;

export default function ScrollVideoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number>();
  const isAtPageEndRef = useRef(false);
  const [videoStatus, setVideoStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [isAtPageEnd, setIsAtPageEnd] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;

    if (!section || !video) return;

    const scrollContainer = section.closest<HTMLElement>(".fp-container");
    if (!scrollContainer) return;

    const needsTouchMediaUnlock =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const updateVideoFromScroll = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;

      const scrollRange = Math.max(
        1,
        section.offsetHeight - scrollContainer.clientHeight,
      );
      const progress = Math.min(
        1,
        Math.max(
          0,
          (scrollContainer.scrollTop - section.offsetTop) / scrollRange,
        ),
      );
      const requestedTime = progress * video.duration;

      if (Math.abs(requestedTime - video.currentTime) > MIN_SEEK_DIFFERENCE) {
        video.currentTime = requestedTime;
      }
    };

    const requestVideoUpdate = () => {
      if (animationFrameRef.current !== undefined) return;

      animationFrameRef.current = requestAnimationFrame(() => {
        animationFrameRef.current = undefined;
        updateVideoFromScroll();
      });
    };

    const cancelVideoUpdate = () => {
      if (animationFrameRef.current === undefined) return;
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    };

    // Page-end UI follows the actual container position, including native
    // inertia. Video seeking is intentionally handled by the user-input
    // listeners below so it stops the instant that input ends.
    const updatePageEndState = () => {
      const hasReachedPageEnd =
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 1;
      if (hasReachedPageEnd !== isAtPageEndRef.current) {
        isAtPageEndRef.current = hasReachedPageEnd;
        setIsAtPageEnd(hasReachedPageEnd);
      }
    };

    let videoUnlocked = false;
    const unlockVideoForIos = () => {
      if (videoUnlocked) return;
      videoUnlocked = true;

      // A user gesture unlocks frame seeking in iOS Safari, including when
      // autoplay is disabled by Low Power Mode.
      void video
        .play()
        .then(() => video.pause())
        .catch(() => {
          videoUnlocked = false;
        });
    };

    let isTouchScrolling = false;
    let isKeyboardScrolling = false;
    const scrollKeys = new Set([
      "ArrowDown",
      "ArrowUp",
      "End",
      "Home",
      "PageDown",
      "PageUp",
      " ",
    ]);

    const handleTouchStart = () => {
      isTouchScrolling = true;
      if (needsTouchMediaUnlock) unlockVideoForIos();
    };

    const stopTouchScrolling = () => {
      isTouchScrolling = false;
      cancelVideoUpdate();
      video.pause();
    };

    const handleWindowBlur = () => {
      isTouchScrolling = false;
      isKeyboardScrolling = false;
      cancelVideoUpdate();
      video.pause();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!scrollKeys.has(event.key)) return;
      const target = event.target;
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.matches("button, input, select, textarea")))
      ) {
        return;
      }
      isKeyboardScrolling = true;
      requestVideoUpdate();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!scrollKeys.has(event.key) || !isKeyboardScrolling) return;
      isKeyboardScrolling = false;
      cancelVideoUpdate();
    };

    const handleScroll = () => {
      updatePageEndState();
      if (isTouchScrolling || isKeyboardScrolling) requestVideoUpdate();
    };

    scrollContainer.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    scrollContainer.addEventListener("wheel", requestVideoUpdate, {
      passive: true,
    });
    scrollContainer.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    scrollContainer.addEventListener("touchmove", requestVideoUpdate, {
      passive: true,
    });
    scrollContainer.addEventListener("touchend", stopTouchScrolling, {
      passive: true,
    });
    scrollContainer.addEventListener("touchcancel", stopTouchScrolling, {
      passive: true,
    });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);
    video.addEventListener("loadedmetadata", updateVideoFromScroll);

    // Sync once on mount for reloads and deep links. Subsequent frame changes
    // only come from wheel, touchmove, or an actively held scroll key.
    updatePageEndState();
    updateVideoFromScroll();

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      scrollContainer.removeEventListener("wheel", requestVideoUpdate);
      scrollContainer.removeEventListener("touchstart", handleTouchStart);
      scrollContainer.removeEventListener("touchmove", requestVideoUpdate);
      scrollContainer.removeEventListener("touchend", stopTouchScrolling);
      scrollContainer.removeEventListener("touchcancel", stopTouchScrolling);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
      video.removeEventListener("loadedmetadata", updateVideoFromScroll);
      cancelVideoUpdate();
    };
  }, []);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setVideoStatus("ready");
  };

  const statusText = {
    loading: "LOADING FILM",
    ready: "SCROLL TO EXPLORE",
    error: "FILM UNAVAILABLE",
  }[videoStatus];
  const hintClassName = [
    "scroll-video-hint",
    videoStatus === "ready" ? "is-ready" : "",
    videoStatus === "error" ? "has-error" : "",
    isAtPageEnd ? "is-hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={sectionRef} className="section scroll-video-section">
      <div className="scroll-video-sticky">
        <video
          ref={videoRef}
          className="scroll-video"
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => setVideoStatus("error")}
          aria-label="Eucerin mood film controlled by scrolling"
        />

        <div
          className={hintClassName}
          role="status"
          aria-live="polite"
          aria-hidden={isAtPageEnd}
        >
          <span className="scroll-video-line" />
          <span>{statusText}</span>
        </div>
      </div>
    </div>
  );
}
