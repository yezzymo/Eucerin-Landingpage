import { useEffect, useRef } from "react";

export default function Section3() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;

    if (!section || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          video.currentTime = 0; // restart every time you enter the section
          video.play().catch(() => {
            // autoplay may be blocked if video is not muted
          });
        } else {
          video.pause();
          video.currentTime = 0;
        }
      },
      {
        threshold: [0, 0.6],
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="section section3">
      <section ref={sectionRef} className="video-section">
        <video
          ref={videoRef}
          src="https://9da97esnbfzl3gah.public.blob.vercel-storage.com/109298.mp4"
          loop
          playsInline
          preload="auto"
          className="section-video"
        />
      </section>
      <span>THE 8TH ELEMENT</span>
    </div>
  );
}
