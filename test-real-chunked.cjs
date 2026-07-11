const fs = require('fs');
const { execSync } = require('child_process');

async function test() {
  const CHUNK_SIZE = 5 * 1024 * 1024;
  
  // Generate real WebM
  execSync("ffmpeg -y -f lavfi -i testsrc=duration=2:size=1280x720:rate=30 -c:v libvpx-vp9 /tmp/real_test.webm");
  const dummyData = fs.readFileSync('/tmp/real_test.webm');
  
  const startRes = await fetch("http://localhost:3000/api/upload/start", { method: "POST" });
  if (!startRes.ok) return console.error("Start failed");
  const { uploadId } = await startRes.json();
  
  for (let i = 0; i < dummyData.length; i += CHUNK_SIZE) {
    const chunk = dummyData.slice(i, i + CHUNK_SIZE);
    const chunkRes = await fetch(`http://localhost:3000/api/upload/chunk/${uploadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: chunk
    });
    if (!chunkRes.ok) return console.error("Chunk failed");
  }
  
  console.log("Finishing...");
  const finishRes = await fetch(`http://localhost:3000/api/upload/finish/${uploadId}`, { method: "POST" });
  if (!finishRes.ok) {
    console.error("Finish failed", finishRes.status, await finishRes.text());
  } else {
    console.log("Finish ok", finishRes.status);
  }
}

test();
