import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';
import { z } from 'zod';

const messageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  content: z.string().min(1, 'Message content is required'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    let recipientId = validatedData.recipientId;
    let recipient;

    // If recipient is "admin", find the first admin user
    if (recipientId === 'admin') {
      recipient = await User.findOne({ role: 'admin' }).select('_id name email');
      if (!recipient) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }
      recipientId = recipient._id.toString();
    } else {
      recipient = await User.findById(recipientId).select('name email');
      if (!recipient) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }
    }

    // Create conversation ID (consistent regardless of message direction)
    const ids = [session.user.id, recipientId].sort();
    const conversationId = `${ids[0]}-${ids[1]}`;

    const message = await Message.create({
      senderId: session.user.id,
      senderName: session.user.name || 'User',
      senderRole: (session.user as any).role || 'user',
      recipientId: recipientId,
      recipientName: recipient.name,
      recipientRole: 'admin',
      content: validatedData.content,
      conversationId,
      isRead: false,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to create message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
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
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');
    const userRole = (session.user as any).role;

    let messages: any[] = [];

    if (userRole === 'admin') {
      // Admin viewing all messages or a specific conversation
      if (conversationId) {
        messages = await Message.find({ conversationId })
          .sort({ createdAt: 1 })
          .lean();
      } else {
        // Get all messages for admin
        messages = await Message.find({
          recipientRole: 'admin',
        })
          .sort({ createdAt: -1 })
          .lean();
      }
    } else if (conversationId) {
      // Get messages for a specific conversation
      messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .lean();

      // Mark messages as read if current user is the recipient
      await Message.updateMany(
        {
          conversationId,
          recipientId: session.user.id,
          isRead: false,
        },
        { isRead: true }
      );
    } else if (userId) {
      // Get all conversations for an admin viewing a specific user
      const ids = [session.user.id, userId].sort();
      const conversationId = `${ids[0]}-${ids[1]}`;

      messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .lean();

      // Mark messages as read
      await Message.updateMany(
        {
          conversationId,
          recipientId: session.user.id,
          isRead: false,
        },
        { isRead: true }
      );
    } else {
      // Get all messages for the current user (all conversations)
      messages = await Message.find({
        $or: [{ senderId: session.user.id }, { recipientId: session.user.id }],
      })
        .sort({ createdAt: 1 })
        .lean();
    }

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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
    const { conversationId, markAsRead } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    if (markAsRead) {
      // Mark all messages in conversation as read for the current user
      const result = await Message.updateMany(
        {
          conversationId,
          recipientId: session.user.id,
          isRead: false,
        },
        { isRead: true }
      );

      return NextResponse.json(
        {
          success: true,
          message: 'Messages marked as read',
          modifiedCount: result.modifiedCount,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'No operation specified' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Failed to update message status:', error);
    return NextResponse.json(
      { error: 'Failed to update message status' },
      { status: 500 }
    );
  }
}
