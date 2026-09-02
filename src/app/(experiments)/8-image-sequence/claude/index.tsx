"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { fitContent, remap } from "@/lib/math";

gsap.registerPlugin(SplitText, ScrollTrigger);

const FRAME_COUNT = 300;
const framePath = (n: number) =>
  `/sequence/${n.toString().padStart(4, "0")}.webp`;

/** Frame held while reduced motion is on, and the first frame we gate reveal on. */
const POSTER_FRAME = 1;

/** How many frames must be decoded before we consider the sequence watchable. */
const WARMUP_FRAMES = 12;

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  const progressRef = useRef(0);

  useGSAP(
    () => {
      SplitText.create("h1", {
        type: "chars",
        charsClass:
          "char++ bg-linear-to-t from-black/10 to-white to-70% bg-clip-text",
        mask: "chars",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          /**
           * The `scrub` property makes the animation run attached to the scroll position.
           * This means the animation progress is directly tied to the scroll position
           * rather than playing automatically over time.
           */
          scrub: 0.3,
        },
      });

      tl.to(progressRef, {
        current: 0.4,
        duration: 0.4,
        ease: "none",
      });

      tl.to(
        ".title",
        {
          /**
           * `autoAlpha` is similar to `opacity`, but when it reaches opacity zero,
           * it automatically adds `display: none` to the element. This removes
           * the element from the layout completely, avoiding issues with hidden but
           * still-present selectors, whereas `opacity` alone makes the element invisible
           * but still present in the DOM.
           */
          autoAlpha: 0,
          duration: 0.1,
        },
        "<+0.01",
      );

      tl.to(
        ".cameras",
        {
          autoAlpha: 1,
          repeat: 1,
          yoyo: true,
          duration: 0.1,
          repeatDelay: 0.15,
        },
        "-=0.03",
      );

      tl.to(
        progressRef,
        {
          current: 1,
          duration: 0.8,
          ease: "none",
        },
        "-=0.03",
      );

      tl.to(
        ".wheels",
        {
          autoAlpha: 1,
          duration: 0.2,
        },
        "-=0.2",
      );
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      {/* Sticky, not fixed: the stage releases when the section ends, so
          anything rendered after this component is not covered forever. */}
      <div className="sticky top-0 h-dvh overflow-hidden">
        <ScrollSequence progress={progressRef} />

        <section className="title absolute inset-0">
          <h1 className="absolute -bottom-[0.1em] right-[0.05em] w-full text-center text-[8vw] uppercase leading-none tracking-widest text-transparent">
            Perseverance
          </h1>
        </section>
        <section className="cameras absolute inset-0 opacity-0">
          <div className="w-md absolute right-10 top-1/2 max-w-full -translate-y-1/2 text-white">
            <h2 className="mb-2 text-6xl">Cameras</h2>
            <p className="text-balance">
              Mounted on the &quot;head&quot; of the rover&apos;s long-necked
              mast. The SuperCam on the Perseverance rover examines rocks and
              soils with a camera, laser, and spectrometers to seek chemical
              materials that could be related to past life on Mars.
            </p>
          </div>
        </section>
        <section className="wheels absolute inset-0 opacity-0">
          <div className="w-md absolute bottom-10 left-16 max-w-full text-white">
            <h2 className="mb-2 text-6xl">Wheels</h2>
            <p className="text-balance">
              The wheels are made of aluminium, with cleats for traction and
              curved titanium spokes for springy support.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const ScrollSequence = ({
  progress,
}: {
  progress: React.RefObject<number>;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const images: Record<number, HTMLImageElement> = {};

    // Declared before `resizeCanvas`, which resets it on the first call below.
    let lastFrame = -1;

    /**
     * Size the backing store in device pixels, not CSS pixels. Without this the
     * canvas renders at half resolution on any retina display. Capped at 2 so a
     * 3x phone does not pay for a 9x fill rate.
     */
    let dpr = 1;
    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.offsetWidth * dpr);
      canvas.height = Math.round(canvas.offsetHeight * dpr);
      lastFrame = -1; // force a redraw at the new size
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let cancelled = false;

    /**
     * Decode before first paint. Assigning `src` alone leaves the decode to
     * happen inline on the first `drawImage`, which lands as a dropped frame
     * mid-scrub. `decode()` moves that work off the critical path.
     */
    const load = async (n: number) => {
      const img = new Image();
      img.src = framePath(n);
      try {
        await img.decode();
      } catch {
        return; // a missing or broken frame should not reject the whole batch
      }
      if (!cancelled) images[n] = img;
    };

    const preload = async () => {
      // The poster first, so there is something to show as early as possible.
      await load(POSTER_FRAME);
      if (cancelled) return;
      draw();

      if (reduced) {
        setReady(true);
        return;
      }

      // Then a short warm-up run so the opening scroll never hits a gap...
      const warmup = [];
      for (let n = 2; n <= Math.min(WARMUP_FRAMES, FRAME_COUNT); n++) {
        warmup.push(load(n));
      }
      await Promise.all(warmup);
      if (cancelled) return;
      setReady(true);

      // ...and the remainder in the background.
      for (let n = WARMUP_FRAMES + 1; n <= FRAME_COUNT; n++) {
        void load(n);
      }
    };

    const draw = () => {
      const frameNumber = reduced
        ? POSTER_FRAME
        : Math.round(
            remap(progress.current, 0, 1, 1, FRAME_COUNT, /* clamp */ true),
          );

      // Nothing moved, so there is nothing to repaint. On a 120Hz display this
      // skips the large majority of ticks.
      if (frameNumber === lastFrame) return;

      const img = images[frameNumber];
      if (!img) return;

      lastFrame = frameNumber;

      const { x, y, width, height } = fitContent(
        canvas.offsetWidth,
        canvas.offsetHeight,
        img.width,
        img.height,
      );

      // Draw in CSS pixels and let the transform handle the device scale.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.drawImage(img, x, y, width, height);
    };

    void preload();

    // Reduced motion holds a single frame, so there is no reason to tick.
    if (!reduced) gsap.ticker.add(draw);

    return () => {
      cancelled = true;
      gsap.ticker.remove(draw);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
};
