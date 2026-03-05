import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAssessment extends Document {
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

  // Section 5: Diabetes
  diabetesType: string;
  diabetesDuration: string;
  diabeticTreatment: string;
  associatedDiseases?: string[];
  foodAllergiesIntolerances?: string[];

  // Section 6: Objectives
  objectives?: string[];

  // Legacy fields (kept for backward compatibility)
  physicalActivityLevel?: string;
  medicalTreatment?: string;
  chronicDiseases?: string[];
  allergiesIntolerances?: string[];
  mainObjective?: string;
  otherObjective?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  hasCompletedAssessment?: boolean;
  assessment?: IAssessment;
  profile?: {
    age?: number;
    gender?: string;
    lifestyle?: string;
    habits?: string[];
    diseases?: string[];
    dietaryPreferences?: string[];
    calorieGoal?: number;
    proteinGoal?: number;
    carbGoal?: number;
    fatGoal?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    hasCompletedAssessment: {
      type: Boolean,
      default: false,
    },
    assessment: {
      // Section 2: Identification
      fullName: String,
      dateOfBirth: String,
      gender: String,
      region: String,
      phoneNumber: String,
      height: String,
      weight: String,

      // Section 3: Lifestyle
      lifestyleDescription: String,
      smoking: String,
      alcoholConsumption: String,
      sleepHours: String,
      practicesPhysicalActivity: String,

      // Section 4: Physical Activity
      physicalActivityDescription: String,
      physicalActivityType: String,
      physicalActivityFrequency: String,

      // Section 5: Eating Habits
      dietaryDescription: String,
      mealsPerDay: String,
      snacksBetweenMeals: String,

      // Section 6: Diabetes
      diabetesDescription: String,
      isDiabetic: String,
      diabetesType: String,
      diabetesDuration: String,
      diabeticTreatment: String,
      associatedDiseases: [String],
      foodAllergiesIntolerances: [String],
      otherAllergies: String,

      // Section 7: Objectives
      objectivesDescription: String,
      objectives: [String],

      // Legacy fields (backward compatibility)
      physicalActivityLevel: String,
      medicalTreatment: String,
      chronicDiseases: [String],
      allergiesIntolerances: [String],
      mainObjective: String,
      otherObjective: String,
    },
    profile: {
      age: Number,
      gender: String,
      lifestyle: String,
      habits: [String],
      diseases: [String],
      dietaryPreferences: [String],
      calorieGoal: Number,
      proteinGoal: Number,
      carbGoal: Number,
      fatGoal: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords
UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = (mongoose.models?.User as any) || mongoose.model<IUser>('User', UserSchema);
export default User;
