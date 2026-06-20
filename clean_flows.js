const fs = require('fs');

const flowsPath = 'C:\\Users\\Balaji\\.node-red\\flows.json';
const data = JSON.parse(fs.readFileSync(flowsPath, 'utf8'));

// Filter out problematic IBM Watson and Cloudant node types
const badTypes = ['cloudant', 'cloudant out', 'mqtt-broker', 'mqtt in'];
const cleaned = data.filter(node => !badTypes.includes(node.type));

fs.writeFileSync(flowsPath, JSON.stringify(cleaned, null, 4));
console.log('Successfully cleaned ' + (data.length - cleaned.length) + ' invalid nodes from flows.json.');
