import React from "react";
import { Shot } from "../data/shots";
import { Play } from "lucide-react";

interface KeyframeCardProps {
  shot: Shot;
  onPreviewKeyframe?: () => void;
}

export const KeyframeCard: React.FC<KeyframeCardProps> = ({
  shot,
  onPreviewKeyframe,
}) => {
  return (
    <div
      onClick={onPreviewKeyframe}
      className="hud-glass-card group relative flex-1 min-w-0 overflow-hidden p-2.5 flex flex-col justify-between cursor-pointer select-none"
    >
      {/* HUD Corner Brackets */}
      <div className="hud-bracket hud-bracket-tl" />
      <div className="hud-bracket hud-bracket-tr" />
      <div className="hud-bracket hud-bracket-bl" />
      <div className="hud-bracket hud-bracket-br" />

      {/* Top Bar inside card: Label & Badge */}
      <div className="flex items-center justify-between gap-1 mb-2 z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
          <span className="font-mono-hud text-[9px] uppercase tracking-widest text-white/75 font-semibold">
            KEYFRAME // STILL
          </span>
        </div>

        <div className="px-1.5 py-0.5 rounded bg-black/60 border border-white/10 font-mono-hud text-[8px] uppercase tracking-wider text-white/80">
          {shot.badge}
        </div>
      </div>

      {/* Center Thumbnail Container with Vertical Glowing Cyan Scan Line */}
      <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-black/50 border border-white/10">
        <img
          key={shot.id}
          src={shot.keyframe}
          alt={`Keyframe ${shot.title}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Faint CRT overlay */}
        <div className="crt-overlay absolute inset-0 pointer-events-none" />

        {/* Vertical Glowing Cyan Scan Line Sweeping Across */}
        <div className="animate-scan-sweep absolute top-0 bottom-0 w-[2px] bg-[#22d3ee] shadow-[0_0_12px_#22d3ee,0_0_20px_#22d3ee] pointer-events-none" />

        {/* Frosted Circular Play Button in Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg shadow-black/40 group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
            <Play className="w-3.5 h-3.5 text-white fill-white/80 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Bottom Info: Tag label */}
      <div className="mt-2 flex items-center justify-between z-10 pt-1 border-t border-white/5">
        <span className="font-mono-hud text-[9px] uppercase tracking-widest text-[#22d3ee] font-bold">
          {shot.tag}
        </span>
        <span className="font-mono-hud text-[8px] text-white/40 uppercase">
          RAW STILL
        </span>
      </div>
    </div>
  );
};
