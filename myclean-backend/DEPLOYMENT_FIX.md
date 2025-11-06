# 🔧 Fix: Prisma Schema Provider Error

## Problem
When deploying to production, you may see this error:
```
Error: Prisma schema validation - (get-config wasm)
error: Error validating datasource db: the URL must start with the protocol file:.
```

This happens because the schema is set to SQLite (`provider = "sqlite"`) which requires `file:` protocol, but production uses PostgreSQL with `postgresql://` protocol.

## ✅ Solution

The schema has been updated to use PostgreSQL by default. This is the standard for production deployments.

### For Local Development

You have two options:

#### Option 1: Use PostgreSQL (Recommended)
1. Install PostgreSQL locally or use a cloud PostgreSQL service
2. Set `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/myclean?schema=public"
   ```

#### Option 2: Use SQLite for Local Dev
If you prefer SQLite for local development:

1. **Change schema.prisma:**
   ```prisma
   datasource db {
     provider = "sqlite"  // Change from "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Change migration_lock.toml:**
   ```toml
   provider = "sqlite"  // Change from "postgresql"
   ```

3. **Update .env:**
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev --name init
   ```

### For Production Deployment

The schema is now configured for PostgreSQL. Just make sure:

1. **Set DATABASE_URL in your deployment platform** (Render, Railway, etc.):
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

## 🚀 Quick Deploy Checklist

- [ ] Schema uses `provider = "postgresql"` ✅
- [ ] DATABASE_URL set in deployment platform (starts with `postgresql://`)
- [ ] Run `npx prisma migrate deploy` after deployment
- [ ] Backend starts successfully

## 📝 Notes

- **SQLite** is great for local development but not recommended for production
- **PostgreSQL** is the standard for production deployments
- The schema is now set to PostgreSQL by default
- If you need SQLite locally, follow Option 2 above

