import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'user';
  recipientId: string;
  recipientName: string;
  recipientRole: 'admin' | 'user';
  content: string;
  conversationId: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['admin', 'user'],
      required: true,
    },
    recipientId: {
      type: String,
      required: true,
      index: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'user'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
