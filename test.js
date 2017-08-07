var fs = require('fs');

var uppm = JSON.parse(fs.readFileSync('uppm.json', 'utf-8'));
var inits = JSON.parse(fs.readFileSync('initials.json', 'utf-8'));

console.log(uppm.length);

console.log(Object.keys(uppm).length);
console.log(inits.length);