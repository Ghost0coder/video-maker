// Just to verify if we can append file in node easily
const fs = require('fs');
fs.writeFileSync('/tmp/test-chunked', Buffer.from('hello'));
fs.appendFileSync('/tmp/test-chunked', Buffer.from(' world'));
console.log(fs.readFileSync('/tmp/test-chunked').toString());
