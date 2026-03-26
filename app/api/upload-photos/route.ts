import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, photos } = body;

    if (!projectName || !photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json({ error: 'Missing projectName or photos' }, { status: 400 });
    }

    // Try Google Drive upload
    let driveResult: {
      folderId: string;
      folderLink: string;
      uploaded: Array<{ fileId: string; webViewLink: string; category: string; fileName: string }>;
    } | null = null;

    try {
      const { createProjectFolder, uploadPhotoToFolder } = await import('@/lib/googleDrive');
      
      const { folderId, subfolders } = await createProjectFolder(projectName);

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

      driveResult = {
        folderId,
        folderLink: `https://drive.google.com/drive/folders/${folderId}`,
        uploaded,
      };
    } catch (driveError: any) {
      console.warn('Google Drive upload failed (non-critical):', driveError.message);
      // Return the error detail for debugging
      return NextResponse.json({
        success: true,
        folderId: '',
        folderLink: '',
        uploaded: photos.map((p: any) => ({
          fileId: '',
          webViewLink: '',
          category: p.category,
          fileName: p.fileName,
        })),
        driveAvailable: false,
        driveError: driveError.message,
      });
    }

    return NextResponse.json({
      success: true,
      folderId: driveResult?.folderId || '',
      folderLink: driveResult?.folderLink || '',
      uploaded: driveResult?.uploaded || photos.map((p: any) => ({
        fileId: '',
        webViewLink: '',
        category: p.category,
        fileName: p.fileName,
      })),
      driveAvailable: !!driveResult,
    });
  } catch (error: any) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload photos' },
      { status: 500 }
    );
  }
}
