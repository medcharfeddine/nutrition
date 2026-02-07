import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  nameAr?: string;
  slug: string;
  description: string;
  descriptionAr?: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      unique: true,
      maxlength: [100, 'Category name cannot be more than 100 characters'],
    },
    nameAr: {
      type: String,
      trim: true,
      maxlength: [100, 'Category name cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    descriptionAr: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    icon: {
      type: String,
      default: '📁',
    },
    color: {
      type: String,
      default: '#4f46e5',
      match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color'],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search
CategorySchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
