import React, { useState } from "react";
import { Shot } from "../data/shots";
import { Sparkles, Sliders, Layers, Film, Music, Cpu, CheckCircle2 } from "lucide-react";

interface PipelineSectionProps {
  shots: Shot[];
  currentShotIndex: number;
  onSelectShot: (index: number) => void;
}

export const PipelineSection: React.FC<PipelineSectionProps> = ({
  shots,
  currentShotIndex,
  onSelectShot,
}) => {
  const [motionViewMode, setMotionViewMode] = useState<"motion" | "keyframe" | "split">("motion");
  const [conversionProgress, setConversionProgress] = useState(100);

  // Demo shot for the Keyframe to Motion breakdown: Shot 05 (Bibliotheca Alexandrina)
  const demoShot = shots[4] || shots[0];

  return (
    <section className="relative z-10 w-full mt-10 pt-8 border-t border-white/10 space-y-6">
      {/* SECTION HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
          <span className="font-mono-hud text-[10px] text-[#22d3ee] uppercase tracking-widest font-bold">
            SECTION 02 // WORKFLOW
          </span>
        </div>

        {/* Big two-line gradient title */}
        <div className="font-display font-black text-2xl sm:text-3xl leading-none uppercase tracking-tight">
          <span className="bg-gradient-to-r from-[#ff3d9a] via-[#c084fc] to-[#8b5cf6] bg-clip-text text-transparent block">
            PRODUCTION
          </span>
          <span className="text-white block mt-1">
            PIPELINE
          </span>
        </div>
        <p className="font-mono-hud text-[10px] text-white/50 tracking-wider pt-1">
          REVERSE-ENGINEERING LATENT DIFFUSION FRAME SYNTHESIS & NLE TIMELINE INTEGRATION
        </p>
      </div>

      {/* STEP INDICATOR 1 */}
      <div className="flex items-center gap-2 pt-2">
        <div className="px-2 py-0.5 rounded bg-[#ff3d9a]/15 border border-[#ff3d9a]/40 font-mono-hud text-[9px] text-[#ff3d9a] font-bold uppercase tracking-wider">
          STEP 03 · 04
        </div>
        <span className="font-mono-hud text-[11px] text-white/90 uppercase font-semibold tracking-wider">
          KEYFRAME TO MOTION
        </span>
      </div>

      {/* KEYFRAME TO MOTION DEMO CARD */}
      <div className="hud-glass-card p-4 space-y-4">
        {/* HUD Brackets */}
        <div className="hud-bracket hud-bracket-tl" />
        <div className="hud-bracket hud-bracket-tr" />
        <div className="hud-bracket hud-bracket-bl" />
        <div className="hud-bracket hud-bracket-br" />

        {/* Card Header & Tag */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#22d3ee] text-black font-mono-hud text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              AI MOTION
            </span>
            <span className="font-mono-hud text-[9px] sm:text-[10px] text-white/80 uppercase tracking-widest font-semibold">
              DEMO 01 / 03 · SHOT 05, BIBLIOTHECA ALEX.
            </span>
          </div>

          {/* Interactive Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-black/60 border border-white/10 text-[8px] font-mono-hud">
            <button
              onClick={() => setMotionViewMode("keyframe")}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                motionViewMode === "keyframe"
                  ? "bg-[#22d3ee] text-black font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              KEYFRAME
            </button>
            <button
              onClick={() => setMotionViewMode("motion")}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                motionViewMode === "motion"
                  ? "bg-[#ff3d9a] text-white font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              MOTION
            </button>
          </div>
        </div>

        {/* Demo Visual Stage */}
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-white/10">
          <img
            src={demoShot.media}
            alt="AI Motion Demo"
            className={`w-full h-full object-cover transition-all duration-700 ${
              motionViewMode === "keyframe" ? "filter contrast-110 saturate-90" : "scale-105"
            }`}
          />

          {/* Scanline CRT overlay */}
          <div className="crt-overlay absolute inset-0 pointer-events-none" />

          {/* Sweeping scan line for motion visualization */}
          <div className="animate-scan-sweep absolute top-0 bottom-0 w-[2px] bg-[#22d3ee] shadow-[0_0_12px_#22d3ee] pointer-events-none" />

          {/* Live Overlay Tag */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 font-mono-hud text-[9px] text-white/90">
            {motionViewMode === "keyframe" ? "INPUT 1-FRAME STILL" : "OUTPUT LATENT 3D TRAJECTORY"}
          </div>

          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-[#ff3d9a]/30 font-mono-hud text-[9px] text-[#ff3d9a] font-bold">
            206 FRAMES · 30 FPS · 6.9 SEC
          </div>
        </div>

        {/* Input / Output Spec Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono-hud text-[9px]">
          <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
            <span className="text-white/40 uppercase block">INPUT STAGE:</span>
            <span className="text-white font-semibold block">Keyframe still · 1 frame</span>
            <span className="text-[#22d3ee] text-[8px] block">Midjourney v6.1 · 8K Upscale</span>
          </div>

          <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
            <span className="text-white/40 uppercase block">OUTPUT STAGE:</span>
            <span className="text-[#ff3d9a] font-semibold block">AI motion · 6.9s · 206 fr</span>
            <span className="text-white/70 text-[8px] block">Runway Gen-3 Alpha · Camera Lock</span>
          </div>
        </div>

        {/* MOTION NOTES Mono Box */}
        <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-mono-hud">
            <span className="text-[#22d3ee] font-bold uppercase tracking-wider">
              MOTION NOTES // CAMERA PROMPT
            </span>
            <span className="text-white/40 text-[8px]">SEED: 84920412</span>
          </div>
          <p className="font-mono-hud text-[9px] sm:text-[10px] text-white/80 leading-relaxed bg-white/5 p-2 rounded border border-white/5">
            "{demoShot.cameraPrompt}"
          </p>
        </div>

        {/* CONVERSION Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between font-mono-hud text-[9px]">
            <span className="text-white/60 uppercase tracking-wider">
              CONVERSION PIPELINE STATUS
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              100% MOTION READY
            </span>
          </div>

          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#22d3ee] via-[#8b5cf6] to-[#ff3d9a] rounded-full shadow-[0_0_10px_#22d3ee]"
              style={{ width: `${conversionProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* STEP INDICATOR 2 */}
      <div className="flex items-center gap-2 pt-4">
        <div className="px-2 py-0.5 rounded bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 font-mono-hud text-[9px] text-[#8b5cf6] font-bold uppercase tracking-wider">
          STEP 05
        </div>
        <span className="font-mono-hud text-[11px] text-white/90 uppercase font-semibold tracking-wider">
          THE EDIT TIMELINE
        </span>
      </div>

      {/* EDIT TIMELINE CARD (NLE-Style Multi-Track) */}
      <div className="hud-glass-card p-4 space-y-3">
        {/* HUD Brackets */}
        <div className="hud-bracket hud-bracket-tl" />
        <div className="hud-bracket hud-bracket-tr" />
        <div className="hud-bracket hud-bracket-bl" />
        <div className="hud-bracket hud-bracket-br" />

        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Film className="w-3.5 h-3.5 text-[#ff3d9a]" />
            <span className="font-mono-hud text-[10px] text-white/90 uppercase tracking-widest font-bold">
              NON-LINEAR SEQUENCE ASSEMBLY
            </span>
          </div>
          <span className="font-mono-hud text-[9px] text-[#22d3ee] uppercase">
            DA VINCI / PREMIERE SYNC
          </span>
        </div>

        {/* NLE TIME RULER */}
        <div className="w-full bg-black/60 rounded-md p-1.5 border border-white/10 overflow-hidden space-y-2">
          {/* Ruler Marks */}
          <div className="flex items-center justify-between px-1 text-[8px] font-mono-hud text-white/40 border-b border-white/10 pb-1">
            <span>00:00:00</span>
            <span>00:15:00</span>
            <span>00:30:00</span>
            <span>00:45:00</span>
            <span>01:02:19</span>
          </div>

          {/* TRACK V2: SFX CHIPS */}
          <div className="flex items-center gap-2">
            <div className="w-14 shrink-0 font-mono-hud text-[9px] text-white/50 uppercase font-bold flex items-center gap-1">
              <span className="text-[#ff3d9a]">V2</span> · SFX
            </div>
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              <span className="px-2 py-0.5 rounded bg-[#ff3d9a]/30 border border-[#ff3d9a]/60 text-[#ff3d9a] font-mono-hud text-[8px] font-bold uppercase shrink-0 shadow-[0_0_6px_rgba(255,61,154,0.3)]">
                TITLE
              </span>
              <span className="px-2 py-0.5 rounded bg-[#8b5cf6]/30 border border-[#8b5cf6]/60 text-purple-300 font-mono-hud text-[8px] font-bold uppercase shrink-0">
                GLITCH_01
              </span>
              <span className="px-2 py-0.5 rounded bg-[#ff3d9a]/30 border border-[#ff3d9a]/60 text-[#ff3d9a] font-mono-hud text-[8px] font-bold uppercase shrink-0">
                DRONE WHOOSH
              </span>
              <span className="px-2 py-0.5 rounded bg-[#8b5cf6]/30 border border-[#8b5cf6]/60 text-purple-300 font-mono-hud text-[8px] font-bold uppercase shrink-0">
                EXHAUST POP
              </span>
              <span className="px-2 py-0.5 rounded bg-[#ff3d9a]/40 border border-[#ff3d9a]/80 text-[#ff3d9a] font-mono-hud text-[8px] font-bold uppercase shrink-0 shadow-[0_0_8px_rgba(255,61,154,0.4)]">
                YR LOGO
              </span>
            </div>
          </div>

          {/* TRACK V1: AI SHOTS */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
            <div className="w-14 shrink-0 font-mono-hud text-[9px] text-white/50 uppercase font-bold">
              <span className="text-[#22d3ee]">V1</span> · SHOTS
            </div>
            <div className="flex-1 flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
              {shots.map((shot, idx) => {
                const isActive = idx === currentShotIndex;
                return (
                  <button
                    key={shot.id}
                    onClick={() => onSelectShot(idx)}
                    className={`h-7 px-2 shrink-0 rounded flex items-center gap-1 text-[8px] font-mono-hud uppercase transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#ff3d9a] text-white font-bold ring-1 ring-white shadow-[0_0_10px_#ff3d9a]"
                        : "bg-white/10 hover:bg-white/20 text-white/70"
                    }`}
                    title={shot.title}
                  >
                    <span>#{shot.id}</span>
                    <span className="hidden sm:inline truncate max-w-[60px]">
                      {shot.title.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TRACK A1: MUSIC */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
            <div className="w-14 shrink-0 font-mono-hud text-[9px] text-white/50 uppercase font-bold flex items-center gap-1">
              <Music className="w-2.5 h-2.5 text-[#8b5cf6]" />
              <span className="text-[#8b5cf6]">A1</span> · BGM
            </div>
            <div className="flex-1 h-6 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 flex items-center px-2 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-between px-1 opacity-60">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ height: `${Math.sin(i * 0.4) * 8 + 10}px` }}
                    className="w-[2px] bg-gradient-to-t from-[#8b5cf6] to-[#ff3d9a] rounded-full"
                  />
                ))}
              </div>
              <span className="relative z-10 font-mono-hud text-[8px] text-white/80 font-bold uppercase">
                CYBERPUNK SYNTHWAVE MASTER (48KHZ · 24-BIT)
              </span>
            </div>
          </div>
        </div>

        {/* NLE Summary specs */}
        <div className="flex items-center justify-between pt-1 font-mono-hud text-[9px] text-white/40 uppercase">
          <span>PROJECT: YR_ALEXANDRIA_FINAL_4K.DRP</span>
          <span className="text-[#22d3ee]">COLOR SPACE: ACEScc</span>
        </div>
      </div>
    </section>
  );
};
