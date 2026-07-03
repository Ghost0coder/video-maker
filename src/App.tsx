import { useState, useRef, useEffect, useCallback, ChangeEvent, DragEvent } from "react";
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
  Compass
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
}

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

export default function App() {
  // Timeline Slides State
  const [slides, setSlides] = useState<VideoSlide[]>(getInitialSlides);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
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
    } catch (e) {
      console.error("Failed to save slides to localStorage", e);
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
  const processUploadedFiles = (files: FileList) => {
    const newSlidesList: VideoSlide[] = [];
    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));

    let loadedCount = 0;
    imageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        
        // Pick creative random transitions for smooth visual variation
        const transitions: Array<VideoSlide["transition"]> = [
          "zoom", "panLeft", "panRight", "slideUp", "slideLeft", "slideRight", "blurFade", "retroSpin"
        ];
        const transition = transitions[index % transitions.length];

        // Format a human-readable name without file extension
        const prettyName = file.name.replace(/\.[^/.]+$/, "").substring(0, 20);

        newSlidesList.push({
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

        loadedCount++;
        if (loadedCount === imageFiles.length) {
          setSlides(prev => {
            const combined = [...prev, ...newSlidesList];
            // If we previously had no slides, select the first one
            if (prev.length === 0 && combined.length > 0) {
              setSelectedSlideId(combined[0].id);
              setCurrentIndex(0);
            }
            return combined;
          });
        }
      };
      reader.readAsDataURL(file);
    });
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
    if (e.dataTransfer.files) {
      processUploadedFiles(e.dataTransfer.files);
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

    try {
      const canvas = document.createElement("canvas");
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
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      const videoChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunks.push(e.data);
      };

      recorder.onstop = async () => {
        const fileBlob = new Blob(videoChunks, { type: "video/webm" });

        if (exportFormat === "mp4") {
          setExportStatusText("Converting WebM to highly-compatible MP4...");
          setExportProgress(98);

          try {
            const response = await fetch("/api/convert-to-mp4", {
              method: "POST",
              headers: {
                "Content-Type": "video/webm",
              },
              body: fileBlob,
            });

            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(errData.error || "Server transcode failed");
            }

            const mp4Blob = await response.blob();
            const videoUrl = URL.createObjectURL(mp4Blob);

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
            const videoUrl = URL.createObjectURL(fileBlob);
            const dl = document.createElement("a");
            dl.href = videoUrl;
            dl.download = `college_memory_slideshow_${Date.now()}.webm`;
            document.body.appendChild(dl);
            dl.click();
            document.body.removeChild(dl);
          }
        } else {
          // Standard webm download
          const videoUrl = URL.createObjectURL(fileBlob);
          const dl = document.createElement("a");
          dl.href = videoUrl;
          dl.download = `college_memory_slideshow_${Date.now()}.webm`;
          document.body.appendChild(dl);
          dl.click();
          document.body.removeChild(dl);
        }

        setIsExporting(false);
        setExportStatusText("");
        setExportProgress(100);
      };

      recorder.start();

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

          // Ratio calculation for Cover vs Contain
          const imgRatio = img.width / img.height;
          const canvasRatio = canvas.width / canvas.height;
          let baseScale = 1.0;
          const fit = activeSlide.fitMode || "cover";

          if (fit === "cover") {
            if (imgRatio > canvasRatio) {
              baseScale = canvas.height / img.height;
            } else {
              baseScale = canvas.width / img.width;
            }
          } else {
            if (imgRatio > canvasRatio) {
              baseScale = canvas.width / img.width;
            } else {
              baseScale = canvas.height / img.height;
            }
          }

          // Apply custom zoom multiplier
          baseScale *= (activeSlide.zoomMultiplier || 1.0);

          const finalScale = baseScale * transitionScale;
          const renderW = img.width * finalScale;
          const renderH = img.height * finalScale;

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

          // Calculate aggregate progress percentage across total slides
          const overallProgress = Math.round(
            ((slideIndex * totalFrames + f) / (slides.length * totalFrames)) * 100
          );
          setExportProgress(overallProgress);
        }

        slideIndex++;
        compileNextSlide();
      };

      compileNextSlide();
    } catch (e: any) {
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
            {/* LEFT COLUMN: Cinematic Slide Preview Player (Span 7) */}
            <section className="lg:col-span-7 space-y-6">
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

            {/* RIGHT COLUMN: Slide Timeline & Soundtrack Customizer (Span 5) */}
            <section className="lg:col-span-5 space-y-6">
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
                  </div>
                </div>
              )}

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
                  <p className="text-[10px] text-stone-500 italic">
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
