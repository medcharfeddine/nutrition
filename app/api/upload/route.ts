import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'image' or 'video'

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedTypes = fileType === 'video' ? validVideoTypes : validImageTypes;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier invalide. Accepte: ${fileType === 'video' ? 'MP4, WebM, MOV' : 'JPEG, PNG, GIF, WebP'}` },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = fileType === 'video' ? 500 * 1024 * 1024 : 50 * 1024 * 1024; // 500MB for video, 50MB for image
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Max: ${fileType === 'video' ? '500MB' : '50MB'}` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    return new Promise<Response>((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: fileType === 'video' ? 'video' : 'auto',
          folder: fileType === 'video' ? 'nutrition-app/videos' : 'nutrition-app/images',
          public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          quality: 'auto:eco',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) {
            resolve(
              NextResponse.json(
                { error: 'Erreur lors du téléchargement du fichier' },
                { status: 500 }
              )
            );
          } else {
            resolve(
              NextResponse.json(
                {
                  message: 'Fichier téléchargé avec succès',
                  url: result?.secure_url,
                  publicId: result?.public_id,
                },
                { status: 201 }
              )
            );
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Delete file from Cloudinary
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    // Only admins can delete
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorise. Acces administrateur requis.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({ error: 'ID public requis' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json(
      { message: 'Fichier supprime avec succes', result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
