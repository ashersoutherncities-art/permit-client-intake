// Google Drive Integration for Photo Storage
// Creates project folders with subfolders for photo categories

import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Parent folder for all permit intake projects (optional)
const PARENT_FOLDER_ID = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || '';

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentials) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured');

  const parsed = JSON.parse(credentials);
  return new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: SCOPES,
  });
}

function getDrive() {
  const auth = getAuth();
  return google.drive({ version: 'v3', auth });
}

export async function createProjectFolder(projectName: string): Promise<{
  folderId: string;
  subfolders: Record<string, string>;
}> {
  const drive = getDrive();

  // Create main project folder
  const folderRes = await drive.files.create({
    requestBody: {
      name: projectName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: PARENT_FOLDER_ID ? [PARENT_FOLDER_ID] : undefined,
    },
    fields: 'id',
  });

  const folderId = folderRes.data.id!;

  // Create subfolders: existing, damage, reference
  const subfolderNames = ['existing', 'damage', 'reference'];
  const subfolders: Record<string, string> = {};

  for (const name of subfolderNames) {
    const subRes = await drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId],
      },
      fields: 'id',
    });
    subfolders[name] = subRes.data.id!;
  }

  // Make folder accessible via link
  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return { folderId, subfolders };
}

export async function uploadPhotoToFolder(
  folderId: string,
  fileName: string,
  mimeType: string,
  base64Data: string
): Promise<{ fileId: string; webViewLink: string }> {
  const drive = getDrive();

  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, 'base64');

  const { Readable } = await import('stream');
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink, webContentLink',
  });

  return {
    fileId: res.data.id!,
    webViewLink: res.data.webViewLink || `https://drive.google.com/file/d/${res.data.id}/view`,
  };
}

export async function getPhotoUrlsFromFolder(folderId: string): Promise<
  Array<{ id: string; name: string; webViewLink: string; mimeType: string }>
> {
  const drive = getDrive();

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
    fields: 'files(id, name, webViewLink, mimeType)',
    orderBy: 'createdTime',
  });

  return (res.data.files || []).map((f) => ({
    id: f.id!,
    name: f.name!,
    webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
    mimeType: f.mimeType!,
  }));
}
