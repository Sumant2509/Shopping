import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { getMongoDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
]);

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg']);
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  const admin = await verifyAdminToken(token);
  return Boolean(admin);
}

// Helper to save image to MongoDB Atlas & optionally local cache
async function persistImage(
  buffer: Buffer,
  uniqueName: string,
  mimeType: string,
  originalFilename: string
): Promise<string> {
  let savedToMongo = false;

  // 1. Try persisting to MongoDB Atlas (Persistent Cloud Storage)
  try {
    const mongo = await getMongoDb();
    if (mongo) {
      await mongo.collection('uploaded_images').updateOne(
        { id: uniqueName },
        {
          $set: {
            id: uniqueName,
            filename: originalFilename,
            mimeType,
            data: buffer.toString('base64'),
            size: buffer.length,
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
      savedToMongo = true;
    }
  } catch (mongoErr) {
    console.warn('[Upload API] MongoDB save warning:', mongoErr);
  }

  // 2. Try saving to local filesystem if writable (dev environment)
  let savedToLocal = false;
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, uniqueName);
    await fs.writeFile(filePath, buffer);
    savedToLocal = true;
  } catch {
    // Expected on read-only serverless filesystems (e.g. Vercel /var/task)
  }

  if (savedToMongo) {
    return `/api/images/${encodeURIComponent(uniqueName)}`;
  }

  if (savedToLocal) {
    return `/uploads/${uniqueName}`;
  }

  // 3. Fallback for serverless if DB is temporarily unavailable: Inline Base64 Data URL
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Admin Authentication
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin credentials required for file upload' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';

    // Handle JSON payload with base64 data URL
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { dataUrl, filename } = body;
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        return NextResponse.json({ error: 'Invalid image data URL' }, { status: 400 });
      }

      const matches = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: 'Malformed base64 image data' }, { status: 400 });
      }

      const mimeType = matches[1];
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return NextResponse.json({ error: 'Unacceptable image format' }, { status: 400 });
      }

      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File size exceeds maximum allowed 15MB' }, { status: 400 });
      }

      let ext = 'jpg';
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('gif')) ext = 'gif';
      else if (mimeType.includes('svg')) ext = 'svg';
      else if (mimeType.includes('avif')) ext = 'avif';

      const safeBase = path.basename(filename || 'mat').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
      const uniqueName = `${safeBase}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const url = await persistImage(buffer, uniqueName, mimeType, filename || uniqueName);

      return NextResponse.json({
        success: true,
        urls: [url],
      });
    }

    // Handle standard FormData upload
    const formData = await req.formData();
    const files = [
      ...formData.getAll('files'),
      ...formData.getAll('file'),
    ].filter((item): item is File => item instanceof File && item.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const savedUrls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `File "${file.name}" is not an accepted image format (JPG, PNG, WEBP, GIF, SVG, AVIF)` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the maximum allowed size of 15MB` },
          { status: 400 }
        );
      }

      const safeName = path.basename(file.name);
      let ext = 'jpg';
      if (safeName.includes('.')) {
        const extracted = safeName.split('.').pop()?.toLowerCase() || 'jpg';
        if (ALLOWED_EXTENSIONS.has(extracted)) {
          ext = extracted;
        }
      }

      const originalBase = safeName
        .substring(0, safeName.lastIndexOf('.') || safeName.length)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 30);

      const uniqueName = `mat-${originalBase || 'img'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const url = await persistImage(buffer, uniqueName, file.type, file.name);
      savedUrls.push(url);
    }

    return NextResponse.json({
      success: true,
      urls: savedUrls,
    });
  } catch (error: any) {
    console.error('[Upload API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error while processing uploaded images' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin credentials required to delete files' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'Invalid file target for deletion' }, { status: 400 });
    }

    const filename = path.basename(url);

    // Delete from MongoDB Atlas
    try {
      const mongo = await getMongoDb();
      if (mongo) {
        await mongo.collection('uploaded_images').deleteOne({ id: filename });
      }
    } catch {}

    // Delete from local filesystem if exists
    try {
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
      await fs.unlink(filePath);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to remove image' }, { status: 500 });
  }
}
