-- =============================================================================
-- Fix Prisma Migration Checksum Encoding Mismatch
-- =============================================================================
-- 
-- Problem:
--   Migration '20260721000000_migration_repair' was applied with Prisma 7.8.0,
--   which stores checksums as base64. The current Prisma version is 6.6.0,
--   which expects hexadecimal encoding. The checksum comparison fails because
--   the formats are incompatible, even though the hash values are identical.
--
-- Root Cause:
--   A brief Prisma upgrade from 6.6.0 → 7.8.0 was attempted and reverted,
--   but the migration_repair was applied during that window. Prisma 7.8.0
--   changed the checksum encoding format from hex to base64.
--
-- Fix:
--   Convert the base64 checksum to its equivalent hex representation.
--   The SHA-256 hash value is the same; only the encoding differs.
--
-- Safe to run:
--   - Does NOT modify any migration SQL files
--   - Does NOT alter the database schema
--   - Does NOT require prisma migrate dev or prisma migrate reset
--   - The checksum value is semantically identical (same SHA-256 hash)
-- =============================================================================

-- Current (base64):  VA2thQtCT7na0IOkyBOX4RLg4PpMdj0N7ir5EVhNKIs=
-- Should be (hex):   540dad850b424fb9dad083a4c81397e112e0e0fa4c763d0dee2af911584d288b

UPDATE _prisma_migrations 
SET checksum = '540dad850b424fb9dad083a4c81397e112e0e0fa4c763d0dee2af911584d288b'
WHERE migration_name = '20260721000000_migration_repair';

-- Verify the update
SELECT migration_name, checksum, 
       CASE 
         WHEN checksum = '540dad850b424fb9dad083a4c81397e112e0e0fa4c763d0dee2af911584d288b' 
         THEN 'FIXED - hex format'
         ELSE 'NOT FIXED'
       END AS status
FROM _prisma_migrations
WHERE migration_name = '20260721000000_migration_repair';