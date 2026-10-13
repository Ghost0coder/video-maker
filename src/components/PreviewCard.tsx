import React, { useState } from "react";
import { Shot } from "../data/shots";
import { Play, Pause, Maximize2, Volume2, VolumeX } from "lucide-react";

interface PreviewCardProps {
  shot: Shot;
  totalShots: number;
  shotProgress: number; // 0 to 1
  liveFrameTimecode: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  shot,
  totalShots,
  shotProgress,
  liveFrameTimecode,
  isPlaying,
  onTogglePlay,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      className={`hud-glass-card group overflow-hidden relative aspect-[16/9] w-full select-none cursor-pointer ${
        isFullscreen
          ? "fixed inset-4 z-50 aspect-auto h-[90vh] max-w-5xl mx-auto shadow-2xl"
          : ""
      }`}
      onClick={onTogglePlay}
    >
      {/* HUD Corner Brackets */}
      <div className="hud-bracket hud-bracket-tl" />
      <div className="hud-bracket hud-bracket-tr" />
      <div className="hud-bracket hud-bracket-bl" />
      <div className="hud-bracket hud-bracket-br" />

      {/* Media Image / Canvas Frame with Cross-fade */}
      <div className="relative w-full h-full overflow-hidden bg-[#0d091a]">
        <img
          key={shot.id}
          src={shot.media}
          alt={shot.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Faint CRT / Scanline Overlay */}
        <div className="crt-overlay absolute inset-0 pointer-events-none" />

        {/* Cinematic subtle vignette and gradient scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />

        {/* Subtle camera drift / lens flare animation indicator */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#22d3ee]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      </div>

      {/* TOP ROW HUD OVERLAYS */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
        {/* Top-Left Tag: FINAL CUT · 3840×2160 */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/65 backdrop-blur-md border border-white/10 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono-hud text-[9px] sm:text-[10px] text-white/90 uppercase tracking-widest font-medium">
            FINAL CUT · 3840×2160
          </span>
        </div>

        {/* Top-Right Tag: SHOT 06 / 14 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-black/65 backdrop-blur-md border border-[#22d3ee]/30 shadow-sm">
            <span className="font-mono-hud text-[9px] sm:text-[10px] font-bold text-[#22d3ee] tracking-widest uppercase">
              SHOT {shot.id} / {totalShots < 10 ? `0${totalShots}` : totalShots}
            </span>
          </div>

          {/* Quick HUD controls */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted((prev) => !prev);
            }}
            className="p-1 rounded bg-black/60 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition-colors"
            title={isMuted ? "Unmute HUD audio fx" : "Mute audio"}
          >
            {isMuted ? (
              <VolumeX className="w-3 h-3 text-white/50" />
            ) : (
              <Volume2 className="w-3 h-3 text-[#ff3d9a]" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-1 rounded bg-black/60 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition-colors"
            title="Expand view"
          >
            <Maximize2 className="w-3 h-3 text-white/70" />
          </button>
        </div>
      </div>

      {/* CENTER PLAY/PAUSE FEEDBACK ON HOVER */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
        <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl shadow-[#ff3d9a]/20 transform group-hover:scale-110 transition-transform">
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white/90" />
          ) : (
            <Play className="w-5 h-5 text-[#22d3ee] ml-0.5" />
          )}
        </div>
      </div>

      {/* BOTTOM ROW HUD OVERLAYS */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between z-20 pointer-events-none">
        {/* Bottom-Left Large Mono Timecode */}
        <div className="space-y-0.5">
          <div className="font-mono-hud text-[9px] uppercase tracking-widest text-[#22d3ee]/80 font-medium">
            SHOT TIMECODE
          </div>
          <div className="font-mono-hud text-base sm:text-xl font-bold text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
            {liveFrameTimecode}
          </div>
        </div>

        {/* Bottom-Right Small Shot Caption */}
        <div className="text-right max-w-[55%]">
          <div className="font-mono-hud text-[9px] uppercase tracking-widest text-[#ff3d9a]/90 font-medium truncate">
            {shot.tag}
          </div>
          <div className="font-display text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider truncate drop-shadow-[0_0_10px_rgba(255,61,154,0.3)]">
            {shot.title}
          </div>
        </div>
      </div>

      {/* Thin Pink-to-Violet Progress Bar Along Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/60 overflow-hidden z-30">
        <div
          className="h-full bg-gradient-to-r from-[#ff3d9a] via-[#8b5cf6] to-[#22d3ee] transition-[width] duration-100 ease-linear shadow-[0_0_8px_#ff3d9a]"
          style={{ width: `${Math.min(100, Math.max(0, shotProgress * 100))}%` }}
        />
      </div>
    </div>
  );
};
