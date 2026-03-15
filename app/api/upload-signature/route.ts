import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { folder, resource_type } = await req.json();

    if (!folder || !resource_type) {
      return NextResponse.json(
        { error: 'Parametres manquants: folder, resource_type' },
        { status: 400 }
      );
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiSecret) {
      console.error('Cloudinary configuration missing');
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Only these parameters are signed
    const paramsToSign: { [key: string]: any } = {
      folder,
      public_id: publicId,
      timestamp,
    };

    // Convert to query string format and sort
    const params = Object.entries(paramsToSign)
      .sort()
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Sign the params
    const signature = crypto
      .createHash('sha1')
      .update(params + apiSecret)
      .digest('hex');

    return NextResponse.json(
      {
        signature,
        timestamp,
        cloudName,
        publicId,
        apiKey: process.env.CLOUDINARY_API_KEY,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signature generation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la generation de la signature' },
      { status: 500 }
    );
  }
}
