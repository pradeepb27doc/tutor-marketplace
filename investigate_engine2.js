const path = require('path');
const fs = require('fs');

const cwd = process.cwd();

// Check packages/database/node_modules/@prisma/client for generated client and runtime requirements
const dbClientDir = path.join(cwd, 'packages', 'database', 'node_modules', '@prisma', 'client');
console.log('=== packages/database/node_modules/@prisma/client ===');
console.log('Exists:', fs.existsSync(dbClientDir));
if (fs.existsSync(dbClientDir)) {
  const files = fs.readdirSync(dbClientDir);
  console.log('Files:', files.join(', '));
  
  // Check runtime directory
  const runtimeDir = path.join(dbClientDir, 'runtime');
  if (fs.existsSync(runtimeDir)) {
    console.log('\nRuntime files:', fs.readdirSync(runtimeDir).slice(0, 20).join(', '));
  }
  
  // Check generated directory
  const genDir = path.join(dbClientDir, 'generated', 'prisma');
  if (fs.existsSync(genDir)) {
    console.log('\nGenerated dir files:', fs.readdirSync(genDir).join(', '));
  }
  
  // Check for client.js which has engine reference
  const clientJs = path.join(dbClientDir, 'client.js');
  if (fs.existsSync(clientJs)) {
    console.log('\nclient.js exists');
  }
  
  // Check for default.js which may have engine path
  const defaultJs = path.join(dbClientDir, 'default.js');
  if (fs.existsSync(defaultJs)) {
    console.log('default.js exists');
  }
  
  // Check package.json for engine deps
  const clientPkg = path.join(dbClientDir, 'package.json');
  if (fs.existsSync(clientPkg)) {
    const pkg = JSON.parse(fs.readFileSync(clientPkg, 'utf8'));
    console.log('\n@prisma/client package.json engines deps:', JSON.stringify(pkg.dependencies || {}));
  }
}

// Check what Prisma version is actually resolved in pnpm
console.log('\n=== pnpm resolved Prisma versions ===');
const pnpmDir = path.join(cwd, 'node_modules', '.pnpm');
const prismaDirs = [];
try {
  const entries = fs.readdirSync(pnpmDir);
  entries.forEach(e => {
    if (e.startsWith('@prisma+client@') || e.startsWith('@prisma+engines@') || e.startsWith('prisma@')) {
      prismaDirs.push(e);
    }
  });
  console.log('Found:', prismaDirs.join('\n'));
} catch(e) {
  console.log('Error reading pnpm dir:', e.message);
}

// Check the @prisma/engines node_modules for the engine binary
console.log('\n=== Checking for all engine binaries ===');
const enginesDirs = ['@prisma+engines@6.19.2', '@prisma+engines@6.6.0'];
enginesDirs.forEach(ed => {
  const dir = path.join(pnpmDir, ed, 'node_modules', '@prisma', 'engines');
  if (fs.existsSync(dir)) {
    console.log(`\nFound engines in: ${ed}`);
    const files = fs.readdirSync(dir);
    console.log('Engines files:', files.join(', '));
    
    // Check distribution directory
    const distDir = path.join(dir, 'dist');
    if (fs.existsSync(distDir)) {
      console.log('dist dir:', fs.readdirSync(distDir).join(', '));
    }
    
    // Check for cache or downloaded engine files
    function deepFind(dirPath, depth = 0) {
      if (depth > 4) return;
      try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const item of items) {
          const fp = path.join(dirPath, item.name);
          if (item.isDirectory()) {
            deepFind(fp, depth + 1);
          } else if (item.name.includes('query-engine') || item.name.includes('.dll') || item.name.includes('.node')) {
            console.log(`  Engine file: ${fp} (${fs.statSync(fp).size} bytes)`);
          }
        }
      } catch(e) {}
    }
    deepFind(dir);
  } else {
    console.log(`\nEngines NOT found in: ${ed}`);
  }
});