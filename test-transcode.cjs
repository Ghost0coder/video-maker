const fs = require('fs');
fetch('http://localhost:3000/api/convert-to-mp4', {
  method: 'POST',
  headers: { 'Content-Type': 'video/webm' },
  body: 'test-data-mock-webm'
}).then(async r => {
  console.log(r.status);
  const text = await r.text();
  console.log(text);
}).catch(e => console.error(e));
