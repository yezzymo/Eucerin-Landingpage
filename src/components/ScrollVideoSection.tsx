import { useEffect, useRef, useState } from "react";

const VIDEO_SRC =
  "https://9da97esnbfzl3gah.public.blob.vercel-storage.com/ECN_Activia_Moodfilm_2025_SNIPPET1.mp4";
const MIN_FRAME_STEP = 1 / 30;

export default function ScrollVideoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;

    if (!section || !video) return;

    const scrollContainer = section.closest<HTMLElement>(".fp-container");
    if (!scrollContainer) return;

    const usesIosMediaEngine =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    let iosSeekFrame: number | undefined;

    const requestIosFrame = () => {
      if (!usesIosMediaEngine || iosSeekFrame !== undefined) return;

      iosSeekFrame = requestAnimationFrame(() => {
        iosSeekFrame = undefined;

        if (
          video.readyState < HTMLMediaElement.HAVE_METADATA ||
          !Number.isFinite(video.duration)
        ) {
          return;
        }

        const requestedTime = Math.min(
          video.duration,
          Math.max(0, targetTimeRef.current),
        );

        if (Math.abs(requestedTime - video.currentTime) > 1 / 120) {
          // WebKit paints paused video frames more reliably when the latest
          // scroll position is assigned directly instead of chaining seeks.
          video.currentTime = requestedTime;
        }
      });
    };

    const requestNextFrame = () => {
      if (animationFrameRef.current !== undefined || video.seeking) return;

      animationFrameRef.current = requestAnimationFrame(updateVideoFrame);
    };

    const updateVideoFrame = () => {
      animationFrameRef.current = undefined;
      const difference = targetTimeRef.current - video.currentTime;

      if (Math.abs(difference) < MIN_FRAME_STEP) {
        return;
      }

      // Move by small steps and wait for each seek to finish. Setting currentTime
      // on every animation frame while a seek is pending makes browsers discard
      // decoded frames, which is the main source of choppy scroll playback.
      const maxStep = Math.max(MIN_FRAME_STEP, video.duration / 90);
      const step =
        Math.sign(difference) * Math.min(Math.abs(difference), maxStep);
      video.currentTime += step;
    };

    const handleSeeked = () => {
      if (usesIosMediaEngine) {
        if (Math.abs(targetTimeRef.current - video.currentTime) > 1 / 60) {
          requestIosFrame();
        }
        return;
      }

      requestNextFrame();
    };

    // The section is a tall "scroll runway" (see .scroll-video-section in
    // fullpage.css). Video progress is simply how far the native scroll
    // position has moved through that runway — no wheel-event hijacking,
    // so it works identically for mouse wheel, trackpad, touch and keyboard,
    // and never fights with the section-to-section scroll-snap.
    const updateFromScroll = () => {
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

      targetTimeRef.current = progress * video.duration;

      if (usesIosMediaEngine) {
        requestIosFrame();
      } else {
        requestNextFrame();
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

    scrollContainer.addEventListener("scroll", updateFromScroll, {
      passive: true,
    });
    scrollContainer.addEventListener("touchstart", unlockVideoForIos, {
      passive: true,
    });
    video.addEventListener("seeked", handleSeeked);

    // Sync immediately in case the page mounts already scrolled into view
    // (e.g. after a reload or a deep link to this section).
    updateFromScroll();

    return () => {
      scrollContainer.removeEventListener("scroll", updateFromScroll);
      scrollContainer.removeEventListener("touchstart", unlockVideoForIos);
      video.removeEventListener("seeked", handleSeeked);
      if (iosSeekFrame !== undefined) {
        cancelAnimationFrame(iosSeekFrame);
      }
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
    targetTimeRef.current = 0;
    setIsReady(true);
  };

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
          aria-label="Eucerin mood film controlled by scrolling"
        />

        <div className={`scroll-video-hint ${isReady ? "is-ready" : ""}`}>
          <span className="scroll-video-line" />
          <span>{isReady ? "SCROLL TO EXPLORE" : "LOADING FILM"}</span>
        </div>
      </div>
    </div>
  );
}
