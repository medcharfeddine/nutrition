import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';

// Get available time slots for a specialist on a specific date
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const specialistId = searchParams.get('specialistId');
    const dateStr = searchParams.get('date');

    if (!specialistId || !dateStr) {
      return NextResponse.json(
        { error: 'Specialist ID and date are required' },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get booked appointments for this specialist on this date
    const bookedAppointments = await Appointment.find({
      specialistId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ['confirmed', 'pending'] },
    }).lean();

    // Default working hours: 9 AM to 5 PM, 1 hour slots
    const workingHours = {
      start: 9,
      end: 17,
      slotDuration: 60, // minutes
    };

    const availableSlots: string[] = [];
    const bookedTimes = new Set(
      bookedAppointments.map((apt) => apt.startTime)
    );

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      const timeStr = `${String(hour).padStart(2, '0')}:00`;
      if (!bookedTimes.has(timeStr)) {
        availableSlots.push(timeStr);
      }
    }

    return NextResponse.json({ availableSlots, bookedAppointments });
  } catch (error: any) {
    console.error('Failed to fetch availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
