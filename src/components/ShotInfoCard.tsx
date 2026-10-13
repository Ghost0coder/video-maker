import React from "react";
import { Shot } from "../data/shots";

interface ShotInfoCardProps {
  shot: Shot;
  shotProgress: number; // 0 to 1
  onClickNext?: () => void;
}

export const ShotInfoCard: React.FC<ShotInfoCardProps> = ({
  shot,
  shotProgress,
  onClickNext,
}) => {
  return (
    <div
      onClick={onClickNext}
      className="hud-glass-card group relative flex-1 min-w-0 overflow-hidden p-3 flex flex-col justify-between cursor-pointer select-none"
    >
      {/* HUD Corner Brackets */}
      <div className="hud-bracket hud-bracket-tl" />
      <div className="hud-bracket hud-bracket-tr" />
      <div className="hud-bracket hud-bracket-bl" />
      <div className="hud-bracket hud-bracket-br" />

      {/* Top Section: Header & Huge Gradient Shot Number */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono-hud text-[8px] uppercase tracking-widest text-white/50 mb-0.5">
            ACTIVE SEQUENCE
          </div>
          {/* Cyan Sub-label */}
          <div className="font-mono-hud text-[9px] sm:text-[10px] text-[#22d3ee] uppercase tracking-wider font-semibold truncate max-w-[140px] sm:max-w-[170px]">
            {shot.subtitle}
          </div>
        </div>

        {/* Huge Gradient Shot Number (Pink to Yellow) */}
        <div
          key={`num-${shot.id}`}
          className="font-display font-black text-4xl sm:text-5xl leading-none tracking-tighter bg-gradient-to-br from-[#ff3d9a] via-[#f43f5e] to-[#ffc928] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,61,154,0.35)] shrink-0 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          {shot.id}
        </div>
      </div>

      {/* Middle Section: Shot Title */}
      <div className="my-1.5">
        <h2
          key={`title-${shot.id}`}
          className="font-display font-extrabold text-xs sm:text-sm text-white uppercase tracking-wider truncate drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] animate-in fade-in duration-300"
        >
          {shot.title}
        </h2>
      </div>

      {/* Bottom Section: In/Out Timecode row & Slim Progress Bar */}
      <div className="space-y-1.5 pt-1.5 border-t border-white/5">
        {/* "IN 21:55 · OUT 25:55 · 4:15" row */}
        <div className="flex items-center justify-between font-mono-hud text-[8px] sm:text-[9px] text-white/70 uppercase tracking-widest">
          <span>
            IN <span className="text-white font-medium">{shot.inTimecode.slice(3)}</span>
          </span>
          <span className="text-white/20">·</span>
          <span>
            OUT <span className="text-white font-medium">{shot.outTimecode.slice(3)}</span>
          </span>
          <span className="text-white/20">·</span>
          <span className="text-[#ff3d9a] font-bold">{shot.duration}</span>
        </div>

        {/* Slim Progress Bar */}
        <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#ff3d9a] via-[#8b5cf6] to-[#22d3ee] rounded-full transition-[width] duration-100 ease-linear shadow-[0_0_6px_#ff3d9a]"
            style={{ width: `${Math.min(100, Math.max(0, shotProgress * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
