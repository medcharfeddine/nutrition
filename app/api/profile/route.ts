import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const body = await req.json();

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          'profile.age': body.age,
          'profile.gender': body.gender,
          'profile.lifestyle': body.lifestyle,
          'profile.habits': body.habits,
          'profile.diseases': body.diseases,
          'profile.dietaryPreferences': body.dietaryPreferences,
          'profile.calorieGoal': body.calorieGoal,
          'profile.proteinGoal': body.proteinGoal,
          'profile.carbGoal': body.carbGoal,
          'profile.fatGoal': body.fatGoal,
        },
      },
      { new: true }
    );

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
