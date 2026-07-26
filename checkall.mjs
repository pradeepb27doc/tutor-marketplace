const base = 'C:/Users/prade/OneDrive/Documents/New project/node_modules';
const tries = [
  base + '/.bin/prisma',
  base + '/@prisma/client',
  base + '/pg',
  base + '/.pnpm/@prisma+client@6.6.0_prisma_66ad65b8aa48c66bbd9b3e64cfcf114a/node_modules/@prisma/client',
  base + '/.pnpm/prisma@6.6.0_typescript@5.8.3/node_modules/prisma',
  base + '/.pnpm/pg@8.13.1/node_modules/pg',
];
for (const p of tries) {
  try { require('fs').accessSync(p); console.log('EXISTS', p); }
  catch { console.log('MISSING', p); }
}
// list pg dirs
try {
  const fs = require('fs');
  const dir = base + '/.pnpm';
  const entries = fs.readdirSync(dir).filter(n => /(^|\/)pg(@|$|_)/.test(n) || n.startsWith('pg@'));
  console.log('PG_ENTRIES', JSON.stringify(entries));
} catch (e) { console.log('ERR', e.message); }