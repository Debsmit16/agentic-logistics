"use client";

import { useRef, useEffect, useCallback } from "react";

type Props = {
  onChange: (base64: string | undefined) => void;
  className?: string;
};

export function SignaturePad({ onChange, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const exportBase64 = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL("image/png");
    const empty = canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height);
    const blank = empty && !empty.data.some((v, i) => i % 4 !== 3 && v !== 0);
    onChange(blank ? undefined : data.split(",")[1]);
  }, [onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#0a1628";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  function pos(e: React.PointerEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  return (
    <div className={className}>
      <p className="mb-1 text-sm font-medium text-gray-700">Customer signature</p>
      <canvas
        ref={canvasRef}
        className="h-36 w-full touch-none rounded-lg border border-gray-300 bg-white"
        onPointerDown={(e) => {
          drawing.current = true;
          canvasRef.current?.setPointerCapture(e.pointerId);
          const ctx = canvasRef.current?.getContext("2d");
          const p = pos(e);
          ctx?.beginPath();
          ctx?.moveTo(p.x, p.y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current?.getContext("2d");
          const p = pos(e);
          ctx?.lineTo(p.x, p.y);
          ctx?.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
          exportBase64();
        }}
      />
      <button
        type="button"
        className="mt-2 text-sm text-teal-700 underline"
        onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          onChange(undefined);
        }}
      >
        Clear signature
      </button>
    </div>
  );
}
