import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, Download, Upload, Sliders, Sun, Palette, 
  MountainSnow, Activity, Crop, Target, 
  Aperture, GitMerge, ListFilter, MousePointer2,
  Wand2, Zap, CircleDashed, Spline, ActivitySquare, Focus, Expand, 
  GripHorizontal, Pipette, Hexagon, Circle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const PhotoEditor = () => {
  const [image, setImage] = useState<string | null>(null);
  
  // The Inspector Pane (The Primary Tabs)
  const [activeTab, setActiveTab] = useState<"light" | "color" | "curve" | "hsl" | "grading" | "effects" | "masking" | "crop" | "nodes" | "scopes">("light");

  // Basic Light & Color
  const [exposure, setExposure] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [whites, setWhites] = useState(0);
  const [blacks, setBlacks] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
  const [vibrance, setVibrance] = useState(0);
  const [saturation, setSaturation] = useState(0);

  // Tone Curve
  const [curveHighlights, setCurveHighlights] = useState(0);
  const [curveLights, setCurveLights] = useState(0);
  const [curveDarks, setCurveDarks] = useState(0);
  const [curveShadows, setCurveShadows] = useState(0);

  // HSL Mixer
  const [hslChannel, setHslChannel] = useState<"red"|"orange"|"yellow"|"green"|"aqua"|"blue"|"purple"|"magenta">("red");
  const [hslData, setHslData] = useState<Record<string, {h: number, s: number, l: number}>>({
    red: { h: 0, s: 0, l: 0 },
    orange: { h: 0, s: 0, l: 0 },
    yellow: { h: 0, s: 0, l: 0 },
    green: { h: 0, s: 0, l: 0 },
    aqua: { h: 0, s: 0, l: 0 },
    blue: { h: 0, s: 0, l: 0 },
    purple: { h: 0, s: 0, l: 0 },
    magenta: { h: 0, s: 0, l: 0 },
  });

  // Color Grading Wheels
  const [gradingWheel, setGradingWheel] = useState<"shadows"|"midtones"|"highlights"|"global">("midtones");
  
  // Effects Panel
  const [texture, setTexture] = useState(0);
  const [clarity, setClarity] = useState(0);
  const [dehaze, setDehaze] = useState(0);
  const [vignetteAmount, setVignetteAmount] = useState(0);
  const [vignetteMidpoint, setVignetteMidpoint] = useState(50);
  const [grainAmount, setGrainAmount] = useState(0);
  const [grainSize, setGrainSize] = useState(25);
  const [borderWidth, setBorderWidth] = useState(0);

  // Crop & Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState("original");
  const [rotation, setRotation] = useState(0);

  // Hollywood Nodes
  const [nodes, setNodes] = useState<{id: string, name: string, active: boolean}[]>([
    { id: "1", name: "Primary Grade", active: true },
    { id: "2", name: "Skin Tones", active: true },
    { id: "3", name: "Film Look Lut", active: false }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  const handleExport = () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.filter = getStyle();
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = 'edited-photo.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    };
  };

  const getStyle = () => {
    let filterString = "";
    
    // Complex mapping approximation for standard CSS filters
    const b = 100 + (exposure * 50);
    const c = 100 + (contrast * 50);
    const s = 100 + (saturation * 50) + (vibrance * 25);
    
    filterString += `brightness(${b}%) `;
    filterString += `contrast(${c}%) `;
    filterString += `saturate(${s}%) `;

    if (temperature > 0) {
      filterString += `sepia(${temperature * 30}%) hue-rotate(${-temperature * 5}deg) saturate(${100 + temperature*20}%) `;
    } else if (temperature < 0) {
      filterString += `saturate(${100 + Math.abs(temperature)*20}%) hue-rotate(${Math.abs(temperature) * 20}deg) brightness(${100 - Math.abs(temperature)*10}%) `;
    }

    if (tint !== 0) {
      filterString += `hue-rotate(${tint * 20}deg) `;
    }

    if (dehaze > 0) {
      filterString += `contrast(${100 + dehaze * 50}%) brightness(${100 - dehaze * 20}%) `;
    }

    if (rotation !== 0) {
       // handled via transform
    }

    return filterString.trim();
  };

  const renderSlider = (label: string, value: number, setter: (val: number) => void, min = -1, max = 1, showNumber = true) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] text-stone-400 font-mono">
        <span>{label}</span>
        {showNumber && <span className="text-stone-200">{value > 0 ? `+${(value*100).toFixed(0)}` : (value*100).toFixed(0)}</span>}
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step="0.01" 
        value={value} 
        onChange={(e) => setter(Number(e.target.value))} 
        className="w-full h-1 bg-stone-800 rounded-lg appearance-none accent-amber-500" 
      />
    </div>
  );

  return (
    <div className="flex h-full w-full bg-stone-950 text-stone-100 overflow-hidden">
      {/* Left Sidebar - Hollywood Nodes & Scopes */}
      <div className="w-16 lg:w-64 bg-stone-900 border-r border-stone-800 flex flex-col hidden sm:flex">
        <div className="p-4 border-b border-stone-800 flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-xs uppercase tracking-widest text-stone-300 hidden lg:block font-mono">Nodes & Scopes</h2>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono uppercase text-stone-500 hidden lg:block">Hollywood Color Nodes</h3>
            <div className="space-y-2">
              {nodes.map(node => (
                <div key={node.id} className="flex items-center gap-2 p-2 bg-stone-950 border border-stone-800 rounded-lg group cursor-pointer hover:border-amber-500/50">
                  <div className={`w-3 h-3 rounded-full border ${node.active ? 'bg-amber-500 border-amber-400' : 'bg-stone-800 border-stone-700'}`} />
                  <span className="text-[10px] font-mono text-stone-300 hidden lg:block truncate">{node.name}</span>
                </div>
              ))}
              <button className="w-full py-2 border border-dashed border-stone-700 rounded-lg text-[10px] font-mono text-stone-500 hover:text-stone-300 hover:border-stone-500 hidden lg:block">
                + Add Serial Node
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-mono uppercase text-stone-500 hidden lg:block">Advanced Scopes</h3>
            <div className="aspect-video bg-stone-950 rounded-lg border border-stone-800 relative overflow-hidden group flex items-center justify-center">
               <ActivitySquare className="w-8 h-8 text-stone-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-red-500/20 via-green-500/20 to-blue-500/20 opacity-30 mix-blend-screen" />
               <span className="absolute bottom-1 left-1 text-[8px] font-mono text-stone-500">RGB PARADE</span>
            </div>
            <div className="aspect-square bg-stone-950 rounded-lg border border-stone-800 relative overflow-hidden group flex items-center justify-center">
               <Target className="w-8 h-8 text-stone-700" />
               <div className="absolute inset-0 bg-stone-900/50 rounded-full scale-75 border border-stone-800" />
               <span className="absolute bottom-1 left-1 text-[8px] font-mono text-stone-500">VECTORSCOPE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 flex flex-col relative bg-stone-950">
        <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950/80 backdrop-blur z-10">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded text-xs font-mono font-bold flex items-center gap-2 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Image
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          {image && (
            <div className="flex gap-2">
               <button className="px-3 py-1.5 bg-stone-900 border border-stone-700 hover:bg-stone-800 rounded text-xs font-mono font-bold flex items-center gap-2 transition-colors text-stone-300">
                <Focus className="w-3.5 h-3.5" /> Before / After
              </button>
              <button 
                onClick={handleExport}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded text-xs font-mono font-bold flex items-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3hOhgoEBo/HQAaOQQAJGOI0EBsI3w2g8dMAoJJCAEU4jAQB3sBwR6k11WwAAAABJRU5ErkJggg==')]">
          {image ? (
            <div className="relative max-w-full max-h-full flex items-center justify-center rounded-lg shadow-2xl group">
              <div 
                 className="relative overflow-hidden transition-all duration-200"
                 style={{
                    border: `${borderWidth}px solid white`,
                    transform: `rotate(${rotation}deg)`
                 }}
              >
                <img 
                  src={image} 
                  alt="Editing Canvas" 
                  className="max-w-full max-h-[75vh] object-contain transition-all duration-100"
                  style={{ filter: getStyle() }}
                />
                
                {/* Vignette Overlay */}
                {vignetteAmount !== 0 && (
                  <div 
                    className="absolute inset-0 pointer-events-none mix-blend-multiply"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, transparent ${vignetteMidpoint}%, rgba(0,0,0,${Math.abs(vignetteAmount)}))`
                    }}
                  />
                )}
                
                {/* Grain Overlay */}
                {grainAmount > 0 && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${0.5 + grainSize * 0.05}' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                      opacity: grainAmount
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-stone-500 space-y-4">
              <Aperture className="w-16 h-16 opacity-20" />
              <p className="font-mono text-sm">Upload an image to start grading</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - The Inspector Pane */}
      <div className="w-80 bg-stone-900 border-l border-stone-800 flex flex-col h-full z-20">
        
        {/* Inspector Tabs */}
        <div className="grid grid-cols-5 gap-0.5 p-1 bg-stone-950 border-b border-stone-800 shrink-0">
          {[
            { id: "light", icon: Sun, title: "Light" },
            { id: "color", icon: Palette, title: "Color" },
            { id: "curve", icon: Spline, title: "Tone Curve" },
            { id: "hsl", icon: ListFilter, title: "Color Mixer" },
            { id: "grading", icon: Target, title: "Color Grading" },
            { id: "effects", icon: Wand2, title: "Effects" },
            { id: "masking", icon: CircleDashed, title: "Masking" },
            { id: "crop", icon: Crop, title: "Crop & Geometry" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-2 flex items-center justify-center rounded-lg transition-colors ${activeTab === tab.id ? "bg-stone-800 text-amber-500" : "text-stone-500 hover:text-stone-300 hover:bg-stone-900"}`}
              title={tab.title}
            >
              <tab.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-stone-800">
          <AnimatePresence mode="wait">
            
            {activeTab === "light" && (
              <motion.div key="light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800/50 pb-2 flex items-center gap-2">
                    <Sun className="w-3 h-3" /> Basic Light
                  </h3>
                  {renderSlider("Exposure", exposure, setExposure)}
                  {renderSlider("Contrast", contrast, setContrast)}
                  {renderSlider("Highlights", highlights, setHighlights)}
                  {renderSlider("Shadows", shadows, setShadows)}
                  {renderSlider("Whites", whites, setWhites)}
                  {renderSlider("Blacks", blacks, setBlacks)}
                </div>
              </motion.div>
            )}

            {activeTab === "color" && (
              <motion.div key="color" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800/50 pb-2 flex items-center gap-2">
                    <Palette className="w-3 h-3" /> White Balance & Color
                  </h3>
                  {renderSlider("Temp", temperature, setTemperature)}
                  {renderSlider("Tint", tint, setTint)}
                  <div className="h-4" />
                  {renderSlider("Vibrance", vibrance, setVibrance)}
                  {renderSlider("Saturation", saturation, setSaturation)}
                </div>
              </motion.div>
            )}

            {activeTab === "curve" && (
              <motion.div key="curve" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800/50 pb-2 flex items-center gap-2">
                    <Spline className="w-3 h-3" /> Tone Curve (Parametric)
                  </h3>
                  <div className="aspect-square bg-stone-950 rounded-xl border border-stone-800 relative overflow-hidden p-4 flex flex-col">
                     {/* Mock Curve Grid */}
                     <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                       {[...Array(16)].map((_, i) => (
                         <div key={i} className="border-[0.5px] border-stone-800/50" />
                       ))}
                     </div>
                     <div className="flex-1 w-full h-full relative z-10">
                        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                           <path d={`M 0 100 C 25 ${100 - (curveShadows*20 + 25)}, 75 ${100 - (curveHighlights*20 + 75)}, 100 0`} fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500" />
                        </svg>
                     </div>
                  </div>
                  {renderSlider("Highlights", curveHighlights, setCurveHighlights)}
                  {renderSlider("Lights", curveLights, setCurveLights)}
                  {renderSlider("Darks", curveDarks, setCurveDarks)}
                  {renderSlider("Shadows", curveShadows, setCurveShadows)}
                </div>
              </motion.div>
            )}

            {activeTab === "hsl" && (
              <motion.div key="hsl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800/50 pb-2 flex items-center gap-2">
                    <ListFilter className="w-3 h-3" /> Color Mixer (HSL/Color)
                  </h3>
                  <div className="flex gap-1 mb-4 flex-wrap">
                    {["red", "orange", "yellow", "green", "aqua", "blue", "purple", "magenta"].map(c => (
                      <button 
                        key={c}
                        onClick={() => setHslChannel(c as any)}
                        className={`w-6 h-6 rounded-full border-2 ${hslChannel === c ? 'border-white scale-110' : 'border-transparent opacity-60'} transition-all`}
                        style={{ backgroundColor: c === 'aqua' ? '#0ff' : c }}
                      />
                    ))}
                  </div>
                  {renderSlider("Hue", hslData[hslChannel].h, (val) => setHslData(prev => ({...prev, [hslChannel]: {...prev[hslChannel], h: val}})))}
                  {renderSlider("Saturation", hslData[hslChannel].s, (val) => setHslData(prev => ({...prev, [hslChannel]: {...prev[hslChannel], s: val}})))}
                  {renderSlider("Luminance", hslData[hslChannel].l, (val) => setHslData(prev => ({...prev, [hslChannel]: {...prev[hslChannel], l: val}})))}
                </div>
              </motion.div>
            )}

            {activeTab === "grading" && (
              <motion.div key="grading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800/50 pb-2 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Color Grading
                  </h3>
                  
                  <div className="flex bg-stone-950 rounded-lg p-1 border border-stone-800 font-mono text-[10px]">
                    {["shadows", "midtones", "highlights", "global"].map(t => (
                      <button 
                        key={t}
                        onClick={() => setGradingWheel(t as any)}
                        className={`flex-1 py-1.5 rounded-md capitalize ${gradingWheel === t ? "bg-stone-800 text-amber-500 font-bold" : "text-stone-500"}`}
                      >
                        {t.slice(0,3)}
                      </button>
                    ))}
                  </div>

                  <div className="aspect-square bg-stone-950 rounded-full border border-stone-800 relative mt-4 shadow-inner flex items-center justify-center group overflow-hidden">
                    {/* The Wheel */}
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] opacity-30" />
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,black_0%,transparent_100%)] opacity-80" />
                    
                    <div className="w-4 h-4 bg-white rounded-full border-2 border-stone-950 absolute z-10 shadow-lg cursor-move" />
                    <div className="w-full h-[1px] bg-stone-800/50 absolute top-1/2 left-0" />
                    <div className="h-full w-[1px] bg-stone-800/50 absolute top-0 left-1/2" />
                  </div>
                  
                  <div className="pt-4 space-y-4">
                    {renderSlider("Luminance", 0, () => {}, -1, 1, false)}
                    {renderSlider("Blending", 0.5, () => {}, 0, 1, false)}
                    {renderSlider("Balance", 0, () => {}, -1, 1, false)}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "effects" && (
              <motion.div key="effects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800/50 pb-2 flex items-center gap-2">
                    <Wand2 className="w-3 h-3" /> Effects Panel
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-[9px] font-mono text-stone-500 uppercase tracking-wider mb-2">Texture & Clarity</p>
                    {renderSlider("Texture", texture, setTexture)}
                    {renderSlider("Clarity", clarity, setClarity)}
                    {renderSlider("Dehaze", dehaze, setDehaze)}
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-stone-800/50">
                    <p className="text-[9px] font-mono text-stone-500 uppercase tracking-wider mb-2">Vignette</p>
                    {renderSlider("Amount", vignetteAmount, setVignetteAmount, -1, 1)}
                    {renderSlider("Midpoint", vignetteMidpoint, setVignetteMidpoint, 0, 100)}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-800/50">
                    <p className="text-[9px] font-mono text-stone-500 uppercase tracking-wider mb-2">Grain</p>
                    {renderSlider("Amount", grainAmount, setGrainAmount, 0, 1)}
                    {renderSlider("Size", grainSize, setGrainSize, 1, 100)}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "masking" && (
              <motion.div key="masking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800/50 pb-2 flex items-center gap-2">
                    <CircleDashed className="w-3 h-3" /> Masking Tools
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex flex-col items-center justify-center p-4 bg-stone-950 border border-stone-800 rounded-xl hover:border-amber-500/50 gap-2">
                       <MousePointer2 className="w-5 h-5 text-stone-400" />
                       <span className="text-[10px] font-mono text-stone-300">Subject</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-stone-950 border border-stone-800 rounded-xl hover:border-amber-500/50 gap-2">
                       <MountainSnow className="w-5 h-5 text-stone-400" />
                       <span className="text-[10px] font-mono text-stone-300">Sky</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-stone-950 border border-stone-800 rounded-xl hover:border-amber-500/50 gap-2">
                       <div className="w-5 h-5 bg-gradient-to-t from-stone-400 to-transparent opacity-80" />
                       <span className="text-[10px] font-mono text-stone-300">Linear</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-stone-950 border border-stone-800 rounded-xl hover:border-amber-500/50 gap-2">
                       <Circle className="w-5 h-5 text-stone-400 border border-dashed rounded-full" />
                       <span className="text-[10px] font-mono text-stone-300">Radial</span>
                    </button>
                  </div>
                  <div className="pt-4 border-t border-stone-800/50 text-center">
                    <p className="text-[10px] font-mono text-stone-500">Create a new mask to apply local adjustments.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "crop" && (
              <motion.div key="crop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800/50 pb-2 flex items-center gap-2">
                    <Crop className="w-3 h-3" /> Crop & Geometry
                  </h3>
                  
                  <div className="space-y-2">
                     <p className="text-[9px] font-mono text-stone-500 uppercase tracking-wider">Aspect Ratio</p>
                     <select 
                        value={aspectRatio} 
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs font-mono text-stone-300 focus:outline-none focus:border-amber-500"
                     >
                       <option value="original">Original</option>
                       <option value="1:1">1:1 (Square)</option>
                       <option value="4:3">4:3</option>
                       <option value="16:9">16:9</option>
                       <option value="2:3">2:3</option>
                     </select>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-800/50">
                    <p className="text-[9px] font-mono text-stone-500 uppercase tracking-wider mb-2">Transform</p>
                    {renderSlider("Angle (Rotation)", rotation, setRotation, -45, 45)}
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-stone-800/50">
                    <p className="text-[9px] font-mono text-stone-500 uppercase tracking-wider mb-2">Framing Border</p>
                    {renderSlider("Border Width", borderWidth, setBorderWidth, 0, 100)}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
