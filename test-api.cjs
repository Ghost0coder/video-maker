const fs = require('fs');
fetch('http://localhost:3000/api/convert-to-mp4', {
  method: 'POST',
  headers: { 'Content-Type': 'video/webm' },
  body: fs.readFileSync('/tmp/test_webm.webm')
}).then(async r => {
  console.log(r.status);
  if (r.status === 200) {
    const ab = await r.arrayBuffer();
    console.log("Got MP4 size:", ab.byteLength);
  } else {
    const text = await r.text();
    console.log("Error:", text);
  }
}).catch(e => console.error(e));
