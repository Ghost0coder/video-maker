const { execSync } = require("child_process");
execSync("ffmpeg -y -f lavfi -i testsrc=duration=1:size=1280x720:rate=30 -f lavfi -i sine=frequency=1000:duration=1 -c:v libvpx-vp9 -c:a libopus /tmp/test_webm.webm");
console.log("Created WebM!");
