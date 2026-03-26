import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, photos } = body;

    if (!projectName || !photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json({ error: 'Missing projectName or photos' }, { status: 400 });
    }

    // Try Google Drive upload
    let driveAvailable = false;
    let folderId = '';
    let folderLink = '';
    const uploaded: Array<{ url: string; category: string; fileName: string }> = [];

    try {
      const { createProjectFolder, uploadPhotoToFolder } = await import('@/lib/googleDrive');
      const result = await createProjectFolder(projectName);
      folderId = result.folderId;
      folderLink = `https://drive.google.com/drive/folders/${folderId}`;
      
      for (const photo of photos) {
        const targetFolder = result.subfolders[photo.category] || result.subfolders['existing'];
        const uploadResult = await uploadPhotoToFolder(targetFolder, photo.fileName, photo.mimeType, photo.base64);
        uploaded.push({
          url: uploadResult.webViewLink,
          category: photo.category,
          fileName: photo.fileName,
        });
      }
      driveAvailable = true;
    } catch (driveErr: any) {
      console.warn('Google Drive upload skipped:', driveErr.message);
      // Photos are still in browser memory for Claude Vision analysis
      for (const photo of photos) {
        uploaded.push({
          url: '',
          category: photo.category,
          fileName: photo.fileName,
        });
      }
    }

    return NextResponse.json({
      success: true,
      folderId,
      folderLink,
      uploaded,
      driveAvailable,
      photoCount: photos.length,
    });
  } catch (error: any) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process photos' },
      { status: 500 }
    );
  }
}
