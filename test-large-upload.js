fetch('http://localhost:3000/api/convert-to-mp4', {
  method: 'POST',
  headers: { 'Content-Type': 'video/webm' },
  body: Buffer.alloc(40 * 1024 * 1024)
}).then(async r => console.log(r.status, await r.text())).catch(e => console.error(e));
