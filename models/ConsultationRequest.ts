import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultationRequest extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  consultationType: 'initial' | 'follow-up' | 'specific-concern';
  goals: string;
  urgency: 'low' | 'medium' | 'high';
  notes: string;
  status: 'pending' | 'assigned' | 'rejected';
  assignedSpecialistId?: string;
  assignedSpecialistName?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const consultationRequestSchema = new Schema<IConsultationRequest>(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    consultationType: {
      type: String,
      enum: ['initial', 'follow-up', 'specific-concern'],
      required: true,
    },
    goals: { type: String, required: true },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'rejected'],
      default: 'pending',
      index: true,
    },
    assignedSpecialistId: { type: String, index: true },
    assignedSpecialistName: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

const ConsultationRequest =
  mongoose.models.ConsultationRequest ||
  mongoose.model<IConsultationRequest>(
    'ConsultationRequest',
    consultationRequestSchema
  );

export default ConsultationRequest;
