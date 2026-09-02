"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { SplitText, ScrollTrigger } from "gsap/all";
import { fitContent, remap } from "@/lib/math";

gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrollTrigger);

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
          scrub: true,
        },
      });

      tl.to(progressRef, {
        current: 0.4,
        duration: 0.4,
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

      // tl.to(
      //   ".cameras",
      //   {
      //     autoAlpha: 1,
      //     duration: 0.1,
      //   },
      //   "-=0.2s",
      // );

      // tl.to(
      //   ".cameras",
      //   {
      //     delay: 0.2,
      //     autoAlpha: 0,
      //     duration: 0.1,
      //   },
      //   "-=0.1s",
      // );

      tl.to(
        progressRef,
        {
          current: 1,
          duration: 0.8,
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
    <div ref={containerRef} className="h-[400vh]">
      <ScrollSecquence progress={progressRef} />
      <div className="relative w-full overflow-clip">
        <section className="title h-screen fixed w-full">
          <h1 className="uppercase absolute text-[8vw] w-full text-center -bottom-[0.1em] leading-none right-[0.05em] tracking-widest text-transparent">
            Perseverance
          </h1>
        </section>
        <section className="cameras fixed h-screen w-full top-0 left-0 opacity-0">
          <div className="absolute top-1/2 -translate-y-1/2 right-10 max-w-full w-md text-white">
            <h2 className="text-6xl mb-2">Cameras</h2>
            <p className="text-balance">
              Mounted on the &quot;head&quot; of the rover&apos;s long-necked
              mast. The SuperCam on the Perseverance rover examines rocks and
              soils with a camera, laser, and spectrometers to seek chemical
              materials that could be related to past life on Mars.
            </p>
          </div>
        </section>
        <section className="wheels fixed h-screen w-full opacity-0">
          <div className="absolute bottom-10 left-16 max-w-full w-md text-white">
            <h2 className="text-6xl mb-2">Wheels</h2>
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

const ScrollSecquence = ({
  progress,
}: {
  progress: React.RefObject<number>;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: Record<number, HTMLImageElement> = {};

    for (let index = 0; index < 300; index++) {
      const img = new Image();
      const imageNumber = (index + 1).toString().padStart(4, "0");

      img.src = `/sequence/${imageNumber}.webp`;
      img.onload = () => {
        images[index + 1] = img;
      };
    }

    const drawImage = () => {
      if (!canvas || !ctx) return;

      let frameNumber = remap(progress.current, 0, 1, 1, 300);
      frameNumber = Math.round(frameNumber);

      const img = images[frameNumber];

      if (!img) return;

      const { x, y, width, height } = fitContent(
        canvas.offsetWidth,
        canvas.offsetHeight,
        img.width,
        img.height,
      );

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.drawImage(img, x, y, width, height);
    };

    const cb = gsap.ticker.add(drawImage);

    return () => {
      gsap.ticker.remove(cb);
      window.addEventListener("resize", resizeCanvas);
    };
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full border border-red-500"
    />
  );
};
