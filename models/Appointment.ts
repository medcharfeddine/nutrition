import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  specialistId: mongoose.Types.ObjectId;
  specialistName: string;
  specialistEmail: string;
  appointmentDate: Date;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // in minutes
  consultationType: 'initial' | 'follow-up' | 'check-in';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  notes: string;
  adminNotes: string;
  userNotes?: string;
  specialistNotes?: string;
  timezone: string;
  meetingLink?: string;
  reminderSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: String,
    userEmail: String,
    specialistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    specialistName: String,
    specialistEmail: String,
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 60,
    },
    consultationType: {
      type: String,
      enum: ['initial', 'follow-up', 'check-in'],
      default: 'initial',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
      index: true,
    },
    notes: String,
    adminNotes: String,
    userNotes: String,
    specialistNotes: String,
    timezone: {
      type: String,
      default: 'UTC',
    },
    meetingLink: String,
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Appointment ||
  mongoose.model<IAppointment>('Appointment', appointmentSchema);
