import React, { useState, useRef, useEffect, useCallback, ChangeEvent, DragEvent } from "react";
import {
  Upload,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Music,
  Plus,
  Trash2,
  Video,
  Settings,
  Volume2,
  VolumeX,
  Layout,
  RefreshCw,
  Clock,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Eye,
  Type as FontIcon,
  Layers,
  Sparkle,
  Copy,
  FolderOpen,
  Undo,
  Redo,
  Compass,
  Bookmark,
  Save,
  Check,
  Library,
  Images
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CollegeMelodyGenerator } from "./utils";

interface VideoSlide {
  id: string;
  url: string;
  name: string;
  duration: number; // in seconds
  transition: "zoom" | "panLeft" | "panRight" | "slideUp" | "slideLeft" | "slideRight" | "blurFade" | "retroSpin" | "zoomOut" | "tiltUp" | "tiltDown" | "vortex" | "glitch" | "fadeOnly";
  caption: string;
  fitMode?: "cover" | "contain";
  zoomMultiplier?: number; // scale adjustment from 0.6 to 2.0
  showSubtitle?: boolean;
  volume?: number; // individual slide volume adjustment (0 to 100, default 100)
  filter?: "none" | "grayscale" | "sepia" | "vibrant" | "vintage" | "invert" | "warm" | "cool" | "dramatic" | "cyberpunk" | "technicolor" | "monochrome" | "dream"; // artistic filters
  motionAngle?: number; // 0 to 360
  motionSpeed?: number; // 0 to 100
  anchorX?: number; // 0 to 100
  anchorY?: number; // 0 to 100
  maskType?: "none" | "radial_focus" | "vignette" | "split_mask";
  maskRadius?: number; // 10 to 100
  maskFeather?: number; // 0 to 100
  cameraRoll?: number; // -45 to 45
  cameraPitch?: number; // -45 to 45
  cameraYaw?: number; // -45 to 45
  parallaxEnabled?: boolean;
  parallaxStrength?: number; // 0 to 100
  vfxType?: "none" | "lens_flare" | "light_leak" | "film_grain" | "snow" | "rain" | "vhs" | "bokeh";
  vfxIntensity?: number; // 0 to 100
}

interface StylePreset {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
  transition: "zoom" | "panLeft" | "panRight" | "slideUp" | "slideLeft" | "slideRight" | "blurFade" | "retroSpin" | "zoomOut" | "tiltUp" | "tiltDown" | "vortex" | "glitch" | "fadeOnly";
  filter: "none" | "grayscale" | "sepia" | "vibrant" | "vintage" | "invert" | "warm" | "cool" | "dramatic" | "cyberpunk" | "technicolor" | "monochrome" | "dream";
  vfxType: "none" | "lens_flare" | "light_leak" | "film_grain" | "snow" | "rain" | "vhs" | "bokeh";
  vfxIntensity: number;
  maskType?: "none" | "radial_focus" | "vignette" | "split_mask";
  maskRadius?: number;
  maskFeather?: number;
  cameraRoll?: number;
  cameraPitch?: number;
  cameraYaw?: number;
  parallaxEnabled?: boolean;
  parallaxStrength?: number;
  motionSpeed?: number;
  motionAngle?: number;
}

const SYSTEM_PRESETS: StylePreset[] = [
  {
    id: "vintage_35mm",
    name: "📽️ Vintage 35mm Cinema",
    description: "Nostalgic warm tones, subtle analog film grain, and elegant zooming transitions.",
    transition: "zoom",
    filter: "vintage",
    vfxType: "film_grain",
    vfxIntensity: 45,
    cameraRoll: 1,
    parallaxEnabled: true,
    parallaxStrength: 25,
    maskType: "vignette",
    maskRadius: 80,
    maskFeather: 60
  },
  {
    id: "cyberpunk_neon",
    name: "🌆 Cyberpunk Neon Horizon",
    description: "Vibrant futuristic color grading, high-intensity projector light leaks, and pan-left dynamics.",
    transition: "panLeft",
    filter: "cyberpunk",
    vfxType: "light_leak",
    vfxIntensity: 65,
    cameraPitch: 5,
    cameraRoll: -3,
    maskType: "vignette",
    maskRadius: 85,
    maskFeather: 50
  },
  {
    id: "golden_dream",
    name: "🟡 Golden Hour Dream",
    description: "Warm glow filter, dreamy floating bokeh particles, and smooth pan-right motion.",
    transition: "panRight",
    filter: "dream",
    vfxType: "bokeh",
    vfxIntensity: 50,
    maskType: "vignette",
    maskRadius: 80,
    maskFeather: 60,
    parallaxEnabled: true,
    parallaxStrength: 20
  },
  {
    id: "noir_storm",
    name: "🌧️ Cinematic Noir Storm",
    description: "High-contrast monochrome filter, atmospheric vertical rain drops, and dramatic focal zoom.",
    transition: "zoom",
    filter: "monochrome",
    vfxType: "rain",
    vfxIntensity: 70,
    maskType: "vignette",
    maskRadius: 65,
    maskFeather: 45
  },
  {
    id: "retro_vhs",
    name: "📼 Retro 80s VHS Tape",
    description: "Warm analog hues, 240p VCR tracking distortion, scanlines, and camera roll slant.",
    transition: "zoomOut",
    filter: "warm",
    vfxType: "vhs",
    vfxIntensity: 60,
    cameraRoll: -1,
    maskType: "split_mask"
  },
  {
    id: "cozy_snow",
    name: "❄️ Atmospheric Cozy Snow",
    description: "Cool glacier tones, gentle falling winter snow drifts, and tilt-up perspective.",
    transition: "tiltUp",
    filter: "cool",
    vfxType: "snow",
    vfxIntensity: 55,
    maskType: "vignette",
    maskRadius: 90,
    maskFeather: 70,
    parallaxEnabled: true,
    parallaxStrength: 35
  },
  {
    id: "anamorphic_flare",
    name: "🎥 Lens Flare Glamour",
    description: "High-contrast dramatic lighting, anamorphic streak flare tracking, and camera perspective.",
    transition: "slideLeft",
    filter: "dramatic",
    vfxType: "lens_flare",
    vfxIntensity: 60,
    cameraPitch: -3,
    cameraYaw: 4,
    maskType: "radial_focus",
    maskRadius: 75,
    maskFeather: 55
  }
];

export const getFilterCss = (filter?: string): string => {
  if (!filter || filter === "none") return "none";
  switch (filter) {
    case "grayscale":
      return "grayscale(100%)";
    case "sepia":
      return "sepia(100%)";
    case "vibrant":
      return "saturate(180%) contrast(115%)";
    case "vintage":
      return "contrast(115%) sepia(35%) saturate(110%)";
    case "invert":
      return "invert(100%)";
    case "warm":
      return "sepia(20%) saturate(130%)";
    case "cool":
      return "contrast(105%) hue-rotate(-10deg) saturate(95%)";
    case "dramatic":
      return "contrast(135%) saturate(50%) brightness(90%)";
    case "cyberpunk":
      return "contrast(125%) saturate(160%) hue-rotate(55deg) brightness(110%)";
    case "technicolor":
      return "contrast(140%) sepia(12%) saturate(210%) hue-rotate(-8deg)";
    case "monochrome":
      return "contrast(210%) grayscale(100%) brightness(105%)";
    case "dream":
      return "contrast(90%) brightness(112%) saturate(115%) blur(0.4px)";
    default:
      return "none";
  }
};

function compressImage(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export to JPEG with specified quality
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function compressDataUrl(dataUrl: string, maxWidth = 1000, maxHeight = 1000, quality = 0.6): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    return Promise.resolve(dataUrl);
  }
  // If already compact, skip
  if (dataUrl.length < 120000) {
    return Promise.resolve(dataUrl);
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}

function safeSaveToLocalStorage(key: string, data: any, pruneCallback?: (data: any) => any): boolean {
  let success = false;
  let attempts = 0;
  let currentData = data;
  while (!success && attempts < 30) {
    try {
      localStorage.setItem(key, JSON.stringify(currentData));
      success = true;
    } catch (e: any) {
      if (e.name === "QuotaExceededError" || e.code === 22 || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
        console.warn(`LocalStorage quota exceeded for key ${key}. Attempting to prune...`);
        if (pruneCallback) {
          const pruned = pruneCallback(currentData);
          if (pruned === currentData || (Array.isArray(pruned) && pruned.length === currentData.length)) {
            // Pruning didn't reduce anything, stop to prevent infinite loop
            break;
          }
          currentData = pruned;
          attempts++;
        } else {
          break;
        }
      } else {
        console.error(`Failed to save to localStorage for key ${key}`, e);
        break;
      }
    }
  }
  return success;
}

function getInitialSlides(): VideoSlide[] {
  try {
    const saved = localStorage.getItem("cinematic_slides_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading slides from localStorage", e);
  }
  return [];
}

interface GalleryAsset {
  id: string;
  url: string;
  name: string;
  addedAt: number;
}

function getInitialGalleryAssets(): GalleryAsset[] {
  try {
    const saved = localStorage.getItem("cinematic_asset_gallery");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading asset gallery from localStorage", e);
  }
  return [];
}

export default function App() {
  // Timeline Slides State
  const [slides, setSlides] = useState<VideoSlide[]>(getInitialSlides);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Asset Gallery States
  const [isAssetGalleryOpen, setIsAssetGalleryOpen] = useState<boolean>(false);
  const [galleryAssets, setGalleryAssets] = useState<GalleryAsset[]>(getInitialGalleryAssets);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [draggedAssetIdx, setDraggedAssetIdx] = useState<number | null>(null);

  // Ref for the sidebar file upload input
  const sidebarFileInputRef = useRef<HTMLInputElement>(null);

  // Background optimization of existing large assets on startup
  useEffect(() => {
    let needsSlideUpdate = false;
    let needsGalleryUpdate = false;

    const optimizeAssets = async () => {
      const optimizedSlides = await Promise.all(
        slides.map(async (slide) => {
          if (slide.url && slide.url.startsWith("data:image/") && slide.url.length > 150000) {
            try {
              const compressed = await compressDataUrl(slide.url);
              if (compressed.length < slide.url.length) {
                needsSlideUpdate = true;
                return { ...slide, url: compressed };
              }
            } catch (err) {
              console.error("Error optimizing slide image on startup", err);
            }
          }
          return slide;
        })
      );

      const optimizedGallery = await Promise.all(
        galleryAssets.map(async (asset) => {
          if (asset.url && asset.url.startsWith("data:image/") && asset.url.length > 150000) {
            try {
              const compressed = await compressDataUrl(asset.url);
              if (compressed.length < asset.url.length) {
                needsGalleryUpdate = true;
                return { ...asset, url: compressed };
              }
            } catch (err) {
              console.error("Error optimizing gallery asset image on startup", err);
            }
          }
          return asset;
        })
      );

      if (needsSlideUpdate) {
        setSlides(optimizedSlides);
      }
      if (needsGalleryUpdate) {
        setGalleryAssets(optimizedGallery);
      }
    };

    optimizeAssets();
  }, []);

  // Auto-sync asset gallery to localStorage
  useEffect(() => {
    const pruneGallery = (assets: GalleryAsset[]) => {
      if (assets.length === 0) return assets;
      // Reduce by 25%, but guarantee at least 1 element is removed to prevent infinite loops/stalls
      const targetLength = Math.min(assets.length - 1, Math.floor(assets.length * 0.75));
      return assets.slice(0, targetLength);
    };

    const success = safeSaveToLocalStorage("cinematic_asset_gallery", galleryAssets, pruneGallery);
    if (!success) {
      console.warn("Failed to save asset gallery to localStorage even after pruning.");
    } else {
      // If we actually pruned, we should update the state so it is in sync
      const savedDataStr = localStorage.getItem("cinematic_asset_gallery");
      if (savedDataStr) {
        try {
          const parsed = JSON.parse(savedDataStr);
          if (Array.isArray(parsed) && parsed.length < galleryAssets.length) {
            setGalleryAssets(parsed);
            setPresetFeedback("Storage quota reached. Older gallery assets were automatically pruned to save space.");
            setTimeout(() => setPresetFeedback(null), 5000);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [galleryAssets]);

  // Populates asset gallery from existing slides if empty on startup
  useEffect(() => {
    if (galleryAssets.length === 0 && slides.length > 0) {
      const initialAssets: GalleryAsset[] = slides.map((slide, idx) => ({
        id: `asset_init_${idx}_${Date.now()}`,
        url: slide.url,
        name: slide.name || `Memory_${idx + 1}`,
        addedAt: Date.now() - (slides.length - idx) * 1000
      }));
      setGalleryAssets(initialAssets);
    }
  }, [slides]);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(() => {
    const initial = getInitialSlides();
    return initial.length > 0 ? initial[0].id : null;
  });
  
  // Video Global Aspect Ratio State
  const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16" | "1:1" | "4:3">("16:9");

  // Export Resolution State
  const [exportResolution, setExportResolution] = useState<"720p" | "1080p" | "4k" | "8k">("1080p");

  // Export Format State (WebM vs highly-compatible MP4)
  const [exportFormat, setExportFormat] = useState<"webm" | "mp4">("mp4");

  // Subtitle / Caption Global State
  const [globalShowSubtitles, setGlobalShowSubtitles] = useState<boolean>(true);

  // Styles & Presets Studio States
  const [customPresets, setCustomPresets] = useState<StylePreset[]>(() => {
    try {
      const saved = localStorage.getItem("cinematic_custom_presets");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error reading custom presets from localStorage", e);
    }
    return [];
  });
  const [newPresetName, setNewPresetName] = useState<string>("");
  const [presetFeedback, setPresetFeedback] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("cinematic_custom_presets", JSON.stringify(customPresets));
    } catch (e) {
      console.error("Failed to save custom presets to localStorage", e);
    }
  }, [customPresets]);

  const saveCurrentStylesAsPreset = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const currentSlide = slides[currentIndex];
    if (!currentSlide) return;

    const newPreset: StylePreset = {
      id: `preset_${Date.now()}`,
      name: trimmed,
      description: `Custom Preset • Created ${new Date().toLocaleDateString()}`,
      isCustom: true,
      transition: currentSlide.transition || "zoom",
      filter: currentSlide.filter || "none",
      vfxType: currentSlide.vfxType || "none",
      vfxIntensity: currentSlide.vfxIntensity !== undefined ? currentSlide.vfxIntensity : 50,
      maskType: currentSlide.maskType || "none",
      maskRadius: currentSlide.maskRadius,
      maskFeather: currentSlide.maskFeather,
      cameraRoll: currentSlide.cameraRoll,
      cameraPitch: currentSlide.cameraPitch,
      cameraYaw: currentSlide.cameraYaw,
      parallaxEnabled: currentSlide.parallaxEnabled,
      parallaxStrength: currentSlide.parallaxStrength,
      motionSpeed: currentSlide.motionSpeed,
      motionAngle: currentSlide.motionAngle
    };

    setCustomPresets(prev => [newPreset, ...prev]);
    setNewPresetName("");
    setPresetFeedback(`Style preset "${trimmed}" successfully saved!`);
    setTimeout(() => setPresetFeedback(null), 4000);
  };

  const loadPreset = (preset: StylePreset, applyToAll: boolean) => {
    if (slides.length === 0) return;

    if (applyToAll) {
      const updated = slides.map(slide => ({
        ...slide,
        transition: preset.transition,
        filter: preset.filter,
        vfxType: preset.vfxType,
        vfxIntensity: preset.vfxIntensity,
        maskType: preset.maskType || "none",
        maskRadius: preset.maskRadius !== undefined ? preset.maskRadius : slide.maskRadius,
        maskFeather: preset.maskFeather !== undefined ? preset.maskFeather : slide.maskFeather,
        cameraRoll: preset.cameraRoll !== undefined ? preset.cameraRoll : slide.cameraRoll,
        cameraPitch: preset.cameraPitch !== undefined ? preset.cameraPitch : slide.cameraPitch,
        cameraYaw: preset.cameraYaw !== undefined ? preset.cameraYaw : slide.cameraYaw,
        parallaxEnabled: preset.parallaxEnabled !== undefined ? preset.parallaxEnabled : slide.parallaxEnabled,
        parallaxStrength: preset.parallaxStrength !== undefined ? preset.parallaxStrength : slide.parallaxStrength,
        motionSpeed: preset.motionSpeed !== undefined ? preset.motionSpeed : slide.motionSpeed,
        motionAngle: preset.motionAngle !== undefined ? preset.motionAngle : slide.motionAngle
      }));
      setSlides(updated);
      setPresetFeedback(`Successfully applied "${preset.name}" to all slides!`);
    } else {
      const updated = [...slides];
      updated[currentIndex] = {
        ...updated[currentIndex],
        transition: preset.transition,
        filter: preset.filter,
        vfxType: preset.vfxType,
        vfxIntensity: preset.vfxIntensity,
        maskType: preset.maskType || "none",
        maskRadius: preset.maskRadius !== undefined ? preset.maskRadius : updated[currentIndex].maskRadius,
        maskFeather: preset.maskFeather !== undefined ? preset.maskFeather : updated[currentIndex].maskFeather,
        cameraRoll: preset.cameraRoll !== undefined ? preset.cameraRoll : updated[currentIndex].cameraRoll,
        cameraPitch: preset.cameraPitch !== undefined ? preset.cameraPitch : updated[currentIndex].cameraPitch,
        cameraYaw: preset.cameraYaw !== undefined ? preset.cameraYaw : updated[currentIndex].cameraYaw,
        parallaxEnabled: preset.parallaxEnabled !== undefined ? preset.parallaxEnabled : updated[currentIndex].parallaxEnabled,
        parallaxStrength: preset.parallaxStrength !== undefined ? preset.parallaxStrength : updated[currentIndex].parallaxStrength,
        motionSpeed: preset.motionSpeed !== undefined ? preset.motionSpeed : updated[currentIndex].motionSpeed,
        motionAngle: preset.motionAngle !== undefined ? preset.motionAngle : updated[currentIndex].motionAngle
      };
      setSlides(updated);
      setPresetFeedback(`Applied "${preset.name}" to the current slide!`);
    }

    setPreviewToggle(prev => prev + 1);
    setTimeout(() => setPresetFeedback(null), 4000);
  };

  const deleteCustomPreset = (id: string) => {
    setCustomPresets(prev => prev.filter(p => p.id !== id));
    setPresetFeedback("Custom preset deleted successfully.");
    setTimeout(() => setPresetFeedback(null), 3000);
  };

  // Transition Preview Trigger State
  const [previewToggle, setPreviewToggle] = useState<number>(0);

  // State History Hooks for Undo / Redo
  const [past, setPast] = useState<VideoSlide[][]>([]);
  const [future, setFuture] = useState<VideoSlide[][]>([]);
  const isUndoRedoActionRef = useRef<boolean>(false);
  const prevSlidesRef = useRef<VideoSlide[]>(getInitialSlides());

  // Auto-sync slides to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("cinematic_slides_data", JSON.stringify(slides));
    } catch (e: any) {
      if (e.name === "QuotaExceededError" || e.code === 22 || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
        console.warn("LocalStorage quota exceeded for slides. Trying to clear custom assets first to make room...");
        try {
          const gallery = localStorage.getItem("cinematic_asset_gallery");
          if (gallery) {
            const parsed = JSON.parse(gallery);
            if (Array.isArray(parsed) && parsed.length > 5) {
              const pruned = parsed.slice(0, 5);
              localStorage.setItem("cinematic_asset_gallery", JSON.stringify(pruned));
              setGalleryAssets(pruned);
              
              // Retry saving slides
              localStorage.setItem("cinematic_slides_data", JSON.stringify(slides));
              setPresetFeedback("Storage space freed. Stored gallery assets were cleared/pruned to save your project slides.");
              setTimeout(() => setPresetFeedback(null), 5000);
              return;
            }
          }
        } catch (err) {
          console.error("Failed to prune gallery for slides", err);
        }
        console.error("Failed to save slides even after clearing gallery space.", e);
      } else {
        console.error("Failed to save slides to localStorage", e);
      }
    }
  }, [slides]);

  // Intercept changes to slides to automatically save history
  useEffect(() => {
    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      prevSlidesRef.current = slides;
      return;
    }

    const currentStr = JSON.stringify(slides);
    const prevStr = JSON.stringify(prevSlidesRef.current);

    if (currentStr !== prevStr) {
      // If we have an existing previous state, save it to history
      if (prevSlidesRef.current && (prevSlidesRef.current.length > 0 || slides.length > 0)) {
        setPast((prevPast) => [...prevPast.slice(-29), prevSlidesRef.current]);
        setFuture([]); // Reset redo stack on new user action
      }
      prevSlidesRef.current = slides;
    }
  }, [slides]);

  // Undo Action
  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    isUndoRedoActionRef.current = true;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture((prevFuture) => [slides, ...prevFuture]);
    setSlides(previous);

    // Keep active indices in bounds
    if (previous.length > 0) {
      setCurrentIndex((prevIdx) => Math.min(prevIdx, previous.length - 1));
    } else {
      setCurrentIndex(0);
    }
  }, [past, slides]);

  // Redo Action
  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    isUndoRedoActionRef.current = true;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prevPast) => [...prevPast, slides]);
    setFuture(newFuture);
    setSlides(next);

    if (next.length > 0) {
      setCurrentIndex((prevIdx) => Math.min(prevIdx, next.length - 1));
    } else {
      setCurrentIndex(0);
    }
  }, [future, slides]);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return; // Don't interrupt native input undo/redo
      }

      const isModKey = e.ctrlKey || e.metaKey;

      if (isModKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (key === "y") {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  // Video Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  
  // Custom Song / Background Music State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [uploadedAudioSrc, setUploadedAudioSrc] = useState<string>("");
  const [uploadedAudioName, setUploadedAudioName] = useState<string>("");
  const [synthesizer] = useState(() => new CollegeMelodyGenerator());
  const [activeSoundtrackType, setActiveSoundtrackType] = useState<"none" | "synth" | "custom">("none");
  
  // Custom Song duration & Auto-Sync State
  const [customAudioDuration, setCustomAudioDuration] = useState<number | null>(null);
  const [autoSyncToSong, setAutoSyncToSong] = useState<boolean>(false);

  // Parse and track custom audio duration dynamically when uploaded
  useEffect(() => {
    if (uploadedAudioSrc) {
      const audioObj = new Audio(uploadedAudioSrc);
      const handleLoadedMetadata = () => {
        setCustomAudioDuration(audioObj.duration);
      };
      audioObj.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => {
        audioObj.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    } else {
      setCustomAudioDuration(null);
    }
  }, [uploadedAudioSrc]);

  // Synchronize slide lengths to match the background audio duration perfectly
  const syncVideoDurationToAudio = (songDur: number) => {
    if (slides.length === 0 || !songDur) return;
    const syncDuration = Math.round((songDur / slides.length) * 100) / 100;
    const clampedDuration = Math.max(0.5, Math.min(30, syncDuration));
    setSlides(prev => prev.map(s => ({ ...s, duration: clampedDuration })));
  };

  // Auto-sync side effect: runs whenever slides length or audio duration changes and auto-sync is on
  useEffect(() => {
    if (autoSyncToSong && customAudioDuration && slides.length > 0) {
      const syncDuration = Math.round((customAudioDuration / slides.length) * 100) / 100;
      const clampedDuration = Math.max(0.5, Math.min(30, syncDuration));
      
      const needsUpdate = slides.some(s => s.duration !== clampedDuration);
      if (needsUpdate) {
        setSlides(prev => prev.map(s => ({ ...s, duration: clampedDuration })));
      }
    }
  }, [autoSyncToSong, customAudioDuration, slides.length]);

  // Audio Fading States
  const [audioFadeInDuration, setAudioFadeInDuration] = useState<number>(() => {
    const saved = localStorage.getItem("cinematic_fade_in_duration");
    return saved ? Number(saved) : 1.5;
  });
  const [audioFadeOutDuration, setAudioFadeOutDuration] = useState<number>(() => {
    const saved = localStorage.getItem("cinematic_fade_out_duration");
    return saved ? Number(saved) : 2.0;
  });

  // Sync fading durations to localStorage
  useEffect(() => {
    localStorage.setItem("cinematic_fade_in_duration", String(audioFadeInDuration));
  }, [audioFadeInDuration]);

  useEffect(() => {
    localStorage.setItem("cinematic_fade_out_duration", String(audioFadeOutDuration));
  }, [audioFadeOutDuration]);

  // Drag-and-drop state
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>("");
  const [exportTimeRemaining, setExportTimeRemaining] = useState<number | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<any>(null);

  // Synchronize audio playback with video state
  useEffect(() => {
    if (isPlaying && !isMuted) {
      if (activeSoundtrackType === "custom" && uploadedAudioSrc) {
        synthesizer.stop();
        if (audioRef.current) {
          audioRef.current.play().catch((err) => console.log("Audio playback delayed:", err));
        }
      } else if (activeSoundtrackType === "synth") {
        if (audioRef.current) audioRef.current.pause();
        synthesizer.start();
      }
    } else {
      synthesizer.stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
    return () => {
      synthesizer.stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isPlaying, isMuted, activeSoundtrackType, uploadedAudioSrc]);

  // Dynamic Volume Adjuster (Volume fade-in, fade-out, individual slide volumes)
  useEffect(() => {
    if (!isPlaying) {
      synthesizer.volumeMultiplier = isMuted ? 0 : 1.0;
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : 1.0;
      }
      return;
    }

    if (isMuted) {
      synthesizer.volumeMultiplier = 0;
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
      return;
    }

    const currentSlide = slides[currentIndex];
    if (!currentSlide) return;

    // Calculate elapsed time of entire slideshow
    const totalSlideshowDuration = slides.reduce((acc, curr) => acc + (curr.duration || 3), 0);
    const currentSlideDuration = currentSlide.duration || 3;
    const currentSlideElapsedTime = (progress / 100) * currentSlideDuration;

    let slideshowElapsedTime = 0;
    for (let i = 0; i < currentIndex; i++) {
      slideshowElapsedTime += (slides[i].duration || 3);
    }
    slideshowElapsedTime += currentSlideElapsedTime;

    // 1. Slide-specific volume adjustment
    const slideVolumeMultiplier = currentSlide.volume !== undefined ? currentSlide.volume / 100 : 1.0;

    // 2. Fade-in multiplier at the beginning of slideshow
    let fadeInMultiplier = 1.0;
    if (audioFadeInDuration > 0) {
      fadeInMultiplier = Math.min(1.0, slideshowElapsedTime / audioFadeInDuration);
    }

    // 3. Fade-out multiplier at the end of slideshow
    let fadeOutMultiplier = 1.0;
    if (audioFadeOutDuration > 0) {
      const remainingTime = totalSlideshowDuration - slideshowElapsedTime;
      fadeOutMultiplier = Math.min(1.0, Math.max(0, remainingTime / audioFadeOutDuration));
    }

    const calculatedVolume = Math.max(0, Math.min(1, slideVolumeMultiplier * fadeInMultiplier * fadeOutMultiplier));

    // Apply calculated volume
    if (activeSoundtrackType === "custom" && audioRef.current) {
      audioRef.current.volume = calculatedVolume;
    } else if (activeSoundtrackType === "synth") {
      synthesizer.volumeMultiplier = calculatedVolume;
    }
  }, [
    isPlaying,
    isMuted,
    activeSoundtrackType,
    currentIndex,
    progress,
    slides,
    audioFadeInDuration,
    audioFadeOutDuration,
    synthesizer
  ]);

  // Synchronize dynamic preview slides transition timer
  useEffect(() => {
    if (!isPlaying || slides.length === 0) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const currentSlide = slides[currentIndex];
    if (!currentSlide) return;

    const durationMs = (currentSlide.duration || 3) * 1000;
    const startTimestamp = Date.now();

    // Reset progress for active slide frame
    setProgress(0);

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimestamp;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(progressIntervalRef.current);
        // Step to next slide or loop
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }
    }, 40);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentIndex, slides]);

  // Bulk Image Upload Handler
  const processUploadedFiles = async (files: FileList) => {
    const imageFiles = (Array.from(files) as File[]).filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    try {
      const processedResults = await Promise.all(
        imageFiles.map(async (file, index) => {
          try {
            const dataUrl = await compressImage(file);
            // Pick creative random transitions for smooth visual variation
            const transitions: Array<VideoSlide["transition"]> = [
              "zoom", "panLeft", "panRight", "slideUp", "slideLeft", "slideRight", "blurFade", "retroSpin"
            ];
            const transition = transitions[index % transitions.length];

            // Format a human-readable name without file extension
            const prettyName = file.name.replace(/\.[^/.]+$/, "").substring(0, 20);

            return {
              id: `slide_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
              url: dataUrl,
              name: file.name,
              duration: 3,
              transition,
              caption: `${prettyName} Memory`,
              fitMode: "cover",
              zoomMultiplier: 1.0,
              showSubtitle: true
            } as VideoSlide;
          } catch (err) {
            console.error(`Error compressing image ${file.name}`, err);
            // Fallback to reading raw file if compression fails
            return new Promise<VideoSlide | null>((resolve) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                const transitions: Array<VideoSlide["transition"]> = [
                  "zoom", "panLeft", "panRight", "slideUp", "slideLeft", "slideRight", "blurFade", "retroSpin"
                ];
                const transition = transitions[index % transitions.length];
                const prettyName = file.name.replace(/\.[^/.]+$/, "").substring(0, 20);
                resolve({
                  id: `slide_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
                  url: dataUrl,
                  name: file.name,
                  duration: 3,
                  transition,
                  caption: `${prettyName} Memory`,
                  fitMode: "cover",
                  zoomMultiplier: 1.0,
                  showSubtitle: true
                });
              };
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(file);
            });
          }
        })
      );

      const validSlides = processedResults.filter((s): s is VideoSlide => s !== null);
      if (validSlides.length === 0) return;

      // Sync with Asset Gallery
      const newAssets: GalleryAsset[] = validSlides.map((slide) => ({
        id: `asset_${slide.id}`,
        url: slide.url,
        name: slide.name,
        addedAt: Date.now()
      }));

      setGalleryAssets(prev => {
        const existingUrls = new Set(prev.map(a => a.url));
        const filteredNew = newAssets.filter(a => !existingUrls.has(a.url));
        return [...filteredNew, ...prev];
      });

      setSlides(prev => {
        const combined = [...prev, ...validSlides];
        // If we previously had no slides, select the first one
        if (prev.length === 0 && combined.length > 0) {
          setSelectedSlideId(combined[0].id);
          setCurrentIndex(0);
        }
        return combined;
      });
    } catch (e) {
      console.error("Error processing uploaded files:", e);
    }
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processUploadedFiles(e.target.files);
    }
  };

  // Drag and Drop Zone Handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);

    // Check if dragging an asset from our library
    const assetUrl = e.dataTransfer.getData("text/plain");
    const assetName = e.dataTransfer.getData("application/x-asset-name") || "Library Photo";
    
    if (assetUrl && (assetUrl.startsWith("http") || assetUrl.startsWith("data:image"))) {
      const transitions: Array<VideoSlide["transition"]> = [
        "zoom", "panLeft", "panRight", "slideUp", "slideLeft", "slideRight", "blurFade", "retroSpin"
      ];
      const transition = transitions[slides.length % transitions.length];
      const prettyName = assetName.replace(/\.[^/.]+$/, "").substring(0, 20);
      
      const newSlide: VideoSlide = {
        id: `slide_asset_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        url: assetUrl,
        name: assetName,
        duration: 3,
        transition,
        caption: `${prettyName} Memory`,
        fitMode: "cover",
        zoomMultiplier: 1.0,
        showSubtitle: true
      };
      
      setSlides(prev => {
        const combined = [...prev, newSlide];
        if (prev.length === 0) {
          setSelectedSlideId(newSlide.id);
          setCurrentIndex(0);
        }
        return combined;
      });
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  // --- ASSET GALLERY CORE HELPERS ---

  // Handle uploading photos directly into the Asset Gallery sidebar
  const handleAssetUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = (Array.from(e.target.files) as File[]).filter(f => f.type.startsWith("image/"));
    if (files.length === 0) return;

    try {
      const processedResults = await Promise.all(
        files.map(async (file, index) => {
          try {
            const dataUrl = await compressImage(file);
            return {
              id: `asset_upload_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
              url: dataUrl,
              name: file.name,
              addedAt: Date.now()
            } as GalleryAsset;
          } catch (err) {
            console.error(`Error compressing gallery image ${file.name}`, err);
            return new Promise<GalleryAsset | null>((resolve) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                resolve({
                  id: `asset_upload_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
                  url: dataUrl,
                  name: file.name,
                  addedAt: Date.now()
                });
              };
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(file);
            });
          }
        })
      );

      const validAssets = processedResults.filter((a): a is GalleryAsset => a !== null);
      if (validAssets.length > 0) {
        setGalleryAssets(prev => [...validAssets, ...prev]);
      }
    } catch (err) {
      console.error("Error uploading assets:", err);
    }
  };

  // Re-ordering within the Asset Gallery via HTML5 Drag & Drop
  const handleDragStartAsset = (e: React.DragEvent, index: number) => {
    setDraggedAssetIdx(index);
    e.dataTransfer.effectAllowed = "copyMove";
    const asset = galleryAssets[index];
    e.dataTransfer.setData("text/plain", asset.url);
    e.dataTransfer.setData("application/x-asset-id", asset.id);
    e.dataTransfer.setData("application/x-asset-name", asset.name);
  };

  const handleDragOverAsset = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedAssetIdx === null || draggedAssetIdx === index) return;
    
    const updated = [...galleryAssets];
    const [moved] = updated.splice(draggedAssetIdx, 1);
    updated.splice(index, 0, moved);
    setDraggedAssetIdx(index);
    setGalleryAssets(updated);
  };

  const handleDropAsset = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedAssetIdx(null);
  };

  const handleDragEndAsset = () => {
    setDraggedAssetIdx(null);
  };

  // Manual Arrow Button Re-ordering (for fallback & high accessibility)
  const moveAssetInGallery = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === galleryAssets.length - 1) return;
    
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...galleryAssets];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setGalleryAssets(updated);
  };

  // Batch Select Toggle for single item
  const toggleAssetSelection = (id: string) => {
    setSelectedAssetIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select All/Deselect All Utility
  const selectAllAssets = () => {
    if (selectedAssetIds.size === galleryAssets.length) {
      setSelectedAssetIds(new Set());
    } else {
      setSelectedAssetIds(new Set(galleryAssets.map(a => a.id)));
    }
  };

  // Append a single gallery photo to the project timeline
  const addAssetToProject = (asset: GalleryAsset) => {
    const transitions: Array<VideoSlide["transition"]> = [
      "zoom", "panLeft", "panRight", "slideUp", "slideLeft", "slideRight", "blurFade", "retroSpin"
    ];
    const transition = transitions[slides.length % transitions.length];
    const prettyName = asset.name.replace(/\.[^/.]+$/, "").substring(0, 20);
    
    const newSlide: VideoSlide = {
      id: `slide_asset_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      url: asset.url,
      name: asset.name,
      duration: 3,
      transition,
      caption: `${prettyName} Memory`,
      fitMode: "cover",
      zoomMultiplier: 1.0,
      showSubtitle: true
    };
    
    setSlides(prev => {
      const combined = [...prev, newSlide];
      if (prev.length === 0) {
        setSelectedSlideId(newSlide.id);
        setCurrentIndex(0);
      }
      return combined;
    });
    
    setPresetFeedback(`Added "${prettyName}" to the project timeline!`);
    setTimeout(() => setPresetFeedback(null), 3000);
  };

  // Append batch-selected photos to the project timeline
  const addSelectedAssetsToProject = () => {
    if (selectedAssetIds.size === 0) return;
    
    const selectedAssets = galleryAssets.filter(a => selectedAssetIds.has(a.id));
    const newSlidesList: VideoSlide[] = [];
    
    selectedAssets.forEach((asset, index) => {
      const transitions: Array<VideoSlide["transition"]> = [
        "zoom", "panLeft", "panRight", "slideUp", "slideLeft", "slideRight", "blurFade", "retroSpin"
      ];
      const transition = transitions[(slides.length + index) % transitions.length];
      const prettyName = asset.name.replace(/\.[^/.]+$/, "").substring(0, 20);
      
      newSlidesList.push({
        id: `slide_asset_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
        url: asset.url,
        name: asset.name,
        duration: 3,
        transition,
        caption: `${prettyName} Memory`,
        fitMode: "cover",
        zoomMultiplier: 1.0,
        showSubtitle: true
      });
    });
    
    setSlides(prev => {
      const combined = [...prev, ...newSlidesList];
      if (prev.length === 0 && combined.length > 0) {
        setSelectedSlideId(combined[0].id);
        setCurrentIndex(0);
      }
      return combined;
    });
    
    setSelectedAssetIds(new Set());
    setPresetFeedback(`Successfully added ${selectedAssets.length} selected photos to the timeline!`);
    setTimeout(() => setPresetFeedback(null), 4000);
  };

  // Delete a photo from stored gallery assets
  const deleteAssetFromGallery = (id: string) => {
    setGalleryAssets(prev => prev.filter(a => a.id !== id));
    setSelectedAssetIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Drag-and-drop target to replace the image of a specific slide
  const handleDropOnSlide = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const assetUrl = e.dataTransfer.getData("text/plain");
    const assetName = e.dataTransfer.getData("application/x-asset-name") || "Library Photo";
    if (assetUrl && (assetUrl.startsWith("http") || assetUrl.startsWith("data:image"))) {
      setSlides(prev => {
        const copy = [...prev];
        if (copy[targetIdx]) {
          copy[targetIdx] = {
            ...copy[targetIdx],
            url: assetUrl,
            name: assetName
          };
        }
        return copy;
      });
      setPresetFeedback(`Replaced slide #${targetIdx + 1} with dropped gallery photo.`);
      setTimeout(() => setPresetFeedback(null), 3000);
    }
  };

  // Custom Audio Song Upload
  const handleAudioUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedAudioName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      setUploadedAudioSrc(base64Str);
      setActiveSoundtrackType("custom");
    };
    reader.readAsDataURL(file);
  };

  // Load Preset Demo slides (above 20 high-fidelity images for gorgeous presentation)
  const loadDemoProject = () => {
    const demoKeywords = [
      "campus", "graduation", "library", "friends", "classroom", 
      "party", "concert", "nature", "travel", "sunset", 
      "cafe", "coding", "sports", "laughing", "roadtrip", 
      "campfire", "stadium", "festival", "summer", "hiking", 
      "autumn", "winter"
    ];

    const demoTransitions: Array<VideoSlide["transition"]> = [
      "zoom", "panLeft", "panRight", "slideUp", "slideLeft", "slideRight", "blurFade", "retroSpin"
    ];

    const demoSlides: VideoSlide[] = demoKeywords.map((kw, idx) => ({
      id: `demo_${idx}`,
      url: `https://images.unsplash.com/photo-${[
        "1523050854058-8df90110c9f1", // campus
        "1541339907198-e08756dedf3f", // graduation
        "1506784983877-45594efa4cbe", // library
        "1511671782779-c97d3d27a1d4", // concert
        "1517486808906-6ca8b3f04846", // party
        "1529156069898-49953e39b3ac", // friends
        "1515187029135-18ee286d815b", // class
        "1501504905252-473c47e087f8", // coding
        "1513151233558-d860c5398176", // party lights
        "1516450360452-9312f5e86fc7", // concert stage
        "1522071820081-009f0129c71c", // office meeting
        "1531482615713-2afd69097998", // campus lounge
        "1543269865-cbf427effbad", // friends hugging
        "1529070538774-1843cb3265df", // campfire
        "1491438590914-bc09fcaaf77a", // roadtrip
        "1475483768296-8980ae175189", // stadium
        "1464822759023-fed622ff2c3b", // mountain hiking
        "1502082553048-f009c37129b9", // autumn trees
        "1483728642387-6c3bdd6c93e5", // winter sports
        "1500648767791-00dcc994a43e", // portrait 1
        "1534528741775-53994a69daeb", // portrait 2
        "1507003211169-0a1dd7228f2d"  // portrait 3
      ][idx % 22]}?auto=format&fit=crop&w=600&q=80`,
      name: `${kw}.jpg`,
      duration: idx % 3 === 0 ? 4 : 3,
      transition: demoTransitions[idx % demoTransitions.length],
      caption: `Unforgettable college moments in the ${kw} scene`,
      fitMode: "cover",
      zoomMultiplier: 1.0,
      showSubtitle: true
    }));

    setSlides(demoSlides);
    setSelectedSlideId(demoSlides[0].id);
    setCurrentIndex(0);
    setActiveSoundtrackType("synth");

    // Populate Asset Gallery with these demo slides as well
    const demoAssets: GalleryAsset[] = demoSlides.map((s, idx) => ({
      id: `asset_demo_${idx}_${Date.now()}`,
      url: s.url,
      name: s.name,
      addedAt: Date.now() - idx * 1000
    }));
    setGalleryAssets(demoAssets);
  };

  // Duplicate an existing slide for advanced editing
  const duplicateSlide = (slide: VideoSlide, idx: number) => {
    const copy: VideoSlide = {
      ...slide,
      id: `copy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      caption: `${slide.caption} (Copy)`
    };
    const updated = [...slides];
    updated.splice(idx + 1, 0, copy);
    setSlides(updated);
  };

  // Rearrange slides (Move left or right)
  const moveSlide = (index: number, direction: "left" | "right") => {
    if (direction === "left" && index === 0) return;
    if (direction === "right" && index === slides.length - 1) return;

    const targetIndex = direction === "left" ? index - 1 : index + 1;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setSlides(updated);
    if (currentIndex === index) {
      setCurrentIndex(targetIndex);
    } else if (currentIndex === targetIndex) {
      setCurrentIndex(index);
    }
  };

  // Bulk Apply Settings
  const bulkApplyTransitions = (transitionType: VideoSlide["transition"]) => {
    setSlides(prev => prev.map(s => ({ ...s, transition: transitionType })));
  };

  const bulkApplyDurations = (sec: number) => {
    setSlides(prev => prev.map(s => ({ ...s, duration: sec })));
  };

  // HD High-Fidelity Video Compiler & Export Engine
  const exportHighDefinitionVideo = async () => {
    if (slides.length === 0) return;
    setIsExporting(true);
    setExportProgress(0);
    setExportStatusText("Compiling frames...");
    setIsPlaying(false);

    // Estimate initial remaining time based on slides count and resolution
    const totalFramesToRender = slides.reduce((acc, s) => acc + (s.duration || 3) * 30, 0);
    let estimatedMsPerFrame = 35; // default 720p
    if (exportResolution === "1080p") {
      estimatedMsPerFrame = 48;
    } else if (exportResolution === "4k") {
      estimatedMsPerFrame = 110;
    } else if (exportResolution === "8k") {
      estimatedMsPerFrame = 320;
    }
    let transcodeOverheadSeconds = 0;
    if (exportFormat === "mp4") {
      transcodeOverheadSeconds = 3 + slides.length * 1.5;
    }
    const initialEstimatedSeconds = Math.ceil((totalFramesToRender * estimatedMsPerFrame) / 1000) + transcodeOverheadSeconds;
    setExportTimeRemaining(initialEstimatedSeconds);

    try {
      const canvas = document.createElement("canvas");
      canvas.id = "cinematic-export-canvas";
      
      // Crucial Fix: In Chromium-based browsers, canvas.captureStream() on an offscreen canvas
      // that is not appended to the DOM can fail or yield blank/empty frames.
      // We append it to the DOM styled as fully hidden offscreen.
      canvas.style.position = "fixed";
      canvas.style.left = "-99999px";
      canvas.style.top = "-99999px";
      canvas.style.width = "400px";
      canvas.style.height = "225px";
      canvas.style.opacity = "0.01";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "-9999";
      document.body.appendChild(canvas);

      // Choose dimensions based on selected aspect ratio and export resolution preset (720p, 1080p, 4k, 8k)
      let canvasW = 1920;
      let canvasH = 1080;

      if (videoAspectRatio === "16:9") {
        if (exportResolution === "720p") {
          canvasW = 1280;
          canvasH = 720;
        } else if (exportResolution === "1080p") {
          canvasW = 1920;
          canvasH = 1080;
        } else if (exportResolution === "4k") {
          canvasW = 3840;
          canvasH = 2160;
        } else if (exportResolution === "8k") {
          canvasW = 7680;
          canvasH = 4320;
        }
      } else if (videoAspectRatio === "9:16") {
        if (exportResolution === "720p") {
          canvasW = 720;
          canvasH = 1280;
        } else if (exportResolution === "1080p") {
          canvasW = 1080;
          canvasH = 1920;
        } else if (exportResolution === "4k") {
          canvasW = 2160;
          canvasH = 3840;
        } else if (exportResolution === "8k") {
          canvasW = 4320;
          canvasH = 7680;
        }
      } else if (videoAspectRatio === "1:1") {
        if (exportResolution === "720p") {
          canvasW = 720;
          canvasH = 720;
        } else if (exportResolution === "1080p") {
          canvasW = 1080;
          canvasH = 1080;
        } else if (exportResolution === "4k") {
          canvasW = 2160;
          canvasH = 2160;
        } else if (exportResolution === "8k") {
          canvasW = 4320;
          canvasH = 4320;
        }
      } else if (videoAspectRatio === "4:3") {
        if (exportResolution === "720p") {
          canvasW = 960;
          canvasH = 720;
        } else if (exportResolution === "1080p") {
          canvasW = 1440;
          canvasH = 1080;
        } else if (exportResolution === "4k") {
          canvasW = 2880;
          canvasH = 2160;
        } else if (exportResolution === "8k") {
          canvasW = 5760;
          canvasH = 4320;
        }
      }

      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context retrieval failed");

      const stream = canvas.captureStream(30); // 30 Frames Per Second
      
      // Robust MIME type detection to guarantee recorder doesn't throw unsupported codecs errors
      let selectedMimeType = "video/webm";
      const candidates = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm;codecs=h264",
        "video/webm",
        "video/mp4;codecs=avc1",
        "video/mp4"
      ];
      for (const mime of candidates) {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });

      const videoChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunks.push(e.data);
      };

      recorder.onstop = async () => {
        // Clean up canvas element from DOM
        const el = document.getElementById("cinematic-export-canvas");
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }

        const rawRecordedBlob = new Blob(videoChunks, { type: selectedMimeType });
        const recordedIsAlreadyMp4 = selectedMimeType.includes("mp4");

        // Transcode if target format is mp4 and recorded file is webm
        if (exportFormat === "mp4" && !recordedIsAlreadyMp4) {
          setExportStatusText("Converting WebM to highly-compatible MP4...");
          setExportProgress(98);
          setExportTimeRemaining(Math.max(2, Math.ceil(transcodeOverheadSeconds * 0.4)));

          try {
            const response = await fetch("/api/convert-to-mp4", {
              method: "POST",
              headers: {
                "Content-Type": "video/webm",
              },
              body: rawRecordedBlob,
            });

            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(errData.error || "Server transcode failed");
            }

            // Create explicitly typed video/mp4 Blob from response so media players recognize it immediately
            const mp4Blob = await response.blob();
            const playableMp4Blob = new Blob([mp4Blob], { type: "video/mp4" });
            const videoUrl = URL.createObjectURL(playableMp4Blob);

            const dl = document.createElement("a");
            dl.href = videoUrl;
            dl.download = `college_memory_slideshow_${Date.now()}.mp4`;
            document.body.appendChild(dl);
            dl.click();
            document.body.removeChild(dl);
          } catch (err: any) {
            console.error("Transcode failed, falling back to WebM download:", err);
            alert("MP4 conversion failed. Downloading high-quality WebM fallback instead. Error: " + err.message);
            
            // Fallback download WebM
            const videoUrl = URL.createObjectURL(rawRecordedBlob);
            const dl = document.createElement("a");
            dl.href = videoUrl;
            dl.download = `college_memory_slideshow_${Date.now()}.webm`;
            document.body.appendChild(dl);
            dl.click();
            document.body.removeChild(dl);
          }
        } else {
          // Standard webm download (or native mp4 download if browser natively recorded to mp4)
          const fileExtension = recordedIsAlreadyMp4 ? "mp4" : "webm";
          const finalDownloadBlob = new Blob([rawRecordedBlob], { type: recordedIsAlreadyMp4 ? "video/mp4" : "video/webm" });
          const videoUrl = URL.createObjectURL(finalDownloadBlob);
          const dl = document.createElement("a");
          dl.href = videoUrl;
          dl.download = `college_memory_slideshow_${Date.now()}.${fileExtension}`;
          document.body.appendChild(dl);
          dl.click();
          document.body.removeChild(dl);
        }

        setIsExporting(false);
        setExportStatusText("");
        setExportProgress(100);
      };

      recorder.start();

      let currentFrame = 0;
      const startTime = Date.now();
      let slideIndex = 0;
      const compileNextSlide = async () => {
        if (slideIndex >= slides.length) {
          recorder.stop();
          return;
        }

        const activeSlide = slides[slideIndex];
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          img.src = activeSlide.url;
        });

        const totalFrames = (activeSlide.duration || 3) * 30; // 30 FPS

        for (let f = 0; f < totalFrames; f++) {
          const ratio = f / totalFrames; // Current slide transition percentage (0 to 1)

          // Background deep cinematic wash
          ctx.fillStyle = "#090504";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Kinetic Ken-Burns & Transition calculations
          let transitionScale = 1.0;
          let dx = 0;
          let dy = 0;
          let rotation = 0;
          let alpha = 1.0;
          let blurAmount = 0;

          // Process advanced custom motion vectors
          if (activeSlide.motionSpeed && activeSlide.motionSpeed > 0) {
            const angleRad = ((activeSlide.motionAngle || 0) * Math.PI) / 180;
            const dist = (activeSlide.motionSpeed || 20) * 1.5;
            // Interpolate from starting offset to ending offset over timeline
            dx = Math.cos(angleRad) * (dist / 2) * (1 - ratio * 2);
            dy = Math.sin(angleRad) * (dist / 2) * (1 - ratio * 2);
          }

          const t = activeSlide.transition;
          if (t === "zoom") {
            transitionScale = 1.0 + ratio * 0.18; // smooth zooming-in
          } else if (t === "zoomOut") {
            transitionScale = 1.25 - ratio * 0.25; // smooth zooming-out
          } else if (t === "panLeft") {
            if (!activeSlide.motionSpeed) {
              dx = (0.5 - ratio) * 60;
            }
            transitionScale = 1.1;
          } else if (t === "panRight") {
            if (!activeSlide.motionSpeed) {
              dx = (ratio - 0.5) * 60;
            }
            transitionScale = 1.1;
          } else if (t === "tiltUp") {
            if (!activeSlide.motionSpeed) {
              dy = (0.5 - ratio) * 60;
            }
            transitionScale = 1.1;
          } else if (t === "tiltDown") {
            if (!activeSlide.motionSpeed) {
              dy = (ratio - 0.5) * 60;
            }
            transitionScale = 1.1;
          } else if (t === "slideUp") {
            if (!activeSlide.motionSpeed) {
              dy = (1.0 - ratio) * 50;
            }
            transitionScale = 1.05;
          } else if (t === "slideLeft") {
            if (!activeSlide.motionSpeed) {
              dx = (1.0 - ratio) * 80;
            }
          } else if (t === "slideRight") {
            if (!activeSlide.motionSpeed) {
              dx = -(1.0 - ratio) * 80;
            }
          } else if (t === "blurFade") {
            alpha = ratio < 0.25 ? ratio * 4 : ratio > 0.85 ? (1 - ratio) * 6.6 : 1;
            blurAmount = ratio < 0.2 ? (1 - ratio * 5) * 20 : 0;
          } else if (t === "retroSpin") {
            rotation = ratio * 0.05;
            transitionScale = 1.0 + ratio * 0.1;
          } else if (t === "vortex") {
            rotation = (ratio - 1.0) * Math.PI;
            transitionScale = 0.3 + ratio * 0.7;
            alpha = ratio;
          } else if (t === "glitch") {
            if (ratio < 0.3) {
              dx = Math.sin(ratio * 50) * 12;
              rotation = Math.sin(ratio * 100) * 0.03;
            }
            transitionScale = 1.0 + Math.sin(ratio * Math.PI) * 0.04;
          } else if (t === "fadeOnly") {
            alpha = ratio < 0.2 ? ratio * 5 : 1;
          }

          // Process Camera 3D Roll/Pitch/Yaw
          const cRollRad = ((activeSlide.cameraRoll || 0) * Math.PI) / 180;
          rotation += cRollRad;

          const cPitchShear = ((activeSlide.cameraPitch || 0) * Math.PI) / 180 * 0.2;
          const cYawShear = ((activeSlide.cameraYaw || 0) * Math.PI) / 180 * 0.2;

          // Process 3D depth parallax separation
          const parallaxStr = activeSlide.parallaxEnabled ? (activeSlide.parallaxStrength || 30) : 0;
          const parallaxDriftX = (ratio - 0.5) * parallaxStr * 0.5;
          const parallaxDriftY = (ratio - 0.5) * parallaxStr * 0.4;
          
          dx += parallaxDriftX;
          dy += parallaxDriftY;

          // Ratio calculation for Cover vs Contain without division-by-zero risk
          const imgRatio = (img.width && img.height) ? (img.width / img.height) : 1;
          const canvasRatio = canvas.width / canvas.height;
          let baseScale = 1.0;
          const fit = activeSlide.fitMode || "cover";

          if (fit === "cover") {
            if (imgRatio > canvasRatio) {
              baseScale = img.height ? (canvas.height / img.height) : 1;
            } else {
              baseScale = img.width ? (canvas.width / img.width) : 1;
            }
          } else {
            if (imgRatio > canvasRatio) {
              baseScale = img.width ? (canvas.width / img.width) : 1;
            } else {
              baseScale = img.height ? (canvas.height / img.height) : 1;
            }
          }

          // Apply custom zoom multiplier
          baseScale *= (activeSlide.zoomMultiplier || 1.0);

          const finalScale = baseScale * transitionScale;
          const renderW = img.width ? (img.width * finalScale) : canvas.width;
          const renderH = img.height ? (img.height * finalScale) : canvas.height;

          ctx.save();
          let filterString = "";
          if (activeSlide.filter && activeSlide.filter !== "none") {
            filterString += getFilterCss(activeSlide.filter) + " ";
          }
          if (blurAmount > 0) {
            filterString += `blur(${blurAmount}px) `;
          }
          if (filterString.trim()) {
            ctx.filter = filterString.trim();
          } else {
            ctx.filter = "none";
          }
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

          // Draw the photo onto the dynamic canvas, centered with custom transformOrigin (Anchor Pin)
          const pinPctX = activeSlide.anchorX !== undefined ? activeSlide.anchorX : 50;
          const pinPctY = activeSlide.anchorY !== undefined ? activeSlide.anchorY : 50;

          // Shift pivot point based on chosen anchor focus pin
          ctx.translate(canvas.width / 2, canvas.height / 2);
          
          // Apply Camera 3D Pitch/Yaw simulated perspective shear
          if (cPitchShear !== 0 || cYawShear !== 0) {
            ctx.transform(1, cPitchShear, cYawShear, 1, 0, 0);
          }

          ctx.rotate(rotation);

          // Apply translation offset to pivot around anchor focus point rather than absolute center
          const pivotX = (pinPctX / 100 - 0.5) * renderW;
          const pivotY = (pinPctY / 100 - 0.5) * renderH;

          ctx.translate(-pivotX, -pivotY);
          ctx.drawImage(img, -renderW / 2 + dx + pivotX, -renderH / 2 + dy + pivotY, renderW, renderH);
          ctx.restore();

          // Render Spotlight/Vignette/Split Mask overlay on top of the drawn image
          if (activeSlide.maskType && activeSlide.maskType !== "none") {
            ctx.save();
            ctx.globalCompositeOperation = "source-over";
            const pinX = (activeSlide.anchorX !== undefined ? activeSlide.anchorX : 50) / 100 * canvas.width;
            const pinY = (activeSlide.anchorY !== undefined ? activeSlide.anchorY : 50) / 100 * canvas.height;
            const radius = (activeSlide.maskRadius || 40) / 100 * Math.max(canvas.width, canvas.height);
            const feather = activeSlide.maskFeather || 50;

            if (activeSlide.maskType === "radial_focus" || activeSlide.maskType === "vignette") {
              const grad = ctx.createRadialGradient(pinX, pinY, radius * (1 - feather / 100), pinX, pinY, radius);
              grad.addColorStop(0, "rgba(0,0,0,0)");
              const maxAlpha = activeSlide.maskType === "vignette" ? 0.92 : 0.72;
              grad.addColorStop(1, `rgba(9,5,4,${maxAlpha})`);
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (activeSlide.maskType === "split_mask") {
              const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
              grad.addColorStop(0, "rgba(9,5,4,0.75)");
              grad.addColorStop(0.5, "rgba(0,0,0,0)");
              grad.addColorStop(1, "rgba(9,5,4,0.75)");
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.restore();
          }

          // Elegant Cinematic Overlay Shading
          const shade = ctx.createLinearGradient(0, 0, 0, canvas.height);
          shade.addColorStop(0, "rgba(0,0,0,0.4)");
          shade.addColorStop(0.7, "rgba(0,0,0,0)");
          shade.addColorStop(1, "rgba(0,0,0,0.85)");
          ctx.fillStyle = shade;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // DRAW CINEMATIC SPECIAL EFFECTS (VFX)
          if (activeSlide.vfxType && activeSlide.vfxType !== "none") {
            const intensity = activeSlide.vfxIntensity !== undefined ? activeSlide.vfxIntensity : 50;

            if (activeSlide.vfxType === "lens_flare") {
              ctx.save();
              ctx.globalCompositeOperation = "screen";
              const pinX = (activeSlide.anchorX !== undefined ? activeSlide.anchorX : 50) / 100 * canvas.width;
              const pinY = (activeSlide.anchorY !== undefined ? activeSlide.anchorY : 50) / 100 * canvas.height;
              
              // Central flare spark
              const size = intensity * 4;
              const flareGrad = ctx.createRadialGradient(pinX, pinY, 0, pinX, pinY, size);
              flareGrad.addColorStop(0, "rgba(255, 245, 220, 0.95)");
              flareGrad.addColorStop(0.2, "rgba(245, 158, 11, 0.4)");
              flareGrad.addColorStop(0.5, "rgba(239, 68, 68, 0.12)");
              flareGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
              ctx.fillStyle = flareGrad;
              ctx.beginPath();
              ctx.arc(pinX, pinY, size, 0, Math.PI * 2);
              ctx.fill();

              // Rotated anamorphic light streak
              ctx.translate(pinX, pinY);
              ctx.rotate(-12 * Math.PI / 180);
              const streakGrad = ctx.createLinearGradient(-canvas.width * 1.5, 0, canvas.width * 1.5, 0);
              streakGrad.addColorStop(0, "rgba(59, 130, 246, 0)");
              streakGrad.addColorStop(0.2, "rgba(59, 130, 246, 0.35)");
              streakGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
              streakGrad.addColorStop(0.8, "rgba(245, 158, 11, 0.35)");
              streakGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
              ctx.fillStyle = streakGrad;
              ctx.fillRect(-canvas.width * 1.5, -((intensity * 0.12 + 1) / 2), canvas.width * 3, intensity * 0.12 + 1);
              ctx.restore();

              // Multi-spectral chromatic reflection orbs
              ctx.save();
              ctx.globalCompositeOperation = "screen";
              const orb1X = pinX * 0.7 + canvas.width * 0.15;
              const orb1Y = pinY * 0.7 + canvas.height * 0.15;
              const orb1Size = intensity * 0.7 + 15;
              const orb1Grad = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, orb1Size);
              orb1Grad.addColorStop(0, "rgba(59, 130, 246, 0.18)");
              orb1Grad.addColorStop(0.6, "rgba(139, 92, 246, 0.06)");
              orb1Grad.addColorStop(1, "rgba(0, 0, 0, 0)");
              ctx.fillStyle = orb1Grad;
              ctx.beginPath();
              ctx.arc(orb1X, orb1Y, orb1Size, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = "rgba(59, 130, 246, 0.12)";
              ctx.lineWidth = 1;
              ctx.stroke();

              const orb2X = pinX * 0.45 + canvas.width * 0.275;
              const orb2Y = pinY * 0.45 + canvas.height * 0.275;
              const orb2Size = intensity * 1.1 + 25;
              const orb2Grad = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, orb2Size);
              orb2Grad.addColorStop(0, "rgba(239, 68, 68, 0.12)");
              orb2Grad.addColorStop(0.6, "rgba(245, 158, 11, 0.04)");
              orb2Grad.addColorStop(1, "rgba(0, 0, 0, 0)");
              ctx.fillStyle = orb2Grad;
              ctx.beginPath();
              ctx.arc(orb2X, orb2Y, orb2Size, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = "rgba(239, 68, 68, 0.08)";
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.restore();
            }

            else if (activeSlide.vfxType === "light_leak") {
              ctx.save();
              ctx.globalCompositeOperation = "screen";
              const alphaVal = (intensity / 100);
              const angle = ratio * Math.PI * 2;
              const xOffset = Math.sin(angle) * 40;
              const yOffset = Math.cos(angle) * 30;

              const leak1Grad = ctx.createRadialGradient(canvas.width * 0.15 + xOffset, canvas.height * 0.15 + yOffset, 0, canvas.width * 0.15 + xOffset, canvas.height * 0.15 + yOffset, canvas.width * 0.5);
              leak1Grad.addColorStop(0, `rgba(245, 158, 11, ${0.4 * alphaVal})`);
              leak1Grad.addColorStop(0.4, `rgba(239, 68, 68, ${0.22 * alphaVal})`);
              leak1Grad.addColorStop(0.7, `rgba(139, 92, 246, ${0.1 * alphaVal})`);
              leak1Grad.addColorStop(1, "rgba(0,0,0,0)");
              ctx.fillStyle = leak1Grad;
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              const leak2Grad = ctx.createRadialGradient(canvas.width * 0.85 - xOffset, canvas.height * 0.85 - yOffset, 0, canvas.width * 0.85 - xOffset, canvas.height * 0.85 - yOffset, canvas.width * 0.45);
              leak2Grad.addColorStop(0, `rgba(236, 72, 153, ${0.3 * alphaVal})`);
              leak2Grad.addColorStop(0.4, `rgba(239, 68, 68, ${0.15 * alphaVal})`);
              leak2Grad.addColorStop(1, "rgba(0,0,0,0)");
              ctx.fillStyle = leak2Grad;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.restore();
            }

            else if (activeSlide.vfxType === "film_grain") {
              ctx.save();
              const opacity = (intensity / 100) * 0.25;

              // Draw random micro-grain dots
              ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.65})`;
              for (let i = 0; i < 400; i++) {
                const gx = Math.random() * canvas.width;
                const gy = Math.random() * canvas.height;
                const gw = Math.random() * 2 + 1;
                ctx.fillRect(gx, gy, gw, gw);
              }
              ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.55})`;
              for (let i = 0; i < 400; i++) {
                const gx = Math.random() * canvas.width;
                const gy = Math.random() * canvas.height;
                const gw = Math.random() * 2 + 1;
                ctx.fillRect(gx, gy, gw, gw);
              }

              // Random linear vertical scratches
              if (Math.random() < 0.35) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 1.6})`;
                ctx.lineWidth = Math.random() * 1.2 + 0.3;
                ctx.beginPath();
                const startX = Math.random() * canvas.width;
                ctx.moveTo(startX, 0);
                ctx.lineTo(startX + (Math.random() * 10 - 5), canvas.height);
                ctx.stroke();
              }
              if (Math.random() < 0.25) {
                ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 1.4})`;
                ctx.lineWidth = Math.random() * 1.5 + 0.3;
                ctx.beginPath();
                const startX = Math.random() * canvas.width;
                ctx.moveTo(startX, 0);
                ctx.lineTo(startX + (Math.random() * 12 - 6), canvas.height);
                ctx.stroke();
              }

              // Hair dust
              if (Math.random() < 0.15) {
                ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                const hx = Math.random() * canvas.width;
                const hy = Math.random() * canvas.height;
                ctx.arc(hx, hy, Math.random() * 15 + 5, Math.random() * Math.PI, Math.random() * Math.PI * 2);
                ctx.stroke();
              }
              ctx.restore();
            }

            else if (activeSlide.vfxType === "snow") {
              ctx.save();
              const opacity = (intensity / 100);
              const numFlakes = 20;
              ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
              for (let i = 0; i < numFlakes; i++) {
                const seedX = (i * 120 + 40) % canvas.width;
                const size = (i % 3 === 0) ? 9 : (i % 3 === 1) ? 6 : 4;
                const rate = 1.0 + (i % 4) * 0.4;
                const driftY = ((ratio * rate + (i * 0.05)) % 1.0) * (canvas.height + 40) - 20;
                const sway = Math.sin(ratio * Math.PI * 2 * 2 + i) * 15;
                const driftX = seedX + sway;

                ctx.beginPath();
                ctx.arc(driftX, driftY, size / 2, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();
            }

            else if (activeSlide.vfxType === "rain") {
              ctx.save();
              const opacity = (intensity / 100);
              const numDrops = 30;
              ctx.strokeStyle = `rgba(220, 230, 255, ${opacity * 0.55})`;
              ctx.lineWidth = 1.8;
              for (let i = 0; i < numDrops; i++) {
                const seedX = (i * 90 + 30) % canvas.width;
                const rate = 1.8 + (i % 3) * 0.6;
                const driftY = ((ratio * rate + (i * 0.03)) % 1.0) * (canvas.height + 120) - 60;
                const driftX = seedX - (driftY * 0.22);

                ctx.beginPath();
                ctx.moveTo(driftX, driftY);
                ctx.lineTo(driftX + 12, driftY + 60);
                ctx.stroke();
              }
              ctx.restore();
            }

            else if (activeSlide.vfxType === "vhs") {
              ctx.save();
              const opacity = (intensity / 100);

              // Draw VHS Scanlines
              ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.08})`;
              for (let y = 0; y < canvas.height; y += 4) {
                ctx.fillRect(0, y, canvas.width, 2);
              }

              // Draw VHS Tracking bar
              const rollY = (ratio * 1.5 % 1.0) * canvas.height;
              ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.12})`;
              ctx.fillRect(0, rollY, canvas.width, 30);
              ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.15})`;
              ctx.fillRect(0, rollY + 30, canvas.width, 6);

              // Occasional screen shaking line glitch
              if (Math.random() < 0.18) {
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.25})`;
                ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 4);
              }

              // VCR overlay text
              ctx.fillStyle = "rgba(74, 222, 128, 0.75)";
              ctx.font = "bold 16px Courier New, monospace";
              ctx.textAlign = "left";
              ctx.fillText("PLAY ▷", 30, canvas.height - 30);
              ctx.textAlign = "right";
              const padVal = (n: number) => String(n).padStart(2, "0");
              const secVal = Math.floor(ratio * (activeSlide.duration || 5));
              ctx.fillText(`00:00:${padVal(secVal)}`, canvas.width - 30, canvas.height - 30);
              ctx.restore();
            }

            else if (activeSlide.vfxType === "bokeh") {
              ctx.save();
              ctx.globalCompositeOperation = "screen";
              const opacity = (intensity / 100) * 0.85;
              const numBubbles = 15;

              for (let i = 0; i < numBubbles; i++) {
                const seedX = (i * 135 + 65) % canvas.width;
                const size = (i % 3 === 0) ? 44 : (i % 3 === 1) ? 60 : 28;
                const rate = 0.5 + (i % 3) * 0.15;
                const driftY = (1.0 - ((ratio * rate + (i * 0.08)) % 1.0)) * (canvas.height + 80) - 40;
                const sway = Math.sin(ratio * Math.PI * 2 + i) * 20;

                const grad = ctx.createRadialGradient(seedX + sway, driftY, 0, seedX + sway, driftY, size / 2);
                grad.addColorStop(0, `rgba(245, 158, 11, ${0.22 * opacity})`);
                grad.addColorStop(0.6, `rgba(245, 158, 11, ${0.06 * opacity})`);
                grad.addColorStop(1, "rgba(0, 0, 0, 0)");
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(seedX + sway, driftY, size / 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(245, 158, 11, ${0.08 * opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
              ctx.restore();
            }
          }

          // Draw beautiful movie subtitle captions at bottom
          if (globalShowSubtitles && activeSlide.showSubtitle !== false && activeSlide.caption) {
            ctx.fillStyle = "rgba(9, 5, 4, 0.85)";
            // Rounded backing panel
            ctx.beginPath();
            ctx.roundRect(140, canvas.height - 110, canvas.width - 280, 75, 16);
            ctx.fill();

            // Caption text
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 26px 'Inter', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(activeSlide.caption, canvas.width / 2, canvas.height - 64);
          }

          // Frame timeline progress track rendering
          ctx.fillStyle = "rgba(245, 158, 11, 0.9)"; // amber-500
          ctx.fillRect(0, canvas.height - 6, canvas.width * ratio, 6);

          // Delay simulation for frame rendering pipeline
          await new Promise((r) => setTimeout(r, 1000 / 30));

          // Increment frame counter
          currentFrame++;

          // Calculate aggregate progress percentage across total slides based on actual frames
          const overallProgress = Math.min(97, Math.round((currentFrame / totalFramesToRender) * 100));
          setExportProgress(overallProgress);

          // Dynamically compute the estimated remaining seconds
          const elapsedMs = Date.now() - startTime;
          const measuredMsPerFrame = currentFrame > 5 ? (elapsedMs / currentFrame) : estimatedMsPerFrame;
          // Smooth the reading with a weighted average
          const averageMsPerFrame = currentFrame > 15 ? (measuredMsPerFrame * 0.8 + estimatedMsPerFrame * 0.2) : measuredMsPerFrame;
          
          const remainingFrames = totalFramesToRender - currentFrame;
          let remainingSeconds = Math.ceil((remainingFrames * averageMsPerFrame) / 1000);

          if (exportFormat === "mp4") {
            const remainingTranscodeOverhead = Math.ceil(transcodeOverheadSeconds * (1 - (currentFrame / totalFramesToRender) * 0.5));
            remainingSeconds += Math.max(2, remainingTranscodeOverhead);
          }
          setExportTimeRemaining(Math.max(0, remainingSeconds));
        }

        slideIndex++;
        compileNextSlide();
      };

      compileNextSlide();
    } catch (e: any) {
      // Clean up the canvas from the DOM in case of compilation failure
      const el = document.getElementById("cinematic-export-canvas");
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      alert("Failed compiling slides: " + e.message);
      setIsExporting(false);
    }
  };

  // Pick transition parameters for CSS motion components with zoomMultiplier support
  const getMotionAnimation = (slide: VideoSlide, sec: number) => {
    const style = slide.transition;
    const userScale = slide.zoomMultiplier || 1.0;

    // Advanced features
    const cRoll = slide.cameraRoll || 0;
    const cPitch = slide.cameraPitch || 0;
    const cYaw = slide.cameraYaw || 0;

    let customXInit = 0;
    let customXAnim = 0;
    let customYInit = 0;
    let customYAnim = 0;

    if (slide.motionSpeed && slide.motionSpeed > 0) {
      const angleRad = ((slide.motionAngle || 0) * Math.PI) / 180;
      const dist = (slide.motionSpeed || 20) * 1.5; // Up to 150px
      customXInit = Math.cos(angleRad) * (dist / 2);
      customYInit = Math.sin(angleRad) * (dist / 2);
      customXAnim = -Math.cos(angleRad) * (dist / 2);
      customYAnim = -Math.sin(angleRad) * (dist / 2);
    }

    const parallaxStr = slide.parallaxEnabled ? (slide.parallaxStrength || 30) : 0;
    const prxX = parallaxStr * 0.4; // Horizontal swing
    const prxY = parallaxStr * 0.3; // Vertical swing

    // Base animation states that incorporate camera controls and parallax
    const initial: any = {
      scale: userScale,
      rotate: cRoll,
      rotateX: cPitch - prxY,
      rotateY: cYaw - prxX,
      x: customXInit,
      y: customYInit,
    };

    const animate: any = {
      scale: userScale,
      rotate: cRoll,
      rotateX: cPitch + prxY,
      rotateY: cYaw + prxX,
      x: customXAnim,
      y: customYAnim,
    };

    const transition: any = { duration: sec, ease: "linear" };

    switch (style) {
      case "zoom":
        initial.scale = userScale;
        animate.scale = userScale * 1.18;
        transition.ease = "easeOut";
        break;
      case "zoomOut":
        initial.scale = userScale * 1.25;
        animate.scale = userScale * 1.0;
        transition.ease = "easeOut";
        break;
      case "panLeft":
        if (!slide.motionSpeed) {
          initial.x = 30;
          animate.x = -30;
        }
        initial.scale = userScale * 1.1;
        animate.scale = userScale * 1.1;
        break;
      case "panRight":
        if (!slide.motionSpeed) {
          initial.x = -30;
          animate.x = 30;
        }
        initial.scale = userScale * 1.1;
        animate.scale = userScale * 1.1;
        break;
      case "tiltUp":
        if (!slide.motionSpeed) {
          initial.y = -30;
          animate.y = 30;
        }
        initial.scale = userScale * 1.1;
        animate.scale = userScale * 1.1;
        break;
      case "tiltDown":
        if (!slide.motionSpeed) {
          initial.y = 30;
          animate.y = -30;
        }
        initial.scale = userScale * 1.1;
        animate.scale = userScale * 1.1;
        break;
      case "slideUp":
        if (!slide.motionSpeed) {
          initial.y = 40;
          animate.y = -10;
        }
        initial.scale = userScale * 1.05;
        animate.scale = userScale * 1.05;
        transition.ease = "easeOut";
        break;
      case "slideLeft":
        if (!slide.motionSpeed) {
          initial.x = 80;
          animate.x = 0;
        }
        transition.ease = "easeOut";
        break;
      case "slideRight":
        if (!slide.motionSpeed) {
          initial.x = -80;
          animate.x = 0;
        }
        transition.ease = "easeOut";
        break;
      case "blurFade":
        initial.filter = "blur(15px)";
        animate.filter = "blur(0px)";
        initial.opacity = 0;
        animate.opacity = 1;
        transition.duration = Math.min(0.8, sec);
        transition.ease = "easeOut";
        break;
      case "retroSpin":
        initial.rotate = cRoll - 3;
        animate.rotate = cRoll + 3;
        initial.scale = userScale * 1.1;
        animate.scale = userScale * 1.15;
        transition.ease = "easeOut";
        break;
      case "vortex":
        initial.rotate = cRoll - 180;
        animate.rotate = cRoll;
        initial.scale = 0.3;
        animate.scale = userScale;
        initial.opacity = 0;
        animate.opacity = 1;
        transition.ease = "easeOut";
        break;
      case "glitch":
        initial.skewX = -10;
        initial.scale = userScale * 1.05;
        animate.skewX = [10, -10, 5, -5, 0];
        animate.scale = userScale;
        transition.duration = Math.min(1.2, sec);
        transition.ease = "easeInOut";
        break;
      case "fadeOnly":
        initial.opacity = 0;
        animate.opacity = 1;
        transition.duration = Math.min(1.0, sec);
        transition.ease = "easeIn";
        break;
      default:
        initial.opacity = 0;
        animate.opacity = 1;
        transition.duration = 0.5;
        break;
    }

    return { initial, animate, transition };
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* Background ambient texture glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Cinematic Header Block */}
        <header className="flex flex-col lg:flex-row items-center justify-between border-b border-stone-800 pb-6 mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl text-stone-950 shadow-lg shadow-amber-500/10">
              <Video className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-stone-100 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                Animated Transition Video Maker
              </h1>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                Build cinematic slide shows with custom durations, beautiful text overlays, & custom soundtracks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Undo / Redo controls */}
            <div className="flex items-center gap-1 bg-stone-900 border border-stone-850 p-1.5 rounded-xl mr-1">
              <button
                onClick={handleUndo}
                disabled={past.length === 0}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  past.length > 0
                    ? "text-stone-200 hover:text-amber-400 hover:bg-stone-800"
                    : "text-stone-600 cursor-not-allowed opacity-30"
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px] font-mono">Undo ({past.length})</span>
              </button>
              
              <div className="w-[1px] h-3.5 bg-stone-800/80 mx-1" />
              
              <button
                onClick={handleRedo}
                disabled={future.length === 0}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  future.length > 0
                    ? "text-stone-200 hover:text-amber-400 hover:bg-stone-800"
                    : "text-stone-600 cursor-not-allowed opacity-30"
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px] font-mono">Redo ({future.length})</span>
              </button>
            </div>

            <button
              onClick={() => setIsAssetGalleryOpen(!isAssetGalleryOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow ${
                isAssetGalleryOpen
                  ? "bg-amber-500/15 border border-amber-500 text-amber-400"
                  : "bg-stone-900 border border-stone-800 hover:border-amber-500/30 text-stone-200"
              }`}
            >
              <Library className="w-4 h-4 text-amber-500" />
              <span>Asset Gallery ({galleryAssets.length})</span>
            </button>

            <button
              onClick={loadDemoProject}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-900 border border-stone-800 hover:border-amber-500/30 text-stone-200 transition-all cursor-pointer shadow"
            >
              <FolderOpen className="w-4 h-4 text-amber-500" />
              Load 20+ Demo Images
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all cursor-pointer shadow-lg shadow-amber-500/15"
            >
              <Upload className="w-4 h-4" />
              Upload Batch Photos
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>
        </header>

        {/* Dynamic Drag-and-Drop Area if no slides are present */}
        {slides.length === 0 ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 min-h-[450px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all ${
              isDraggingOver
                ? "border-amber-500 bg-amber-500/5 scale-[0.99]"
                : "border-stone-800 bg-stone-900/20 hover:border-stone-700"
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mb-6">
              <Upload className="w-10 h-10 text-stone-500 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-stone-200">Start Crafting Your Cinematic Video</h2>
            <p className="text-xs text-stone-400 max-w-md mt-2 leading-relaxed">
              Drag & drop over 20+ images from your college memories, or upload them at once. Add background audio, set custom transition animation effects, and export the video easily!
            </p>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                Upload Images
              </button>
              <button
                onClick={loadDemoProject}
                className="px-6 py-3 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 font-bold text-xs transition-all cursor-pointer"
              >
                Use 20+ Demo Snapshots
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
            {/* ASSET GALLERY SIDEBAR */}
            <AnimatePresence mode="popLayout">
              {isAssetGalleryOpen && (
                <motion.aside
                  id="asset-gallery-sidebar"
                  initial={{ opacity: 0, x: -30, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "auto" }}
                  exit={{ opacity: 0, x: -30, width: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="lg:col-span-3 bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl h-[820px] flex flex-col overflow-hidden sticky top-4"
                >
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                        <Images className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200 font-mono">
                          Asset Gallery
                        </h3>
                        <p className="text-[10px] text-stone-400 font-mono">
                          {galleryAssets.length} {galleryAssets.length === 1 ? "photo" : "photos"} stored
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAssetGalleryOpen(false)}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Hide gallery"
                    >
                      <span className="text-[10px] font-mono font-bold">✕ Close</span>
                    </button>
                  </div>

                  {/* Upload and Bulk Controls */}
                  <div className="space-y-2.5 mb-3.5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => sidebarFileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-[10px] transition-all cursor-pointer shadow-md"
                        title="Upload directly to asset library"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload To Gallery
                      </button>
                      <input
                        type="file"
                        ref={sidebarFileInputRef}
                        onChange={handleAssetUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      
                      <button
                        onClick={selectAllAssets}
                        disabled={galleryAssets.length === 0}
                        className="px-2.5 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-300 font-bold rounded-xl text-[10px] transition-colors cursor-pointer disabled:opacity-40"
                        title="Select all stored assets"
                      >
                        {selectedAssetIds.size === galleryAssets.length && galleryAssets.length > 0 ? "Clear All" : "Select All"}
                      </button>
                    </div>

                    {/* Batch insertion actions */}
                    {selectedAssetIds.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center justify-between gap-2"
                      >
                        <span className="text-[10px] font-bold text-amber-400 font-mono">
                          {selectedAssetIds.size} Selected
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={addSelectedAssetsToProject}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[9px] font-mono rounded-lg transition-colors cursor-pointer"
                          >
                            Add To Timeline (+{selectedAssetIds.size})
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove these ${selectedAssetIds.size} assets from your gallery?`)) {
                                selectedAssetIds.forEach(id => deleteAssetFromGallery(id));
                              }
                            }}
                            className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete selected assets"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Scrollable Gallery Grid */}
                  <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                    {galleryAssets.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-stone-500 space-y-3">
                        <div className="p-3 bg-stone-950 border border-stone-850 rounded-full">
                          <Library className="w-8 h-8 text-stone-600 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-stone-300">Your gallery is empty</p>
                          <p className="text-[9px] text-stone-500 max-w-[180px] leading-relaxed mx-auto">
                            Bulk uploads and loaded demo snapshots will automatically appear here. Or upload images directly above.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 pb-4">
                        {galleryAssets.map((asset, index) => {
                          const isSelected = selectedAssetIds.has(asset.id);
                          return (
                            <div
                              key={asset.id}
                              draggable
                              onDragStart={(e) => handleDragStartAsset(e, index)}
                              onDragOver={(e) => handleDragOverAsset(e, index)}
                              onDrop={handleDropAsset}
                              onDragEnd={handleDragEndAsset}
                              className={`group/asset relative aspect-square bg-stone-950 rounded-xl overflow-hidden border transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                isSelected
                                  ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                                  : "border-stone-800 hover:border-stone-600"
                              }`}
                            >
                              <img
                                src={asset.url}
                                alt={asset.name}
                                className="w-full h-full object-cover select-none pointer-events-none group-hover/asset:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />

                              {/* Gradient shading */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60 group-hover/asset:opacity-75 transition-opacity" />

                              {/* Batch Selection Checkbox overlay */}
                              <div className="absolute top-1.5 left-1.5 z-10">
                                <button
                                  type="button"
                                  onClick={() => toggleAssetSelection(asset.id)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-amber-500 border-amber-500 text-stone-950"
                                      : "bg-black/50 border-stone-600 hover:border-amber-500/80"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                              </div>

                              {/* Name/Size Label */}
                              <span className="absolute bottom-1 left-1 right-1 text-[8px] font-mono text-stone-300 truncate pointer-events-none bg-stone-950/70 px-1 py-0.5 rounded backdrop-blur-[2px]">
                                {asset.name || "Unnamed Asset"}
                              </span>

                              {/* Interactive Hover Actions Panel */}
                              <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover/asset:opacity-100 flex flex-col justify-between p-1.5 transition-all duration-200">
                                {/* Top corner actions */}
                                <div className="flex justify-end gap-1 select-none">
                                  <button
                                    onClick={() => deleteAssetFromGallery(asset.id)}
                                    className="p-1 bg-stone-900 hover:bg-rose-500/80 border border-stone-800 text-stone-400 hover:text-white rounded-md transition-colors cursor-pointer"
                                    title="Remove from gallery"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Drag indicator & click insertion */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => moveAssetInGallery(index, "up")}
                                      disabled={index === 0}
                                      className="p-0.5 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                      title="Move asset up"
                                    >
                                      <ChevronLeft className="w-2.5 h-2.5 rotate-90" />
                                    </button>
                                    <button
                                      onClick={() => moveAssetInGallery(index, "down")}
                                      disabled={index === galleryAssets.length - 1}
                                      className="p-0.5 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                      title="Move asset down"
                                    >
                                      <ChevronRight className="w-2.5 h-2.5 rotate-90" />
                                    </button>
                                  </div>
                                  
                                  <button
                                    onClick={() => addAssetToProject(asset)}
                                    className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[8px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-0.5 cursor-pointer uppercase"
                                  >
                                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                                    <span>Add Frame</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Pro-Tip helper */}
                  <div className="bg-stone-950 p-2.5 rounded-2xl border border-stone-850/60 mt-2 text-stone-500 text-[8px] leading-snug">
                    💡 <strong>Drag & Drop Support:</strong> Drag photos out of this gallery directly onto the timeline below to insert scenes, or drop onto the preview screen to swap slides!
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* LEFT COLUMN: Cinematic Slide Preview Player */}
            <section className={`${isAssetGalleryOpen ? "lg:col-span-5" : "lg:col-span-7"} space-y-6 transition-all duration-300`}>
              {/* High-Fidelity Interactive Slideshow Box */}
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-widest text-stone-300">
                      LIVE PREVIEW SCREEN
                    </span>
                  </div>

                  {/* Dynamic Video Aspect Ratio Picker */}
                  <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 self-start sm:self-auto">
                    <span className="text-[9px] font-mono text-stone-500 px-2 uppercase font-bold">Video Ratio:</span>
                    {(["16:9", "9:16", "1:1", "4:3"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setVideoAspectRatio(r)}
                        className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          videoAspectRatio === r
                            ? "bg-amber-500 text-stone-950 shadow shadow-amber-500/20"
                            : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <button
                      onClick={() => setGlobalShowSubtitles(!globalShowSubtitles)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        globalShowSubtitles
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                          : "bg-stone-950 border-stone-800 text-stone-500 hover:text-stone-400"
                      }`}
                      title={globalShowSubtitles ? "Hide all subtitles on video" : "Show subtitles on video"}
                    >
                      <FontIcon className="w-3 h-3" />
                      <span>SUBTITLES {globalShowSubtitles ? "ON" : "OFF"}</span>
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <span className="text-[10px] font-mono bg-stone-950 px-2 py-0.5 rounded border border-stone-800 text-stone-400">
                      Audio: {activeSoundtrackType === "custom" ? "Uploaded Song" : activeSoundtrackType === "synth" ? "Campus Melodies" : "Silent"}
                    </span>
                  </div>
                </div>

                {/* Primary Slide Display Window */}
                <div className={`relative bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 shadow-inner flex items-center justify-center transition-all duration-300 ${
                  videoAspectRatio === "16:9" ? "aspect-video w-full" :
                  videoAspectRatio === "9:16" ? "aspect-[9/16] h-[480px] sm:h-[520px] mx-auto" :
                  videoAspectRatio === "1:1" ? "aspect-square h-[450px] mx-auto" :
                  "aspect-[4/3] h-[450px] mx-auto"
                }`}>
                  <AnimatePresence mode="wait">
                    {slides[currentIndex] && (
                      <motion.div
                        key={slides[currentIndex].id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 w-full h-full cursor-crosshair group/preview overflow-hidden"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          const updated = [...slides];
                          updated[currentIndex] = {
                            ...updated[currentIndex],
                            anchorX: Math.round(x),
                            anchorY: Math.round(y),
                          };
                          setSlides(updated);
                        }}
                      >
                        {/* Interactive Image Frame with customized animation transitions & anchor origin pivot */}
                        <motion.img
                          key={slides[currentIndex].id + "_motion"}
                          src={slides[currentIndex].url}
                          alt="Cinematic Image Frame"
                          className={`w-full h-full ${
                            slides[currentIndex].fitMode === "contain" ? "object-contain bg-stone-950" : "object-cover"
                          }`}
                          referrerPolicy="no-referrer"
                          style={{
                            filter: getFilterCss(slides[currentIndex].filter),
                            transformOrigin: `${slides[currentIndex].anchorX !== undefined ? slides[currentIndex].anchorX : 50}% ${slides[currentIndex].anchorY !== undefined ? slides[currentIndex].anchorY : 50}%`,
                          }}
                          {...getMotionAnimation(slides[currentIndex], slides[currentIndex].duration)}
                        />

                        {/* LIVE PREVIEW VISUAL EFFECTS (VFX) */}
                        {slides[currentIndex].vfxType && slides[currentIndex].vfxType !== "none" && (
                          <>
                            {/* VFX: Lens Flare */}
                            {slides[currentIndex].vfxType === "lens_flare" && (
                              <div className="absolute inset-0 z-12 pointer-events-none mix-blend-screen overflow-hidden">
                                <div 
                                  className="absolute rounded-full"
                                  style={{
                                    left: `${slides[currentIndex].anchorX !== undefined ? slides[currentIndex].anchorX : 50}%`,
                                    top: `${slides[currentIndex].anchorY !== undefined ? slides[currentIndex].anchorY : 50}%`,
                                    width: `${(slides[currentIndex].vfxIntensity || 50) * 4}px`,
                                    height: `${(slides[currentIndex].vfxIntensity || 50) * 4}px`,
                                    transform: "translate(-50%, -50%)",
                                    background: "radial-gradient(circle, rgba(255, 245, 220, 0.95) 0%, rgba(245, 158, 11, 0.4) 25%, rgba(239, 68, 68, 0.12) 55%, rgba(0, 0, 0, 0) 70%)",
                                    filter: "blur(2px)"
                                  }}
                                />
                                <div 
                                  className="absolute"
                                  style={{
                                    left: `${slides[currentIndex].anchorX !== undefined ? slides[currentIndex].anchorX : 50}%`,
                                    top: `${slides[currentIndex].anchorY !== undefined ? slides[currentIndex].anchorY : 50}%`,
                                    width: "300%",
                                    height: `${(slides[currentIndex].vfxIntensity || 50) * 0.12 + 1}px`,
                                    transform: "translate(-50%, -50%) rotate(-12deg)",
                                    background: "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.35) 20%, rgba(255,255,255,0.95) 50%, rgba(245,158,11,0.35) 80%, rgba(245,158,11,0) 100%)",
                                    opacity: (slides[currentIndex].vfxIntensity || 50) / 100
                                  }}
                                />
                                <div 
                                  className="absolute rounded-full"
                                  style={{
                                    left: `${(slides[currentIndex].anchorX !== undefined ? slides[currentIndex].anchorX : 50) * 0.7 + 15}%`,
                                    top: `${(slides[currentIndex].anchorY !== undefined ? slides[currentIndex].anchorY : 50) * 0.7 + 15}%`,
                                    width: `${(slides[currentIndex].vfxIntensity || 50) * 0.7 + 15}px`,
                                    height: `${(slides[currentIndex].vfxIntensity || 50) * 0.7 + 15}px`,
                                    transform: "translate(-50%, -50%)",
                                    background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.06) 60%, rgba(0,0,0,0) 100%)",
                                    border: "1px solid rgba(59,130,246,0.12)",
                                    opacity: (slides[currentIndex].vfxIntensity || 50) / 100
                                  }}
                                />
                                <div 
                                  className="absolute rounded-full"
                                  style={{
                                    left: `${(slides[currentIndex].anchorX !== undefined ? slides[currentIndex].anchorX : 50) * 0.45 + 27.5}%`,
                                    top: `${(slides[currentIndex].anchorY !== undefined ? slides[currentIndex].anchorY : 50) * 0.45 + 27.5}%`,
                                    width: `${(slides[currentIndex].vfxIntensity || 50) * 1.1 + 25}px`,
                                    height: `${(slides[currentIndex].vfxIntensity || 50) * 1.1 + 25}px`,
                                    transform: "translate(-50%, -50%)",
                                    background: "radial-gradient(circle, rgba(239,68,68,0.12) 0%, rgba(245,158,11,0.04) 65%, rgba(0,0,0,0) 100%)",
                                    border: "1px solid rgba(239,68,68,0.08)",
                                    opacity: (slides[currentIndex].vfxIntensity || 50) / 100
                                  }}
                                />
                              </div>
                            )}

                            {/* VFX: Light Leak */}
                            {slides[currentIndex].vfxType === "light_leak" && (
                              <div className="absolute inset-0 z-12 pointer-events-none mix-blend-screen overflow-hidden">
                                <div 
                                  className="absolute inset-0 animate-light-leak"
                                  style={{
                                    background: "radial-gradient(circle at 15% 15%, rgba(245, 158, 11, 0.4) 0%, rgba(239, 68, 68, 0.22) 30%, rgba(139, 92, 246, 0.1) 50%, rgba(0, 0, 0, 0) 80%), radial-gradient(circle at 85% 85%, rgba(236, 72, 153, 0.3) 0%, rgba(239, 68, 68, 0.15) 35%, rgba(0, 0, 0, 0) 70%)",
                                    opacity: (slides[currentIndex].vfxIntensity || 50) / 100
                                  }}
                                />
                              </div>
                            )}

                            {/* VFX: Film Grain & Vintage Noise */}
                            {slides[currentIndex].vfxType === "film_grain" && (
                              <div className="absolute inset-0 z-12 pointer-events-none overflow-hidden select-none">
                                <div 
                                  className="absolute -inset-[20%] animate-film-grain bg-repeat"
                                  style={{
                                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                                    opacity: ((slides[currentIndex].vfxIntensity || 50) / 100) * 0.16
                                  }}
                                />
                                <div className="absolute inset-0 opacity-40">
                                  <div className="absolute w-[1px] h-12 bg-white/40 left-[25%] top-[15%] rotate-[5deg] animate-[pulse_0.15s_infinite]" />
                                  <div className="absolute w-[1.5px] h-6 bg-stone-900/40 left-[72%] top-[48%] -rotate-[12deg] animate-[pulse_0.23s_infinite]" />
                                  <div className="absolute w-2 h-2 rounded-full bg-white/30 left-[45%] top-[80%] animate-[pulse_0.08s_infinite]" />
                                </div>
                              </div>
                            )}

                            {/* VFX: Cozy Snow Particle Drift */}
                            {slides[currentIndex].vfxType === "snow" && (
                              <div className="absolute inset-0 z-12 pointer-events-none overflow-hidden select-none">
                                {[...Array(15)].map((_, i) => {
                                  const left = (i * 7.5 + (i % 3) * 5) % 100;
                                  const delay = (i * 0.35).toFixed(2);
                                  const duration = (3.0 + (i % 4) * 0.95).toFixed(2);
                                  return (
                                    <div
                                      key={i}
                                      className="absolute bg-white rounded-full animate-drift-snow"
                                      style={{
                                        left: `${left}%`,
                                        top: `-15px`,
                                        width: i % 3 === 0 ? "10px" : i % 3 === 1 ? "6px" : "4px",
                                        height: i % 3 === 0 ? "10px" : i % 3 === 1 ? "6px" : "4px",
                                        opacity: ((slides[currentIndex].vfxIntensity || 50) / 100) * (i % 2 === 0 ? 0.8 : 0.5),
                                        animationDelay: `${delay}s`,
                                        animationDuration: `${duration}s`,
                                        filter: i % 3 === 0 ? "blur(1px)" : "none"
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            )}

                            {/* VFX: Cinematic Raindrops */}
                            {slides[currentIndex].vfxType === "rain" && (
                              <div className="absolute inset-0 z-12 pointer-events-none overflow-hidden select-none">
                                {[...Array(20)].map((_, i) => {
                                  const left = (i * 6 + (i % 4) * 7) % 100;
                                  const delay = (i * 0.12).toFixed(2);
                                  const duration = (0.5 + (i % 3) * 0.15).toFixed(2);
                                  return (
                                    <div
                                      key={i}
                                      className="absolute bg-gradient-to-b from-white/30 to-white/0 rounded-full animate-drift-rain"
                                      style={{
                                        left: `${left}%`,
                                        top: `-80px`,
                                        width: "1.5px",
                                        height: "60px",
                                        opacity: ((slides[currentIndex].vfxIntensity || 50) / 100) * 0.6,
                                        animationDelay: `${delay}s`,
                                        animationDuration: `${duration}s`,
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            )}

                            {/* VFX: VHS Vintage Analog Scanlines & Glitch */}
                            {slides[currentIndex].vfxType === "vhs" && (
                              <div className="absolute inset-0 z-12 pointer-events-none overflow-hidden select-none animate-vhs-flicker">
                                <div 
                                  className="absolute inset-0 opacity-[0.25]"
                                  style={{
                                    backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.85) 50%, rgba(255,255,255,0.08) 50%)",
                                    backgroundSize: "100% 4px",
                                    opacity: ((slides[currentIndex].vfxIntensity || 50) / 100) * 0.35
                                  }}
                                />
                                <div 
                                  className="absolute w-full h-8 bg-white/10 blur-[2px] animate-vhs-roll"
                                  style={{
                                    opacity: ((slides[currentIndex].vfxIntensity || 50) / 100) * 0.25
                                  }}
                                />
                                <div className="absolute bottom-0 left-0 right-0 h-4 bg-stone-900/60 flex items-center justify-between select-none px-2 opacity-50 text-[6px] font-mono font-bold tracking-wider text-green-400">
                                  <span>PLAY ▷</span>
                                  <span>0:04:12</span>
                                  <span>VCR-240p</span>
                                </div>
                              </div>
                            )}

                            {/* VFX: Dreamy Floating Bokeh Orbs */}
                            {slides[currentIndex].vfxType === "bokeh" && (
                              <div className="absolute inset-0 z-12 pointer-events-none overflow-hidden select-none">
                                {[...Array(12)].map((_, i) => {
                                  const left = (i * 9 + (i % 3) * 8) % 100;
                                  const delay = (i * 0.45).toFixed(2);
                                  const duration = (5.0 + (i % 3) * 1.5).toFixed(2);
                                  return (
                                    <div
                                      key={i}
                                      className="absolute rounded-full animate-float-bokeh"
                                      style={{
                                        left: `${left}%`,
                                        bottom: `-40px`,
                                        width: i % 3 === 0 ? "32px" : i % 3 === 1 ? "48px" : "20px",
                                        height: i % 3 === 0 ? "32px" : i % 3 === 1 ? "48px" : "20px",
                                        background: "radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0.06) 65%, rgba(0,0,0,0) 100%)",
                                        opacity: ((slides[currentIndex].vfxIntensity || 50) / 100) * 0.85,
                                        animationDelay: `${delay}s`,
                                        animationDuration: `${duration}s`,
                                        filter: "blur(2px)",
                                        border: "1px solid rgba(245,158,11,0.08)"
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}

                        {/* Live Masking Overlay */}
                        {slides[currentIndex].maskType && slides[currentIndex].maskType !== "none" && (
                          <div
                            className="absolute inset-0 z-10 pointer-events-none transition-all duration-300"
                            style={{
                              background: (() => {
                                const pinX = slides[currentIndex].anchorX !== undefined ? slides[currentIndex].anchorX : 50;
                                const pinY = slides[currentIndex].anchorY !== undefined ? slides[currentIndex].anchorY : 50;
                                const radius = slides[currentIndex].maskRadius || 40;
                                const feather = slides[currentIndex].maskFeather || 50;
                                const mType = slides[currentIndex].maskType;
                                if (mType === "radial_focus") {
                                  return `radial-gradient(circle at ${pinX}% ${pinY}%, rgba(0,0,0,0) ${radius * (1 - feather / 100)}%, rgba(9,5,4,0.72) ${radius}%)`;
                                } else if (mType === "vignette") {
                                  return `radial-gradient(circle at ${pinX}% ${pinY}%, rgba(0,0,0,0) ${radius * (1 - feather / 100)}%, rgba(9,5,4,0.92) ${radius}%)`;
                                } else if (mType === "split_mask") {
                                  return `linear-gradient(to bottom, rgba(9,5,4,0.75) 0%, rgba(0,0,0,0) 50%, rgba(9,5,4,0.75) 100%)`;
                                }
                                return "none";
                              })()
                            }}
                          />
                        )}

                        {/* Anchor point focal target pin */}
                        <div
                          className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center pointer-events-none z-30 transition-all duration-300"
                          style={{
                            left: `${slides[currentIndex].anchorX !== undefined ? slides[currentIndex].anchorX : 50}%`,
                            top: `${slides[currentIndex].anchorY !== undefined ? slides[currentIndex].anchorY : 50}%`,
                          }}
                        >
                          <div className="absolute inset-0 rounded-full bg-amber-500/20 border border-amber-500 animate-ping" />
                          <div className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/40">
                            <div className="w-1.5 h-1.5 bg-stone-950 rounded-full" />
                          </div>
                          <span className="absolute left-5 bg-stone-950/90 border border-stone-800 text-[8px] font-mono font-bold text-amber-500 px-1 py-0.5 rounded whitespace-nowrap uppercase shadow">
                            Anchor Focus ({slides[currentIndex].anchorX !== undefined ? slides[currentIndex].anchorX : 50}%, {slides[currentIndex].anchorY !== undefined ? slides[currentIndex].anchorY : 50}%)
                          </span>
                        </div>

                        {/* Motion Vector Direction Indicator HUD */}
                        {slides[currentIndex].motionSpeed && slides[currentIndex].motionSpeed > 0 && (
                          <div
                            className="absolute pointer-events-none z-30 flex items-center justify-center transition-all duration-300"
                            style={{
                              left: `${slides[currentIndex].anchorX !== undefined ? slides[currentIndex].anchorX : 50}%`,
                              top: `${slides[currentIndex].anchorY !== undefined ? slides[currentIndex].anchorY : 50}%`,
                              transform: `rotate(${(slides[currentIndex].motionAngle || 0) - 90}deg)`, // Adjust arrow angle offset
                            }}
                          >
                            <div
                              className="h-0.5 bg-gradient-to-r from-amber-500 to-amber-500/10 origin-left"
                              style={{
                                width: `${(slides[currentIndex].motionSpeed || 20) * 1.5}px`,
                                boxShadow: "0 0 8px rgba(245,158,11,0.6)"
                              }}
                            />
                            <div
                              className="w-2 h-2 border-t-2 border-r-2 border-amber-500 absolute rotate-45"
                              style={{
                                left: `${(slides[currentIndex].motionSpeed || 20) * 1.5}px`,
                              }}
                            />
                          </div>
                        )}

                        {/* Modern Gradient Shading overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40 pointer-events-none" />

                        {/* Quick Click helper overlay on hover */}
                        <div className="absolute top-3 right-3 z-20 pointer-events-none opacity-0 group-hover/preview:opacity-100 transition-opacity bg-stone-950/85 px-2.5 py-1 rounded-lg border border-stone-800 text-[8px] font-mono font-bold uppercase tracking-wider text-stone-400">
                          Click Screen to Adjust Anchor Target
                        </div>

                        {/* Interactive Caption Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 z-20 text-center">
                          {globalShowSubtitles && slides[currentIndex].showSubtitle !== false && slides[currentIndex].caption && (
                            <p className="text-stone-100 font-extrabold text-lg md:text-xl drop-shadow-lg max-w-2xl mx-auto leading-relaxed mb-3">
                              "{slides[currentIndex].caption}"
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[10px] font-mono text-amber-500 bg-stone-950/80 px-2.5 py-0.5 rounded-full border border-stone-800">
                              FRAME {currentIndex + 1} OF {slides.length}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400 bg-stone-950/80 px-2.5 py-0.5 rounded-full border border-stone-800 uppercase">
                              Effect: {slides[currentIndex].transition}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Timeline Progress Bar indicator */}
                <div className="mt-4 space-y-4">
                  <div className="h-1.5 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                    <div
                      style={{ width: `${progress}%` }}
                      className="h-full bg-amber-500 rounded-full transition-all duration-100"
                    />
                  </div>

                  {/* Primary Video Player Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-11 h-11 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentIndex(0);
                          setProgress(0);
                        }}
                        className="w-9 h-9 rounded-full bg-stone-950 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 flex items-center justify-center transition-all cursor-pointer"
                        title="Reset Slideshow"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
                      <span>
                        Slide duration: <strong className="text-amber-500">{slides[currentIndex]?.duration || 3}s</strong>
                      </span>
                      <span className="text-stone-700">|</span>
                      <span>
                        Total Video: <strong className="text-amber-500">{slides.reduce((acc, curr) => acc + curr.duration, 0)}s</strong>
                      </span>
                    </div>

                     {/* Quality resolution selector and compile button */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <div className="relative">
                        <select
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value as any)}
                          className="bg-stone-950 border border-stone-800 hover:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-300 focus:border-amber-500/50 focus:outline-none cursor-pointer font-mono font-bold h-11"
                          disabled={isExporting}
                          title="Select export format"
                        >
                          <option value="mp4">Format: MP4</option>
                          <option value="webm">Format: WebM</option>
                        </select>
                      </div>

                      <div className="relative">
                        <select
                          value={exportResolution}
                          onChange={(e) => setExportResolution(e.target.value as any)}
                          className="bg-stone-950 border border-stone-800 hover:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-300 focus:border-amber-500/50 focus:outline-none cursor-pointer font-mono font-bold h-11"
                          disabled={isExporting}
                          title="Select export resolution"
                        >
                          <option value="720p">720p HD</option>
                          <option value="1080p">1080p FHD</option>
                          <option value="4k">4K UHD</option>
                          <option value="8k">8K Cinema</option>
                        </select>
                      </div>

                      <button
                        onClick={exportHighDefinitionVideo}
                        disabled={isExporting || slides.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 hover:scale-[1.02] rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/10 h-11"
                      >
                        {isExporting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{exportProgress}%</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Compile & Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRE-EXPORT VIDEO STORYBOARD SUMMARY */}
              <AnimatePresence>
                {slides.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-stone-800/80 pb-3 mb-1">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-amber-500 animate-pulse" />
                        <h3 className="text-sm font-extrabold text-stone-200 uppercase tracking-wider font-mono">
                          Video Summary & Script Sequence
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Ready to Render
                      </span>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed">
                      Review your sequence timeline, subtitles, and total estimated render duration below. Click any storyboard scene to jump directly to its editor frame.
                    </p>

                    {/* Summary Metric Stats Dashboard Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/70 text-center">
                        <span className="block text-[8px] font-mono text-stone-500 uppercase tracking-wider">Total Duration</span>
                        <span className="text-sm font-extrabold text-amber-500 font-mono">
                          {slides.reduce((acc, curr) => acc + curr.duration, 0)}s
                        </span>
                      </div>
                      <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/70 text-center">
                        <span className="block text-[8px] font-mono text-stone-500 uppercase tracking-wider">Scenes count</span>
                        <span className="text-sm font-extrabold text-stone-200 font-mono">
                          {slides.length} Clips
                        </span>
                      </div>
                      <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/70 text-center">
                        <span className="block text-[8px] font-mono text-stone-500 uppercase tracking-wider">Aspect Ratio</span>
                        <span className="text-sm font-extrabold text-stone-200 font-mono">
                          {videoAspectRatio}
                        </span>
                      </div>
                      <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/70 text-center">
                        <span className="block text-[8px] font-mono text-stone-500 uppercase tracking-wider">Export Setup</span>
                        <span className="text-xs font-bold text-amber-500/95 font-mono uppercase truncate block mt-0.5">
                          {exportFormat} • {exportResolution}
                        </span>
                      </div>
                    </div>

                    {/* Active Slide Captions & Duration Storyboard List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 uppercase tracking-wider px-1">
                        <span>Timeline Script Sequence</span>
                        <span>Duration / FX</span>
                      </div>

                      <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                        {slides.map((slide, idx) => {
                          const isActive = currentIndex === idx;
                          return (
                            <div
                              key={slide.id}
                              onClick={() => {
                                setCurrentIndex(idx);
                                setProgress(0);
                                setIsPlaying(false);
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 group relative overflow-hidden ${
                                isActive
                                  ? "border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/5"
                                  : "border-stone-800/80 bg-stone-950/40 hover:bg-stone-950/85 hover:border-stone-700"
                              }`}
                            >
                              {/* Slide Scene Thumbnail with Number Overlay */}
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-stone-950 border border-stone-800 relative group-hover:scale-[1.03] transition-transform">
                                <img
                                  src={slide.url}
                                  alt={`Scene ${idx + 1}`}
                                  className="w-full h-full object-cover pointer-events-none"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/10" />
                                <span className="absolute bottom-0 right-0 bg-stone-950/90 border-t border-l border-stone-800 text-[8px] font-mono font-extrabold text-amber-500 px-1 rounded-tl">
                                  #{(idx + 1).toString().padStart(2, "0")}
                                </span>
                                {isActive && (
                                  <div className="absolute inset-0 bg-amber-500/25 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                                  </div>
                                )}
                              </div>

                              {/* Middle Column: Script line / Slide caption */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-bold font-mono ${isActive ? "text-amber-400" : "text-stone-300"}`}>
                                    Scene {idx + 1}
                                  </span>
                                  {slide.name && (
                                    <span className="text-[9px] text-stone-500 font-mono truncate max-w-[120px]">
                                      ({slide.name})
                                    </span>
                                  )}
                                </div>
                                <p 
                                  className={`text-xs truncate leading-snug font-medium ${
                                    slide.caption 
                                      ? "text-stone-200" 
                                      : "text-stone-500 italic"
                                  }`}
                                >
                                  {slide.caption ? `"${slide.caption}"` : "(No caption subtitle set)"}
                                </p>
                              </div>

                              {/* Right Column: Duration, transition and optional effects badges */}
                              <div className="flex flex-col items-end gap-1.5 flex-shrink-0 text-right">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15">
                                    {slide.duration}s
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1 flex-wrap justify-end">
                                  <span className="text-[8px] font-mono text-stone-400 bg-stone-900 border border-stone-800 px-1.5 py-0.5 rounded uppercase">
                                    {slide.transition === "zoom" ? "Zoom In" : slide.transition === "zoomOut" ? "Zoom Out" : slide.transition === "panLeft" ? "Pan L" : slide.transition === "panRight" ? "Pan R" : slide.transition === "tiltUp" ? "Tilt U" : slide.transition === "tiltDown" ? "Tilt D" : slide.transition === "slideUp" ? "Slide U" : slide.transition === "slideLeft" ? "Slide L" : slide.transition === "slideRight" ? "Slide R" : slide.transition === "blurFade" ? "Blur" : slide.transition === "retroSpin" ? "Spin" : slide.transition === "vortex" ? "Vortex" : slide.transition === "glitch" ? "Glitch" : "Fade"}
                                  </span>
                                  {slide.vfxType && slide.vfxType !== "none" && (
                                    <span className="text-[8px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/10 px-1 py-0.5 rounded flex items-center gap-0.5">
                                      ✨ {slide.vfxType === "lens_flare" ? "Flare" : slide.vfxType === "light_leak" ? "Leak" : slide.vfxType === "film_grain" ? "Grain" : slide.vfxType === "snow" ? "Snow" : slide.vfxType === "rain" ? "Rain" : slide.vfxType === "vhs" ? "VHS" : "Bokeh"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-[9px] text-stone-500 leading-normal">
                      💡 <strong>Pro Tip:</strong> All text captions will compile directly onto the final frame as high-contrast cinematic subtitles. Set durations and customize transition vectors per scene above to align with your soundtrack tempo.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bulk Timeline Controls Area */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4.5 h-4.5 text-amber-500" />
                    <h3 className="text-sm font-bold text-stone-200">Bulk Slide Automation</h3>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">Quick Edit All Frames</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-2">Set All Transitions</label>
                    <div className="flex flex-wrap gap-1.5">
                      {["zoom", "zoomOut", "panLeft", "panRight", "tiltUp", "tiltDown", "slideUp", "slideLeft", "slideRight", "blurFade", "retroSpin", "vortex", "glitch", "fadeOnly"].map((style) => (
                        <button
                          key={style}
                          onClick={() => bulkApplyTransitions(style as any)}
                          className="text-[9px] font-semibold px-2 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 rounded text-stone-300 cursor-pointer transition-colors"
                        >
                          {style === "zoom" ? "Zoom In" : style === "zoomOut" ? "Zoom Out" : style === "panLeft" ? "Pan L" : style === "panRight" ? "Pan R" : style === "tiltUp" ? "Tilt U" : style === "tiltDown" ? "Tilt D" : style === "slideUp" ? "Slide U" : style === "slideLeft" ? "Slide L" : style === "slideRight" ? "Slide R" : style === "blurFade" ? "Blur Fade" : style === "retroSpin" ? "Retro Spin" : style === "vortex" ? "Vortex" : style === "glitch" ? "Glitch" : "Fade Only"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-2">Set All Slide Durations</label>
                    <div className="flex gap-2">
                      {[2, 3, 4, 5, 8].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => bulkApplyDurations(sec)}
                          className="flex-1 text-xs font-bold py-1 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 border border-stone-800 rounded transition-all cursor-pointer"
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: Slide Timeline & Soundtrack Customizer */}
            <section className={`${isAssetGalleryOpen ? "lg:col-span-4" : "lg:col-span-5"} space-y-6 transition-all duration-300`}>
              {/* Soundtrack Customizer Box */}
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h3 className="text-sm font-extrabold text-stone-200">Video Background Audio</h3>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Provide background score to the slideshow movie. Select from campus ambient synthesizers or upload your own song!
                </p>

                <div className="space-y-3 pt-1">
                  {/* Select Options */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setActiveSoundtrackType("synth");
                      }}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        activeSoundtrackType === "synth"
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                          : "bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Nostalgia Melody
                    </button>

                    <button
                      onClick={() => {
                        if (uploadedAudioSrc) {
                          setActiveSoundtrackType("custom");
                        } else {
                          audioInputRef.current?.click();
                        }
                      }}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        activeSoundtrackType === "custom"
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                          : "bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700"
                      }`}
                    >
                      <Music className="w-3.5 h-3.5" />
                      {uploadedAudioName ? "My Active Song" : "Select My Song"}
                    </button>
                  </div>

                  {/* Song Upload Area */}
                  <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                      <span>SONG SELECTION FOR SLIDESHOW</span>
                      {uploadedAudioName && (
                        <button
                          onClick={() => {
                            setUploadedAudioSrc("");
                            setUploadedAudioName("");
                            setActiveSoundtrackType("synth");
                          }}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Clear custom song
                        </button>
                      )}
                    </div>

                    {uploadedAudioName ? (
                      <div className="flex items-center gap-3 p-3 bg-stone-900 border border-amber-500/20 rounded-xl">
                        <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
                          <Music className="w-4 h-4 animate-bounce" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-stone-200 truncate">{uploadedAudioName}</p>
                          <p className="text-[9px] font-mono text-amber-500 uppercase tracking-wider">Custom Audio File Configured</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => audioInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 p-3.5 bg-stone-900 hover:bg-stone-900 border border-dashed border-stone-800 hover:border-stone-700 rounded-xl text-xs text-stone-400 hover:text-stone-200 transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Custom MP3 / Audio File
                      </button>
                    )}
                    <input
                      type="file"
                      ref={audioInputRef}
                      onChange={handleAudioUploadChange}
                      accept="audio/*"
                      className="hidden"
                    />
                    {uploadedAudioSrc && (
                      <audio ref={audioRef} src={uploadedAudioSrc} loop />
                    )}
                  </div>

                  {/* Auto-Sync Song controls */}
                  <div className="bg-stone-950 p-4 border border-stone-800 rounded-2xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="block text-xs font-bold text-stone-200">Auto-Sync Video Length to Song</span>
                        <p className="text-[10px] text-stone-400">Distributes the soundtrack duration evenly over all slides</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSyncToSong}
                          onChange={(e) => {
                            setAutoSyncToSong(e.target.checked);
                            if (e.target.checked && customAudioDuration) {
                              syncVideoDurationToAudio(customAudioDuration);
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-300 after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-stone-950 peer-checked:after:border-stone-950" />
                      </label>
                    </div>

                    {customAudioDuration ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono bg-stone-900/60 p-2 rounded-lg border border-stone-800/50">
                          <span className="text-stone-400">Song Duration:</span>
                          <span className="text-amber-400 font-bold">{Math.round(customAudioDuration)} seconds</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => syncVideoDurationToAudio(customAudioDuration)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/30 hover:border-amber-500 text-amber-400 hover:text-stone-950 font-bold rounded-xl text-[10px] transition-all cursor-pointer font-mono"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          SYNC SLIDESHOW TO SONG LENGTH
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-stone-500 italic bg-stone-900/40 p-2.5 rounded-lg border border-dashed border-stone-800 text-center">
                        Upload custom background music above to enable exact audio length matching.
                      </div>
                    )}
                  </div>

                  {/* Slideshow Audio Fading Controls */}
                  <div className="pt-4 border-t border-stone-800/80 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                      <span>SLIDESHOW AUDIO FADING CONTROLS</span>
                      <span className="text-amber-500 font-bold uppercase text-[9px] tracking-wider">Fade effects</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-stone-950 p-3 rounded-xl border border-stone-850 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Fade-In (Start):</span>
                          <span className="text-amber-500 font-bold">{audioFadeInDuration.toFixed(1)}s</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="8"
                          step="0.5"
                          value={audioFadeInDuration}
                          onChange={(e) => setAudioFadeInDuration(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                          title="Fade-in duration at slideshow start"
                        />
                        <div className="flex justify-between text-[8px] font-mono text-stone-600">
                          <span>0s (Off)</span>
                          <span>8s</span>
                        </div>
                      </div>

                      <div className="bg-stone-950 p-3 rounded-xl border border-stone-850 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Fade-Out (End):</span>
                          <span className="text-amber-500 font-bold">{audioFadeOutDuration.toFixed(1)}s</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="8"
                          step="0.5"
                          value={audioFadeOutDuration}
                          onChange={(e) => setAudioFadeOutDuration(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                          title="Fade-out duration at slideshow end"
                        />
                        <div className="flex justify-between text-[8px] font-mono text-stone-600">
                          <span>0s (Off)</span>
                          <span>8s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Slide Fine-Tuning Inspector Panel (Aspect Ratio, Fit Mode, Scale) */}
              {slides[currentIndex] && (
                <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-800 pb-3 mb-1">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-stone-200">
                      Frame #{currentIndex + 1} Inspector
                    </h3>
                    <span className="text-[10px] font-mono text-stone-400 ml-auto truncate max-w-[150px]">
                      {slides[currentIndex].name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Thumbnail Preview in inspector with transition preview */}
                    <div className="relative aspect-video bg-stone-950 rounded-xl overflow-hidden border border-stone-800 flex items-center justify-center group">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={`${currentIndex}_${slides[currentIndex].transition}_${previewToggle}`}
                          src={slides[currentIndex].url}
                          alt="Inspector Thumbnail"
                          className={`w-full h-full ${
                            slides[currentIndex].fitMode === "contain" ? "object-contain" : "object-cover"
                          }`}
                          style={{ filter: getFilterCss(slides[currentIndex].filter) }}
                          referrerPolicy="no-referrer"
                          {...getMotionAnimation(slides[currentIndex], 1.2)}
                        />
                      </AnimatePresence>
                      
                      <span className="absolute bottom-2 left-2 text-[8px] font-mono bg-stone-900/95 text-stone-400 px-1.5 py-0.5 rounded border border-stone-800 uppercase pointer-events-none z-10">
                        {slides[currentIndex].fitMode === "contain" ? "Contain" : "Cover"}
                      </span>

                      {/* Floating Active Transition Style Badge */}
                      <span className="absolute top-2 left-2 text-[8px] font-mono bg-amber-500/90 text-stone-950 px-2 py-0.5 rounded-full font-bold uppercase shadow-sm z-10 pointer-events-none">
                        Effect: {slides[currentIndex].transition || "zoom"}
                      </span>

                      {/* Small floating replay preview overlay */}
                      <button
                        onClick={() => setPreviewToggle(prev => prev + 1)}
                        className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 text-white text-[10px] font-bold font-mono transition-all duration-200 cursor-pointer z-20"
                        title="Replay Transition Animation Preview"
                      >
                        <span className="p-2 bg-amber-500 hover:scale-110 active:scale-95 text-stone-950 rounded-full shadow-lg transition-transform">
                          <Play className="w-3.5 h-3.5 fill-stone-950" />
                        </span>
                        <span className="bg-stone-950/90 px-2 py-0.5 rounded-lg border border-stone-800 tracking-wider">REPLAY PREVIEW</span>
                      </button>
                    </div>

                    {/* Quick controls */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">
                          Fit Mode (Aspect Control)
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              const updated = [...slides];
                              updated[currentIndex].fitMode = "cover";
                              setSlides(updated);
                            }}
                            className={`py-1.5 rounded-lg text-center text-[9px] font-bold border transition-all cursor-pointer ${
                              (slides[currentIndex].fitMode || "cover") === "cover"
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-400 font-extrabold"
                                : "bg-stone-950 border-stone-800/80 text-stone-400 hover:text-stone-300"
                            }`}
                          >
                            Fill Frame (Cover)
                          </button>
                          <button
                            onClick={() => {
                              const updated = [...slides];
                              updated[currentIndex].fitMode = "contain";
                              setSlides(updated);
                            }}
                            className={`py-1.5 rounded-lg text-center text-[9px] font-bold border transition-all cursor-pointer ${
                              slides[currentIndex].fitMode === "contain"
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-400 font-extrabold"
                                : "bg-stone-950 border-stone-800/80 text-stone-400 hover:text-stone-300"
                            }`}
                          >
                            Fit Frame (Contain)
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400">
                            Custom Zoom Ratio
                          </label>
                          <span className="text-[10px] font-mono font-bold text-amber-500">
                            {slides[currentIndex].zoomMultiplier ? `${slides[currentIndex].zoomMultiplier.toFixed(1)}x` : "1.0x"}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.6"
                          max="2.0"
                          step="0.1"
                          value={slides[currentIndex].zoomMultiplier || 1.0}
                          onChange={(e) => {
                            const updated = [...slides];
                            updated[currentIndex].zoomMultiplier = Number(e.target.value);
                            setSlides(updated);
                          }}
                          className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-950 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[8px] font-mono text-stone-500 mt-1">
                          <span>0.6x (Zoom Out)</span>
                          <span>1.0x (Original)</span>
                          <span>2.0x (Zoom In)</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400">
                            Frame Audio Volume
                          </label>
                          <span className="text-[10px] font-mono font-bold text-amber-500 font-mono">
                            {slides[currentIndex].volume !== undefined ? slides[currentIndex].volume : 100}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={slides[currentIndex].volume !== undefined ? slides[currentIndex].volume : 100}
                          onChange={(e) => {
                            const updated = [...slides];
                            updated[currentIndex].volume = Number(e.target.value);
                            setSlides(updated);
                          }}
                          className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-950 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[8px] font-mono text-stone-500 mt-1">
                          <span>0% (Mute)</span>
                          <span>50%</span>
                          <span>100% (Full)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtitle caption input & settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1.5">
                        Transition Animation Style
                      </label>
                      <select
                        value={slides[currentIndex].transition}
                        onChange={(e) => {
                          const updated = [...slides];
                          updated[currentIndex].transition = e.target.value as any;
                          setSlides(updated);
                        }}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500/50 focus:outline-none cursor-pointer"
                      >
                        <option value="zoom">Zoom In Effect</option>
                        <option value="zoomOut">Zoom Out Effect</option>
                        <option value="panLeft">Pan Left Movement</option>
                        <option value="panRight">Pan Right Movement</option>
                        <option value="tiltUp">Tilt Up Movement</option>
                        <option value="tiltDown">Tilt Down Movement</option>
                        <option value="slideUp">Slide Up Entry</option>
                        <option value="slideLeft">Slide Left Entry</option>
                        <option value="slideRight">Slide Right Entry</option>
                        <option value="blurFade">Cinematic Blur Dissolve</option>
                        <option value="retroSpin">Retro Spin & Zoom</option>
                        <option value="vortex">Vortex Spin Dissolve</option>
                        <option value="glitch">Digital Glitch Jitter</option>
                        <option value="fadeOnly">Clean Cross-Fade Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1.5">
                        Duration in Seconds
                      </label>
                      <div className="flex gap-1 bg-stone-950 p-0.5 rounded-xl border border-stone-800">
                        {[2, 3, 4, 5, 8].map((sec) => (
                          <button
                            key={sec}
                            onClick={() => {
                              const updated = [...slides];
                              updated[currentIndex].duration = sec;
                              setSlides(updated);
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-center text-xs font-mono font-bold transition-all cursor-pointer ${
                              slides[currentIndex].duration === sec
                                ? "bg-amber-500 text-stone-950"
                                : "text-stone-400 hover:text-stone-200"
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Artistic Color Filter */}
                  <div className="border-t border-stone-800/60 pt-4 space-y-2">
                    <label className="block text-[10px] font-mono uppercase text-stone-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Artistic Color Filter
                    </label>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "none", name: "Normal", desc: "No Filter" },
                        { id: "grayscale", name: "Grayscale", desc: "Classic Noir" },
                        { id: "sepia", name: "Sepia", desc: "Retro Warm" },
                        { id: "vibrant", name: "Vibrant", desc: "Rich Saturate" },
                        { id: "vintage", name: "Vintage", desc: "Analog Film" },
                        { id: "invert", name: "X-Ray", desc: "Invert Art" },
                        { id: "warm", name: "Sunny", desc: "Golden Hour" },
                        { id: "cool", name: "Nordic", desc: "Glacier Cool" },
                        { id: "dramatic", name: "Dramatic", desc: "Cinematic Low-Sat" },
                        { id: "cyberpunk", name: "Cyberpunk", desc: "Neon Pink/Blue" },
                        { id: "technicolor", name: "Technicolor", desc: "Retro Hollywood" },
                        { id: "monochrome", name: "Monochrome", desc: "High Contrast B&W" },
                        { id: "dream", name: "Dream Soft", desc: "Dreamy Glow" }
                      ].map((filt) => (
                        <button
                          key={filt.id}
                          onClick={() => {
                            const updated = [...slides];
                            updated[currentIndex].filter = filt.id as any;
                            setSlides(updated);
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            (slides[currentIndex].filter || "none") === filt.id
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-400 font-extrabold"
                              : "bg-stone-950 border-stone-800/80 text-stone-400 hover:text-stone-300 hover:border-stone-700"
                          }`}
                        >
                          <span className="text-[10px] font-bold tracking-tight">{filt.name}</span>
                          <span className="text-[8px] opacity-70 font-mono mt-0.5">{filt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                   <div className="space-y-2 border-t border-stone-800/60 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono uppercase text-stone-400 font-bold flex items-center gap-1.5">
                        <FontIcon className="w-3.5 h-3.5 text-amber-500" />
                        Subtitle Overlay & Caption
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...slides];
                            updated[currentIndex].showSubtitle = !(updated[currentIndex].showSubtitle !== false);
                            setSlides(updated);
                          }}
                          className={`text-[9px] font-mono font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                            slides[currentIndex].showSubtitle !== false
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          }`}
                        >
                          {slides[currentIndex].showSubtitle !== false ? "● Subtitle Enabled" : "○ Subtitle Disabled"}
                        </button>
                      </div>
                    </div>
                    
                    {/* Caption input and quick action buttons */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={slides[currentIndex].caption || ""}
                        onChange={(e) => {
                          const updated = [...slides];
                          updated[currentIndex].caption = e.target.value;
                          if (e.target.value && updated[currentIndex].showSubtitle === false) {
                            updated[currentIndex].showSubtitle = true; // Auto-enable if user starts writing
                          }
                          setSlides(updated);
                        }}
                        className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:border-amber-500/50 focus:outline-none"
                        placeholder="Write subtitle caption displayed on video..."
                      />
                      
                      {slides[currentIndex].caption ? (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...slides];
                            updated[currentIndex].caption = "";
                            updated[currentIndex].showSubtitle = false;
                            setSlides(updated);
                          }}
                          className="px-3 py-2 bg-stone-950 border border-stone-800 hover:border-rose-500/50 hover:text-rose-400 text-stone-400 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                          title="Remove Subtitle"
                        >
                          Clear
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...slides];
                            updated[currentIndex].caption = "A beautiful cinematic scene";
                            updated[currentIndex].showSubtitle = true;
                            setSlides(updated);
                          }}
                          className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-amber-400 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                          title="Add Subtitle template"
                        >
                          Add Preset
                        </button>
                      )}
                    </div>
                    <p className="text-[9px] text-stone-500 leading-tight">
                      Disable subtitle visibility to completely hide captions on both live preview and exported videos, or use "Clear" to reset.
                    </p>
                  </div>

                  {/* Advanced Camera Motion & VFX Studio */}
                  <div className="border-t border-stone-800/60 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono uppercase text-stone-400 font-bold flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-amber-500" />
                        ADVANCED CAMERA & VFX STUDIO
                      </label>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono font-bold uppercase border border-amber-500/20">
                        Pro Tools Enabled
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-950 p-4 rounded-2xl border border-stone-800/80">
                      {/* Sub-Panel 1: Motion Vectors */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-stone-800/55 pb-1.5">
                          <Compass className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[10px] font-bold text-stone-200 font-mono uppercase">1. Motion & Direction Vectors</span>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-stone-400">Motion Angle (Direction)</label>
                            <span className="text-[10px] font-mono text-amber-500 font-bold">{(slides[currentIndex] && slides[currentIndex].motionAngle) !== undefined ? slides[currentIndex].motionAngle : 0}°</span>
                          </div>
                          <div className="flex gap-2.5 items-center">
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={(slides[currentIndex] && slides[currentIndex].motionAngle) !== undefined ? slides[currentIndex].motionAngle : 0}
                              onChange={(e) => {
                                const updated = [...slides];
                                updated[currentIndex].motionAngle = Number(e.target.value);
                                setSlides(updated);
                              }}
                              className="flex-1 accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                            />
                            {/* Circular visual feedback dial */}
                            <div className="w-6 h-6 rounded-full border border-stone-800 bg-stone-900 flex items-center justify-center relative shadow-inner overflow-hidden">
                              <div 
                                className="w-2 h-0.5 bg-amber-500 origin-left absolute"
                                style={{ transform: `rotate(${((slides[currentIndex] && slides[currentIndex].motionAngle) !== undefined ? slides[currentIndex].motionAngle : 0) - 90}deg)`, left: "50%" }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-[8px] font-mono text-stone-500 mt-1">
                            <span>0° (Up)</span>
                            <span>90° (Right)</span>
                            <span>180° (Down)</span>
                            <span>270° (Left)</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-stone-400 font-medium">Motion Speed (Force)</label>
                            <span className="text-[10px] font-mono text-amber-500 font-bold">{(slides[currentIndex] && slides[currentIndex].motionSpeed) !== undefined ? slides[currentIndex].motionSpeed : 0}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={(slides[currentIndex] && slides[currentIndex].motionSpeed) !== undefined ? slides[currentIndex].motionSpeed : 0}
                            onChange={(e) => {
                              const updated = [...slides];
                              updated[currentIndex].motionSpeed = Number(e.target.value);
                              setSlides(updated);
                            }}
                            className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                          />
                          <div className="flex justify-between text-[8px] font-mono text-stone-500 mt-1">
                            <span>0% (Disabled)</span>
                            <span>50% (Gentle)</span>
                            <span>100% (Cinematic Fast)</span>
                          </div>
                        </div>
                      </div>

                      {/* Sub-Panel 2: Anchor Pin & Masking Brush */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-stone-800/55 pb-1.5">
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[10px] font-bold text-stone-200 font-mono uppercase">2. Focal Anchor & Mask Brush</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] text-stone-400 block mb-1">Anchor X%</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={(slides[currentIndex] && slides[currentIndex].anchorX) !== undefined ? slides[currentIndex].anchorX : 50}
                              onChange={(e) => {
                                const updated = [...slides];
                                updated[currentIndex].anchorX = Math.max(0, Math.min(100, Number(e.target.value)));
                                setSlides(updated);
                              }}
                              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-xs text-stone-200 text-center focus:border-amber-500/50 focus:outline-none"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-stone-400 block mb-1">Anchor Y%</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={(slides[currentIndex] && slides[currentIndex].anchorY) !== undefined ? slides[currentIndex].anchorY : 50}
                              onChange={(e) => {
                                const updated = [...slides];
                                updated[currentIndex].anchorY = Math.max(0, Math.min(100, Number(e.target.value)));
                                setSlides(updated);
                              }}
                              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-xs text-stone-200 text-center focus:border-amber-500/50 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...slides];
                              updated[currentIndex].anchorX = 50;
                              updated[currentIndex].anchorY = 50;
                              setSlides(updated);
                            }}
                            className="flex-1 py-1 px-2 text-[8px] font-mono font-bold uppercase rounded border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-400 transition-colors cursor-pointer"
                          >
                            Reset Focus to Center
                          </button>
                        </div>

                        <div>
                          <label className="block text-[9px] text-stone-400 mb-1">Mask Brush Type</label>
                          <select
                            value={(slides[currentIndex] && slides[currentIndex].maskType) || "none"}
                            onChange={(e) => {
                              const updated = [...slides];
                              updated[currentIndex].maskType = e.target.value as any;
                              if (updated[currentIndex].maskRadius === undefined) {
                                updated[currentIndex].maskRadius = 40;
                              }
                              if (updated[currentIndex].maskFeather === undefined) {
                                updated[currentIndex].maskFeather = 50;
                              }
                              setSlides(updated);
                            }}
                            className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2 py-1.5 text-[10px] text-stone-300 focus:outline-none"
                          >
                            <option value="none">No Spotlight Mask</option>
                            <option value="radial_focus">Radial Spotlight Focus</option>
                            <option value="vignette">Deep Vignette Shading</option>
                            <option value="split_mask">Graduated Split Mask</option>
                          </select>
                        </div>

                        {slides[currentIndex] && slides[currentIndex].maskType && slides[currentIndex].maskType !== "none" && (
                          <div className="space-y-2 pt-1">
                            <div>
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="text-stone-500">Spotlight Radius</span>
                                <span className="text-amber-500 font-bold">{slides[currentIndex].maskRadius || 40}%</span>
                              </div>
                              <input
                                type="range"
                                min="10"
                                max="100"
                                value={slides[currentIndex].maskRadius || 40}
                                onChange={(e) => {
                                  const updated = [...slides];
                                  updated[currentIndex].maskRadius = Number(e.target.value);
                                  setSlides(updated);
                                }}
                                className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="text-stone-500">Brush Feather</span>
                                <span className="text-amber-500 font-bold">{slides[currentIndex].maskFeather || 50}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={slides[currentIndex].maskFeather || 50}
                                onChange={(e) => {
                                  const updated = [...slides];
                                  updated[currentIndex].maskFeather = Number(e.target.value);
                                  setSlides(updated);
                                }}
                                className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-950 p-4 rounded-2xl border border-stone-800/80">
                      {/* Sub-Panel 3: Camera 3D Position Offsets */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-stone-800/55 pb-1.5">
                          <Settings className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[10px] font-bold text-stone-200 font-mono uppercase">3. Cinematic Camera Controls</span>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-stone-400">Camera Roll (Rotation Twist)</label>
                            <span className="text-[10px] font-mono text-amber-500 font-bold">{slides[currentIndex] && slides[currentIndex].cameraRoll !== undefined ? slides[currentIndex].cameraRoll : 0}°</span>
                          </div>
                          <input
                            type="range"
                            min="-45"
                            max="45"
                            value={slides[currentIndex] && slides[currentIndex].cameraRoll !== undefined ? slides[currentIndex].cameraRoll : 0}
                            onChange={(e) => {
                              const updated = [...slides];
                              updated[currentIndex].cameraRoll = Number(e.target.value);
                              setSlides(updated);
                            }}
                            className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                          />
                          <div className="flex justify-between text-[8px] font-mono text-stone-500 mt-1">
                            <span>-45° Left</span>
                            <span>0° Level</span>
                            <span>+45° Right</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <div className="flex justify-between items-center mb-1 text-[9px]">
                              <span className="text-stone-400">Camera Pitch (Tilt)</span>
                              <span className="text-amber-500 font-bold font-mono">{slides[currentIndex] && slides[currentIndex].cameraPitch !== undefined ? slides[currentIndex].cameraPitch : 0}°</span>
                            </div>
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              value={slides[currentIndex] && slides[currentIndex].cameraPitch !== undefined ? slides[currentIndex].cameraPitch : 0}
                              onChange={(e) => {
                                const updated = [...slides];
                                updated[currentIndex].cameraPitch = Number(e.target.value);
                                setSlides(updated);
                              }}
                              className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1 text-[9px]">
                              <span className="text-stone-400">Camera Yaw (Pan)</span>
                              <span className="text-amber-500 font-bold font-mono">{slides[currentIndex] && slides[currentIndex].cameraYaw !== undefined ? slides[currentIndex].cameraYaw : 0}°</span>
                            </div>
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              value={slides[currentIndex] && slides[currentIndex].cameraYaw !== undefined ? slides[currentIndex].cameraYaw : 0}
                              onChange={(e) => {
                                const updated = [...slides];
                                updated[currentIndex].cameraYaw = Number(e.target.value);
                                setSlides(updated);
                              }}
                              className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sub-Panel 4: 3D Depth Parallax Simulation */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-stone-800/55 pb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[10px] font-bold text-stone-200 font-mono uppercase">4. Deep 3D Parallax Separation</span>
                        </div>

                        <div className="flex items-center justify-between bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/50">
                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-bold text-stone-300">Enable 3D Parallax</span>
                            <span className="block text-[8px] text-stone-500 leading-none">Simulates depth layers splitting on animation</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!(slides[currentIndex] && slides[currentIndex].parallaxEnabled)}
                              onChange={(e) => {
                                const updated = [...slides];
                                updated[currentIndex].parallaxEnabled = e.target.checked;
                                if (e.target.checked && updated[currentIndex].parallaxStrength === undefined) {
                                  updated[currentIndex].parallaxStrength = 30;
                                }
                                setSlides(updated);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4.5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-300 after:border-stone-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-stone-950 peer-checked:after:border-stone-950" />
                          </label>
                        </div>

                        {slides[currentIndex] && slides[currentIndex].parallaxEnabled && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] text-stone-400">Parallax Displacement Power</label>
                              <span className="text-[10px] font-mono text-amber-500 font-bold">{slides[currentIndex].parallaxStrength || 30}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={slides[currentIndex].parallaxStrength || 30}
                              onChange={(e) => {
                                const updated = [...slides];
                                updated[currentIndex].parallaxStrength = Number(e.target.value);
                                setSlides(updated);
                              }}
                              className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                            />
                            <div className="flex justify-between text-[8px] font-mono text-stone-500 mt-1">
                              <span>10% (Shallow)</span>
                              <span>50% (Balanced)</span>
                              <span>100% (Maximum Separation)</span>
                            </div>
                          </div>
                        )}

                        <div className="p-2 bg-amber-500/5 rounded-lg border border-amber-500/10 text-[8px] font-mono text-amber-400/80 leading-relaxed">
                          ⚡ Anchor Focus Pin sets the optical pivot point. Parallax mimics a stereoscopic camera lens, drifting foreground details to add rich 3D perspective to standard 2D photos.
                        </div>
                      </div>
                    </div>

                    {/* Sub-Panel 5: Cinematic Special Effects Overlay (VFX) */}
                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800/80 space-y-3.5 mt-4">
                      <div className="flex items-center justify-between border-b border-stone-800/55 pb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span className="text-[10px] font-bold text-stone-200 font-mono uppercase">5. Cinematic Visual Effects (VFX) Overlays</span>
                        </div>
                        <span className="text-[8px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono font-bold uppercase border border-amber-500/20 animate-pulse">
                          Active VFX Studio
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] text-stone-400 uppercase font-mono mb-1.5">Choose VFX Overlay Style</label>
                          <select
                            value={(slides[currentIndex] && slides[currentIndex].vfxType) || "none"}
                            onChange={(e) => {
                              const updated = [...slides];
                              updated[currentIndex].vfxType = e.target.value as any;
                              if (updated[currentIndex].vfxIntensity === undefined) {
                                updated[currentIndex].vfxIntensity = 50;
                              }
                              setSlides(updated);
                            }}
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500/50 focus:outline-none cursor-pointer"
                          >
                            <option value="none">✨ No VFX Overlay</option>
                            <option value="lens_flare">🎥 Anamorphic Lens Flare (Focal Based)</option>
                            <option value="light_leak">🔥 Vintage Projector Light Leak Sweep</option>
                            <option value="film_grain">🎞️ 35mm Analog Film Grain & Dust Scratches</option>
                            <option value="snow">❄️ Cozy Atmospheric Winter Snowfall</option>
                            <option value="rain">🌧️ Dramatic Cinematic Rain Shower</option>
                            <option value="vhs">📼 Retro 80s VHS Video Tape scanlines</option>
                            <option value="bokeh">🟡 Soft Golden Floating Bokeh Bubbles</option>
                          </select>
                        </div>

                        {slides[currentIndex] && slides[currentIndex].vfxType && slides[currentIndex].vfxType !== "none" && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-stone-400 uppercase font-mono">VFX Intensity / Scale</span>
                              <span className="text-amber-500 font-bold font-mono">{slides[currentIndex].vfxIntensity || 50}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={slides[currentIndex].vfxIntensity || 50}
                              onChange={(e) => {
                                const updated = [...slides];
                                updated[currentIndex].vfxIntensity = Number(e.target.value);
                                setSlides(updated);
                              }}
                              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-900 rounded-lg appearance-none mt-1"
                            />
                            <div className="flex justify-between text-[8px] font-mono text-stone-500">
                              <span>10% (Subtle Accent)</span>
                              <span>50% (Standard)</span>
                              <span>100% (High Density)</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] text-stone-500 leading-tight">
                        ✨ Pro Tip: The Lens Flare effect will automatically align to your chosen **Anchor Focus Pin** on the slide, creating gorgeous focal perspective. Light Leak and VHS effects add rich nostalgia to historic memories.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STYLES & PRESETS STUDIO */}
              <AnimatePresence>
                {slides.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-stone-800/80 pb-3 mb-1">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-amber-500" />
                        <h3 className="text-sm font-extrabold text-stone-200 uppercase tracking-wider font-mono">
                          Styles & Presets Studio
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Live Templates
                      </span>
                    </div>

                    {presetFeedback && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl text-xs flex items-center gap-2 animate-pulse font-medium">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{presetFeedback}</span>
                      </div>
                    )}

                    <p className="text-xs text-stone-400 leading-relaxed">
                      Save your custom combination of transitions, artistic filters, camera pan, and cinematic VFX as reusable presets, or apply pre-built style templates instantly.
                    </p>

                    <div className="space-y-4">
                      {/* Custom Preset Saving Form */}
                      <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800/80 space-y-3">
                        <div className="flex items-center gap-2">
                          <Save className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-[10px] font-bold text-stone-300 font-mono uppercase">Save Active Frame Style as Preset</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder="e.g., Midnight Retro Cyber, Cinematic Noir 3D"
                            className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:border-amber-500/50 focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newPresetName.trim()) {
                                saveCurrentStylesAsPreset(newPresetName);
                              }
                            }}
                          />
                          <button
                            onClick={() => saveCurrentStylesAsPreset(newPresetName)}
                            disabled={!newPresetName.trim()}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 disabled:border-stone-850 text-stone-950 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
                          >
                            Save Preset
                          </button>
                        </div>
                      </div>

                      {/* Presets List Sections (Curated) */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-stone-400 font-mono uppercase">Curated Cinematic Templates</span>
                          <span className="text-[8px] text-stone-500 font-mono">Click to Apply</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                          {SYSTEM_PRESETS.map((preset) => {
                            const isActive = slides[currentIndex] && 
                              slides[currentIndex].transition === preset.transition && 
                              slides[currentIndex].filter === preset.filter && 
                              slides[currentIndex].vfxType === preset.vfxType;
                            return (
                              <div 
                                key={preset.id}
                                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 bg-stone-950/40 hover:bg-stone-950/90 cursor-pointer group ${
                                  isActive ? "border-amber-500 bg-amber-500/5" : "border-stone-800/80 hover:border-stone-700"
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-stone-200 group-hover:text-amber-400 transition-colors">
                                      {preset.name}
                                    </span>
                                    {isActive && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                                  </div>
                                  <span className="block text-[8px] text-stone-500 leading-tight">
                                    {preset.description}
                                  </span>
                                </div>

                                <div className="flex gap-1.5 mt-1 border-t border-stone-900/60 pt-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      loadPreset(preset, false);
                                    }}
                                    className="flex-1 text-[8px] font-mono font-bold bg-stone-900 hover:bg-stone-800 text-stone-300 py-1 px-1.5 rounded transition-all cursor-pointer border border-stone-800"
                                  >
                                    Apply Active
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      loadPreset(preset, true);
                                    }}
                                    className="flex-1 text-[8px] font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 py-1 px-1.5 rounded transition-all cursor-pointer border border-amber-500/20"
                                    title="Apply style to all slides in timeline"
                                  >
                                    Apply to All
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Saved Custom Presets */}
                      <div className="space-y-3 pt-2 border-t border-stone-800/55">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-stone-400 font-mono uppercase">Your Reusable Style Templates ({customPresets.length})</span>
                          {customPresets.length === 0 && <span className="text-[8px] text-stone-600 font-mono italic">No custom presets saved yet</span>}
                        </div>

                        {customPresets.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                            {customPresets.map((preset) => (
                              <div 
                                key={preset.id}
                                className="p-2.5 rounded-xl border border-stone-800/80 bg-stone-950/40 hover:bg-stone-950 hover:border-stone-700 transition-all flex flex-col justify-between gap-2"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-bold text-stone-200 truncate" title={preset.name}>
                                      ⭐ {preset.name}
                                    </span>
                                    <button
                                      onClick={() => deleteCustomPreset(preset.id)}
                                      className="text-stone-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                                      title="Delete Preset"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <span className="block text-[8px] text-stone-500 font-mono">
                                    {preset.description}
                                  </span>
                                </div>

                                <div className="flex gap-1.5 mt-1 border-t border-stone-900/40 pt-1.5">
                                  <button
                                    onClick={() => loadPreset(preset, false)}
                                    className="flex-1 text-[8px] font-mono font-bold bg-stone-900 hover:bg-stone-800 text-stone-300 py-1 px-1.5 rounded transition-all cursor-pointer border border-stone-800"
                                  >
                                    Apply Active
                                  </button>
                                  <button
                                    onClick={() => loadPreset(preset, true)}
                                    className="flex-1 text-[8px] font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 py-1 px-1.5 rounded transition-all cursor-pointer border border-amber-500/20"
                                  >
                                    Apply to All
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Master Timeline & Slides Management List */}
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-extrabold text-stone-200">Timeline Slides ({slides.length})</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSlides([]);
                      setCurrentIndex(0);
                    }}
                    className="text-xs text-stone-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {/* Horizontal Sequence Strip Preview */}
                {slides.length > 0 && (
                  <div className="space-y-2.5 bg-stone-950/70 border border-stone-800/80 p-3.5 rounded-2xl">
                    <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        Interactive Sequence Strip
                      </span>
                      <span className="text-stone-500 font-bold">
                        Total: {slides.reduce((acc, s) => acc + (s.duration || 3), 0)}s • {slides.length} slides
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                      {slides.map((slide, idx) => {
                        const isSelected = currentIndex === idx;
                        return (
                          <div key={`strip-${slide.id}`} className="flex items-center flex-shrink-0">
                            {/* Thumbnail Card */}
                            <button
                              onClick={() => {
                                setCurrentIndex(idx);
                                setProgress(0);
                              }}
                              className={`relative group flex-shrink-0 cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 outline-none ${
                                isSelected
                                  ? "border-amber-500 ring-2 ring-amber-500/20 scale-[1.03] shadow-md"
                                  : "border-stone-800 hover:border-stone-600 scale-100 hover:scale-[1.01]"
                              }`}
                              style={{ width: "84px", height: "56px" }}
                              title={`Slide ${idx + 1}: ${slide.caption || "No caption"}`}
                            >
                              <img
                                src={slide.url}
                                alt={`Slide ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                style={{ filter: getFilterCss(slide.filter) }}
                                referrerPolicy="no-referrer"
                              />

                              {/* Corner index badge */}
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-mono font-black rounded bg-stone-950/85 text-stone-300 border border-stone-800/60 leading-none">
                                {idx + 1}
                              </span>

                              {/* Duration Badge */}
                              <span className="absolute bottom-1 right-1 px-1 py-0.5 text-[7px] font-mono rounded bg-stone-900/90 text-amber-400 font-extrabold border border-stone-800/40 leading-none">
                                {slide.duration || 3}s
                              </span>

                              {/* Filter/Transition info on hover */}
                              <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center text-[7px] font-bold font-mono text-stone-200 transition-opacity duration-150 p-1 text-center">
                                <span className="uppercase text-[6px] text-amber-400">{slide.transition || "zoom"}</span>
                                {slide.filter && slide.filter !== "none" && (
                                  <span className="opacity-80 text-[6px]">{slide.filter}</span>
                                )}
                              </div>
                            </button>

                            {/* Transition indicator arrow between slides */}
                            {idx < slides.length - 1 && (
                              <div className="flex flex-col items-center justify-center px-1 text-stone-600 font-mono text-[9px] flex-shrink-0 select-none">
                                <span className="text-amber-500/60 hover:text-amber-500 transition-colors font-extrabold">→</span>
                                <span className="text-[7px] scale-90 opacity-60 font-bold uppercase tracking-tighter" style={{ maxWidth: "32px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {slides[idx].transition || "zoom"}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Slices Scroll Container */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-800">
                  {slides.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                        currentIndex === idx
                          ? "bg-amber-500/5 border-amber-500/30"
                          : "bg-stone-950/60 border-stone-800/80 hover:border-stone-700"
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <button
                        onClick={() => {
                          setCurrentIndex(idx);
                          setProgress(0);
                        }}
                        className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-stone-800 cursor-pointer"
                      >
                        <img
                          src={slide.url}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>

                      {/* Info & Settings */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-amber-500 font-bold">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={slide.caption}
                            onChange={(e) => {
                              const updated = [...slides];
                              updated[idx].caption = e.target.value;
                              setSlides(updated);
                            }}
                            className="text-xs font-bold text-stone-200 bg-transparent border-b border-transparent hover:border-stone-800 focus:border-amber-500/50 focus:outline-none w-full py-0.5 truncate"
                            placeholder="Enter slide subtitle..."
                          />
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1.5 text-[9px] font-mono text-stone-400">
                          <select
                            value={slide.transition}
                            onChange={(e) => {
                              const updated = [...slides];
                              updated[idx].transition = e.target.value as any;
                              setSlides(updated);
                            }}
                            className="bg-transparent border-none text-amber-500 cursor-pointer focus:outline-none"
                          >
                            <option value="zoom">Zoom</option>
                            <option value="zoomOut">Zoom Out</option>
                            <option value="panLeft">Pan L</option>
                            <option value="panRight">Pan R</option>
                            <option value="tiltUp">Tilt U</option>
                            <option value="tiltDown">Tilt D</option>
                            <option value="slideUp">Slide U</option>
                            <option value="slideLeft">Slide L</option>
                            <option value="slideRight">Slide R</option>
                            <option value="blurFade">Blur</option>
                            <option value="retroSpin">Spin</option>
                            <option value="vortex">Vortex</option>
                            <option value="glitch">Glitch</option>
                            <option value="fadeOnly">Fade</option>
                          </select>
                          
                          <span>•</span>

                          <select
                            value={slide.duration}
                            onChange={(e) => {
                              const updated = [...slides];
                              updated[idx].duration = Number(e.target.value);
                              setSlides(updated);
                            }}
                            className="bg-transparent border-none text-stone-300 cursor-pointer focus:outline-none"
                          >
                            <option value={2}>2s</option>
                            <option value={3}>3s</option>
                            <option value={4}>4s</option>
                            <option value={5}>5s</option>
                            <option value={8}>8s</option>
                          </select>
                        </div>
                      </div>

                      {/* Frame actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => moveSlide(idx, "left")}
                          disabled={idx === 0}
                          className="p-1 rounded bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 cursor-pointer"
                          title="Move Slide Up"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveSlide(idx, "right")}
                          disabled={idx === slides.length - 1}
                          className="p-1 rounded bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 cursor-pointer"
                          title="Move Slide Down"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateSlide(slide, idx)}
                          className="p-1 rounded bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-400 cursor-pointer"
                          title="Duplicate Slide"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const updated = slides.filter((_, i) => i !== idx);
                            setSlides(updated);
                            if (currentIndex >= updated.length) {
                              setCurrentIndex(Math.max(0, updated.length - 1));
                            }
                          }}
                          className="p-1 rounded bg-stone-900 border border-stone-800 text-stone-400 hover:text-rose-400 cursor-pointer"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-800/80 flex justify-between items-center text-xs text-stone-500 font-mono">
                  <span>Bulk uploads active</span>
                  <span>Total slides: {slides.length}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Minimal layout footer */}
        <footer className="mt-auto pt-16 border-t border-stone-900 pb-4 text-center">
          <p className="text-xs text-stone-600">
            Cinematic Slideshow & HD Movie Creator Powered by Web Audio, HTML5 Canvas, and Framer Motion.
          </p>
        </footer>

        {/* Cinematic Video Export Modal Overlay */}
        <AnimatePresence>
          {isExporting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-stone-900 border border-stone-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6"
              >
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-stone-800 border-t-amber-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-stone-800 border-b-amber-400 animate-spin" style={{ animationDirection: "reverse" }} />
                  <Download className="w-7 h-7 text-amber-500 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-stone-100 tracking-tight">
                    Generating Cinematic Video
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    {exportStatusText || "Processing project media..."}
                  </p>
                </div>

                {/* Progress bar and numeric percentage */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono font-bold text-stone-400">
                    <span>Export Progress</span>
                    <span className="text-amber-500">{exportProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                    <div
                      style={{ width: `${exportProgress}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                    />
                  </div>
                  {exportTimeRemaining !== null && (
                    <div className="space-y-2 bg-stone-950/60 rounded-xl p-3 border border-stone-800/50 mt-1 text-left">
                      <div className="flex justify-between items-center text-[11px] font-mono text-stone-400">
                        <span className="text-stone-500">Estimated time remaining:</span>
                        <span className="text-amber-400 font-bold">
                          {exportTimeRemaining > 60
                            ? `${Math.floor(exportTimeRemaining / 60)}m ${exportTimeRemaining % 60}s`
                            : `${exportTimeRemaining}s`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-stone-500 border-t border-stone-800/40 pt-1.5">
                        <span>Resolution: {exportResolution}</span>
                        <span>Format: {exportFormat.toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-stone-500 italic mt-2">
                    Please do not close this tab or navigate away.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
