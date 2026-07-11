const fs = require('fs');

async function test() {
  const CHUNK_SIZE = 5 * 1024 * 1024;
  const startRes = await fetch("http://localhost:3000/api/upload/start", { method: "POST" });
  if (!startRes.ok) {
    console.error("Start failed:", startRes.status, await startRes.text());
    return;
  }
  const { uploadId } = await startRes.json();
  console.log("Started", uploadId);
  
  const dummyData = Buffer.alloc(10 * 1024 * 1024);
  
  for (let i = 0; i < dummyData.length; i += CHUNK_SIZE) {
    const chunk = dummyData.slice(i, i + CHUNK_SIZE);
    const chunkRes = await fetch(`http://localhost:3000/api/upload/chunk/${uploadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: chunk
    });
    if (!chunkRes.ok) {
      console.error("Chunk failed", await chunkRes.text());
      return;
    }
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
