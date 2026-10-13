import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Copy,
  Download,
  Sparkles,
  Maximize2,
  Volume2,
  VolumeX,
  Repeat,
  Sliders,
  Layers,
  Film,
  Music,
  FolderOpen,
  Save,
  RotateCcw,
  CheckSquare,
  Square,
  Wand2,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileVideo
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CollegeMelodyGenerator, transcodeWebmToMp4InBrowser, sliceCollageImage } from "./utils";
import { StarField } from "./components/StarField";
import { DEFAULT_COLLAGE, DEFAULT_COLLAGE_IMAGE, SubPhoto } from "./data/defaultCollage";

export interface VideoSlide {
  id: string;
  url: string;
  caption: string;
  duration: number; // in seconds
  transition:
    | "zoom"
    | "zoomOut"
    | "panLeft"
    | "panRight"
    | "tiltUp"
    | "tiltDown"
    | "slideUp"
    | "slideLeft"
    | "slideRight"
    | "blurFade"
    | "retroSpin"
    | "vortex"
    | "glitch"
    | "fadeOnly";
  filter:
    | "none"
    | "grayscale"
    | "sepia"
    | "vibrant"
    | "vintage"
    | "invert"
    | "warm"
    | "cool"
    | "dramatic"
    | "cyberpunk"
    | "technicolor"
    | "monochrome";
  fitMode: "cover" | "contain";
  zoomMultiplier?: number;
  volume?: number;
  description?: string;
}

// Built-in Sample Photos for initial state
const INITIAL_SLIDES: VideoSlide[] = [
  {
    id: "slide_1",
    url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    caption: "The unforgettable campus sunsets and endless conversations.",
    duration: 3,
    transition: "zoom",
    filter: "cyberpunk",
    fitMode: "cover",
    zoomMultiplier: 1.1,
    volume: 100,
    description: "Students gathering at sunset"
  },
  {
    id: "slide_2",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    caption: "Laughter echoed through library halls and late-night study sessions.",
    duration: 3.5,
    transition: "panLeft",
    filter: "vibrant",
    fitMode: "cover",
    zoomMultiplier: 1.0,
    volume: 100,
    description: "Friends laughing together in study group"
  },
  {
    id: "slide_3",
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    caption: "A bond forged in shared dreams and unforgettable memories.",
    duration: 4,
    transition: "blurFade",
    filter: "warm",
    fitMode: "cover",
    zoomMultiplier: 1.2,
    volume: 100,
    description: "Celebration outdoors with friends"
  },
  {
    id: "slide_4",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    caption: "Caps tossed into the sky, stepping boldly into tomorrow.",
    duration: 3.5,
    transition: "zoomOut",
    filter: "dramatic",
    fitMode: "cover",
    zoomMultiplier: 1.0,
    volume: 100,
    description: "Graduation celebration moment"
  }
];

export default function App() {
  // Core Slides & Project State
  const [slides, setSlides] = useState<VideoSlide[]>(INITIAL_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [projectName, setProjectName] = useState("CYBERPUNK SHORT REEL");
  const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16" | "1:1" | "4:5">("16:9");

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlideTime, setCurrentSlideTime] = useState(0); // time in current slide (seconds)
  const [isLooping, setIsLooping] = useState(true);
  const [previewToggle, setPreviewToggle] = useState(0);

  // Inspector & Active Tab
  const [activeTab, setActiveTab] = useState<"style" | "motion" | "captions">("style");

  // Batch Selection State
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedSlideIds, setSelectedSlideIds] = useState<Set<string>>(new Set());

  // Audio Synth State
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [musicVolume, setMusicVolume] = useState(80);
  const melodyGenRef = useRef<CollegeMelodyGenerator | null>(null);

  // Modals State
  const [showAiModal, setShowAiModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // AI Collage Modal Local State
  const [collageImageUrl, setCollageImageUrl] = useState("");
  const [isAnalyzingCollage, setIsAnalyzingCollage] = useState(false);
  const [collageStatusText, setCollageStatusText] = useState("");
  const [collageTheme, setCollageTheme] = useState("Cyberpunk Sci-Fi Story");
  const [collagePrompt, setCollagePrompt] = useState("High energy, cinematic rhythm, neon cyberpunk atmosphere.");

  // Export State
  const [exportResolution, setExportResolution] = useState<"720p" | "1080p" | "4k">("1080p");
  const [exportFormat, setExportFormat] = useState<"mp4" | "webm">("mp4");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState("");
  const [exportTimeRemaining, setExportTimeRemaining] = useState<number | null>(null);

  // Saved Projects List from LocalStorage
  const [savedProjects, setSavedProjects] = useState<string[]>([]);

  // Asset Gallery & Direct URL input
  const [galleryAssets, setGalleryAssets] = useState<string[]>([
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
  ]);
  const [galleryInputUrl, setGalleryInputUrl] = useState("");
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);

  // HUD Toast Notification (Replaces window.alert for sandboxed iframe compatibility)
  const [toast, setToast] = useState<{ id: number; message: string; type: "success" | "info" | "warn" } | null>(null);
  const showToast = useCallback((message: string, type: "success" | "info" | "warn" = "info") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 3200);
  }, []);

  // HUD In-App Confirmation Dialog (Replaces window.confirm for sandboxed iframe compatibility)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: "red" | "cyan";
    onConfirm: () => void;
  } | null>(null);

  // Canvas / Video Ref for rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate Total Film Duration
  const totalDuration = useMemo(() => {
    return slides.reduce((acc, s) => acc + s.duration, 0);
  }, [slides]);

  // Calculate Elapsed Total Timecode
  const totalElapsedTime = useMemo(() => {
    if (slides.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < currentIndex; i++) {
      sum += slides[i]?.duration || 0;
    }
    return sum + currentSlideTime;
  }, [slides, currentIndex, currentSlideTime]);

  // Format Seconds to MM:SS:FF
  const formatTimecode = (seconds: number) => {
    const totalSecs = Math.max(0, seconds);
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    const frames = Math.floor((totalSecs % 1) * 30);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };

  // Safe Slide Deletion: decoupled state update with index re-clamping
  const deleteSlide = useCallback((indexToDelete: number) => {
    if (indexToDelete < 0 || indexToDelete >= slides.length) return;
    const nextSlides = slides.filter((_, i) => i !== indexToDelete);
    setSlides(nextSlides);
    if (nextSlides.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex === indexToDelete) {
      setCurrentIndex(Math.min(currentIndex, nextSlides.length - 1));
    } else if (currentIndex > indexToDelete) {
      setCurrentIndex(currentIndex - 1);
    }
    setCurrentSlideTime(0);
    showToast("Slide removed from timeline", "info");
  }, [slides, currentIndex, showToast]);

  // Batch Delete
  const deleteSelectedSlides = useCallback(() => {
    if (selectedSlideIds.size === 0) return;
    const count = selectedSlideIds.size;
    const nextSlides = slides.filter(s => !selectedSlideIds.has(s.id));
    setSlides(nextSlides);
    setCurrentIndex(0);
    setCurrentSlideTime(0);
    setSelectedSlideIds(new Set());
    setIsBatchMode(false);
    showToast(`Deleted ${count} selected slides`, "info");
  }, [slides, selectedSlideIds, showToast]);

  // Start New Project: clean state reset with HUD confirmation modal
  const startNewProject = useCallback(() => {
    if (slides.length > 0) {
      setConfirmDialog({
        title: "START NEW PROJECT",
        message: "Are you sure you want to start a new blank project? Unsaved edits in the current session will be cleared.",
        confirmText: "RESET BLANK",
        confirmColor: "red",
        onConfirm: () => {
          setSlides([]);
          setProjectName("NEW PROJECT");
          setCurrentIndex(0);
          setCurrentSlideTime(0);
          setIsPlaying(false);
          setSelectedSlideIds(new Set());
          setConfirmDialog(null);
          showToast("Workspace reset to blank project", "info");
        }
      });
      return;
    }
    setSlides([]);
    setProjectName("NEW PROJECT");
    setCurrentIndex(0);
    setCurrentSlideTime(0);
    setIsPlaying(false);
    setSelectedSlideIds(new Set());
    showToast("Workspace reset to blank project", "info");
  }, [slides.length, showToast]);

  // Load Saved Projects List from LocalStorage
  const refreshSavedProjects = () => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("cyber_video_project_")) {
        keys.push(key.replace("cyber_video_project_", ""));
      }
    }
    setSavedProjects(keys);
  };

  const saveCurrentProject = () => {
    const key = `cyber_video_project_${projectName.trim() || "Untitled"}`;
    const data = {
      name: projectName,
      aspectRatio: videoAspectRatio,
      slides,
      updatedAt: Date.now()
    };
    try {
      localStorage.setItem(key, JSON.stringify(data));
      refreshSavedProjects();
      showToast(`Project "${projectName}" saved to local storage`, "success");
    } catch (e) {
      showToast("Error saving project to local storage", "warn");
    }
  };

  const loadProject = (name: string) => {
    const raw = localStorage.getItem(`cyber_video_project_${name}`);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      setProjectName(data.name || name);
      setVideoAspectRatio(data.aspectRatio || "16:9");
      setSlides(data.slides || []);
      setCurrentIndex(0);
      setCurrentSlideTime(0);
      setShowProjectsModal(false);
      showToast(`Loaded project "${data.name || name}"`, "success");
    } catch (e) {
      showToast("Failed to load project data", "warn");
    }
  };

  const deleteSavedProject = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      title: "DELETE SAVED PROJECT",
      message: `Delete project "${name}" from local storage? This action cannot be undone.`,
      confirmText: "DELETE",
      confirmColor: "red",
      onConfirm: () => {
        localStorage.removeItem(`cyber_video_project_${name}`);
        refreshSavedProjects();
        setConfirmDialog(null);
        showToast(`Project "${name}" deleted`, "info");
      }
    });
  };

  // Duplicate Slide
  const duplicateSlide = (index: number) => {
    if (!slides[index]) return;
    const item = slides[index];
    const copySlide: VideoSlide = {
      ...item,
      id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = [...slides];
    updated.splice(index + 1, 0, copySlide);
    setSlides(updated);
    setCurrentIndex(index + 1);
    setCurrentSlideTime(0);
    showToast(`Slide ${(index + 1).toString().padStart(2, "0")} duplicated`, "success");
  };

  // Reorder Slide Left / Right
  const moveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slides.length) return;
    const updated = [...slides];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setSlides(updated);
    setCurrentIndex(toIndex);
    setCurrentSlideTime(0);
    showToast(`Slide moved to position ${(toIndex + 1).toString().padStart(2, "0")}`, "info");
  };

  // Keyboard Shortcuts: Delete and Backspace bound to delete selected slide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid deleting if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (isBatchMode && selectedSlideIds.size > 0) {
          deleteSelectedSlides();
        } else if (slides.length > 0 && currentIndex < slides.length) {
          deleteSlide(currentIndex);
        }
      } else if (e.key === " " && !e.repeat) {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex(p => Math.max(0, p - 1));
        setCurrentSlideTime(0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex(p => Math.min(slides.length - 1, p + 1));
        setCurrentSlideTime(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length, currentIndex, isBatchMode, selectedSlideIds, deleteSlide, deleteSelectedSlides]);

  // Audio Synthesizer Toggle
  useEffect(() => {
    if (isMusicEnabled) {
      if (!melodyGenRef.current) {
        melodyGenRef.current = new CollegeMelodyGenerator();
      }
      melodyGenRef.current.volumeMultiplier = musicVolume / 100;
      melodyGenRef.current.start();
    } else {
      if (melodyGenRef.current) {
        melodyGenRef.current.stop();
        melodyGenRef.current = null;
      }
    }

    return () => {
      if (melodyGenRef.current) {
        melodyGenRef.current.stop();
        melodyGenRef.current = null;
      }
    };
  }, [isMusicEnabled]);

  useEffect(() => {
    if (melodyGenRef.current) {
      melodyGenRef.current.volumeMultiplier = musicVolume / 100;
    }
  }, [musicVolume]);

  // Real-time Playback Timer Loop
  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;

    const interval = 50; // 20 updates/second for smooth timecode
    const timer = setInterval(() => {
      setCurrentSlideTime(prev => {
        const currentSlide = slides[currentIndex];
        if (!currentSlide) return 0;

        const nextTime = prev + interval / 1000;
        if (nextTime >= currentSlide.duration) {
          // Slide finished, advance to next
          if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            // Loop or finish
            if (isLooping) {
              setCurrentIndex(0);
              return 0;
            } else {
              setIsPlaying(false);
              return currentSlide.duration;
            }
          }
        }
        return nextTime;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, slides, currentIndex, isLooping]);

  // Filter CSS resolver
  const getFilterCss = (filter: VideoSlide["filter"]) => {
    switch (filter) {
      case "grayscale":
        return "grayscale(100%) contrast(110%)";
      case "sepia":
        return "sepia(75%) contrast(105%) brightness(95%)";
      case "vibrant":
        return "saturate(170%) contrast(110%)";
      case "vintage":
        return "sepia(35%) contrast(90%) brightness(105%) saturate(120%)";
      case "invert":
        return "invert(100%) hue-rotate(180deg)";
      case "warm":
        return "sepia(25%) saturate(140%) hue-rotate(-10deg)";
      case "cool":
        return "saturate(110%) hue-rotate(180deg) brightness(105%)";
      case "dramatic":
        return "contrast(140%) saturate(75%) brightness(90%)";
      case "cyberpunk":
        return "contrast(130%) saturate(180%) hue-rotate(290deg)";
      case "technicolor":
        return "contrast(115%) saturate(200%) brightness(105%)";
      case "monochrome":
        return "grayscale(100%) contrast(160%) brightness(90%)";
      default:
        return "none";
    }
  };

  // Motion Animation Generator
  const getMotionAnimation = (slide: VideoSlide, duration: number) => {
    const zoom = slide.zoomMultiplier || 1.0;
    switch (slide.transition) {
      case "zoom":
        return {
          initial: { scale: zoom, opacity: 0 },
          animate: { scale: zoom * 1.15, opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration, ease: "easeOut" }
        };
      case "zoomOut":
        return {
          initial: { scale: zoom * 1.25, opacity: 0 },
          animate: { scale: zoom, opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration, ease: "easeOut" }
        };
      case "panLeft":
        return {
          initial: { x: 40, scale: zoom * 1.05, opacity: 0 },
          animate: { x: -40, scale: zoom * 1.05, opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration, ease: "linear" }
        };
      case "panRight":
        return {
          initial: { x: -40, scale: zoom * 1.05, opacity: 0 },
          animate: { x: 40, scale: zoom * 1.05, opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration, ease: "linear" }
        };
      case "tiltUp":
        return {
          initial: { y: 35, scale: zoom * 1.05, opacity: 0 },
          animate: { y: -35, scale: zoom * 1.05, opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration, ease: "linear" }
        };
      case "tiltDown":
        return {
          initial: { y: -35, scale: zoom * 1.05, opacity: 0 },
          animate: { y: 35, scale: zoom * 1.05, opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration, ease: "linear" }
        };
      case "slideUp":
        return {
          initial: { y: "100%", opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: "-100%", opacity: 0 },
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        };
      case "slideLeft":
        return {
          initial: { x: "100%", opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: "-100%", opacity: 0 },
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        };
      case "slideRight":
        return {
          initial: { x: "-100%", opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: "100%", opacity: 0 },
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        };
      case "blurFade":
        return {
          initial: { filter: "blur(15px)", opacity: 0, scale: zoom * 1.08 },
          animate: { filter: "blur(0px)", opacity: 1, scale: zoom },
          exit: { filter: "blur(15px)", opacity: 0 },
          transition: { duration: 0.8, ease: "easeInOut" }
        };
      case "retroSpin":
        return {
          initial: { rotate: -15, scale: zoom * 0.8, opacity: 0 },
          animate: { rotate: 0, scale: zoom * 1.05, opacity: 1 },
          exit: { rotate: 15, scale: zoom * 1.2, opacity: 0 },
          transition: { duration: 0.9, ease: "easeOut" }
        };
      case "vortex":
        return {
          initial: { rotate: -180, scale: 0.2, opacity: 0 },
          animate: { rotate: 0, scale: zoom, opacity: 1 },
          exit: { rotate: 180, scale: 2.0, opacity: 0 },
          transition: { duration: 0.9, ease: "easeInOut" }
        };
      case "glitch":
        return {
          initial: { x: 10, skewX: 12, opacity: 0 },
          animate: { x: [0, -6, 6, -2, 0], skewX: [0, -8, 8, -2, 0], opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.7, ease: "easeInOut" }
        };
      case "fadeOnly":
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.5, ease: "easeInOut" }
        };
    }
  };

  // AI Collage Analysis & Auto Video Generation
  const handleAnalyzeAndGenerateCollage = async () => {
    setIsAnalyzingCollage(true);
    setCollageStatusText("Detecting photo layout and sub-photos with Gemini Vision AI...");

    try {
      const targetImage = collageImageUrl.trim() || DEFAULT_COLLAGE_IMAGE;
      
      // Fetch image as base64
      let base64 = "";
      try {
        const imgRes = await fetch(targetImage);
        const blob = await imgRes.blob();
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn("Could not fetch remote image directly, will use fallback default collage", err);
      }

      setCollageStatusText("Analyzing grid compositions & extracting bounding boxes...");

      let detectedPhotos: SubPhoto[] = DEFAULT_COLLAGE.subPhotos;
      let detectedTitle = DEFAULT_COLLAGE.title;

      if (base64) {
        try {
          const res = await fetch("/api/analyze-collage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.subPhotos && Array.isArray(data.subPhotos) && data.subPhotos.length > 0) {
              detectedPhotos = data.subPhotos.map((sp: any, idx: number) => ({
                id: `ai_photo_${idx + 1}`,
                x: sp.x,
                y: sp.y,
                width: sp.width,
                height: sp.height,
                description: sp.description || `Sub-photo ${idx + 1}`,
                caption: sp.caption || "A cinematic memory captured in time.",
                duration: 3 + (idx % 3),
                transition: ["zoom", "panLeft", "blurFade", "panRight", "slideUp"][idx % 5] as any
              }));
              if (data.title) detectedTitle = data.title;
            }
          }
        } catch (apiErr) {
          console.warn("AI endpoint fallback to default bounding boxes:", apiErr);
        }
      }

      setCollageStatusText("Slicing high-res sub-photos and rendering transitions...");

      // Crop/slice sub-photos
      const newSlides: VideoSlide[] = [];
      for (let i = 0; i < detectedPhotos.length; i++) {
        const sp = detectedPhotos[i];
        let croppedUrl = targetImage;
        try {
          croppedUrl = await sliceCollageImage(targetImage, sp.x, sp.y, sp.width, sp.height);
        } catch (cropErr) {
          console.warn("Slice failed for photo", i, cropErr);
        }

        newSlides.push({
          id: `slide_ai_${Date.now()}_${i}`,
          url: croppedUrl,
          caption: sp.caption,
          duration: sp.duration,
          transition: sp.transition === "fade" ? "fadeOnly" : sp.transition === "retro" ? "retroSpin" : (sp.transition as any),
          filter: (["none", "cyberpunk", "vibrant", "warm", "dramatic"][i % 5] as any),
          fitMode: "cover",
          zoomMultiplier: 1.05,
          volume: 100,
          description: sp.description
        });
      }

      setSlides(newSlides);
      setProjectName(detectedTitle.toUpperCase() || "AI GENERATED SHORT FILM");
      setCurrentIndex(0);
      setCurrentSlideTime(0);
      setShowAiModal(false);
      showToast("AI video generated successfully from collage!", "success");
    } catch (err: any) {
      showToast("Collage breakdown: " + (err.message || err), "warn");
    } finally {
      setIsAnalyzingCollage(false);
      setCollageStatusText("");
    }
  };

  // AI Regenerate Captions for existing slides
  const handleRegenerateCaptions = async () => {
    if (slides.length === 0) return;
    setIsGeneratingCaptions(true);
    showToast("Generating AI cinematic captions...", "info");
    try {
      const descriptions = slides.map((s, i) => s.description || s.caption || `Scene ${i + 1}`);
      const res = await fetch("/api/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descriptions,
          theme: collageTheme,
          prompt: collagePrompt
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.captions && Array.isArray(data.captions)) {
          const updated = slides.map((s, idx) => ({
            ...s,
            caption: data.captions[idx] || s.caption
          }));
          setSlides(updated);
          showToast("Captions refreshed with Gemini AI!", "success");
          return;
        }
      }
      throw new Error("AI endpoint unavailable, using creative script engine");
    } catch (err: any) {
      const cyberpunkCaptions = [
        "Neon pulses echo through the rain-soaked asphalt.",
        "Reflections of a distant skyline cut through the haze.",
        "Every frame holds a fragmented memory frozen in time.",
        "Drifting into the twilight grid where stories collide.",
        "The engine roars against the quiet hum of the night.",
        "Chasing shadows through the illuminated corridor.",
        "Moments etched in chrome and electric light."
      ];
      const updated = slides.map((s, idx) => ({
        ...s,
        caption: cyberpunkCaptions[idx % cyberpunkCaptions.length]
      }));
      setSlides(updated);
      showToast("Captions refreshed with cinematic story script!", "success");
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  /**
   * Slideshow Video Compilation & Export Logic
   * Note Bug fix from User Request 1:
   * "Investigate the slideshow rendering engine logic in `compileNextSlide`. The current loop starts transition application after the first few frames;
   * ensure the transition state is correctly initialized and applied to the very first slide by properly syncing the frame counter and transition duration parameters at the start of the compilation process."
   */
  const handleExportVideo = async () => {
    if (slides.length === 0) {
      showToast("Please add at least one slide before exporting.", "warn");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportStatusText("Setting up video canvas rendering pipeline...");

    try {
      // Determine Dimensions
      let width = 1920;
      let height = 1080;
      if (exportResolution === "720p") {
        width = videoAspectRatio === "9:16" ? 720 : 1280;
        height = videoAspectRatio === "9:16" ? 1280 : 720;
      } else if (exportResolution === "4k") {
        width = videoAspectRatio === "9:16" ? 2160 : 3840;
        height = videoAspectRatio === "9:16" ? 3840 : 2160;
      } else {
        // 1080p
        width = videoAspectRatio === "9:16" ? 1080 : 1920;
        height = videoAspectRatio === "9:16" ? 1920 : 1080;
      }

      if (videoAspectRatio === "1:1") {
        width = height = exportResolution === "4k" ? 2160 : exportResolution === "720p" ? 720 : 1080;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas context");

      // Preload all slide images
      setExportStatusText("Preloading slide visual assets...");
      const loadedImages: HTMLImageElement[] = await Promise.all(
        slides.map(s => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img); // continue gracefully
            img.src = s.url;
          });
        })
      );

      // Set up Audio Context and Destination for recording
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioDest = audioCtx.createMediaStreamDestination();

      if (isMusicEnabled) {
        const synth = new CollegeMelodyGenerator();
        synth.volumeMultiplier = (musicVolume / 100) * 0.8;
        synth.start(audioDest, audioCtx);
      }

      // Stream recording setup
      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks()
      ]);

      const recordedChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm"
      });

      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) recordedChunks.push(e.data);
      };

      const recordFinishedPromise = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          resolve(blob);
        };
        mediaRecorder.onerror = reject;
      });

      mediaRecorder.start();

      // Rendering Engine Frame-by-Frame with compileNextSlide
      const FPS = 30;
      const totalFrames = Math.ceil(totalDuration * FPS);
      let currentFrame = 0;

      // compileNextSlide initialization: correctly start transition state at frame 0
      const compileNextSlide = (frameIdx: number) => {
        // Find which slide we are on based on frameIdx
        let accumulatedSecs = 0;
        let activeSlideIdx = 0;
        let slideLocalSecs = 0;
        const currentSecs = frameIdx / FPS;

        for (let i = 0; i < slides.length; i++) {
          const dur = slides[i].duration;
          if (currentSecs >= accumulatedSecs && currentSecs < accumulatedSecs + dur) {
            activeSlideIdx = i;
            slideLocalSecs = currentSecs - accumulatedSecs;
            break;
          }
          accumulatedSecs += dur;
        }

        if (activeSlideIdx >= slides.length) {
          activeSlideIdx = slides.length - 1;
          slideLocalSecs = slides[activeSlideIdx].duration;
        }

        const currentSlide = slides[activeSlideIdx];
        const img = loadedImages[activeSlideIdx];

        // Clear canvas
        ctx.fillStyle = "#07050f";
        ctx.fillRect(0, 0, width, height);

        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();

          // Calculate transition progress:
          // User Request 1: transition state is correctly initialized and applied to the very first slide by properly syncing frame counter and transition duration parameters from frame 0
          const transitionDuration = Math.min(1.0, currentSlide.duration * 0.3);
          const transitionProgress = Math.min(1.0, slideLocalSecs / transitionDuration); // 0.0 to 1.0

          // Calculate Scale & Pan
          const zoom = currentSlide.zoomMultiplier || 1.0;
          let scaleFactor = zoom;
          let offsetX = 0;
          let offsetY = 0;
          let globalAlpha = 1.0;

          if (currentSlide.transition === "zoom") {
            scaleFactor = zoom * (1.0 + 0.15 * (slideLocalSecs / currentSlide.duration));
            globalAlpha = Math.min(1.0, transitionProgress);
          } else if (currentSlide.transition === "zoomOut") {
            scaleFactor = zoom * (1.2 - 0.2 * (slideLocalSecs / currentSlide.duration));
            globalAlpha = Math.min(1.0, transitionProgress);
          } else if (currentSlide.transition === "panLeft") {
            offsetX = 40 * (1 - (slideLocalSecs / currentSlide.duration) * 2);
            globalAlpha = Math.min(1.0, transitionProgress);
          } else if (currentSlide.transition === "panRight") {
            offsetX = -40 * (1 - (slideLocalSecs / currentSlide.duration) * 2);
            globalAlpha = Math.min(1.0, transitionProgress);
          } else if (currentSlide.transition === "slideUp") {
            offsetY = (1 - transitionProgress) * height * 0.4;
            globalAlpha = Math.min(1.0, transitionProgress);
          } else if (currentSlide.transition === "fadeOnly" || currentSlide.transition === "blurFade") {
            globalAlpha = Math.min(1.0, transitionProgress);
          }

          ctx.globalAlpha = Math.max(0, Math.min(1, globalAlpha));

          // Draw Image with Fit Mode
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const canvasAspect = width / height;
          let renderW = width;
          let renderH = height;

          if (currentSlide.fitMode === "contain") {
            if (imgAspect > canvasAspect) {
              renderW = width;
              renderH = width / imgAspect;
            } else {
              renderH = height;
              renderW = height * imgAspect;
            }
          } else {
            // Cover
            if (imgAspect > canvasAspect) {
              renderH = height;
              renderW = height * imgAspect;
            } else {
              renderW = width;
              renderH = width / imgAspect;
            }
          }

          renderW *= scaleFactor;
          renderH *= scaleFactor;

          const drawX = (width - renderW) / 2 + offsetX;
          const drawY = (height - renderH) / 2 + offsetY;

          ctx.drawImage(img, drawX, drawY, renderW, renderH);

          // CRT Scanline subtle overlay
          ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
          for (let y = 0; y < height; y += 4) {
            ctx.fillRect(0, y, width, 1.5);
          }

          // Caption Text Overlay
          if (currentSlide.caption) {
            ctx.font = `600 ${Math.round(height * 0.038)}px 'Syne', sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const textY = height * 0.88;
            const textWidth = ctx.measureText(currentSlide.caption).width;

            // Background glass chip for caption
            ctx.fillStyle = "rgba(14, 10, 30, 0.85)";
            ctx.strokeStyle = "rgba(34, 211, 238, 0.5)";
            ctx.lineWidth = 1.5;
            const padX = 24;
            const padY = 12;
            const bgH = Math.round(height * 0.06);

            ctx.beginPath();
            ctx.roundRect((width - textWidth) / 2 - padX, textY - bgH / 2, textWidth + padX * 2, bgH, 10);
            ctx.fill();
            ctx.stroke();

            // Caption Text
            ctx.fillStyle = "#ffffff";
            ctx.fillText(currentSlide.caption, width / 2, textY);
          }

          ctx.restore();
        }
      };

      // Frame generation loop
      for (let f = 0; f < totalFrames; f++) {
        compileNextSlide(f);
        currentFrame = f;
        setExportProgress(Math.round((f / totalFrames) * 90));
        setExportStatusText(`Rendering frame ${f + 1} / ${totalFrames} (${Math.round((f / totalFrames) * 100)}%)...`);

        // Yield to browser UI
        if (f % 5 === 0) {
          await new Promise(r => setTimeout(r, 8));
        }
      }

      mediaRecorder.stop();
      setExportStatusText("Finalizing video stream encoding...");
      const rawRecordedBlob = await recordFinishedPromise;

      audioCtx.close();

      setExportProgress(92);
      setExportStatusText("Converting to MP4 format...");

      let finalBlob = rawRecordedBlob;
      let filename = `${projectName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.mp4`;

      if (exportFormat === "mp4") {
        try {
          setExportStatusText("Converting to MP4 in-browser with FFmpeg...");
          finalBlob = await transcodeWebmToMp4InBrowser(rawRecordedBlob, setExportStatusText);
        } catch (wasmErr) {
          console.warn("WASM transcode error, attempting server fallback:", wasmErr);
          try {
            setExportStatusText("Transcoding via server FFmpeg backend...");
            const sRes = await fetch("/api/convert-to-mp4", {
              method: "POST",
              headers: { "Content-Type": "video/webm" },
              body: rawRecordedBlob
            });
            if (sRes.ok) {
              finalBlob = await sRes.blob();
            }
          } catch (serverErr) {
            console.warn("Server transcode also failed, downloading high quality WebM fallback", serverErr);
            filename = `${projectName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.webm`;
          }
        }
      } else {
        filename = `${projectName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.webm`;
      }

      setExportProgress(100);
      setExportStatusText("Export complete! Downloading your video...");

      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setIsExporting(false);
        setShowExportModal(false);
      }, 1500);
    } catch (err: any) {
      showToast("Export error: " + (err.message || err), "warn");
      setIsExporting(false);
    }
  };

  // Upload Local File as Slide or Asset
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const result = evt.target?.result as string;
      if (!result) return;

      const newSlide: VideoSlide = {
        id: `slide_user_${Date.now()}`,
        url: result,
        caption: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        duration: 3.5,
        transition: "zoom",
        filter: "none",
        fitMode: "cover",
        zoomMultiplier: 1.0,
        volume: 100,
        description: file.name
      };

      setSlides(prev => {
        const next = [...prev, newSlide];
        setCurrentIndex(next.length - 1);
        return next;
      });
      setGalleryAssets(prev => [result, ...prev]);
      showToast(`Added frame: ${newSlide.caption}`, "success");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const currentSlide = slides[currentIndex] || null;

  return (
    <div className="relative min-h-screen bg-[#07050f] text-white flex flex-col font-syne select-none">
      {/* Background StarField & Corner Radial Glows */}
      <StarField />

      {/* Radial Corner Glows */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-[#8b5cf6]/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#ff3d9a]/15 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
      <div className="fixed top-1/2 left-1/2 w-[32rem] h-[32rem] bg-[#22d3ee]/8 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      {/* TOP HEADER */}
      <header className="relative z-20 border-b border-[#8b5cf6]/25 bg-[#0e0a1e]/80 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: App Brand & Editable Project Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff3d9a] via-[#8b5cf6] to-[#22d3ee] flex items-center justify-center shadow-[0_0_16px_rgba(255,61,154,0.4)]">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="bg-transparent font-extrabold text-sm sm:text-base tracking-wide text-white hover:border-b border-[#22d3ee]/50 focus:border-b focus:border-[#22d3ee] focus:outline-none transition-all px-1 py-0.5"
                  title="Click to rename project"
                />
                <span className="font-mono-hud text-[#22d3ee] px-2 py-0.5 rounded border border-[#22d3ee]/40 bg-[#22d3ee]/10 text-[9px]">
                  4K · 30FPS
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono-hud text-white/50 text-[9px] mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#ff3d9a] animate-live-dot" />
                <span>FILM TC {formatTimecode(totalElapsedTime)} / {formatTimecode(totalDuration)}</span>
              </div>
            </div>
          </div>

          {/* Center: Aspect Ratio Toggles */}
          <div className="flex items-center gap-1 bg-[#120c26]/90 p-1 rounded-xl border border-[#8b5cf6]/30">
            {(["16:9", "9:16", "1:1", "4:5"] as const).map(ratio => (
              <button
                key={ratio}
                onClick={() => setVideoAspectRatio(ratio)}
                className={`hud-tab px-2.5 py-1 text-[9px] ${
                  videoAspectRatio === ratio ? "hud-tab-active" : ""
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          {/* Right: Action Buttons (AI Video Generator, Projects, New, Export) */}
          <div className="flex items-center gap-2">
            {/* AI Collage Generator Modal Button */}
            <button
              onClick={() => setShowAiModal(true)}
              className="hud-btn hud-btn-cyan flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
              title="Auto-generate video from collage with Gemini AI"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#22d3ee]" />
              <span className="hidden sm:inline">AI COLLAGE</span>
            </button>

            {/* Asset Gallery Button */}
            <button
              onClick={() => setShowGalleryModal(true)}
              className="hud-btn flex items-center gap-1.5 px-3 py-1.5 text-xs"
              title="Media and Asset Library"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#8b5cf6]" />
              <span className="hidden sm:inline">MEDIA</span>
            </button>

            {/* Saved Projects Modal Button */}
            <button
              onClick={() => {
                refreshSavedProjects();
                setShowProjectsModal(true);
              }}
              className="hud-btn flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
              title="Saved Projects"
            >
              <FolderOpen className="w-3.5 h-3.5 text-white/70" />
            </button>

            {/* Save Current Project */}
            <button
              onClick={saveCurrentProject}
              className="hud-btn flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
              title="Save Project to LocalStorage"
            >
              <Save className="w-3.5 h-3.5 text-white/70" />
            </button>

            {/* Start New Project (clean slate reset) */}
            <button
              onClick={startNewProject}
              className="hud-btn flex items-center gap-1.5 px-2.5 py-1.5 text-xs hover:border-[#ff3d9a]"
              title="Start New Blank Project"
            >
              <RotateCcw className="w-3.5 h-3.5 text-white/70" />
              <span className="hidden md:inline">NEW</span>
            </button>

            {/* Export Video Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="hud-btn hud-btn-primary flex items-center gap-1.5 px-4 py-1.5 text-xs font-extrabold"
              title="Export Full High-Def Video"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE: 2-COLUMN LAYOUT (EDITOR PREVIEW + INSPECTOR) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        {/* LEFT / CENTER: VIDEO CANVAS PREVIEW & PLAYBACK BAR (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Main Preview Card */}
          <div className="hud-glass-card p-3 sm:p-4 flex flex-col items-center justify-center">
            {/* Corner HUD Brackets */}
            <div className="hud-bracket hud-bracket-tl" />
            <div className="hud-bracket hud-bracket-tr" />
            <div className="hud-bracket hud-bracket-bl" />
            <div className="hud-bracket hud-bracket-br" />

            {/* Top HUD Status Row */}
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-[#8b5cf6]/20 font-mono-hud text-[9px] text-white/60">
              <span className="text-[#22d3ee]">
                FINAL CUT · {videoAspectRatio} · {exportResolution.toUpperCase()}
              </span>
              <span>
                {slides.length > 0
                  ? `SLIDE ${(currentIndex + 1).toString().padStart(2, "0")} / ${slides.length.toString().padStart(2, "0")}`
                  : "NO SLIDES"}
              </span>
            </div>

            {/* The Video / Canvas Viewport */}
            <div
              className={`relative w-full bg-[#07050f] rounded-xl overflow-hidden border border-[#8b5cf6]/40 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all ${
                videoAspectRatio === "16:9"
                  ? "aspect-video"
                  : videoAspectRatio === "9:16"
                  ? "aspect-[9/16] max-h-[580px]"
                  : videoAspectRatio === "1:1"
                  ? "aspect-square max-h-[520px]"
                  : "aspect-[4/5] max-h-[540px]"
              }`}
            >
              {/* Scanline CRT overlay */}
              <div className="absolute inset-0 crt-overlay z-10 pointer-events-none" />

              {/* Sweeping cyan scan line animation */}
              <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#22d3ee]/20 to-transparent animate-scan-sweep z-10 pointer-events-none" />

              {/* Active Image with Motion Animation */}
              {currentSlide ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentSlide.id}_${previewToggle}_${currentSlide.transition}`}
                    className="w-full h-full relative flex items-center justify-center"
                    {...getMotionAnimation(currentSlide, currentSlide.duration)}
                  >
                    <img
                      src={currentSlide.url}
                      alt="Current Slide"
                      className={`w-full h-full ${
                        currentSlide.fitMode === "contain" ? "object-contain" : "object-cover"
                      }`}
                      style={{ filter: getFilterCss(currentSlide.filter) }}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#120c26] border border-dashed border-[#8b5cf6]/50 flex items-center justify-center text-[#ff3d9a]">
                    <Film className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-base text-white/90">TIMELINE IS EMPTY</h3>
                  <p className="text-xs text-white/50 max-w-sm">
                    Add new frames from your library, upload a photo, or use AI Collage to auto-breakdown images into a cinematic video.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setShowAiModal(true)}
                      className="hud-btn hud-btn-cyan px-4 py-2 text-xs font-bold"
                    >
                      <Wand2 className="w-3.5 h-3.5 inline mr-1.5" />
                      AUTO BREAKDOWN COLLAGE
                    </button>
                    <button
                      onClick={() => setShowGalleryModal(true)}
                      className="hud-btn px-4 py-2 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 inline mr-1.5" />
                      ADD FIRST FRAME
                    </button>
                  </div>
                </div>
              )}

              {/* Subtitle / Caption Overlay on Preview */}
              {currentSlide && currentSlide.caption && (
                <div className="absolute bottom-4 inset-x-4 z-20 flex justify-center pointer-events-none">
                  <div className="hud-glass-card px-4 py-2 rounded-xl border border-[#22d3ee]/40 bg-[#0e0a1e]/90 text-center max-w-md shadow-2xl">
                    <p className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                      {currentSlide.caption}
                    </p>
                  </div>
                </div>
              )}

              {/* Thin Slide Progress Bar at the Bottom of Preview */}
              {currentSlide && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-[#120c26] z-20">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff3d9a] to-[#22d3ee] transition-all duration-75"
                    style={{
                      width: `${Math.min(100, (currentSlideTime / currentSlide.duration) * 100)}%`
                    }}
                  />
                </div>
              )}
            </div>

            {/* PLAYBACK CONTROL TOOLBAR */}
            <div className="w-full mt-3 pt-3 border-t border-[#8b5cf6]/20 flex flex-wrap items-center justify-between gap-3">
              {/* Playback Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setCurrentIndex(p => Math.max(0, p - 1));
                    setCurrentSlideTime(0);
                  }}
                  className="hud-btn p-2 rounded-lg"
                  title="Previous Slide (Left Arrow)"
                  disabled={slides.length === 0}
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(p => !p)}
                  className={`hud-btn p-2.5 rounded-xl ${
                    isPlaying
                      ? "hud-btn-cyan"
                      : "hud-btn-primary"
                  }`}
                  title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  disabled={slides.length === 0}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setCurrentIndex(p => Math.min(slides.length - 1, p + 1));
                    setCurrentSlideTime(0);
                  }}
                  className="hud-btn p-2 rounded-lg"
                  title="Next Slide (Right Arrow)"
                  disabled={slides.length === 0}
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsLooping(l => !l)}
                  className={`hud-btn p-2 rounded-lg ${
                    isLooping ? "text-[#22d3ee] border-[#22d3ee]/60" : "text-white/40"
                  }`}
                  title="Toggle Looping Playback"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Timecode & Scrubber Info */}
              <div className="font-mono-hud text-xs flex items-center gap-3">
                <span className="text-white/80 font-bold">
                  {formatTimecode(totalElapsedTime)}
                </span>
                <span className="text-white/30">/</span>
                <span className="text-white/50">
                  {formatTimecode(totalDuration)}
                </span>
              </div>

              {/* Audio Synth Toggle & Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMusicEnabled(m => !m)}
                  className={`hud-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs ${
                    isMusicEnabled ? "hud-btn-cyan" : "text-white/40"
                  }`}
                  title="Synthesized Background Music (Web Audio API)"
                >
                  {isMusicEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#22d3ee]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                  <span className="font-mono-hud text-[9px]">
                    {isMusicEnabled ? "BGM ON" : "BGM OFF"}
                  </span>
                </button>

                {isMusicEnabled && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={e => setMusicVolume(Number(e.target.value))}
                    className="hud-slider w-16"
                    title={`Music Volume: ${musicVolume}%`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* TWO-CARD ROW DIRECTLY UNDER PREVIEW (Keyframe Still + Shot Info) */}
          {currentSlide && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Left Card: Keyframe / Still Card */}
              <div className="hud-glass-card p-3 flex items-center gap-3">
                <div className="hud-bracket hud-bracket-tl" />
                <div className="hud-bracket hud-bracket-br" />
                <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-black border border-[#8b5cf6]/40 flex-shrink-0 group">
                  <img
                    src={currentSlide.url}
                    alt="Keyframe Still"
                    className="w-full h-full object-cover"
                    style={{ filter: getFilterCss(currentSlide.filter) }}
                  />
                  {/* Sweeping scan line on still */}
                  <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-[#22d3ee]/40 to-transparent animate-scan-sweep pointer-events-none" />
                  <button
                    onClick={() => {
                      setCurrentSlideTime(0);
                      setPreviewToggle(p => p + 1);
                    }}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                    title="Replay Transition Animation"
                  >
                    <Play className="w-4 h-4 fill-white text-white" />
                  </button>
                  <span className="absolute top-1 right-1 font-mono-hud text-[7px] bg-[#07050f]/80 px-1 py-0.5 rounded text-[#22d3ee]">
                    STILL
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono-hud text-[8px] text-[#22d3ee]">KEYFRAME // STILL</span>
                  <p className="text-xs font-bold text-white truncate mt-0.5">
                    {currentSlide.caption || "Frame Scene Still"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono-hud text-[8px] px-1.5 py-0.5 rounded bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#ff3d9a]">
                      IMAGE → VIDEO
                    </span>
                    <button
                      onClick={() => {
                        setCurrentSlideTime(0);
                        setPreviewToggle(p => p + 1);
                      }}
                      className="font-mono-hud text-[8px] text-white/50 hover:text-[#22d3ee] underline cursor-pointer"
                    >
                      REPLAY
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Card: Shot Telemetry Card with Big Gradient Number */}
              <div className="hud-glass-card p-3 flex items-center justify-between gap-3">
                <div className="hud-bracket hud-bracket-tr" />
                <div className="hud-bracket hud-bracket-bl" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono-hud text-[8px] text-[#22d3ee]">
                    EFFECT // {currentSlide.transition.toUpperCase()}
                  </div>
                  <h4 className="text-sm font-extrabold text-white truncate mt-0.5">
                    {currentSlide.description || `FRAME ${(currentIndex + 1).toString().padStart(2, "0")}`}
                  </h4>
                  <div className="font-mono-hud text-[9px] text-white/60 mt-1">
                    DUR {currentSlide.duration}S · FILTER {currentSlide.filter.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black bg-gradient-to-r from-[#ff3d9a] via-[#8b5cf6] to-[#22d3ee] bg-clip-text text-transparent">
                    {(currentIndex + 1).toString().padStart(2, "0")}
                  </div>
                  <span className="font-mono-hud text-[8px] text-white/40">
                    OF {slides.length.toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: SLIDE INSPECTOR & PROPERTIES PANEL (lg:col-span-4) */}
        <aside className="lg:col-span-4 hud-glass-card p-4 flex flex-col gap-4">
          {/* Corner HUD Brackets */}
          <div className="hud-bracket hud-bracket-tl" />
          <div className="hud-bracket hud-bracket-tr" />
          <div className="hud-bracket hud-bracket-bl" />
          <div className="hud-bracket hud-bracket-br" />

          {/* Inspector Header & Tabs */}
          <div className="flex items-center justify-between border-b border-[#8b5cf6]/25 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#ff3d9a]" />
              <h3 className="font-extrabold text-sm tracking-wider text-white">
                SLIDE INSPECTOR
              </h3>
            </div>
            {currentSlide && (
              <span className="font-mono-hud text-[9px] px-2 py-0.5 rounded bg-[#ff3d9a]/15 text-[#ff3d9a] border border-[#ff3d9a]/40">
                #{(currentIndex + 1).toString().padStart(2, "0")}
              </span>
            )}
          </div>

          {currentSlide ? (
            <>
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-1 bg-[#120c26] p-1 rounded-xl border border-[#8b5cf6]/30">
                <button
                  onClick={() => setActiveTab("style")}
                  className={`hud-tab text-[9px] ${activeTab === "style" ? "hud-tab-active" : ""}`}
                >
                  EFFECTS
                </button>
                <button
                  onClick={() => setActiveTab("motion")}
                  className={`hud-tab text-[9px] ${activeTab === "motion" ? "hud-tab-active" : ""}`}
                >
                  MOTION
                </button>
                <button
                  onClick={() => setActiveTab("captions")}
                  className={`hud-tab text-[9px] ${activeTab === "captions" ? "hud-tab-active" : ""}`}
                >
                  CAPTIONS
                </button>
              </div>

              {/* TAB 1: EFFECTS & FILTERS */}
              {activeTab === "style" && (
                <div className="space-y-4">
                  {/* Transition Style Dropdown */}
                  <div>
                    <label className="block font-mono-hud text-[9px] text-white/60 mb-1.5">
                      TRANSITION ANIMATION STYLE
                    </label>
                    <select
                      value={currentSlide.transition}
                      onChange={e => {
                        const updated = [...slides];
                        updated[currentIndex].transition = e.target.value as any;
                        setSlides(updated);
                        setPreviewToggle(p => p + 1);
                      }}
                      className="hud-input w-full px-3 py-2 text-xs cursor-pointer"
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

                  {/* Fit Mode Toggle */}
                  <div>
                    <label className="block font-mono-hud text-[9px] text-white/60 mb-1.5">
                      FIT MODE (ASPECT CONTROL)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const updated = [...slides];
                          updated[currentIndex].fitMode = "cover";
                          setSlides(updated);
                        }}
                        className={`hud-btn py-2 text-[10px] ${
                          currentSlide.fitMode === "cover"
                            ? "hud-btn-cyan font-bold"
                            : "text-white/60"
                        }`}
                      >
                        FILL (COVER)
                      </button>
                      <button
                        onClick={() => {
                          const updated = [...slides];
                          updated[currentIndex].fitMode = "contain";
                          setSlides(updated);
                        }}
                        className={`hud-btn py-2 text-[10px] ${
                          currentSlide.fitMode === "contain"
                            ? "hud-btn-cyan font-bold"
                            : "text-white/60"
                        }`}
                      >
                        FIT (CONTAIN)
                      </button>
                    </div>
                  </div>

                  {/* Artistic Color Filters Grid */}
                  <div>
                    <label className="block font-mono-hud text-[9px] text-white/60 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#ff3d9a]" />
                        ARTISTIC COLOR FILTER
                      </span>
                      <span className="text-[#22d3ee]">
                        {currentSlide.filter.toUpperCase()}
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {[
                        { id: "none", name: "Normal" },
                        { id: "cyberpunk", name: "Cyberpunk" },
                        { id: "vibrant", name: "Vibrant" },
                        { id: "warm", name: "Sunny" },
                        { id: "dramatic", name: "Dramatic" },
                        { id: "grayscale", name: "Noir B&W" },
                        { id: "sepia", name: "Sepia" },
                        { id: "vintage", name: "Vintage" },
                        { id: "cool", name: "Nordic" },
                        { id: "technicolor", name: "Technicolor" },
                        { id: "monochrome", name: "Monochrome" },
                        { id: "invert", name: "X-Ray" }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => {
                            const updated = [...slides];
                            updated[currentIndex].filter = f.id as any;
                            setSlides(updated);
                          }}
                          className={`hud-btn py-2 px-1 text-[9px] truncate text-center ${
                            currentSlide.filter === f.id
                              ? "hud-btn-primary font-bold border-[#ff3d9a]"
                              : "text-white/70"
                          }`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MOTION & TRIM */}
              {activeTab === "motion" && (
                <div className="space-y-4">
                  {/* Duration Selector */}
                  <div>
                    <label className="block font-mono-hud text-[9px] text-white/60 mb-1.5">
                      SLIDE DURATION
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {[2, 3, 4, 5, 8].map(sec => (
                        <button
                          key={sec}
                          onClick={() => {
                            const updated = [...slides];
                            updated[currentIndex].duration = sec;
                            setSlides(updated);
                          }}
                          className={`hud-btn py-2 text-xs font-bold ${
                            currentSlide.duration === sec
                              ? "hud-btn-cyan"
                              : "text-white/60"
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zoom Multiplier Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-mono-hud text-[9px] text-white/60">
                        CUSTOM ZOOM RATIO
                      </label>
                      <span className="font-mono-hud text-xs text-[#22d3ee] font-bold">
                        {currentSlide.zoomMultiplier ? `${currentSlide.zoomMultiplier.toFixed(1)}x` : "1.0x"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="2.0"
                      step="0.1"
                      value={currentSlide.zoomMultiplier || 1.0}
                      onChange={e => {
                        const updated = [...slides];
                        updated[currentIndex].zoomMultiplier = Number(e.target.value);
                        setSlides(updated);
                      }}
                      className="hud-slider w-full"
                    />
                    <div className="flex justify-between font-mono-hud text-[8px] text-white/40 mt-1">
                      <span>0.6x (Wide)</span>
                      <span>1.0x (Standard)</span>
                      <span>2.0x (Close-Up)</span>
                    </div>
                  </div>

                  {/* Frame Audio Volume */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-mono-hud text-[9px] text-white/60">
                        FRAME AUDIO VOLUME
                      </label>
                      <span className="font-mono-hud text-xs text-[#ff3d9a] font-bold">
                        {currentSlide.volume !== undefined ? currentSlide.volume : 100}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={currentSlide.volume !== undefined ? currentSlide.volume : 100}
                      onChange={e => {
                        const updated = [...slides];
                        updated[currentIndex].volume = Number(e.target.value);
                        setSlides(updated);
                      }}
                      className="hud-slider w-full"
                    />
                  </div>

                  {/* Quick Replay Button */}
                  <button
                    onClick={() => setPreviewToggle(p => p + 1)}
                    className="hud-btn hud-btn-cyan w-full py-2.5 text-xs font-bold mt-2"
                  >
                    <Play className="w-3.5 h-3.5 inline mr-1.5" />
                    PREVIEW MOTION EFFECT
                  </button>
                </div>
              )}

              {/* TAB 3: CAPTIONS & SUBTITLES */}
              {activeTab === "captions" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-mono-hud text-[9px] text-white/60">
                        SUBTITLE / CAPTION TEXT
                      </label>
                      <button
                        onClick={handleRegenerateCaptions}
                        disabled={isGeneratingCaptions}
                        className="font-mono-hud text-[9px] text-[#22d3ee] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                        title="Rewrite captions using AI storyline generator"
                      >
                        <Sparkles className={`w-3 h-3 ${isGeneratingCaptions ? "animate-spin" : ""}`} />
                        {isGeneratingCaptions ? "GENERATING..." : "AI REWRITE"}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={currentSlide.caption}
                      onChange={e => {
                        const updated = [...slides];
                        updated[currentIndex].caption = e.target.value;
                        setSlides(updated);
                      }}
                      placeholder="Enter subtitle caption overlay..."
                      className="hud-input w-full p-2.5 text-xs focus:ring-0 resize-none"
                    />
                  </div>

                  {/* Description / Story Note */}
                  <div>
                    <label className="block font-mono-hud text-[9px] text-white/60 mb-1.5">
                      SCENE / SHOT NOTE
                    </label>
                    <input
                      type="text"
                      value={currentSlide.description || ""}
                      onChange={e => {
                        const updated = [...slides];
                        updated[currentIndex].description = e.target.value;
                        setSlides(updated);
                      }}
                      placeholder="e.g., Driver looking towards skyline..."
                      className="hud-input w-full px-3 py-2 text-xs"
                    />
                  </div>

                  {/* Clear Caption */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const updated = [...slides];
                        updated[currentIndex].caption = "";
                        setSlides(updated);
                        showToast("Caption removed", "info");
                      }}
                      className="hud-btn flex-1 py-2 text-[10px] text-white/60"
                    >
                      REMOVE CAPTION
                    </button>
                  </div>
                </div>
              )}

              {/* Slide Action Buttons: Move Left / Move Right / Duplicate / Delete */}
              <div className="pt-3 border-t border-[#8b5cf6]/20 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => moveSlide(currentIndex, currentIndex - 1)}
                    disabled={currentIndex <= 0}
                    className="hud-btn py-2 text-[10px] flex items-center justify-center gap-1 disabled:opacity-40"
                    title="Move slide earlier in timeline"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-[#22d3ee]" />
                    MOVE LEFT
                  </button>
                  <button
                    onClick={() => moveSlide(currentIndex, currentIndex + 1)}
                    disabled={currentIndex >= slides.length - 1}
                    className="hud-btn py-2 text-[10px] flex items-center justify-center gap-1 disabled:opacity-40"
                    title="Move slide later in timeline"
                  >
                    MOVE RIGHT
                    <ChevronRight className="w-3.5 h-3.5 text-[#22d3ee]" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => duplicateSlide(currentIndex)}
                    className="hud-btn py-2 text-[10px] flex items-center justify-center gap-1.5"
                    title="Duplicate this slide"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#22d3ee]" />
                    DUPLICATE
                  </button>
                  <button
                    onClick={() => deleteSlide(currentIndex)}
                    className="hud-btn py-2 text-[10px] text-[#ff3d9a] hover:border-[#ff3d9a] flex items-center justify-center gap-1.5"
                    title="Delete this slide (Delete key)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    DELETE
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-white/40 text-xs font-mono-hud">
              Select or add a slide to edit properties.
            </div>
          )}
        </aside>
      </main>

      {/* BOTTOM SECTION: TIMELINE TRACKS, PLAYHEAD, AND AUDIO WAVEFORM */}
      <footer className="relative z-20 border-t border-[#8b5cf6]/25 bg-[#0e0a1e]/90 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          {/* Timeline Header Row with Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono-hud text-xs text-[#22d3ee] font-bold">
                TIMELINE // SYNC
              </span>
              <span className="font-mono-hud text-[9px] text-white/50">
                {slides.length} SHOTS · {formatTimecode(totalDuration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Batch Select Mode Toggle */}
              <button
                onClick={() => {
                  setIsBatchMode(b => !b);
                  setSelectedSlideIds(new Set());
                }}
                className={`hud-btn px-2.5 py-1 text-[9px] flex items-center gap-1 ${
                  isBatchMode ? "hud-btn-cyan" : "text-white/60"
                }`}
                title="Toggle Batch Multi-Select"
              >
                {isBatchMode ? (
                  <CheckSquare className="w-3 h-3 text-[#22d3ee]" />
                ) : (
                  <Square className="w-3 h-3" />
                )}
                BATCH SELECT
              </button>

              {/* Batch Delete Button */}
              {isBatchMode && selectedSlideIds.size > 0 && (
                <button
                  onClick={deleteSelectedSlides}
                  className="hud-btn px-2.5 py-1 text-[9px] text-[#ff3d9a] border-[#ff3d9a]/60 hover:bg-[#ff3d9a]/20 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  DELETE ({selectedSlideIds.size})
                </button>
              )}

              {/* Add Frame (+) Button */}
              <button
                onClick={() => setShowGalleryModal(true)}
                className="hud-btn hud-btn-cyan px-3 py-1 text-[10px] font-bold flex items-center gap-1"
                title="Add new photo or video clip to timeline"
              >
                <Plus className="w-3.5 h-3.5" />
                ADD FRAME
              </button>
            </div>
          </div>

          {/* HORIZONTAL SLIDES TIMELINE STRIP */}
          <div className="relative py-2 overflow-x-auto select-none">
            {/* Cyan Playhead Indicator sweeping across timeline */}
            {totalDuration > 0 && (
              <div
                className="hud-playhead"
                style={{
                  left: `${Math.min(100, Math.max(0, (totalElapsedTime / totalDuration) * 100))}%`
                }}
              >
                <div className="hud-playhead-diamond" />
              </div>
            )}

            <div className="flex items-center gap-2.5 min-w-max pb-1">
              {slides.map((s, idx) => {
                const isSelected = currentIndex === idx;
                const isBatchChecked = selectedSlideIds.has(s.id);

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (isBatchMode) {
                        const next = new Set(selectedSlideIds);
                        if (next.has(s.id)) next.delete(s.id);
                        else next.add(s.id);
                        setSelectedSlideIds(next);
                      } else {
                        setCurrentIndex(idx);
                        setCurrentSlideTime(0);
                      }
                    }}
                    className={`relative w-28 h-20 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border bg-[#120c26] flex-shrink-0 group ${
                      isSelected
                        ? "hud-selected scale-105 z-10" // Selected clip strictly glows yellow (#ffc928)
                        : "border-[#8b5cf6]/30 hover:border-[#22d3ee]/60 hover:scale-102"
                    }`}
                  >
                    <img
                      src={s.url}
                      alt={`Slide ${idx + 1}`}
                      className="w-full h-full object-cover"
                      style={{ filter: getFilterCss(s.filter) }}
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                    {/* Top-Left: Index Badge */}
                    <span className="absolute top-1.5 left-1.5 font-mono-hud text-[8px] px-1 py-0.2 rounded bg-black/75 text-white/90 border border-white/10">
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>

                    {/* Top-Right: Batch Checkmark or Selected Highlight */}
                    {isBatchMode ? (
                      <span className="absolute top-1.5 right-1.5">
                        {isBatchChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#22d3ee]" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-white/40" />
                        )}
                      </span>
                    ) : isSelected ? (
                      <span className="absolute top-1.5 right-1.5 font-mono-hud text-[7px] px-1 py-0.2 rounded bg-[#ffc928] text-black font-extrabold shadow-sm">
                        ACTIVE
                      </span>
                    ) : null}

                    {/* Bottom: Duration & Transition Tag */}
                    <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between font-mono-hud text-[8px] text-white/80">
                      <span>{s.duration}s</span>
                      <span className="text-[#22d3ee] truncate max-w-[50px]">
                        {s.transition}
                      </span>
                    </div>

                    {/* Quick Move Buttons on Hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                      {idx > 0 && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            moveSlide(idx, idx - 1);
                          }}
                          className="p-1.5 rounded-lg bg-[#120c26] border border-[#8b5cf6]/40 text-white hover:text-[#22d3ee] active:scale-95"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteSlide(idx);
                        }}
                        className="p-1.5 rounded-lg bg-[#120c26] border border-[#ff3d9a]/50 text-white hover:text-[#ff3d9a] active:scale-95"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {idx < slides.length - 1 && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            moveSlide(idx, idx + 1);
                          }}
                          className="p-1.5 rounded-lg bg-[#120c26] border border-[#8b5cf6]/40 text-white hover:text-[#22d3ee] active:scale-95"
                          title="Move Right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Slide Card at end of strip */}
              <button
                onClick={() => setShowGalleryModal(true)}
                className="w-24 h-20 rounded-xl border border-dashed border-[#8b5cf6]/40 hover:border-[#22d3ee] hover:bg-[#8b5cf6]/10 flex flex-col items-center justify-center gap-1.5 transition-all text-white/50 hover:text-[#22d3ee] flex-shrink-0 cursor-pointer"
                title="Add Slide from Media Library or Device"
              >
                <Plus className="w-4 h-4" />
                <span className="font-mono-hud text-[8px]">ADD CLIP</span>
              </button>
            </div>
          </div>

          {/* AUDIO WAVEFORM TRACK WITH CLICK SEEKING */}
          <div className="relative pt-1 border-t border-[#8b5cf6]/20 flex items-center gap-3">
            <span className="font-mono-hud text-[9px] text-[#ff3d9a] flex items-center gap-1">
              <Music className="w-3 h-3" />
              A1 // BGM
            </span>

            {/* Clickable Animated Waveform Track */}
            <div
              onClick={e => {
                if (totalDuration <= 0) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const targetSeconds = ratio * totalDuration;
                let acc = 0;
                for (let i = 0; i < slides.length; i++) {
                  const dur = slides[i].duration;
                  if (targetSeconds >= acc && targetSeconds < acc + dur) {
                    setCurrentIndex(i);
                    setCurrentSlideTime(targetSeconds - acc);
                    return;
                  }
                  acc += dur;
                }
                if (slides.length > 0) {
                  setCurrentIndex(slides.length - 1);
                  setCurrentSlideTime(slides[slides.length - 1].duration);
                }
              }}
              className="flex-1 h-6 flex items-end gap-1 px-2 py-1 bg-[#07050f] rounded-lg border border-[#8b5cf6]/30 overflow-hidden cursor-pointer hover:border-[#22d3ee]/60 transition-colors"
              title="Click to seek / scrub timeline"
            >
              {Array.from({ length: 64 }).map((_, i) => {
                const ratio = i / 64;
                const progressRatio = totalDuration > 0 ? totalElapsedTime / totalDuration : 0;
                const isPassed = ratio <= progressRatio;
                // Height based on sine waves
                const heightPct = 20 + Math.abs(Math.sin(i * 0.35)) * 60 + Math.sin(i * 1.2) * 15;

                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all duration-150 ${
                      isPassed
                        ? "bg-gradient-to-t from-[#8b5cf6] to-[#ff3d9a] shadow-[0_0_6px_rgba(255,61,154,0.4)]"
                        : "bg-[#8b5cf6]/20"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                );
              })}
            </div>

            <span className="font-mono-hud text-[9px] text-white/40">
              SYNTH 48kHz
            </span>
          </div>
        </div>
      </footer>

      {/* HIDDEN FILE INPUT FOR PHOTO UPLOAD */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* AI COLLAGE ANALYZER & BREAKDOWN MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-glass-card max-w-lg w-full p-5 sm:p-6 flex flex-col gap-4 border border-[#22d3ee]/50 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
            <div className="hud-bracket hud-bracket-tl" />
            <div className="hud-bracket hud-bracket-tr" />
            <div className="hud-bracket hud-bracket-bl" />
            <div className="hud-bracket hud-bracket-br" />

            <div className="flex items-center justify-between border-b border-[#8b5cf6]/30 pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-[#22d3ee]" />
                <h3 className="font-extrabold text-base text-white">
                  AI COLLAGE TO VIDEO GENERATOR
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Upload a multi-photo collage or image poster. Google Gemini Vision AI will automatically detect individual sub-photos, crop them, generate emotional memory captions, and build a synchronized video timeline with smooth cinematic transitions.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-mono-hud text-[9px] text-white/60 mb-1">
                  COLLAGE IMAGE URL (OR LEAVE BLANK FOR SAMPLE COLLAGE)
                </label>
                <input
                  type="text"
                  value={collageImageUrl}
                  onChange={e => setCollageImageUrl(e.target.value)}
                  placeholder="https://... (or sample celebratory collage)"
                  className="hud-input w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono-hud text-[9px] text-white/60 mb-1">
                  STORY THEME
                </label>
                <input
                  type="text"
                  value={collageTheme}
                  onChange={e => setCollageTheme(e.target.value)}
                  placeholder="e.g., Cyberpunk Sci-Fi, Birthday Celebration..."
                  className="hud-input w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono-hud text-[9px] text-white/60 mb-1">
                  STYLE & TONE INSTRUCTIONS
                </label>
                <input
                  type="text"
                  value={collagePrompt}
                  onChange={e => setCollagePrompt(e.target.value)}
                  placeholder="e.g., Dynamic, emotional, high contrast neon..."
                  className="hud-input w-full px-3 py-2 text-xs"
                />
              </div>
            </div>

            {isAnalyzingCollage && (
              <div className="p-3 rounded-xl bg-[#120c26] border border-[#22d3ee]/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono-hud">
                  <span className="text-[#22d3ee] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-ping" />
                    AI AGENT WORKING
                  </span>
                  <span className="text-white/60">PROCESSING</span>
                </div>
                <p className="text-xs text-white/80">{collageStatusText}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="hud-btn px-4 py-2 text-xs"
                disabled={isAnalyzingCollage}
              >
                CANCEL
              </button>
              <button
                onClick={handleAnalyzeAndGenerateCollage}
                className="hud-btn hud-btn-primary px-5 py-2 text-xs font-bold"
                disabled={isAnalyzingCollage}
              >
                <Wand2 className="w-3.5 h-3.5 inline mr-1.5" />
                {isAnalyzingCollage ? "ANALYZING..." : "GENERATE VIDEO"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT VIDEO MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-glass-card max-w-md w-full p-5 sm:p-6 flex flex-col gap-4 border border-[#ff3d9a]/50 shadow-[0_0_50px_rgba(255,61,154,0.25)]">
            <div className="hud-bracket hud-bracket-tl" />
            <div className="hud-bracket hud-bracket-tr" />
            <div className="hud-bracket hud-bracket-bl" />
            <div className="hud-bracket hud-bracket-br" />

            <div className="flex items-center justify-between border-b border-[#8b5cf6]/30 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#ff3d9a]" />
                <h3 className="font-extrabold text-base text-white">
                  EXPORT HIGH-RES VIDEO
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                disabled={isExporting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-mono-hud text-[9px] text-white/60 mb-1.5">
                  RESOLUTION
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["720p", "1080p", "4k"] as const).map(res => (
                    <button
                      key={res}
                      onClick={() => setExportResolution(res)}
                      className={`hud-btn py-2 text-xs font-bold ${
                        exportResolution === res ? "hud-btn-primary" : "text-white/60"
                      }`}
                      disabled={isExporting}
                    >
                      {res.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono-hud text-[9px] text-white/60 mb-1.5">
                  FORMAT
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setExportFormat("mp4")}
                    className={`hud-btn py-2 text-xs font-bold ${
                      exportFormat === "mp4" ? "hud-btn-cyan" : "text-white/60"
                    }`}
                    disabled={isExporting}
                  >
                    MP4 (H.264 / AAC)
                  </button>
                  <button
                    onClick={() => setExportFormat("webm")}
                    className={`hud-btn py-2 text-xs font-bold ${
                      exportFormat === "webm" ? "hud-btn-cyan" : "text-white/60"
                    }`}
                    disabled={isExporting}
                  >
                    WEBM (FAST)
                  </button>
                </div>
              </div>
            </div>

            {/* Export Progress Bar */}
            {isExporting && (
              <div className="p-3 rounded-xl bg-[#120c26] border border-[#ff3d9a]/40 space-y-2">
                <div className="flex justify-between font-mono-hud text-xs">
                  <span className="text-[#ff3d9a] font-bold">COMPILING FRAMES</span>
                  <span className="text-white">{exportProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff3d9a] via-[#8b5cf6] to-[#22d3ee] transition-all duration-150"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <p className="font-mono-hud text-[9px] text-white/70">{exportStatusText}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="hud-btn px-4 py-2 text-xs"
                disabled={isExporting}
              >
                CLOSE
              </button>
              <button
                onClick={handleExportVideo}
                className="hud-btn hud-btn-primary px-5 py-2 text-xs font-extrabold"
                disabled={isExporting}
              >
                <Download className="w-3.5 h-3.5 inline mr-1.5" />
                {isExporting ? "EXPORTING..." : "START EXPORT"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVED PROJECTS MODAL */}
      {showProjectsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-glass-card max-w-md w-full p-5 sm:p-6 flex flex-col gap-4 border border-[#8b5cf6]/50">
            <div className="hud-bracket hud-bracket-tl" />
            <div className="hud-bracket hud-bracket-tr" />
            <div className="hud-bracket hud-bracket-bl" />
            <div className="hud-bracket hud-bracket-br" />

            <div className="flex items-center justify-between border-b border-[#8b5cf6]/30 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#8b5cf6]" />
                <h3 className="font-extrabold text-base text-white">
                  SAVED PROJECTS
                </h3>
              </div>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {savedProjects.length === 0 ? (
                <p className="text-xs text-white/50 text-center py-6 font-mono-hud">
                  No saved projects in local storage yet.
                </p>
              ) : (
                savedProjects.map(name => (
                  <div
                    key={name}
                    onClick={() => loadProject(name)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#120c26] border border-[#8b5cf6]/30 hover:border-[#22d3ee] hover:bg-[#1a1234] cursor-pointer transition-all group"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white group-hover:text-[#22d3ee]">
                        {name}
                      </h4>
                      <span className="font-mono-hud text-[8px] text-white/40">
                        CLICK TO LOAD
                      </span>
                    </div>
                    <button
                      onClick={e => deleteSavedProject(name, e)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-[#ff3d9a] hover:bg-black/40 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={startNewProject}
                className="hud-btn px-3 py-1.5 text-xs text-[#ff3d9a] hover:border-[#ff3d9a]"
              >
                RESET TO BLANK
              </button>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="hud-btn px-4 py-1.5 text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSET & MEDIA GALLERY MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-glass-card max-w-2xl w-full p-5 sm:p-6 flex flex-col gap-4 border border-[#22d3ee]/50">
            <div className="hud-bracket hud-bracket-tl" />
            <div className="hud-bracket hud-bracket-tr" />
            <div className="hud-bracket hud-bracket-bl" />
            <div className="hud-bracket hud-bracket-br" />

            <div className="flex items-center justify-between border-b border-[#8b5cf6]/30 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#22d3ee]" />
                <h3 className="font-extrabold text-base text-white">
                  MEDIA & ASSET GALLERY
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="hud-btn hud-btn-cyan px-3 py-1 text-xs font-bold"
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  UPLOAD FILE
                </button>
                <button
                  onClick={() => setShowGalleryModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Direct Image URL input */}
            <div className="flex items-center gap-2 p-2 bg-[#120c26] rounded-xl border border-[#8b5cf6]/30">
              <input
                type="text"
                value={galleryInputUrl}
                onChange={e => setGalleryInputUrl(e.target.value)}
                placeholder="Or paste any image URL..."
                className="hud-input flex-1 px-3 py-1.5 text-xs"
              />
              <button
                onClick={() => {
                  if (!galleryInputUrl.trim()) return;
                  const newSlide: VideoSlide = {
                    id: `slide_url_${Date.now()}`,
                    url: galleryInputUrl.trim(),
                    caption: `Scene ${slides.length + 1}`,
                    duration: 3.5,
                    transition: "zoom",
                    filter: "none",
                    fitMode: "cover",
                    zoomMultiplier: 1.0,
                    volume: 100
                  };
                  setSlides(prev => [...prev, newSlide]);
                  setCurrentIndex(slides.length);
                  setGalleryAssets(prev => [galleryInputUrl.trim(), ...prev]);
                  setGalleryInputUrl("");
                  setShowGalleryModal(false);
                  showToast("Image added to timeline", "success");
                }}
                disabled={!galleryInputUrl.trim()}
                className="hud-btn hud-btn-cyan px-3 py-1.5 text-xs font-bold disabled:opacity-40"
              >
                + ADD URL
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
              {galleryAssets.map((assetUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const newSlide: VideoSlide = {
                      id: `slide_asset_${Date.now()}_${idx}`,
                      url: assetUrl,
                      caption: `Scene ${slides.length + 1}`,
                      duration: 3,
                      transition: "zoom",
                      filter: "none",
                      fitMode: "cover",
                      zoomMultiplier: 1.0,
                      volume: 100
                    };
                    setSlides(prev => [...prev, newSlide]);
                    setCurrentIndex(slides.length);
                    setShowGalleryModal(false);
                    showToast("Asset added to timeline", "success");
                  }}
                  className="relative aspect-video rounded-xl overflow-hidden border border-[#8b5cf6]/40 hover:border-[#22d3ee] bg-black group cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <img
                    src={assetUrl}
                    alt={`Asset ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center">
                    <button
                      type="button"
                      className="hud-btn hud-btn-cyan w-full py-1 text-[9px] font-bold"
                    >
                      + ADD TO TIMELINE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGalleryModal(false)}
                className="hud-btn px-4 py-2 text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HUD CONFIRMATION MODAL (Replaces blocked window.confirm) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-glass-card max-w-sm w-full p-5 flex flex-col gap-4 border border-[#ff3d9a]/60 shadow-[0_0_40px_rgba(255,61,154,0.3)]">
            <div className="hud-bracket hud-bracket-tl" />
            <div className="hud-bracket hud-bracket-tr" />
            <div className="hud-bracket hud-bracket-bl" />
            <div className="hud-bracket hud-bracket-br" />

            <div className="flex items-center gap-2 border-b border-[#ff3d9a]/30 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff3d9a] animate-pulse" />
              <h4 className="font-extrabold text-sm text-white tracking-wider">
                {confirmDialog.title}
              </h4>
            </div>

            <p className="text-xs text-white/80 leading-relaxed font-sans">
              {confirmDialog.message}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="hud-btn px-4 py-1.5 text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`hud-btn ${
                  confirmDialog.confirmColor === "cyan" ? "hud-btn-cyan" : "hud-btn-primary"
                } px-4 py-1.5 text-xs font-bold`}
              >
                {confirmDialog.confirmText || "CONFIRM"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HUD TOAST NOTIFICATION (Replaces blocked window.alert) */}
      {toast && (
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div
            className={`pointer-events-auto px-4 py-2.5 rounded-xl border backdrop-blur-lg shadow-2xl flex items-center gap-2.5 font-mono-hud text-xs tracking-wide transition-all ${
              toast.type === "success"
                ? "bg-[#071912]/90 border-[#22d3ee] text-[#22d3ee] shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : toast.type === "warn"
                ? "bg-[#200c14]/90 border-[#ff3d9a] text-[#ff3d9a] shadow-[0_0_20px_rgba(255,61,154,0.4)]"
                : "bg-[#100b24]/90 border-[#8b5cf6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                toast.type === "success"
                  ? "bg-[#22d3ee]"
                  : toast.type === "warn"
                  ? "bg-[#ff3d9a]"
                  : "bg-[#8b5cf6]"
              } animate-ping`}
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
