const { execSync } = require("child_process");
console.time("Generate 10s");
execSync("ffmpeg -y -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -c:v libvpx-vp9 /tmp/test_10s.webm");
console.timeEnd("Generate 10s");

console.time("Convert 10s");
execSync(`ffmpeg -y -i /tmp/test_10s.webm -map 0:v -map 0:a? -c:v libx264 -preset ultrafast -crf 22 -pix_fmt yuv420p -c:a aac -b:a 192k /tmp/test_10s.mp4`);
console.timeEnd("Convert 10s");
