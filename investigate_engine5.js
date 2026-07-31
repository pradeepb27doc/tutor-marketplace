const path = require('path');
const fs = require('fs');
const cwd = process.cwd();

// Check what binary is actually being downloaded for 6.6.0 vs 6.19.2
const pnpmDir = path.join(cwd, 'node_modules', '.pnpm');

// For 6.6.0 - check for any engine files hidden deeper
const engines6Dir = path.join(pnpmDir, '@prisma+engines@6.6.0', 'node_modules', '@prisma', 'engines');
console.log('=== @prisma/engines@6.6.0 ===');
console.log('Contents:', fs.readdirSync(engines6Dir).join(', '));

// Check for any .node or .exe or .dll files recursively
function deepFindExe(dirPath, depth = 0) {
  if (depth > 6) return;
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const item of items) {
      const fp = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        deepFindExe(fp, depth + 1);
      } else if (item.name.endsWith('.exe') || item.name.endsWith('.dll') || item.name.endsWith('.node')) {
        console.log(`  FOUND: ${fp} (${fs.statSync(fp).size} bytes)`);
      } else if (item.name === 'libquery-engine') {
        console.log(`  FOUND (libquery-engine): ${fp} (${fs.statSync(fp).size} bytes)`);
      }
    }
  } catch(e) {}
}
console.log('\nDeep search in @prisma+engines@6.6.0:');
deepFindExe(engines6Dir);

// For 6.19.2 - check the engine binary type  
const engines19Dir = path.join(pnpmDir, '@prisma+engines@6.19.2', 'node_modules', '@prisma', 'engines');
console.log('\n=== @prisma/engines@6.19.2 ===');
console.log('Contents:', fs.readdirSync(engines19Dir).join(', '));
console.log('\nDeep search in @prisma+engines@6.19.2:');
deepFindExe(engines19Dir);

// Also check where the Prisma CLI prisma generate generates to - is there a cache?
const prismaCache = path.join(cwd, 'node_modules', '.cache', 'prisma');
console.log('\n=== prisma cache ===');
console.log('Exists:', fs.existsSync(prismaCache));
if (fs.existsSync(prismaCache)) {
  function listAll(dirPath, depth = 0) {
    if (depth > 4) return;
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const item of items) {
        const fp = path.join(dirPath, item.name);
        console.log(' '.repeat(depth*2) + item.name + (item.isDirectory() ? '/' : ' (' + fs.statSync(fp).size + ' bytes)'));
        if (item.isDirectory()) listAll(fp, depth + 1);
      }
    } catch(e) {}
  }
  listAll(prismaCache);
}

// Check the binary target from the generated client's engine resolution
const binaryJs = path.join(cwd, 'packages', 'database', 'node_modules', '@prisma', 'client', 'runtime', 'binary.js');
const content = fs.readFileSync(binaryJs, 'utf8');
// Find binary targets
const matches = content.match(/["']windows["']|["']darwin["']|["']linux["']|["']arm64["']|["']x64["']/g);
console.log('\n=== Binary target refs in binary.js ===');
if (matches) {
  const unique = [...new Set(matches)];
  console.log('Found:', unique.join(', '));
}
// Find the specific windows entry
const windowsMatch = content.match(/windows["']?\s*[,:]\s*["']?[^"']+/g);
if (windowsMatch) {
  console.log('Windows targets:', windowsMatch.filter(m => m.includes('windows')).join(' | '));
}