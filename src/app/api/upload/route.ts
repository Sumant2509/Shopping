import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export async function POST(req: NextRequest) {
  try {
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
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      let ext = 'jpg';
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('gif')) ext = 'gif';
      else if (mimeType.includes('svg')) ext = 'svg';

      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const safeBase = (filename || 'mat').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
      const uniqueName = `${safeBase}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      await fs.writeFile(filePath, buffer);
      return NextResponse.json({
        success: true,
        urls: [`/uploads/${uniqueName}`],
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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

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

      let ext = 'jpg';
      if (file.type === 'image/png') ext = 'png';
      else if (file.type === 'image/webp') ext = 'webp';
      else if (file.type === 'image/gif') ext = 'gif';
      else if (file.type === 'image/svg+xml') ext = 'svg';
      else if (file.type === 'image/avif') ext = 'avif';
      else if (file.name.includes('.')) {
        ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      }

      const originalBase = file.name
        .substring(0, file.name.lastIndexOf('.') || file.name.length)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 30);

      const uniqueName = `mat-${originalBase || 'img'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(filePath, buffer);

      savedUrls.push(`/uploads/${uniqueName}`);
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
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url || !url.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Invalid file target for deletion' }, { status: 400 });
    }

    const filename = path.basename(url);
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    try {
      await fs.unlink(filePath);
    } catch {
      // File might already be gone, ignore
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to remove image' }, { status: 500 });
  }
}
