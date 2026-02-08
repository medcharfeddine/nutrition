import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Content from '@/models/Content';
import Category from '@/models/Category';
import { z } from 'zod';

const contentSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caracteres'),
  type: z.enum(['video', 'post', 'infographic']),
  description: z.string().min(10, 'La description doit contenir au moins 10 caracteres'),
  mediaUrl: z.string().url('URL invalide'),
  content: z.string().optional(),
  category: z.string().optional(), // Allow any string that will be validated against database categories
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let query: any = {};
    if (category) {
      query.category = category;
    }

    const contents = await Content.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ contents });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise. Acces administrateur requis.' }, { status: 403 });
    }

    const body = await req.json();

    const validatedData = contentSchema.safeParse(body);

    if (!validatedData.success) {
      const errorMessage = validatedData.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate category exists in database if provided
    if (validatedData.data.category) {
      const categoryExists = await Category.findOne({
        $or: [
          { slug: validatedData.data.category },
          { _id: validatedData.data.category }
        ]
      });

      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Categorie invalide. Veuillez choisir une categorie existante.' },
          { status: 400 }
        );
      }

      // Store the slug for consistent filtering
      validatedData.data.category = categoryExists.slug;
    }

    const content = await Content.create(validatedData.data);

    return NextResponse.json(
      { message: 'Contenu cree avec succes', content },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise. Acces administrateur requis.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('id');

    if (!contentId) {
      return NextResponse.json({ error: 'ID de contenu requis' }, { status: 400 });
    }

    const body = await req.json();

    const validatedData = contentSchema.partial().safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate category exists in database if provided
    if (validatedData.data.category) {
      const categoryExists = await Category.findOne({
        $or: [
          { slug: validatedData.data.category },
          { _id: validatedData.data.category }
        ]
      });

      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Categorie invalide. Veuillez choisir une categorie existante.' },
          { status: 400 }
        );
      }

      // Store the slug for consistent filtering
      validatedData.data.category = categoryExists.slug;
    }

    const content = await Content.findByIdAndUpdate(
      contentId,
      validatedData.data,
      { new: true }
    );

    return NextResponse.json({ message: 'Contenu mis a jour avec succes', content });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise. Acces administrateur requis.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('id');

    if (!contentId) {
      return NextResponse.json({ error: 'ID de contenu requis' }, { status: 400 });
    }

    await connectDB();

    await Content.findByIdAndDelete(contentId);

    return NextResponse.json({ message: 'Contenu supprime avec succes' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
