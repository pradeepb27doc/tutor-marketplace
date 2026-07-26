const path = require('path');
const fs = require('fs');

const cwd = process.cwd();

// Check the generated client to see what engine type it's configured to use
const dbClientDir = path.join(cwd, 'packages', 'database', 'node_modules', '@prisma', 'client');

// Check the runtime/binary.js to see what engine it loads
const binaryJs = path.join(dbClientDir, 'runtime', 'binary.js');
if (fs.existsSync(binaryJs)) {
  const content = fs.readFileSync(binaryJs, 'utf8');
  // Look for engine path references
  const lines = content.split('\n');
  console.log('=== binary.js engine references ===');
  lines.forEach((line, i) => {
    if (line.includes('engine') || line.includes('query') || line.includes('dll') || line.includes('.node')) {
      console.log(`  L${i+1}: ${line.trim().substring(0, 200)}`);
    }
  });
}

// Check the runtime/library.js to see what engine it loads
const libraryJs = path.join(dbClientDir, 'runtime', 'library.js');
if (fs.existsSync(libraryJs)) {
  const content = fs.readFileSync(libraryJs, 'utf8');
  const lines = content.split('\n');
  console.log('\n=== library.js engine references ===');
  lines.forEach((line, i) => {
    if (line.includes('engine') || line.includes('query') || line.includes('dll') || line.includes('.node') || line.includes('libquery')) {
      console.log(`  L${i+1}: ${line.trim().substring(0, 200)}`);
    }
  });
}

// Check the generated client.js to see which engine type is configured
const clientJs = path.join(dbClientDir, 'runtime', 'client.js');
if (fs.existsSync(clientJs)) {
  const content = fs.readFileSync(clientJs, 'utf8');
  const lines = content.split('\n');
  console.log('\n=== client.js engine config ===');
  lines.forEach((line, i) => {
    if (line.includes('engineType') || line.includes('EngineType') || line.includes('binary') || line.includes('library')) {
      console.log(`  L${i+1}: ${line.trim().substring(0, 200)}`);
    }
  });
}

// Check the default.js to see which engine is used
const defaultJs = path.join(dbClientDir, 'default.js');
if (fs.existsSync(defaultJs)) {
  const content = fs.readFileSync(defaultJs, 'utf8');
  console.log('\n=== default.js content (first 30 lines) ===');
  const lines = content.split('\n');
  lines.slice(0, 30).forEach((line, i) => {
    console.log(`  L${i+1}: ${line.trim().substring(0, 200)}`);
  });
}

// Check the index.js
const indexJs = path.join(dbClientDir, 'index.js');
if (fs.existsSync(indexJs)) {
  const content = fs.readFileSync(indexJs, 'utf8');
  console.log('\n=== index.js content (first 20 lines) ===');
  const lines = content.split('\n');
  lines.slice(0, 20).forEach((line, i) => {
    console.log(`  L${i+1}: ${line.trim().substring(0, 200)}`);
  });
}

// Check what version of @prisma/client is actually being resolved
console.log('\n=== Checking which @prisma/client version is linked ===');
const clientPkg = path.join(dbClientDir, 'package.json');
if (fs.existsSync(clientPkg)) {
  const pkg = JSON.parse(fs.readFileSync(clientPkg, 'utf8'));
  console.log('Version:', pkg.version);
}

// Check the engines package.json for version
const enginesPkg6 = path.join(cwd, 'node_modules', '.pnpm', '@prisma+engines@6.6.0', 'node_modules', '@prisma', 'engines', 'package.json');
if (fs.existsSync(enginesPkg6)) {
  const pkg = JSON.parse(fs.readFileSync(enginesPkg6, 'utf8'));
  console.log('\n@prisma/engines@6.6.0 version:', pkg.version);
  console.log('Has engines field:', !!pkg.prisma);
  if (pkg.prisma) console.log('Prisma config:', JSON.stringify(pkg.prisma));
}

const enginesPkg19 = path.join(cwd, 'node_modules', '.pnpm', '@prisma+engines@6.19.2', 'node_modules', '@prisma', 'engines', 'package.json');
if (fs.existsSync(enginesPkg19)) {
  const pkg = JSON.parse(fs.readFileSync(enginesPkg19, 'utf8'));
  console.log('\n@prisma/engines@6.19.2 version:', pkg.version);
  console.log('Has engines field:', !!pkg.prisma);
  if (pkg.prisma) console.log('Prisma config:', JSON.stringify(pkg.prisma));
}