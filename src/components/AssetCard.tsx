import React, { useState } from "react";
import { FilmAsset } from "../data/shots";
import { Sparkles, Eye, X } from "lucide-react";

interface AssetCardProps {
  asset: FilmAsset;
  isInCurrentShot: boolean;
  onSelectShotWithAsset?: (assetId: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isInCurrentShot,
  onSelectShotWithAsset,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className={`hud-glass-card group relative flex-1 min-w-0 overflow-hidden p-2.5 flex flex-col justify-between cursor-pointer select-none transition-all duration-300 ${
          isInCurrentShot
            ? "hud-asset-active scale-[1.01] opacity-100 ring-1 ring-[#ffc928]/40"
            : "opacity-60 hover:opacity-90 border-white/10"
        }`}
      >
        {/* HUD Corner Brackets */}
        <div className="hud-bracket hud-bracket-tl" />
        <div className="hud-bracket hud-bracket-tr" />
        <div className="hud-bracket hud-bracket-bl" />
        <div className="hud-bracket hud-bracket-br" />

        {/* Top Header: Asset Code & Status Badge */}
        <div className="flex items-center justify-between gap-1 mb-1.5 z-10">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isInCurrentShot ? "bg-[#ffc928] shadow-[0_0_6px_#ffc928]" : "bg-white/30"
              }`}
            />
            <span className="font-mono-hud text-[9px] uppercase tracking-wider text-white/80 font-bold truncate">
              {asset.code}
            </span>
          </div>

          {/* "IN SHOT" Warm Yellow Badge or "STANDBY" */}
          {isInCurrentShot ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ffc928] text-black font-mono-hud text-[8px] font-black tracking-wider uppercase shadow-[0_0_10px_rgba(255,201,40,0.6)] animate-pulse shrink-0">
              <Sparkles className="w-2.5 h-2.5" />
              <span>IN SHOT</span>
            </div>
          ) : (
            <div className="px-1.5 py-0.5 rounded bg-black/40 border border-white/5 font-mono-hud text-[8px] text-white/40 tracking-wider uppercase shrink-0">
              STANDBY
            </div>
          )}
        </div>

        {/* Center Thumbnail */}
        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-black/60 border border-white/10">
          <img
            src={asset.image}
            alt={asset.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* CRT scanline overlay */}
          <div className="crt-overlay absolute inset-0 pointer-events-none" />

          {/* Subtle hover inspect prompt */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity text-white text-[10px] font-mono-hud uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-[#22d3ee]" />
            <span>INSPECT</span>
          </div>

          {/* Asset Type Watermark */}
          <div className="absolute bottom-1 right-1.5 px-1 rounded bg-black/70 font-mono-hud text-[7px] text-white/60 uppercase">
            {asset.type}
          </div>
        </div>

        {/* Bottom Subtitle & Spec Pills */}
        <div className="mt-2 flex items-center justify-between z-10 pt-1 border-t border-white/5">
          <span className="font-mono-hud text-[8px] text-white/50 uppercase tracking-wider truncate">
            {asset.subtitle}
          </span>
          <span className="font-mono-hud text-[8px] text-[#22d3ee] uppercase font-semibold">
            {asset.specs[0]}
          </span>
        </div>
      </div>

      {/* Asset Inspection Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="hud-glass-card max-w-lg w-full p-5 relative border border-[#22d3ee]/40 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            {/* Brackets */}
            <div className="hud-bracket hud-bracket-tl" />
            <div className="hud-bracket hud-bracket-tr" />
            <div className="hud-bracket hud-bracket-bl" />
            <div className="hud-bracket hud-bracket-br" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="font-mono-hud text-[9px] uppercase tracking-widest text-[#22d3ee] block">
                  ASSET ARCHIVE // {asset.id}
                </span>
                <h3 className="font-display font-extrabold text-base text-white tracking-wide">
                  {asset.name}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Full Detail */}
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden my-3 border border-white/15 bg-black">
              <img
                src={asset.image}
                alt={asset.name}
                className="w-full h-full object-cover"
              />
              <div className="crt-overlay absolute inset-0 pointer-events-none" />
            </div>

            {/* Specs & Info */}
            <div className="space-y-2">
              <div className="font-mono-hud text-[9px] text-white/50 uppercase">
                MODEL SPECIFICATIONS & RIG DATA:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {asset.specs.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono-hud text-[9px] text-[#22d3ee] uppercase"
                  >
                    {spec}
                  </span>
                ))}
              </div>
              <p className="font-mono-hud text-[10px] text-white/70 leading-relaxed pt-1">
                Conditioned via LoRA weights with multi-view identity consistency across
                both day & neon dusk lighting passes.
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="font-mono-hud text-[9px] text-white/40">
                STATUS: {isInCurrentShot ? "ACTIVE IN CURRENT SHOT" : "STANDBY POOL"}
              </span>
              <button
                onClick={() => {
                  setShowModal(false);
                  if (onSelectShotWithAsset) {
                    onSelectShotWithAsset(asset.id);
                  }
                }}
                className="px-3 py-1 rounded bg-[#ff3d9a] hover:bg-[#ff3d9a]/80 text-white font-mono-hud text-[9px] font-bold uppercase tracking-wider cursor-pointer shadow-[0_0_12px_#ff3d9a]"
              >
                FIND SHOTS WITH ASSET
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
