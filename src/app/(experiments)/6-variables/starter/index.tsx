"use client";

import { cn } from "@/lib/utils";
import s from "./styles.module.css";
import { useEffect, useState, useRef } from "react";
import { distance } from "@/lib/math";
import Script from "next/script";

export default function Page() {
  /**
   * Escape React by using a ref and update the variable `dist`
   * instead using React state so there are less re-renders
   * for performance
   */
  const titleRef = useRef<HTMLDivElement>(null);

  // const [distanceValue, setDistanceValue] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      "mousemove",
      (event) => {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        const centerX = screenW / 2;
        const centerY = screenH / 2;

        const maxDist = distance(0, 0, centerX, centerY);
        const dist = distance(mouseX, mouseY, centerX, centerY);

        titleRef?.current?.style.setProperty(
          "--distance",
          (dist / maxDist).toString(),
        );

        // setDistanceValue(dist / maxDist);
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div
      className={cn(
        "w-screen h-screen text-white flex items-center justify-center",
        s.grid,
      )}
    >
      <Script
        src="//unpkg.com/react-scan/dist/auto.global.js"
        crossOrigin="anonymous"
        strategy="beforeInteractive"
      />
      <h1
        ref={titleRef}
        className={cn(
          "uppercase text-[10vh] leading-none relative",
          s["title"],
        )}
        // style={
        //   {
        //     "--distance": distanceValue,
        //   } as React.CSSProperties
        // }
      >
        Variables
      </h1>
    </div>
  );
}
