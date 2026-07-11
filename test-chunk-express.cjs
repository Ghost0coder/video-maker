const http = require('http');
const express = require('express');
const app = express();

app.post("/chunk", express.raw({ type: "*/*", limit: "50mb" }), (req, res) => {
  console.log("Received body length:", req.body.length, Buffer.isBuffer(req.body));
  res.json({ ok: true });
});

const server = app.listen(3002, async () => {
  const fetch = globalThis.fetch;
  const res = await fetch('http://localhost:3002/chunk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: Buffer.from("hello world")
  });
  console.log("Status:", res.status);
  server.close();
});
