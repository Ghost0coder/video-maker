/**
 * Slices a portion of an image and returns a base64 encoded data URL.
 * @param imageSrc The source image data URL or image element
 * @param x The horizontal start percentage (0 to 100)
 * @param y The vertical start percentage (0 to 100)
 * @param w The width percentage (0 to 100)
 * @param h The height percentage (0 to 100)
 */
export function sliceCollageImage(
  imageSrc: string,
  x: number,
  y: number,
  w: number,
  h: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get 2D context"));
          return;
        }

        // Convert percentage to actual pixels
        const sourceX = (x / 100) * img.width;
        const sourceY = (y / 100) * img.height;
        const sourceW = (w / 100) * img.width;
        const sourceH = (h / 100) * img.height;

        // Set canvas dimensions to the sliced output size
        canvas.width = Math.max(50, sourceW);
        canvas.height = Math.max(50, sourceH);

        // Draw the cropped portion
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceW,
          sourceH,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load source image for slicing"));
    img.src = imageSrc;
  });
}

/**
 * Generates synthesized dynamic background music using standard Web Audio API
 * in case Lyria is not set up or as a fallback theme soundtrack.
 * Plays a warm, celebratory, nostalgic college background melody.
 */
export class CollegeMelodyGenerator {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;
  public volumeMultiplier = 1.0;

  start() {
    if (this.isPlaying) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isPlaying = true;

      // Simple nostalgic progression in C Major / G Major: C - G - Am - F
      const chords = [
        [60, 64, 67], // C
        [55, 59, 62], // G
        [57, 60, 64], // Am
        [53, 57, 60], // F
      ];
      
      const melodyNotes = [
        [67, 69, 71, 72], // high notes C Major
        [74, 76, 79, 76],
        [72, 71, 69, 67],
        [65, 64, 62, 60]
      ];

      let chordIndex = 0;
      let step = 0;

      this.intervalId = setInterval(() => {
        if (!this.ctx) return;
        
        // Base Beat (Kick-like soft pulse)
        if (step % 4 === 0) {
          this.playTone(80, "sine", 0.15, 0.4);
        }

        // Play chord notes (soft warm pad)
        if (step % 8 === 0) {
          const chord = chords[chordIndex];
          chord.forEach(midi => {
            const freq = this.midiToFreq(midi);
            this.playTone(freq, "triangle", 0.05, 1.8);
          });
          chordIndex = (chordIndex + 1) % chords.length;
        }

        // Play flowing nostalgic melody notes
        if (step % 2 === 0) {
          const notes = melodyNotes[chordIndex];
          const midi = notes[Math.floor(Math.random() * notes.length)];
          const freq = this.midiToFreq(midi);
          // random high octave soft bell
          this.playTone(freq, "sine", 0.03, 0.8);
        }

        step++;
      }, 350); // 170 BPM sub-tempo
    } catch (e) {
      console.error("Audio Synthesis error", e);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  private midiToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  private playTone(freq: number, type: OscillatorType, volume: number, duration: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gainNode.gain.setValueAtTime(volume * this.volumeMultiplier, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // ignore oscillator state exceptions
    }
  }
}
