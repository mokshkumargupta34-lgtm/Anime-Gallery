import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface ScrollScrubHeroProps {
  /** Path to the scrubbing video (served from /public). */
  src: string;
  /** Optional first-frame poster shown until the video can paint. */
  poster?: string;
  /**
   * Scroll distance allotted to the intro, in viewport heights.
   * Bigger = the video advances more slowly as you scroll.
   */
  scrollVh?: number;
}

/**
 * A full-bleed intro whose background video is "scrubbed" by the scroll
 * position. The section is taller than the viewport and pins a full-screen
 * video via `position: sticky`, so scrolling through it advances the clip
 * frame-by-frame. The page only reveals the content below once the clip has
 * played all the way through — no scroll hijacking, just native scrolling.
 */
export default function ScrollScrubHero({
  src,
  poster,
  scrollVh = 450,
}: ScrollScrubHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    let duration = 0;
    let targetTime = 0;
    let rafId = 0;

    const onMeta = () => {
      duration = video.duration || 0;
      setReady(true);
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

    const computeProgress = () => {
      const scrollable = section.offsetHeight - window.innerHeight;
      const scrolled = Math.min(
        Math.max(-section.getBoundingClientRect().top, 0),
        Math.max(scrollable, 0),
      );
      return scrollable > 0 ? scrolled / scrollable : 0;
    };

    const onScroll = () => {
      const p = computeProgress();
      setProgress(p);
      // Stop a hair short of the very end so the last frame stays painted.
      targetTime = p * Math.max(duration - 0.05, 0);
    };

    // Ease currentTime toward the scroll target every frame. This decouples
    // the decode rate from raw scroll events, which keeps scrubbing smooth.
    const tick = () => {
      if (duration) {
        const diff = targetTime - video.currentTime;
        if (Math.abs(diff) > 0.004) {
          try {
            video.currentTime += diff * 0.2;
          } catch {
            /* seek not ready yet */
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  // Fade the intro chrome out as the clip nears its end.
  const chromeOpacity = Math.max(0, 1 - progress * 1.4);

  return (
    <section
      ref={sectionRef}
      style={{ height: `${scrollVh}vh` }}
      className="relative w-full bg-black"
      aria-label="Intro reel — scroll to play"
    >
      {/* Pinned full-screen stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover"
          // Punch up the color — the source reads dull, so boost saturation /
          // brightness / contrast right in the browser (no re-encode needed).
          style={{ filter: "saturate(1.4) brightness(1.12) contrast(1.06)" }}
        />

        {/* Legibility veils — kept light so they don't dull the color */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/45" />
        <div className="pointer-events-none absolute inset-0 bg-halftone-pattern opacity-[0.08] mix-blend-overlay" />

        {/* Overlay chrome */}
        <div
          className="absolute inset-0 flex flex-col justify-between p-6 md:p-10"
          style={{ opacity: chromeOpacity }}
        >
          {/* Top eyebrow */}
          <div className="flex items-center justify-between font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-white/80">
            <span>Volume 01 // Collectors Edition</span>
            <span className="hidden sm:inline">EST. 2026 // TOKYO</span>
          </div>

          {/* Centered title */}
          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#E31B23] font-bold mb-3">
              Premium Edition // 絶版
            </span>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tighter uppercase text-white drop-shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
              LEGENDS<br />
              <span className="text-[#E31B23]">GALLERY</span>
            </h1>
          </div>

          {/* Bottom scroll hint */}
          <div className="flex flex-col items-center gap-1 text-white/90">
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold animate-pulse">
              {ready ? "Scroll to play the reel" : "Loading reel…"}
            </span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </div>
        </div>

        {/* Reel progress bar (always visible) */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/15">
          <div
            className="h-full bg-[#E31B23] transition-[width] duration-75 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}
