import React from "react";
import { Play, Pause } from "lucide-react";

interface HeaderProps {
  currentTimecode: string;
  totalTimecode: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTimecode,
  totalTimecode,
  isPlaying,
  onTogglePlay,
}) => {
  return (
    <header className="relative z-20 w-full pt-3 pb-2 px-1 border-b border-white/5">
      {/* Top Line: Event Title & Tech Spec */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-[#ff3d9a] via-pink-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,61,154,0.3)]">
            YR ALEXANDRIA EVENT
          </span>
        </div>

        <div className="text-right">
          <span className="font-mono-hud text-[9px] sm:text-[10px] text-white/70 uppercase tracking-widest block">
            AI FILM BREAKDOWN / 4K · 30FPS
          </span>
        </div>
      </div>

      {/* Sub Line: Pulsing LIVE SYNC + Live Timecode */}
      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
        <div className="flex items-center gap-2">
          {/* Pulsing pink live dot */}
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3d9a] ${
                isPlaying ? "opacity-75" : "opacity-20"
              }`}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff3d9a] shadow-[0_0_8px_#ff3d9a]" />
          </span>

          <span className="font-mono-hud text-[10px] font-semibold text-[#ff3d9a] uppercase tracking-wider">
            LIVE SYNC
          </span>

          <span className="text-white/20 text-[10px]">·</span>

          <span className="font-mono-hud text-[10px] sm:text-[11px] text-white/90 tracking-wider">
            FILM TC <span className="text-cyan-400 font-bold">{currentTimecode}</span>{" "}
            <span className="text-white/40">/ {totalTimecode}</span>
          </span>
        </div>

        {/* Quick Playback Sync Control */}
        <button
          onClick={onTogglePlay}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ff3d9a]/50 text-white/80 hover:text-white transition-all text-[9px] font-mono-hud cursor-pointer active:scale-95"
          title={isPlaying ? "Pause playback" : "Resume playback"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-2.5 h-2.5 text-[#ff3d9a]" />
              <span className="text-[#ff3d9a]">PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-2.5 h-2.5 text-[#22d3ee]" />
              <span className="text-[#22d3ee]">PLAY</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
