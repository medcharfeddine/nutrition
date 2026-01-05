import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import ConsultationRequest from '@/models/ConsultationRequest';
import User from '@/models/User';
import { z } from 'zod';

const requestSchema = z.object({
  consultationType: z.enum(['initial', 'follow-up', 'specific-concern']),
  goals: z.string().min(10, 'Please provide at least 10 characters'),
  urgency: z.enum(['low', 'medium', 'high']),
  notes: z.string().optional(),
});

const assignSchema = z.object({
  specialistId: z.string().min(1, 'Specialist ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Check if user already has a pending request
    const existingRequest = await ConsultationRequest.findOne({
      userId: session.user.id,
      status: 'pending',
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending consultation request' },
        { status: 400 }
      );
    }

    const consultationRequest = await ConsultationRequest.create({
      userId: session.user.id,
      userName: session.user.name || 'User',
      userEmail: session.user.email,
      ...validatedData,
    });

    return NextResponse.json(consultationRequest, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to create consultation request:', error);
    return NextResponse.json(
      { error: 'Failed to create consultation request' },
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
    const userRole = (session.user as any).role;

    let requests: any[] = [];

    if (userRole === 'admin') {
      // Admin: get all pending requests
      requests = await ConsultationRequest.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // User: get their own requests
      requests = await ConsultationRequest.find({
        userId: session.user.id,
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Failed to fetch consultation requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { requestId, specialistId, action } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required' },
        { status: 400 }
      );
    }

    const consultationRequest = await ConsultationRequest.findById(requestId);

    if (!consultationRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (action === 'assign') {
      if (!specialistId) {
        return NextResponse.json(
          { error: 'Specialist ID is required' },
          { status: 400 }
        );
      }

      const specialist = await User.findById(specialistId);
      if (!specialist) {
        return NextResponse.json(
          { error: 'Specialist not found' },
          { status: 404 }
        );
      }

      consultationRequest.status = 'assigned';
      consultationRequest.assignedSpecialistId = specialistId;
      consultationRequest.assignedSpecialistName = specialist.name;
    } else if (action === 'reject') {
      const { reason } = body;
      consultationRequest.status = 'rejected';
      consultationRequest.rejectionReason = reason || 'Request rejected';
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    await consultationRequest.save();

    return NextResponse.json(consultationRequest);
  } catch (error: any) {
    console.error('Failed to update consultation request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
