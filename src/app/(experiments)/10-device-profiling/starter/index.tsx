"use client";

import { ShaderEffect } from "./logo-webgl";
import { StaticVersion } from "./logo-static";
import { useEffect, useState } from "react";
import { getGPUTier } from "@pmndrs/detect-gpu";
// import { getGPUTier } from "detect-gpu";
import { getSelectorsByUserAgent } from "react-device-detect";
import { DeviceType } from "@/types";
import { useBattery } from "@/hooks/use-battery";

export default function Page() {
  const shouldUseGl = useShouldRenderGL();

  return shouldUseGl ? <ShaderEffect /> : <StaticVersion />;
}

const useShouldRenderGL = () => {
  const [gpuTier, setGpuTier] = useState<number | null>(null);
  const [gpu, setGpu] = useState<string | undefined | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceType | null>(null);
  const battery = useBattery();

  useEffect(() => {
    const result: DeviceType = getSelectorsByUserAgent(
      window.navigator.userAgent,
    );
    console.log(result);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeviceInfo(result);

    // https://www.npmjs.com/package/detect-gpu
    getGPUTier().then((result) => {
      setGpuTier(result.tier);
      setGpu(result.gpu);
    });
  }, []);
  console.log(gpuTier);
  /**
   * NOTE: `detect-gpu` - mac laptop safari browser hides its gpu and returns its generic "Apple GPU"
   * USE `@pmndrs/detect-gpu` where this is fixed
   */
  console.log(gpu);

  // if (deviceInfo?.isSafari) {
  //   return false;
  // }

  if (typeof gpuTier === "number" && gpuTier < 2) {
    return false;
  }

  if (
    battery.isSupported &&
    battery.fetched &&
    battery.level < 0.3 &&
    !battery.charging
  ) {
    return false;
  }

  return true;
};
