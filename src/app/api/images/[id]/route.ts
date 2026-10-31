import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params?.id;
    if (!rawId) {
      return new NextResponse('Missing image ID', { status: 400 });
    }

    const imageId = decodeURIComponent(rawId);

    // 1. Try finding image in MongoDB Atlas
    try {
      const mongo = await getMongoDb();
      if (mongo) {
        const doc = await mongo.collection('uploaded_images').findOne({ id: imageId });
        if (doc && doc.data) {
          const buffer = Buffer.from(doc.data, 'base64');
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': doc.mimeType || 'image/jpeg',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('[Image Serve] MongoDB lookup warning:', dbErr);
    }

    // 2. Fallback: Check local public/uploads directory
    try {
      const localPath = path.join(process.cwd(), 'public', 'uploads', imageId);
      const buffer = await fs.readFile(localPath);
      let contentType = 'image/jpeg';
      if (imageId.endsWith('.png')) contentType = 'image/png';
      else if (imageId.endsWith('.webp')) contentType = 'image/webp';
      else if (imageId.endsWith('.svg')) contentType = 'image/svg+xml';
      else if (imageId.endsWith('.gif')) contentType = 'image/gif';

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {}

    return new NextResponse('Image not found', { status: 404 });
  } catch (err: any) {
    console.error('[Image Serve Error]:', err);
    return new NextResponse('Error loading image', { status: 500 });
  }
}
