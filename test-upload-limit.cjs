const http = require('http');

function upload(size) {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000/api/convert-to-mp4', {
      method: 'POST',
      headers: { 'Content-Type': 'video/webm', 'Content-Length': size }
    }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', reject);
    req.write(Buffer.alloc(size));
    req.end();
  });
}

(async () => {
  try {
    console.log("30MB:", await upload(30 * 1024 * 1024));
    console.log("50MB:", await upload(50 * 1024 * 1024));
  } catch (e) { console.error(e); }
})();
