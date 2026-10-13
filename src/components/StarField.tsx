import React, { useEffect, useRef } from "react";

export const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Generate stars
    const starCount = Math.min(80, Math.floor((width * height) / 12000));
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.008 + 0.003,
      color:
        Math.random() > 0.6
          ? "#22d3ee" // cyan
          : Math.random() > 0.3
          ? "#ff3d9a" // magenta
          : "#ffffff",
      phase: Math.random() * Math.PI * 2,
    }));

    let lastTime = 0;

    const render = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw faint stars
      for (const s of stars) {
        if (!prefersReducedMotion) {
          s.phase += s.speed;
        }
        const currentAlpha =
          s.alpha * (0.6 + 0.4 * Math.sin(s.phase));

        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(0.9, currentAlpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Corner ambient glows: soft purple, magenta, and cyan radial glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#8b5cf6]/15 blur-[120px]" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-[#ff3d9a]/12 blur-[130px]" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-[#22d3ee]/10 blur-[120px]" />
      <div className="absolute -bottom-32 right-10 w-96 h-96 rounded-full bg-[#8b5cf6]/15 blur-[140px]" />

      {/* Subtle Star Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-70"
      />
    </div>
  );
};
