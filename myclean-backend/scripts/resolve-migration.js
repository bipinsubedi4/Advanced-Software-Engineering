#!/usr/bin/env node
/**
 * Script to resolve failed Prisma migrations
 * Usage: node scripts/resolve-migration.js
 */

const { execSync } = require('child_process');

console.log('🔧 Resolving failed Prisma migration...\n');

try {
  // Mark the failed migration as rolled back
  console.log('📝 Marking failed migration as rolled back...');
  execSync('npx prisma migrate resolve --rolled-back 20251106045209_init', {
    stdio: 'inherit'
  });
  console.log('✅ Migration marked as rolled back\n');

  // Push schema directly to database
  console.log('📊 Pushing schema to database...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit'
  });
  console.log('✅ Schema pushed successfully\n');

  // Generate Prisma Client
  console.log('🔨 Generating Prisma Client...');
  execSync('npx prisma generate', {
    stdio: 'inherit'
  });
  console.log('✅ Prisma Client generated\n');

  console.log('🎉 Migration resolved successfully!');
  console.log('💡 You can now seed the database with: npm run seed');
} catch (error) {
  console.error('❌ Error resolving migration:', error.message);
  console.log('\n💡 Try running these commands manually:');
  console.log('   npx prisma migrate resolve --rolled-back 20251106045209_init');
  console.log('   npx prisma db push --accept-data-loss');
  console.log('   npx prisma generate');
  process.exit(1);
}

