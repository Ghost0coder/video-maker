import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import os from "os";
import { exec } from "child_process";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body parser with a larger limit for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini client on the server side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini SDK successfully initialized.");
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will fallback to client-side mocks.");
}

// API endpoint to analyze collage and detect individual photos with coordinates
app.post("/api/analyze-collage", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data in request body" });
    }

    if (!ai) {
      return res.status(500).json({ error: "Gemini API client is not configured. Please add GEMINI_API_KEY in Secrets." });
    }

    // Strip header from base64 if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data,
      },
    };

    const promptText = `
      You are a cinematic video director. Analyze this collage image which contains multiple smaller photos (usually arranged in a grid, heart, or diamond shape).
      Your task is to detect and locate each individual sub-photo inside the collage.
      
      For each sub-photo you find, provide:
      1. Bounding box coordinates as percentages (0 to 100) relative to the overall collage width and height:
         - x: starting horizontal position (percentage from left edge)
         - y: starting vertical position (percentage from top edge)
         - width: horizontal span (percentage of overall width)
         - height: vertical span (percentage of overall height)
      2. A brief, warm description of who is in the photo or what is happening (e.g., "couple smiling next to water", "two guys laughing at a party").
      3. A touching, celebratory, or emotional birthday/college memory caption for that sub-photo (under 15 words).
         
      Also, detect the primary title or greeting text of the collage (e.g. "Happy Birthday Aneech Eatta").
      
      Make sure the coordinates are relative and accurately frame the individual square/rectangular photos. Do not group them too much; split them into individual elements. There are typically between 5 and 20 photos.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, { text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The main title or greeting text detected on the collage."
            },
            subPhotos: {
              type: Type.ARRAY,
              description: "A list of detected individual sub-photos with their bounding boxes.",
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER, description: "X coordinate of the bounding box as percentage (0-100)" },
                  y: { type: Type.NUMBER, description: "Y coordinate of the bounding box as percentage (0-100)" },
                  width: { type: Type.NUMBER, description: "Width of the bounding box as percentage (0-100)" },
                  height: { type: Type.NUMBER, description: "Height of the bounding box as percentage (0-100)" },
                  description: { type: Type.STRING, description: "Description of what is in the photo" },
                  caption: { type: Type.STRING, description: "A touching memory caption for this photo (max 15 words)" }
                },
                required: ["x", "y", "width", "height", "description", "caption"]
              }
            }
          },
          required: ["title", "subPhotos"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error analyzing collage:", error);
    res.status(500).json({ error: error.message || "Failed to analyze collage" });
  }
});

// API endpoint to generate individual captions for specific photos or customize themes
app.post("/api/generate-captions", async (req, res) => {
  try {
    const { descriptions, theme, prompt } = req.body;
    if (!descriptions || !Array.isArray(descriptions)) {
      return res.status(400).json({ error: "Missing descriptions array" });
    }

    if (!ai) {
      return res.status(500).json({ error: "Gemini API client is not configured" });
    }

    const promptText = `
      You are a scriptwriter for a cinematic memory video. 
      Here is a list of descriptions for photos in a slideshow:
      ${descriptions.map((desc, idx) => `${idx + 1}. ${desc}`).join("\n")}
      
      The overall video theme is: "${theme || "Celebration/Birthday"}".
      User instructions: "${prompt || "Make it emotional, poetic, and heartwarming."}"
      
      Generate a poetic caption (under 12 words) for each photo that flows beautifully like a storyline.
      Return the output as a JSON list of strings, corresponding exactly to the input photos in order.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of generated captions corresponding exactly to the input list of photos."
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const captions = JSON.parse(resultText);
    res.json({ captions });
  } catch (error: any) {
    console.error("Error generating captions:", error);
    res.status(500).json({ error: error.message || "Failed to generate captions" });
  }
});

// High-Fidelity WebM to MP4 transcode API via server-side FFmpeg
app.post("/api/convert-to-mp4", express.raw({ type: "video/webm", limit: "150mb" }), (req, res) => {
  try {
    const webmBuffer = req.body;
    if (!webmBuffer || webmBuffer.length === 0) {
      return res.status(400).json({ error: "No video data received" });
    }

    const tempWebmPath = path.join(os.tmpdir(), `input_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.webm`);
    const tempMp4Path = path.join(os.tmpdir(), `output_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.mp4`);

    fs.writeFile(tempWebmPath, webmBuffer, (err) => {
      if (err) {
        console.error("Failed to write temporary webm file:", err);
        return res.status(500).json({ error: "Failed to process video upload on server" });
      }

      // Convert WebM to standard MP4 (libx264, standard AAC audio fallback)
      // We use yuv420p pixel format for supreme compatibility with all standard players (QuickTime, Safari, mobile devices)
      const ffmpegCmd = `ffmpeg -y -i "${tempWebmPath}" -c:v libx264 -preset ultrafast -crf 22 -pix_fmt yuv420p "${tempMp4Path}"`;

      exec(ffmpegCmd, (execErr, stdout, stderr) => {
        // Safe clean up of raw source file
        fs.unlink(tempWebmPath, () => {});

        if (execErr) {
          console.error("FFmpeg conversion process failed:", execErr);
          console.error("FFmpeg details stderr:", stderr);
          return res.status(500).json({ error: "FFmpeg transcode failed: " + execErr.message });
        }

        // Send the fully converted MP4 file
        res.download(tempMp4Path, "collage_memory_slideshow.mp4", (downloadErr) => {
          // Safe clean up of compiled output file
          fs.unlink(tempMp4Path, () => {});
        });
      });
    });
  } catch (error: any) {
    console.error("Error in convert-to-mp4 route:", error);
    res.status(500).json({ error: error.message || "Internal server error during conversion" });
  }
});

// Integrate Vite middleware in development or serve static build files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA routing fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
