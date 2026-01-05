import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
  title: string;
  type: 'video' | 'post' | 'infographic';
  description: string;
  mediaUrl: string;
  content?: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema: Schema<IContent> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    type: {
      type: String,
      enum: ['video', 'post', 'infographic'],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    mediaUrl: {
      type: String,
      required: [true, 'Please provide a media URL'],
    },
    content: {
      type: String,
      maxlength: [5000, 'Content cannot be more than 5000 characters'],
    },
    category: {
      type: String,
      enum: [
        'nutrition-basics',
        'meal-planning',
        'weight-management',
        'healthy-eating',
        'fitness',
        'mindfulness',
      ],
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

const Content = (mongoose.models?.Content as any) || mongoose.model<IContent>('Content', ContentSchema);
export default Content;
