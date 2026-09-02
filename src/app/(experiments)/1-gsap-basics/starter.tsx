"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { useEffect, useRef } from "react";

gsap.registerPlugin(SplitText);

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const split = SplitText.create(".title", {
        type: "chars, words",
      });

      gsap.from(split.chars, {
        autoAlpha: 0,
        y: 200,
        duration: 0.4,
        stagger: 0.03,
        // hit control + space to see the possible values
        ease: "circ.out",
      });
    },
    {
      scope: containerRef,
    },
  );

  // useGSAP(
  //   () => {
  //     SplitText.create(".title", {
  //       type: "chars, words",
  //       charsClass: "letter",
  //     });

  //     gsap.from(".title .letter", {
  //       y: 200,
  //       opacity: 0,
  //       ease: "circ.out",
  //       stagger: 0.03,
  //     });
  //   },
  //   {
  //     scope: containerRef,
  //   },
  // );

  // useEffect(() => {
  //   const ctx = gsap.context(() => {
  //     gsap.to(".title", {
  //       x: 200,
  //       duration: 10,
  //       onUpdate: () => {
  //         console.log("update");
  //       },
  //     });
  //   }, containerRef);

  //   // const tween = gsap.to(".title", {
  //   //   x: 200,
  //   //   duration: 10,
  //   //   onUpdate: () => {
  //   //     console.log("update");
  //   //   },
  //   // });

  //   // gsap.fromTo(
  //   //   ".title",
  //   //   { x: -200 },
  //   //   {
  //   //     x: 200,
  //   //   },
  //   // );

  //   // gsap.from(".title", {
  //   //   x: 200,
  //   // });

  //   return () => {
  //     ctx.revert();
  //     // tween.revert();
  //   };
  // }, []);

  return (
    <div className="bg-blue-300 text-black">
      <div
        ref={containerRef}
        className="flex h-screen items-end justify-left overflow-hidden"
      >
        <h1 className="title font-black text-[min(20rem,30vw)] leading-none pb-[0.1em] text-left">
          GSAP
          <br />
          tweens
        </h1>
      </div>
    </div>
  );
}
