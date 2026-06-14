import prisma from '../src/lib/prisma';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Seeding database...');

  // 1. Seed Admin User
  const adminUsername = 'admin';
  const adminPassword = 'adminpassword123';
  const passwordHash = hashPassword(adminPassword);

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username: adminUsername }
  });

  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        username: adminUsername,
        passwordHash: passwordHash
      }
    });
    console.log(`Admin user created: username: "${adminUsername}", password: "${adminPassword}"`);
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Seed Images
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  let imagesToSeed: any[] = [];

  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    });

    if (files.length > 0) {
      console.log(`Found ${files.length} uploaded files in public/uploads. Seeding them...`);
      imagesToSeed = files.map(file => {
        const ext = path.extname(file).toLowerCase();
        const frameId = path.basename(file, ext).toUpperCase();
        
        return {
          frameId,
          title: `Premium Wall Art - ${frameId}`,
          description: `A premium quality photo frame featuring high-definition artwork, imported directly from Instagram (Source file: ${file}).`,
          imageUrl: `/uploads/${file}`,
          thumbnailUrl: `/uploads/${file}`,
          category: 'Instagram Art',
          tags: 'instagram, wallpaper, hd, frame, art'
        };
      });
    }
  }

  // Fallback to default unsplash images if no uploads found
  if (imagesToSeed.length === 0) {
    console.log('No uploaded files found in public/uploads. Seeding fallback default images...');
    imagesToSeed = [
      {
        frameId: 'FRM1001',
        title: 'Mountain Sunset Reflections',
        description: 'A breathtaking view of mountain peaks glowing in the sunset, reflected perfectly on a calm alpine lake. Capture the serenity of nature in a premium wooden frame.',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
        category: 'Landscape',
        tags: 'mountain, sunset, lake, nature, reflection'
      },
      {
        frameId: 'FRM1002',
        title: 'Minimalist Ocean Breeze',
        description: 'Clean coastal vibes with soft sandy shorelines and crystal blue ocean waves. Perfect for adding a refreshing, modern coastal theme to your living room.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
        category: 'Coastal',
        tags: 'ocean, minimalist, beach, blue, sand'
      },
      {
        frameId: 'FRM1003',
        title: 'Cyberpunk Alleyway Nights',
        description: 'Vibrant neon signs illuminating a futuristic cityscape alleyway, wet with fresh rainfall. A striking choice for fans of sci-fi, urban photography, and modern neon aesthetics.',
        imageUrl: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=400&q=80',
        category: 'Cyberpunk',
        tags: 'neon, cyberpunk, city, urban, night'
      },
      {
        frameId: 'FRM1004',
        title: 'Serene Forest Canopy',
        description: 'Lush green trees reaching towards the sky, letting warm sunbeams filter through their leaves. Creates a calming, natural sanctuary space in any bedroom or office.',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
        category: 'Nature',
        tags: 'forest, trees, sunshine, green, calmness'
      }
    ];
  }

  // Insert into DB
  for (const imgData of imagesToSeed) {
    const existing = await prisma.image.findUnique({
      where: { frameId: imgData.frameId }
    });

    if (!existing) {
      await prisma.image.create({
        data: imgData
      });
      console.log(`Seeded frame: ${imgData.frameId} - ${imgData.title}`);
    } else {
      console.log(`Frame ${imgData.frameId} already exists in DB.`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  });
