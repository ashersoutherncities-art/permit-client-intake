import { NextRequest, NextResponse } from 'next/server';
import { analyzePhotos, PhotoInput } from '@/lib/visionAnalysis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photos } = body;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json({ error: 'No photos provided for analysis' }, { status: 400 });
    }

    // Validate photos
    const validPhotos: PhotoInput[] = photos.map((p: any) => ({
      base64: p.base64,
      mimeType: p.mimeType,
      category: p.category || 'existing',
      fileName: p.fileName || 'photo.jpg',
    }));

    if (validPhotos.length > 15) {
      return NextResponse.json({ error: 'Maximum 15 photos allowed' }, { status: 400 });
    }

    const analysis = await analyzePhotos(validPhotos);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Photo analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze photos' },
      { status: 500 }
    );
  }
}
