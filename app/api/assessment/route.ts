import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Assessment from '@/models/Assessment';
import { z } from 'zod';

const assessmentSchema = z.object({
  // Section 1: Identification
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
  dateOfBirth: z.string().min(1, 'La date de naissance est requise'),
  gender: z.string().min(1, 'Le sexe est requis'),
  region: z.string().min(1, 'La région est requise'),
  phoneNumber: z.string().min(1, 'Le téléphone est requis'),
  height: z.string().min(1, 'La taille est requise'),
  weight: z.string().min(1, 'Le poids est requis'),

  // Section 2: Mode de Vie
  smoking: z.string().min(1, 'Veuillez répondre à la question sur le tabac'),
  alcoholConsumption: z.string().min(1, 'Veuillez répondre à la question sur l\'alcool'),
  sleepHours: z.string().optional(),
  practicesPhysicalActivity: z.string().min(1, 'Veuillez répondre'),

  // Section 3: Activity Type
  physicalActivityType: z.string().optional(),
  physicalActivityFrequency: z.string().optional(),

  // Section 4: Eating Habits
  mealsPerDay: z.string().min(1, 'Le nombre de repas est requis'),
  snacksBetweenMeals: z.string().min(1, 'Veuillez répondre'),

  // Section 5: Diabetes
  isDiabetic: z.string().default('yes'), // Legacy field - backward compatibility
  diabetesType: z.string().min(1, 'Le type de diabète est requis'),
  diabetesDuration: z.string().min(1, 'La durée du diabète est requise'),
  diabeticTreatment: z.string().min(1, 'Le traitement antidiabétique est requis'),
  associatedDiseases: z.array(z.string()).optional(),
  foodAllergiesIntolerances: z.array(z.string()).optional(),

  // Section 6: Objectives
  objectives: z.array(z.string()).optional(),
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
    console.error('Assessment submission error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
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
    console.error('Assessment GET error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
