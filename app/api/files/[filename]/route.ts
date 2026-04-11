import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    
    // Ensure filename doesn't contain directory traversal sequences
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), '.storage', 'uploads', safeFilename);

    try {
      const fileBuffer = await fs.readFile(filePath);
      
      const ext = path.extname(safeFilename).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${safeFilename}"`,
        },
      });
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to access file' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    
    // Attempt deletion
    const { storage } = await import('@/lib/storage');
    // Using string matching to mock how URL would look like
    await storage.deleteFile(`/api/files/${filename}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
