"use client";

import {
  PointerEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import s from "./styles.module.css";
import { lerp } from "@/lib/math";
import gsap from "gsap";

export default function Page() {
  const mouseRef = useRef<HTMLDivElement>(null);

  /**
   * Using `useRef` ensures the object is created once and persists
   * across re-renders without being recreated. A plain object literal
   * would be recreated on ever re-render, causing the position data to
   * reset and potentially triggering unnecessary re-renders if used as a
   * dependency in useEffect. `useRef` maintains the same object reference
   * and allows direct mutation of its `current` property without triggering
   * re-renders.
   */

  // Cursor Target - where the mouse IS
  const cursorTargetRef = useRef({
    x: 0,
    y: 0,
  });

  // Cursor Position - the updated value of the element
  const cursorPosRef = useRef({
    x: 0,
    y: 0,
  });

  const [snap, setSnap] = useState<null | {
    x: number;
    y: number;
    w: number;
    h: number;
  }>(null);

  useEffect(() => {
    /**
     *
     * @param time
     * Represents the total time in seconds since GSAP started globally.
     * @param deltaTime
     * Represents the time between each frame which varies based on frame rate
     * The deltaTime value is used to make animations frame-rate independent by
     * multiplying it with animation values, ensuring animations run at the same speed
     * across different monitors and frame rates.
     */
    const callback: gsap.TickerCallback = (time, deltaTime) => {
      if (snap) {
        cursorPosRef.current.x = lerp(
          cursorPosRef.current.x,
          snap.x,
          deltaTime * 0.01,
        );

        cursorPosRef.current.y = lerp(
          cursorPosRef.current.y,
          snap.y,
          deltaTime * 0.01,
        );
      } else {
        cursorPosRef.current.x = lerp(
          cursorPosRef.current.x,
          cursorTargetRef.current.x,
          /**
           * Multiply deltaTime makes animations frame-rate independent.
           * Without it, animations would run at different speeds on different devices.
           * (e.g., Mac 120fps vs 60fps) or when performance issues cause frame rate drops.
           * Using deltaTime ensures the animation looks the same on every screen regardless of frame rate.
           */
          deltaTime * 0.01,
        );

        cursorPosRef.current.y = lerp(
          cursorPosRef.current.y,
          cursorTargetRef.current.y,
          deltaTime * 0.01,
        );
      }

      if (mouseRef.current) {
        mouseRef.current.style.setProperty(
          "--x",
          cursorPosRef.current.x.toString(),
        );
        mouseRef.current.style.setProperty(
          "--y",
          cursorPosRef.current.y.toString(),
        );
      }

      // requestAnimationFrame(callback);
    };

    // callback();

    const cb = gsap.ticker.add(callback);

    return () => {
      gsap.ticker.remove(cb);
    };
  }, [snap]);

  useEffect(() => {
    const controller = new AbortController();

    window.addEventListener("mousemove", (event) => {
      const x = event.clientX;
      const y = event.clientY;

      if (mouseRef.current) {
        cursorTargetRef.current.x = x;
        cursorTargetRef.current.y = y;
      }
    });

    return () => {
      controller.abort();
    };
  }, []);

  const onPointerEnter = useCallback<PointerEventHandler<HTMLHeadElement>>(
    (event) => {
      const rect = event.currentTarget.getClientRects()[0];

      setSnap({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        w: rect.width + 20,
        h: rect.height + 20,
      });
    },
    [],
  );

  const onPointerLeave = useCallback(() => {
    setSnap(null);
  }, []);

  return (
    <div className="w-screen h-screen bg-black text-green-400 flex items-center justify-center">
      <h1
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className="uppercase text-[10vh] leading-none relative cursor-default pl-[0.1em] opacity-60 hover:opacity-100"
      >
        Start
      </h1>
      <div
        ref={mouseRef}
        className={s.cursor}
        style={
          {
            "--w": snap ? snap.w + "px" : undefined,
            "--h": snap ? snap.h + "px" : undefined,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
