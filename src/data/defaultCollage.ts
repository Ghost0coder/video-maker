export interface SubPhoto {
  id: string;
  x: number;       // Percentage X
  y: number;       // Percentage Y
  width: number;   // Percentage Width
  height: number;  // Percentage Height
  description: string;
  caption: string;
  duration: number; // Duration in seconds
  transition: "fade" | "zoom" | "panLeft" | "panRight" | "slideUp" | "retro";
}

export interface CollageData {
  title: string;
  imageUrl: string;
  subPhotos: SubPhoto[];
}

export const DEFAULT_COLLAGE_IMAGE = "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80"; // Celebratory backdrop as fallback if none uploaded

export const DEFAULT_COLLAGE: CollageData = {
  title: "Happy Birthday Aneech Eatta",
  imageUrl: "", // This will be set or can be uploaded by the user
  subPhotos: [
    {
      id: "photo_1",
      x: 30,
      y: 32,
      width: 17,
      height: 9,
      description: "Couple smiling side-by-side",
      caption: "To the sweet laughter and endless shared conversations.",
      duration: 3,
      transition: "zoom"
    },
    {
      id: "photo_2",
      x: 53,
      y: 32,
      width: 17,
      height: 9,
      description: "Man and woman grinning outdoors",
      caption: "Finding magic in every sunny day spent together.",
      duration: 3,
      transition: "panLeft"
    },
    {
      id: "photo_3",
      x: 18,
      y: 42,
      width: 15,
      height: 9,
      description: "Couple standing looking forward",
      caption: "Stepping into new horizons hand in hand.",
      duration: 3.5,
      transition: "panRight"
    },
    {
      id: "photo_4",
      x: 34,
      y: 42,
      width: 15,
      height: 9,
      description: "Couple laughing, close look",
      caption: "Every shared secret is a treasure of friendship.",
      duration: 3,
      transition: "fade"
    },
    {
      id: "photo_5",
      x: 50,
      y: 42,
      width: 15,
      height: 9,
      description: "Couple holding flowers with warm expressions",
      caption: "Grateful for the blooming moments of joy.",
      duration: 4,
      transition: "zoom"
    },
    {
      id: "photo_6",
      x: 65,
      y: 42,
      width: 17,
      height: 9,
      description: "Man with beard smiling widely beside his partner",
      caption: "A bond forged in laughter and simple happiness.",
      duration: 3,
      transition: "slideUp"
    },
    {
      id: "photo_7",
      x: 18,
      y: 52,
      width: 15,
      height: 9,
      description: "Two friends smiling in crisp daylight",
      caption: "Brothers through thick and thin, memories that shine.",
      duration: 3,
      transition: "panLeft"
    },
    {
      id: "photo_8",
      x: 34,
      y: 52,
      width: 15,
      height: 9,
      description: "Girl and guy smiling against soft background",
      caption: "Quiet companionship and comfort in silence.",
      duration: 3.5,
      transition: "fade"
    },
    {
      id: "photo_9",
      x: 49,
      y: 52,
      width: 15,
      height: 9,
      description: "Warm couples smiling at a beach setting",
      caption: "Making waves of joy wherever the road leads.",
      duration: 3,
      transition: "zoom"
    },
    {
      id: "photo_10",
      x: 65,
      y: 52,
      width: 17,
      height: 9,
      description: "Laughing together under warm lighting",
      caption: "Your birthday is the perfect reason to celebrate us.",
      duration: 4,
      transition: "panRight"
    },
    {
      id: "photo_11",
      x: 26,
      y: 61,
      width: 15,
      height: 9,
      description: "Couple posing with beautiful green forest backdrop",
      caption: "Among the trees and under the skies, we find peace.",
      duration: 3.5,
      transition: "zoom"
    },
    {
      id: "photo_12",
      x: 42,
      y: 61,
      width: 15,
      height: 9,
      description: "Couple on a riverboat tour, wearing sunglasses",
      caption: "Sailing through life's finest adventures together.",
      duration: 3,
      transition: "slideUp"
    },
    {
      id: "photo_13",
      x: 57,
      y: 61,
      width: 17,
      height: 9,
      description: "Happy couple close-up smile in warm daylight",
      caption: "Always backing each other with warm smiles.",
      duration: 3,
      transition: "fade"
    },
    {
      id: "photo_14",
      x: 34,
      y: 71,
      width: 15,
      height: 9,
      description: "Two friends smiling on a terrace",
      caption: "To the nights that turned into morning memories.",
      duration: 3,
      transition: "panLeft"
    },
    {
      id: "photo_15",
      x: 50,
      y: 71,
      width: 17,
      height: 9,
      description: "Cute couple on a scooter with helmets",
      caption: "Riding through life's curves with perfect sync.",
      duration: 3.5,
      transition: "zoom"
    },
    {
      id: "photo_16",
      x: 41,
      y: 80,
      width: 18,
      height: 9,
      description: "Couple laughing with beautiful background light",
      caption: "Here is to many more chapters of pure love and laughter!",
      duration: 4,
      transition: "slideUp"
    }
  ]
};
