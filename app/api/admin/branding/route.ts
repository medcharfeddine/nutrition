import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Branding from '@/models/Branding';
import { z } from 'zod';

const brandingSchema = z.object({
  siteName: z.string().min(1, 'Le nom du site est requis'),
  siteDescription: z.string().min(5, 'La description doit contenir au moins 5 caracteres'),
  logoUrl: z.string().optional().nullable(),
  logoPublicId: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  faviconPublicId: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

// GET branding settings (public)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let branding = await Branding.findOne();

    if (!branding) {
      branding = await Branding.create({
        siteName: 'NutriÉd',
        siteDescription: 'Plateforme de nutrition personnalisée',
      });
    }

    return NextResponse.json({ branding });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// PUT to update branding (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorise. Acces administrateur requis.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    const validatedData = brandingSchema.safeParse(body);

    if (!validatedData.success) {
      const errorMessage = validatedData.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    await connectDB();

    let branding = await Branding.findOne();

    if (!branding) {
      branding = await Branding.create({
        ...validatedData.data,
        updatedBy: session.user.id,
      });
    } else {
      branding = await Branding.findOneAndUpdate(
        {},
        {
          ...validatedData.data,
          updatedBy: session.user.id,
        },
        { new: true }
      );
    }

    return NextResponse.json(
      { message: 'Branding updated successfully', branding },
      { status: 200 }
    );
  } catch (error) {
    console.error('Branding update error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
