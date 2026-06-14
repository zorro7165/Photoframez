import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialize AdmZip with the buffer
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    // Filter for image files
    const imageEntries = zipEntries.filter(entry => {
      if (entry.isDirectory) return false;
      const ext = path.extname(entry.entryName).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    });

    if (imageEntries.length === 0) {
      return NextResponse.json({ error: 'No valid image files found in ZIP (supported: .jpg, .jpeg, .png)' }, { status: 400 });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sourceDir = 'D:\\AI\\ag_photo_scraper\\downloads\\combined_wallpapers';
    const hasSourceDir = fs.existsSync(sourceDir);

    const importedFrames = [];

    // Process each image sequentially
    for (const entry of imageEntries) {
      // Find the latest frame ID from DB
      const latestFrame = await prisma.image.findFirst({
        orderBy: { frameId: 'desc' }
      });

      let nextFrameId = 'FRM1001';
      if (latestFrame) {
        const match = latestFrame.frameId.match(/FRM(\d+)/);
        if (match) {
          const nextNum = parseInt(match[1], 10) + 1;
          nextFrameId = `FRM${nextNum}`;
        }
      }

      const ext = path.extname(entry.entryName).toLowerCase();
      const newFileName = `${nextFrameId}${ext}`;
      const destPath = path.join(uploadsDir, newFileName);

      // Extract image content buffer
      const imageBuffer = entry.getData();

      // Write to public uploads folder
      fs.writeFileSync(destPath, imageBuffer);

      // If sourceDir exists, write there too to keep them in sync
      if (hasSourceDir) {
        fs.writeFileSync(path.join(sourceDir, newFileName), imageBuffer);
      }

      // Insert into Database
      const originalName = path.basename(entry.entryName, ext);
      const title = `Premium Wall Art - ${nextFrameId}`;
      const category = 'Instagram Art';
      const tags = 'instagram, wallpaper, hd, frame, art, imported';
      const description = `A premium quality photo frame featuring high-definition artwork, imported directly from Instagram (Source: ${originalName}).`;

      const newFrame = await prisma.image.create({
        data: {
          frameId: nextFrameId,
          title,
          description,
          imageUrl: `/uploads/${newFileName}`,
          thumbnailUrl: `/uploads/${newFileName}`,
          category,
          tags
        }
      });

      importedFrames.push(newFrame);
    }

    // Now, regenerate the public wallpapers.zip containing all files in uploads folder
    const allFiles = fs.readdirSync(uploadsDir).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    });

    const newZip = new AdmZip();
    for (const f of allFiles) {
      newZip.addLocalFile(path.join(uploadsDir, f), '', f);
    }

    // Save the new zip to public downloads
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    newZip.writeZip(path.join(downloadsDir, 'wallpapers.zip'));

    // Save the new zip also to source downloads
    if (hasSourceDir) {
      newZip.writeZip(path.join('D:\\AI\\ag_photo_scraper\\downloads', 'wallpapers.zip'));
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedFrames.length} designs.`,
      imported: importedFrames.map(f => f.frameId)
    });

  } catch (error) {
    console.error('Error handling zip upload:', error);
    return NextResponse.json({ error: 'Failed to process and import ZIP file' }, { status: 500 });
  }
}
