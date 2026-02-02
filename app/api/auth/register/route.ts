import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
  email: z.string().email('E-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email: validatedData.data.email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail deja utilise' },
        { status: 400 }
      );
    }

    const user = await User.create({
      name: validatedData.data.name,
      email: validatedData.data.email,
      password: validatedData.data.password,
      role: 'user',
    });

    return NextResponse.json(
      { message: 'Utilisateur enregistre avec succes', user: { id: user._id.toString(), email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
