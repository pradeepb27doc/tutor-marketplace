const path = require('path');
const fs = require('fs');
const cwd = process.cwd();

// Check .prisma/client which is where the generated client normally points
const dotPrismaClient = path.join(cwd, 'node_modules', '.prisma', 'client');
console.log('=== .prisma/client existence ===');
console.log('Exists:', fs.existsSync(dotPrismaClient));
if (fs.existsSync(dotPrismaClient)) {
  console.log('Contents:', fs.readdirSync(dotPrismaClient).join(', '));
}

// Check if there's a .prisma/client in packages/database
const dbDotPrisma = path.join(cwd, 'packages', 'database', 'node_modules', '.prisma', 'client');
console.log('\n=== packages/database/node_modules/.prisma/client ===');
console.log('Exists:', fs.existsSync(dbDotPrisma));
if (fs.existsSync(dbDotPrisma)) {
  console.log('Contents:', fs.readdirSync(dbDotPrisma).join(', '));
}

// Check for prisma generate output directories
const generateDirs = [
  path.join(cwd, 'node_modules', '.prisma'),
  path.join(cwd, 'packages', 'database', 'node_modules', '.prisma'),
  path.join(cwd, 'packages', 'database', 'prisma', 'generated'),
];

generateDirs.forEach(d => {
  if (fs.existsSync(d)) {
    console.log(`\n=== ${d} ===`);
    function listDir(dirPath, depth = 0) {
      if (depth > 2) return;
      try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const item of items) {
          const fp = path.join(dirPath, item.name);
          console.log(' '.repeat(depth*2) + item.name + (item.isDirectory() ? '/' : ''));
          if (item.isDirectory()) listDir(fp, depth + 1);
        }
      } catch(e) {}
    }
    listDir(d);
  }
});

// Check which engine package is actually linked from packages/database
console.log('\n=== packages/database/node_modules/@prisma link resolution ===');
const clientLink = path.join(cwd, 'packages', 'database', 'node_modules', '@prisma', 'client');
try {
  const stat = fs.lstatSync(clientLink);
  if (stat.isSymbolicLink()) {
    const target = fs.readlinkSync(clientLink);
    console.log('  @prisma/client is a symlink to:', target);
  } else {
    console.log('  @prisma/client is a real directory');
  }
} catch(e) {
  console.log('  Error:', e.message);
}

// Check what's in the @prisma/client runtime for the specific engine type
const clientRuntime = path.join(cwd, 'packages', 'database', 'node_modules', '@prisma', 'client', 'runtime');
const runtimeFiles = fs.readdirSync(clientRuntime).filter(f => f.endsWith('.js'));
console.log('\n=== Runtime JS files ===');
runtimeFiles.forEach(f => {
  const content = fs.readFileSync(path.join(clientRuntime, f), 'utf8');
  if (content.includes('engineType') || content.includes('EngineType')) {
    const match = content.match(/engineType["\s:=]+["']([^"']+)["']/);
    if (match) console.log(`  ${f}: engineType = ${match[1]}`);
  }
  if (content.includes('Lo=') && f === 'client.js') {
    const match = content.match(/Lo\s*=\s*"([^"]+)"/);
    if (match) console.log(`  ${f}: Lo (engineType) = ${match[1]}`);
  }
});