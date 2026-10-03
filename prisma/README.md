# Prisma deployment workflow

This project currently has an existing PostgreSQL schema but no Prisma migration history. Do not run `prisma migrate reset`.

## One-time baseline for an existing database

1. Back up the database and confirm the live schema matches `prisma/schema.prisma` with `npx prisma db pull`.
2. Generate a baseline migration script from the Prisma schema without applying it:

```powershell
New-Item -ItemType Directory -Force prisma\migrations\0_baseline | Out-Null
npx prisma migrate diff --from-empty --to-schema-datamodel prisma\schema.prisma --script | Out-File -Encoding utf8 prisma\migrations\0_baseline\migration.sql
```

3. Against the already-populated database, mark the baseline as applied. This records migration history and does not execute the baseline SQL:

```powershell
npx prisma migrate resolve --applied 0_baseline
```

Only run step 3 after independently confirming that the existing database matches the schema.

## Future development and deployment

- Development: update `prisma/schema.prisma`, run `npx prisma migrate dev --name <descriptive_name>`, and test the generated migration.
- Production: set the production `DATABASE_URL`, then run `npx prisma migrate deploy` during deployment.
- Never use `prisma migrate reset` against a shared or production database.
