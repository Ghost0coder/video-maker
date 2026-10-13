import React, { useMemo } from "react";

interface WaveformProps {
  progressRatio: number; // 0 to 1 across entire film
  isPlaying: boolean;
  onSeekRatio?: (ratio: number) => void;
}

export const Waveform: React.FC<WaveformProps> = ({
  progressRatio,
  isPlaying,
  onSeekRatio,
}) => {
  // Generate consistent pseudo-waveform bar heights
  const barCount = 48;
  const bars = useMemo(() => {
    // Cinematic soundtrack pattern: building intro, driving pulse, big climax
    return Array.from({ length: barCount }, (_, i) => {
      const x = i / barCount;
      const base =
        0.25 +
        0.35 * Math.sin(x * Math.PI * 4) * Math.sin(x * Math.PI) +
        0.2 * Math.sin(x * 18);
      const accent = i % 4 === 0 ? 0.35 : i % 2 === 0 ? 0.15 : 0;
      return Math.min(1.0, Math.max(0.12, base + accent));
    });
  }, [barCount]);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeekRatio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeekRatio(ratio);
  };

  return (
    <div className="w-full mt-2.5 pt-2 border-t border-white/5 select-none">
      {/* Waveform Track */}
      <div
        onClick={handleWaveformClick}
        className="relative h-9 flex items-center justify-between gap-[2px] cursor-pointer group px-0.5"
        title="Click waveform to scrub film timeline"
      >
        {bars.map((height, i) => {
          const barRatio = i / (barCount - 1);
          const isPassed = barRatio <= progressRatio;
          const barPixelHeight = Math.round(height * 32);

          return (
            <div
              key={i}
              style={{ height: `${barPixelHeight}px` }}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isPassed
                  ? "bg-gradient-to-t from-[#8b5cf6] via-[#d946ef] to-[#22d3ee] shadow-[0_0_6px_rgba(34,211,238,0.5)] opacity-100"
                  : "bg-white/10 group-hover:bg-white/15 opacity-40"
              }`}
            />
          );
        })}

        {/* Vertical scrubber line indicator on waveform */}
        <div
          className="absolute top-0 bottom-0 w-[1.5px] bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] pointer-events-none transition-[left] duration-100 ease-linear"
          style={{ left: `${progressRatio * 100}%` }}
        />
      </div>

      {/* Monospace Timecode Ticks Below */}
      <div className="flex items-center justify-between mt-1 text-[8px] font-mono-hud text-white/40 uppercase tracking-widest px-0.5">
        <span>00:00</span>
        <span>00:15</span>
        <span className="text-[#ff3d9a]/80 font-semibold">00:30 (STANLEY)</span>
        <span>00:45</span>
        <span className="text-white/60">01:02:19</span>
      </div>
    </div>
  );
};
