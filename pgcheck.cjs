const { Client } = require('pg');
(async () => {
  try {
    const c = new Client({ connectionString: process.env.PGTEST || 'postgresql://postgres:postgres@localhost:5432/tutor_marketplace_test' });
    await c.connect();
    const r = await c.query('select version()');
    console.log('PG_OK', r.rows[0].version);
    await c.end();
  } catch (e) {
    console.log('PG_FAIL', e.message);
  }
})();