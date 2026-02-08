import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Assessment from '@/models/Assessment';
import { z } from 'zod';

const assessmentSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
  dateOfBirth: z.string(),
  gender: z.string().min(1, 'Le sexe est requis'),
  region: z.string().min(1, 'La région est requise'),
  phoneNumber: z.string().optional(),
  height: z.string().min(1, 'La taille est requise'),
  weight: z.string().min(1, 'Le poids est requis'),
  physicalActivityLevel: z.string().min(1, 'Le niveau d\'activité est requis'),
  smoking: z.string().min(1, 'Veuillez repondre'),
  alcoholConsumption: z.string().min(1, 'Veuillez repondre'),
  sleepHours: z.string().min(1, 'Veuillez repondre'),
  mealsPerDay: z.string().min(1, 'Veuillez repondre'),
  chronicDiseases: z.array(z.string()).optional(),
  medicalTreatment: z.string().optional(),
  allergiesIntolerances: z.array(z.string()).optional(),
  otherAllergies: z.string().optional(),
  mainObjective: z.string().optional(),
  otherObjective: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    // Allow assessment submission for newly registered users (with email verification)
    // or authenticated users
    let userId: string;
    let userEmail: string;
    let userName: string;

    if (session && session.user) {
      // Authenticated user
      userId = session.user.id;
      userEmail = session.user.email || '';
      userName = session.user.name || '';
    } else if (body.userId && body.userEmail) {
      // Newly registered user (passed during signup)
      userId = body.userId;
      userEmail = body.userEmail;
      userName = body.fullName;
    } else {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const validatedData = assessmentSchema.safeParse(body);

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

    const assessment = await Assessment.create({
      userId,
      userName,
      userEmail,
      ...validatedData.data,
    });

    // Mark user as having completed assessment
    if (session && session.user && session.user.id) {
      await User.findByIdAndUpdate(
        session.user.id,
        { hasCompletedAssessment: true },
        { new: true }
      );
    } else {
      // For newly registered users, update by ID passed in request
      await User.findByIdAndUpdate(
        userId as string,
        { hasCompletedAssessment: true },
        { new: true }
      );
    }

    return NextResponse.json(
      { message: 'Evaluation enregistree avec succes', assessment },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    // Only admins can view all assessments
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise. Acces administrateur requis.' }, { status: 403 });
    }

    await connectDB();

    const assessments = await Assessment.find().sort({ createdAt: -1 });

    return NextResponse.json({ assessments });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
