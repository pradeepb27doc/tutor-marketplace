const path = require('path');
const fs = require('fs');
const cwd = process.cwd();
const pnpmDir = path.join(cwd, 'node_modules', '.pnpm');

// After prisma generate, check if engines now have binaries
const engines6Dir = path.join(pnpmDir, '@prisma+engines@6.6.0', 'node_modules', '@prisma', 'engines');
console.log('=== @prisma/engines@6.6.0 (after generate) ===');

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
deepFindExe(engines6Dir);

// Also check the cache for 6.6.0
const prismaCache = path.join(cwd, 'node_modules', '.cache', 'prisma');
console.log('\n=== prisma cache (after generate) ===');
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
} else {
  console.log('Cache directory does not exist');
}

// Check the generated client output to verify engine binary
const generatedClientDir = path.join(pnpmDir, '@prisma+client@6.6.0_prisma_66ad65b8aa48c66bbd9b3e64cfcf114a', 'node_modules', '@prisma', 'client');
console.log('\n=== Generated client contents ===');
if (fs.existsSync(generatedClientDir)) {
  const contents = fs.readdirSync(generatedClientDir);
  console.log('Files:', contents.join(', '));
  
  // Check runtime for engine type
  const runtimeDir = path.join(generatedClientDir, 'runtime');
  if (fs.existsSync(runtimeDir)) {
    const clientJsContent = fs.readFileSync(path.join(runtimeDir, 'client.js'), 'utf8');
    const match = clientJsContent.match(/Lo\s*=\s*"([^"]+)"/);
    if (match) console.log('Engine type in client.js:', match[1]);
  }
}