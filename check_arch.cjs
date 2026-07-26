const fs = require('fs');

const filePath = process.argv[2];
const buf = fs.readFileSync(filePath);

// Read PE offset at 0x3C
const peOffset = buf.readUInt32LE(0x3C);

// Read machine type at PE offset + 4
const machine = buf.readUInt16LE(peOffset + 4);

const machines = {
  0x8664: 'x86_64 (AMD64)',
  0x014C: 'x86 (IA32)',
  0x0200: 'IA64',
  0xAA64: 'ARM64',
  0x01C4: 'ARMv7/Thumb',
  0x5032: 'x86_64 (AMD64)'
};

console.log(`File: ${filePath}`);
console.log(`PE offset: 0x${peOffset.toString(16)}`);
console.log(`Machine type: 0x${machine.toString(16)} -> ${machines[machine] || 'Unknown'}`);
console.log(`File size: ${buf.length} bytes`);