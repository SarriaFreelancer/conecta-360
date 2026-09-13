import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'downloads', 'conecta360.apk');

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Archivo APK no encontrado', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="conecta360.apk"',
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'no-cache',
    },
  });
}
