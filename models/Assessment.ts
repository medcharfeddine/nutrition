import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  
  // Section 1: Identification
  fullName: string;
  dateOfBirth: string;
  gender: string;
  region: string;
  phoneNumber: string;
  height: string;
  weight: string;
  
  // Section 2: Mode de Vie
  smoking: string;
  alcoholConsumption: string;
  sleepHours?: string;
  practicesPhysicalActivity: string;
  
  // Section 3: Physical Activity
  physicalActivityType?: string;
  physicalActivityFrequency?: string;
  
  // Section 4: Eating Habits
  mealsPerDay: string;
  snacksBetweenMeals: string;
  
  // Section 5: Diabetes Management
  diabetesType: string;
  diabetesDuration: string;
  diabeticTreatment: string;
  isDiabetic?: string; // Legacy field - kept for backward compatibility
  associatedDiseases?: string[];
  foodAllergiesIntolerances?: string[];
  
  // Section 6: Objectives
  objectives?: string[];
  
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
    // Section 1: Identification
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
    phoneNumber: {
      type: String,
      required: true,
    },
    height: {
      type: String,
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
    // Section 2: Mode de Vie
    smoking: {
      type: String,
      required: true,
    },
    alcoholConsumption: {
      type: String,
      required: true,
    },
    sleepHours: String,
    practicesPhysicalActivity: {
      type: String,
      required: true,
    },
    // Section 3: Physical Activity
    physicalActivityType: String,
    physicalActivityFrequency: String,
    // Section 4: Eating Habits
    mealsPerDay: {
      type: String,
      required: true,
    },
    snacksBetweenMeals: {
      type: String,
      required: true,
    },
    // Section 5: Diabetes Management
    diabetesType: {
      type: String,
      required: true,
    },
    diabetesDuration: {
      type: String,
      required: true,
    },
    diabeticTreatment: {
      type: String,
      required: true,
    },
    isDiabetic: {
      type: String,
      default: 'yes', // Default to 'yes' for backward compatibility
    },
    associatedDiseases: [String],
    foodAllergiesIntolerances: [String],
    // Section 6: Objectives
    objectives: [String],
  },
  {
    timestamps: true,
  }
);

const Assessment = (mongoose.models?.Assessment as any) || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
export default Assessment;
