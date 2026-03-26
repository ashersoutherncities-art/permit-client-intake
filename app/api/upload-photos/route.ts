import { NextRequest, NextResponse } from 'next/server';
import { createProjectFolder, uploadPhotoToFolder } from '@/lib/googleDrive';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, photos } = body;

    if (!projectName || !photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json({ error: 'Missing projectName or photos' }, { status: 400 });
    }

    // Create project folder structure
    const { folderId, subfolders } = await createProjectFolder(projectName);

    // Upload each photo to the appropriate subfolder
    const uploaded: Array<{
      fileId: string;
      webViewLink: string;
      category: string;
      fileName: string;
    }> = [];

    for (const photo of photos) {
      const { base64, mimeType, category, fileName } = photo;
      const targetFolder = subfolders[category] || subfolders['existing'];

      const result = await uploadPhotoToFolder(targetFolder, fileName, mimeType, base64);
      uploaded.push({
        ...result,
        category,
        fileName,
      });
    }

    return NextResponse.json({
      success: true,
      folderId,
      subfolders,
      uploaded,
      folderLink: `https://drive.google.com/drive/folders/${folderId}`,
    });
  } catch (error: any) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload photos' },
      { status: 500 }
    );
  }
}
