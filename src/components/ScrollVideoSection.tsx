import { useEffect, useRef, useState } from "react";

const VIDEO_SRC =
  "https://9da97esnbfzl3gah.public.blob.vercel-storage.com/ECN_Activia_Moodfilm_2025_SNIPPET1.mp4";
const SCRUB_DISTANCE = 3600;
const MIN_FRAME_STEP = 1 / 30;
const WHEEL_DEAD_ZONE = 6;

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
      const maxStep = Math.max(MIN_FRAME_STEP, video.duration / 180);
      const step =
        Math.sign(difference) * Math.min(Math.abs(difference), maxStep);
      video.currentTime += step;
    };

    const handleSeeked = () => requestNextFrame();

    const handleWheel = (event: WheelEvent) => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;

      // Ignore the tiny deltas produced by resting fingers on a trackpad.
      if (Math.abs(event.deltaY) < WHEEL_DEAD_ZONE) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const atBeginning =
        targetTimeRef.current <= 0.01 && video.currentTime <= 0.03;

      // At the first frame, let an upward scroll return to the previous section.
      if (event.deltaY < 0 && atBeginning) return;

      event.preventDefault();
      event.stopPropagation();

      const secondsPerPixel = video.duration / SCRUB_DISTANCE;
      const requestedTime = Math.min(
        video.duration,
        Math.max(0, targetTimeRef.current + event.deltaY * secondsPerPixel),
      );

      // Keep at most one decoded step queued. This prevents a short trackpad
      // swipe from building momentum that continues playing after the gesture.
      const maxQueuedDistance = Math.max(MIN_FRAME_STEP, video.duration / 180);
      targetTimeRef.current = Math.min(
        video.currentTime + maxQueuedDistance,
        Math.max(video.currentTime - maxQueuedDistance, requestedTime),
      );

      requestNextFrame();
    };

    section.addEventListener("wheel", handleWheel, { passive: false });
    video.addEventListener("seeked", handleSeeked);

    return () => {
      section.removeEventListener("wheel", handleWheel);
      video.removeEventListener("seeked", handleSeeked);
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
  );
}
