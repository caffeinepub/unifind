import { useEffect, useRef } from "react";

interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

interface UseQRCodeOptions {
  value: string;
  options?: QRCodeOptions;
}

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: CDN lib
    QRCode: any;
  }
}

let qrLibLoaded = false;
let qrLibLoading = false;
const qrLibCallbacks: Array<() => void> = [];

function loadQRLib(cb: () => void) {
  if (qrLibLoaded) {
    cb();
    return;
  }
  qrLibCallbacks.push(cb);
  if (qrLibLoading) return;
  qrLibLoading = true;
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js";
  script.onload = () => {
    qrLibLoaded = true;
    qrLibLoading = false;
    for (const fn of qrLibCallbacks.splice(0)) fn();
  };
  script.onerror = () => {
    qrLibLoading = false;
    console.error("Failed to load QRCode library");
  };
  document.head.appendChild(script);
}

export function useQRCode({ value, options }: UseQRCodeOptions) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!value) return;

    const render = () => {
      if (!ref.current || !window.QRCode) return;
      window.QRCode.toCanvas(
        ref.current,
        value,
        {
          width: options?.width ?? 200,
          margin: options?.margin ?? 2,
          color: {
            dark: options?.color?.dark ?? "#000000",
            light: options?.color?.light ?? "#ffffff",
          },
        },
        (err: Error | null) => {
          if (err) console.error("QR render error:", err);
        },
      );
    };

    if (qrLibLoaded) {
      render();
    } else {
      loadQRLib(render);
    }
  }, [
    value,
    options?.width,
    options?.margin,
    options?.color?.dark,
    options?.color?.light,
  ]);

  return { ref };
}
