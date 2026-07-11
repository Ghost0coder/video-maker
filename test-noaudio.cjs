const { execSync } = require("child_process");
const fs = require('fs');

// Generate WebM with NO audio
execSync("ffmpeg -y -f lavfi -i testsrc=duration=1:size=1280x720:rate=30 -c:v libvpx-vp9 /tmp/test_noaudio.webm");

// Try to convert to mp4 using our server command
try {
  execSync(`ffmpeg -y -i /tmp/test_noaudio.webm -map 0:v -map 0:a? -c:v libx264 -preset ultrafast -crf 22 -pix_fmt yuv420p -c:a aac -b:a 192k /tmp/test_output.mp4`);
  console.log("Success with no audio!");
} catch (e) {
  console.error("FFMPEG failed:", e.message);
}
