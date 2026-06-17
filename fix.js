const fs = require('fs');
let content = fs.readFileSync('hermes-worker.mjs', 'utf-8');
content = content.replace(/C:\\Users\\27554\\Desktop/g, 'C:/Users/27554/Desktop');
fs.writeFileSync('hermes-worker.mjs', content);
console.log('Fixed!');
