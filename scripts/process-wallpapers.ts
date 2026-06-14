import prisma from '../src/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';

const SOURCE_DIR = 'D:\\AI\\ag_photo_scraper\\downloads\\combined_wallpapers';
const DEST_DIR = 'd:\\AI\\AG\\public\\uploads';
const ZIP_DEST_DIR = 'd:\\AI\\AG\\public\\downloads';

async function main() {
  console.log('Starting wallpaper processing...');

  // Create directories if they don't exist
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }
  if (!fs.existsSync(ZIP_DEST_DIR)) {
    fs.mkdirSync(ZIP_DEST_DIR, { recursive: true });
  }

  // Read files from source directory
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory does not exist: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SOURCE_DIR)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    })
    .sort(); // Sort alphabetically

  console.log(`Found ${files.length} images to process.`);

  const zip = new AdmZip();
  const dbData = [];

  for (let i = 0; i < files.length; i++) {
    const originalFile = files[i];
    const originalPath = path.join(SOURCE_DIR, originalFile);
    
    // Check if the file is already renamed (e.g. starting with FRM)
    let frameId = '';
    const match = originalFile.match(/^(FRM\d+)\.(jpg|jpeg|png)$/i);
    const ext = path.extname(originalFile).toLowerCase();
    
    if (match) {
      frameId = match[1].toUpperCase();
    } else {
      const frameNum = 1001 + i;
      frameId = `FRM${frameNum}`;
    }

    const newFileName = `${frameId}${ext}`;
    const newSourcePath = path.join(SOURCE_DIR, newFileName);
    const newDestPath = path.join(DEST_DIR, newFileName);

    // 1. Rename in-place in SOURCE_DIR if it's not already renamed
    if (originalPath !== newSourcePath) {
      console.log(`Renaming: ${originalFile} -> ${newFileName}`);
      fs.renameSync(originalPath, newSourcePath);
    } else {
      console.log(`Already renamed: ${newFileName}`);
    }

    // 2. Copy to DEST_DIR (website public uploads)
    fs.copyFileSync(newSourcePath, newDestPath);

    // 3. Add to ZIP
    zip.addLocalFile(newSourcePath, '', newFileName);

    // 4. Prepare database data
    const originalBase = originalFile.replace(/\.[^/.]+$/, "");
    const title = `Premium Wall Art - ${frameId}`;
    const category = 'Instagram Art';
    const tags = 'instagram, wallpaper, hd, frame, art';
    const description = `A premium quality photo frame featuring high-definition artwork, imported directly from Instagram (Source: ${originalBase}).`;

    dbData.push({
      frameId,
      title,
      description,
      imageUrl: `/uploads/${newFileName}`,
      thumbnailUrl: `/uploads/${newFileName}`,
      category,
      tags
    });
  }

  // Write ZIP file
  const zipPath = path.join(ZIP_DEST_DIR, 'wallpapers.zip');
  console.log(`Writing ZIP file to ${zipPath}...`);
  zip.writeZip(zipPath);

  // Write ZIP file also to the source downloads folder for convenience
  const zipPathSource = 'D:\\AI\\ag_photo_scraper\\downloads\\wallpapers.zip';
  console.log(`Writing ZIP file to ${zipPathSource}...`);
  zip.writeZip(zipPathSource);

  // 5. Update Database
  console.log('Updating database entries...');
  await prisma.image.deleteMany({});
  
  for (const img of dbData) {
    await prisma.image.create({
      data: img
    });
  }

  console.log(`Database updated! Seeded ${dbData.length} frames.`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error in script:', err);
  process.exit(1);
});
