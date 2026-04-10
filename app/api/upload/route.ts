import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier n'a été fourni" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const newFilename = `${uniqueSuffix}-${filename}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // Directoty might already exist, which is fine
    }

    const filePath = path.join(uploadsDir, newFilename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${newFilename}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Erreur lors de l'upload du fichier:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
