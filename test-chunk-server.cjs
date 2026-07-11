const fs = require('fs');
const files = fs.readdirSync('/tmp').filter(f => f.startsWith('upload_'));
for (const f of files) {
  console.log(f, fs.statSync('/tmp/' + f).size);
}
