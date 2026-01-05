import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import { z } from 'zod';

const appointmentSchema = z.object({
  specialistId: z.string().min(1, 'Specialist ID is required'),
  appointmentDate: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  duration: z.number().min(15).max(480),
  consultationType: z.enum(['initial', 'follow-up', 'check-in']),
  notes: z.string().optional(),
  timezone: z.string().default('UTC'),
});

// Email service function
async function sendAppointmentEmail(
  to: string,
  subject: string,
  type: 'booking' | 'confirmation' | 'rejection' | 'reminder',
  appointmentData: any
) {
  try {
    // In production, integrate with SendGrid, AWS SES, or similar
    // For now, we'll log it. You can replace with actual email service
    console.log(`Email sent to ${to}: ${subject}`, appointmentData);

    // Example structure for email service integration:
    // await emailService.send({
    //   to,
    //   subject,
    //   template: type,
    //   data: appointmentData,
    // });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const validatedData = appointmentSchema.parse(body);

    // Get specialist details
    const specialist = await User.findById(validatedData.specialistId).select(
      'name email role'
    );
    if (!specialist || specialist.role !== 'admin') {
      return NextResponse.json(
        { error: 'Specialist not found' },
        { status: 404 }
      );
    }

    // Get user details
    const user = await User.findById(session.user.id).select('name email');

    // Check for conflicting appointments
    const appointmentDate = new Date(validatedData.appointmentDate);
    const conflictingAppointment = await Appointment.findOne({
      specialistId: validatedData.specialistId,
      appointmentDate: {
        $gte: appointmentDate,
        $lt: new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { $in: ['confirmed', 'pending'] },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        {
          error:
            'Specialist has a conflicting appointment at that time. Please choose another time.',
        },
        { status: 409 }
      );
    }

    const appointment = await Appointment.create({
      userId: session.user.id,
      userName: user.name,
      userEmail: user.email,
      specialistId: validatedData.specialistId,
      specialistName: specialist.name,
      specialistEmail: specialist.email,
      appointmentDate: appointmentDate,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      duration: validatedData.duration,
      consultationType: validatedData.consultationType,
      notes: validatedData.notes || '',
      timezone: validatedData.timezone,
      status: 'pending',
    });

    // Send notification emails
    await sendAppointmentEmail(
      specialist.email,
      'New Appointment Request',
      'booking',
      {
        userName: user.name,
        appointmentDate: appointmentDate.toDateString(),
        startTime: validatedData.startTime,
        consultationType: validatedData.consultationType,
        notes: validatedData.notes,
      }
    );

    await sendAppointmentEmail(
      user.email,
      'Appointment Request Submitted',
      'booking',
      {
        specialistName: specialist.name,
        appointmentDate: appointmentDate.toDateString(),
        startTime: validatedData.startTime,
      }
    );

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to create appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all'; // all, pending, confirmed, completed, cancelled
    const role = (session.user as any).role;

    let query: any = {};

    // Filter by role
    if (role === 'admin') {
      query.specialistId = session.user.id;
    } else {
      query.userId = session.user.id;
    }

    // Filter by status
    if (filter !== 'all') {
      query.status = filter;
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1 })
      .lean();

    return NextResponse.json({ appointments });
  } catch (error: any) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { appointmentId, status, adminNotes, meetingLink } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'Appointment ID and status are required' },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check authorization - only specialist or user can update
    if (
      appointment.specialistId.toString() !== session.user.id &&
      appointment.userId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update appointment
    appointment.status = status;
    if (adminNotes) appointment.adminNotes = adminNotes;
    if (meetingLink) appointment.meetingLink = meetingLink;

    await appointment.save();

    // Send notification emails based on status
    if (status === 'confirmed') {
      await sendAppointmentEmail(
        appointment.userEmail,
        'Appointment Confirmed',
        'confirmation',
        {
          specialistName: appointment.specialistName,
          appointmentDate: appointment.appointmentDate.toDateString(),
          startTime: appointment.startTime,
          meetingLink: meetingLink,
        }
      );

      await sendAppointmentEmail(
        appointment.specialistEmail,
        'Appointment Confirmed',
        'confirmation',
        {
          userName: appointment.userName,
          appointmentDate: appointment.appointmentDate.toDateString(),
          startTime: appointment.startTime,
        }
      );
    } else if (status === 'rejected') {
      await sendAppointmentEmail(
        appointment.userEmail,
        'Appointment Request Rejected',
        'rejection',
        {
          specialistName: appointment.specialistName,
          reason: adminNotes,
        }
      );
    } else if (status === 'cancelled') {
      await sendAppointmentEmail(
        appointment.specialistEmail,
        'Appointment Cancelled',
        'rejection',
        {
          userName: appointment.userName,
          appointmentDate: appointment.appointmentDate.toDateString(),
        }
      );
    }

    return NextResponse.json({ appointment });
  } catch (error: any) {
    console.error('Failed to update appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const appointmentId = searchParams.get('id');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (appointment.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Appointment.findByIdAndDelete(appointmentId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
