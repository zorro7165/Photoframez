const { execSync } = require('child_process');

try {
  console.log('Starting custom build script...');
  
  console.log('Running: prisma generate');
  execSync('npx prisma generate', { stdio: 'inherit' });

  if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL environment variable detected.');
    console.log('Running: prisma db push');
    execSync('npx prisma db push', { stdio: 'inherit' });

    console.log('Running: prisma seed');
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
  } else {
    console.warn('WARNING: DATABASE_URL environment variable is not defined.');
    console.warn('Skipping prisma db push and seed script. Production build will compile successfully.');
  }

  console.log('Running: next build');
  execSync('npx next build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Custom build script failed with error:', error);
  process.exit(1);
}
