import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  region: string;
  phoneNumber?: string;
  height: string;
  weight: string;
  physicalActivityLevel: string;
  smoking: string;
  alcoholConsumption: string;
  sleepHours: string;
  mealsPerDay: string;
  chronicDiseases?: string[];
  medicalTreatment: string;
  allergiesIntolerances?: string[];
  otherAllergies?: string;
  mainObjective: string;
  otherObjective?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema: Schema<IAssessment> = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    phoneNumber: String,
    height: {
      type: String,
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
    physicalActivityLevel: {
      type: String,
      required: true,
    },
    smoking: {
      type: String,
      required: true,
    },
    alcoholConsumption: {
      type: String,
      required: true,
    },
    sleepHours: {
      type: String,
      required: true,
    },
    mealsPerDay: {
      type: String,
      required: true,
    },
    chronicDiseases: [String],
    medicalTreatment: {
      type: String,
      required: true,
    },
    allergiesIntolerances: [String],
    otherAllergies: String,
    mainObjective: {
      type: String,
      required: true,
    },
    otherObjective: String,
  },
  {
    timestamps: true,
  }
);

const Assessment = (mongoose.models?.Assessment as any) || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
export default Assessment;
