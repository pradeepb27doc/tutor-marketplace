const path = require('path');
const fs = require('fs');

const cwd = process.cwd();

// 1. Check @prisma/client generated files
const clientPaths = [
  'node_modules/@prisma/client',
  'packages/database/node_modules/@prisma/client',
];

// 2. Check pnpm store for engines
function findFiles(dir, pattern) {
  const results = [];
  try {
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findFiles(fullPath, pattern));
      } else if (entry.name.includes(pattern)) {
        results.push(fullPath);
      }
    }
  } catch (e) {
    // skip permission errors
  }
  return results;
}

// Check node_modules/.pnpm for @prisma engines
const pnpmDir = path.join(cwd, 'node_modules', '.pnpm');
console.log('=== Looking for query-engine binaries ===');
const engines = findFiles(pnpmDir, 'query-engine');
engines.forEach(e => {
  const stat = fs.statSync(e);
  console.log(`  ${e} (${stat.size} bytes)`);
});

if (engines.length === 0) {
  console.log('  No engine binaries found in pnpm store!');
}

// Check @prisma/client for generated client
console.log('\n=== Looking for @prisma/client ===');
const prismaClientDir = path.join(cwd, 'node_modules', '@prisma', 'client');
if (fs.existsSync(prismaClientDir)) {
  console.log('  Found @prisma/client');
  const files = fs.readdirSync(prismaClientDir);
  console.log('  Contents:', files.filter(f => f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.node')).join(', '));
  
  // Check for generated client
  const schemaDir = path.join(prismaClientDir, 'generated', 'prisma');
  if (fs.existsSync(schemaDir)) {
    console.log('  Generated client found in:', schemaDir);
    const generatedFiles = fs.readdirSync(schemaDir);
    console.log('  Generated files:', generatedFiles.join(', '));
  } else {
    // Check other locations for generated client
    const generatedDirs = ['runtime', 'scripts'];
    generatedDirs.forEach(d => {
      const dp = path.join(prismaClientDir, d);
      if (fs.existsSync(dp)) {
        console.log(`  Subdir ${d} exists with`, fs.readdirSync(dp).slice(0, 10).join(', '));
      }
    });
  }
}

// Check if there's a separate client generation location
console.log('\n=== Checking packages/database for generated client ===');
const dbNodeModules = path.join(cwd, 'packages', 'database', 'node_modules', '@prisma', 'client');
if (fs.existsSync(dbNodeModules)) {
  console.log('  Found @prisma/client in packages/database');
} else {
  console.log('  No @prisma/client in packages/database node_modules');
}