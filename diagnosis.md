# Migration Checksum Mismatch — Diagnosis

## Investigation Results

### 1. Checksum Comparison: All File Checksums Match the Database

| Migration | DB Checksum (as stored) | File SHA-256 → base64 | Match? |
|---|---|---|---|
| `20260708000000_init` | `e4b737ed...` (hex, 64 chars) | `5Lc37U0l...` (base64) | ✅ (hex→base64 matches) |
| `20260711000001_tutor_language` | `26195d8f...` (hex, 64 chars) | `Jhldj6fV...` (base64) | ✅ (hex→base64 matches) |
| `20260712000000_availability_10b` | `3ee6e00a...` (hex, 64 chars) | `PubgCrsb...` (base64) | ✅ (hex→base64 matches) |
| `20260721000000_migration_repair` | `VA2thQtC...` (base64, 44 chars) | `VA2thQtC...` (base64) | ✅ (direct match) |

**The migration file was NOT modified after being applied.** The checksums are consistent.

### 2. Root Cause: Prisma Version Mismatch in Checksum Encoding

The database stores checksums in **two different formats**:

- **Migrations 1–3** (applied with Prisma **6.6.0**): checksums stored as **hexadecimal** strings (64 hex chars = 32 bytes)
- **Migration 4** (`migration_repair`, applied with Prisma **7.8.0**): checksum stored as **base64** string (44 base64 chars = 32 bytes)

Evidence:
- The backup patch (`12D-investigation-backup.patch`) shows an upgrade from Prisma 6.6.0 → 7.8.0 was attempted
- The `migration_repair` directory was created on **Jul 21 11:27** and applied at **2026-07-21 11:29:16**
- The current `package.json` still has Prisma **6.6.0** (the upgrade was reverted)
- The `migration_repair` directory has different permissions (`drwxr-xr-x` vs `drwxrwxrwx` for the others), suggesting it was created under different conditions

**The mismatch**: Prisma 6.6.0 reads the DB, sees a base64 checksum for migration 4, computes the file's checksum in hex format, and the comparison fails because the formats are incompatible.

### 3. Migration History Consistency

The `_prisma_migrations` table shows all 4 migrations as applied with no rollbacks:
- All have `finished_at` set and `rolled_back_at` = NULL
- All have `applied_steps_count` = 1
- The sequence is chronological

The database schema itself is consistent — the migration was successfully applied. The only inconsistency is the checksum encoding format.

### 4. Safest Repair Strategy

**Option A (Recommended): Fix the checksum format in the database**

Convert the base64 checksum for `migration_repair` to hex format, matching the other migrations:

```
Current DB value: VA2thQtCT7na0IOkyBOX4RLg4PpMdj0N7ir5EVhNKIs=  (base64)
Should be:        540dad850b424fb9dad083a4c81397e112e0e0fa4c763d0dee2af911584d288b  (hex)
```

SQL to fix:
```sql
UPDATE _prisma_migrations 
SET checksum = '540dad850b424fb9dad083a4c81397e112e0e0fa4c763d0dee2af911584d288b'
WHERE migration_name = '20260721000000_migration_repair';
```

**Why this is safe:**
- Does NOT modify any migration SQL files
- Does NOT alter the database schema
- Does NOT require `prisma migrate dev` or `prisma migrate reset`
- The checksum value is semantically identical (same SHA-256 hash, just different encoding)
- Prisma 6.6.0 will then see a hex checksum, compute the file's hex checksum, and they will match

**Option B (Alternative): Mark the migration as applied**

If the checksum format issue persists, use `prisma migrate resolve --applied` to mark the migration. But Option A is more precise and doesn't require Prisma CLI commands that might trigger unwanted side effects.

## Proposed Fix

Execute the single SQL UPDATE statement above to normalize the checksum encoding, then verify Prisma Client generation succeeds.