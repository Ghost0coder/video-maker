import React, { useRef, useEffect } from "react";
import { Shot } from "../data/shots";
import { Waveform } from "./Waveform";
import { Play, Pause, SkipBack, SkipForward, Repeat } from "lucide-react";

interface TimelineProps {
  shots: Shot[];
  currentShotIndex: number;
  shotProgress: number; // 0 to 1 within current shot
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectShot: (index: number) => void;
  onPrevShot: () => void;
  onNextShot: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  shots,
  currentShotIndex,
  shotProgress,
  isPlaying,
  onTogglePlay,
  onSelectShot,
  onPrevShot,
  onNextShot,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement | null>(null);

  // Overall film progress ratio across the 14 shots
  const totalShots = shots.length;
  const filmProgressRatio = Math.max(
    0,
    Math.min(1, (currentShotIndex + shotProgress) / totalShots)
  );

  // Auto-scroll timeline strip to keep active shot visible
  useEffect(() => {
    if (activeThumbnailRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeThumbnailRef.current;
      const containerWidth = container.offsetWidth;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;

      container.scrollTo({
        left: elementLeft - containerWidth / 2 + elementWidth / 2,
        behavior: "smooth",
      });
    }
  }, [currentShotIndex]);

  const handleSeekWaveform = (ratio: number) => {
    const targetIndex = Math.min(
      totalShots - 1,
      Math.max(0, Math.floor(ratio * totalShots))
    );
    onSelectShot(targetIndex);
  };

  return (
    <div className="hud-glass-card relative overflow-hidden p-3 select-none">
      {/* HUD Corner Brackets */}
      <div className="hud-bracket hud-bracket-tl" />
      <div className="hud-bracket hud-bracket-tr" />
      <div className="hud-bracket hud-bracket-bl" />
      <div className="hud-bracket hud-bracket-br" />

      {/* TOP HEADER */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_6px_#22d3ee]" />
          <span className="font-mono-hud text-[9px] sm:text-[10px] text-[#22d3ee] uppercase tracking-widest font-bold">
            SHOT TIMELINE // SYNC
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono-hud text-[9px] sm:text-[10px] text-white/70 uppercase tracking-widest">
            {totalShots} SHOTS · 62:05
          </span>
        </div>
      </div>

      {/* TIMELINE CONTROLS BAR */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        {/* Playback Button Cluster */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevShot}
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Previous Shot"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border font-mono-hud text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
              isPlaying
                ? "bg-[#ff3d9a]/20 border-[#ff3d9a] text-[#ff3d9a] shadow-[0_0_12px_rgba(255,61,154,0.3)]"
                : "bg-[#22d3ee]/20 border-[#22d3ee] text-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.3)]"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current ml-0.5" />
                <span>AUTO-PLAY</span>
              </>
            )}
          </button>

          <button
            onClick={onNextShot}
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Next Shot"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Active Indicator & Auto Loop Status */}
        <div className="flex items-center gap-2">
          <div className="hidden xs:flex items-center gap-1 text-[9px] font-mono-hud text-white/40 uppercase">
            <Repeat className="w-3 h-3 text-[#ff3d9a]" />
            <span>LOOP 4.5S</span>
          </div>
          <span className="font-mono-hud text-[10px] text-white/90 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">
            SHOT {shots[currentShotIndex]?.id}
          </span>
        </div>
      </div>

      {/* HORIZONTAL STRIP OF 14 THUMBNAILS */}
      <div
        ref={containerRef}
        className="relative flex items-center gap-2 overflow-x-auto pb-2 pt-3 px-1 scrollbar-thin scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
      >
        {shots.map((shot, index) => {
          const isActive = index === currentShotIndex;

          return (
            <button
              key={shot.id}
              ref={isActive ? activeThumbnailRef : null}
              onClick={() => onSelectShot(index)}
              className={`relative shrink-0 w-16 sm:w-18 aspect-[16/10] rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer group select-none ${
                isActive
                  ? "border-[#ff3d9a] shadow-[0_0_14px_#ff3d9a] scale-105 z-20"
                  : "border-white/10 opacity-60 hover:opacity-100 hover:border-[#22d3ee]/50 hover:scale-102"
              }`}
            >
              {/* Thumbnail Image */}
              <img
                src={shot.media}
                alt={shot.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              {/* CRT overlay */}
              <div className="crt-overlay absolute inset-0 pointer-events-none" />

              {/* Number Badge Top-Left */}
              <div
                className={`absolute top-1 left-1 px-1 py-0.2 rounded font-mono-hud text-[8px] font-extrabold tracking-tight ${
                  isActive
                    ? "bg-[#ff3d9a] text-white shadow-sm"
                    : "bg-black/70 text-white/80"
                }`}
              >
                {shot.id}
              </div>

              {/* Active Playhead Diamond & Line Overlay */}
              {isActive && (
                <>
                  {/* Cyan Diamond Handle at Top */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div className="w-2.5 h-2.5 rotate-45 bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] border border-white" />
                  </div>

                  {/* Vertical Playhead Scrub Line moving within thumbnail */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] z-20 pointer-events-none transition-[left] duration-100 ease-linear"
                    style={{ left: `${Math.min(95, Math.max(5, shotProgress * 100))}%` }}
                  />

                  {/* Subtle pulsing glow edge */}
                  <div className="absolute inset-0 border border-[#ff3d9a]/80 rounded-lg pointer-events-none animate-pulse" />
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* AUDIO WAVEFORM STRIP */}
      <Waveform
        progressRatio={filmProgressRatio}
        isPlaying={isPlaying}
        onSeekRatio={handleSeekWaveform}
      />
    </div>
  );
};
