import mongoose, { Schema, Document } from 'mongoose';

export interface IBranding extends Document {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  logoPublicId?: string;
  faviconUrl?: string;
  faviconPublicId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  updatedAt: Date;
  updatedBy?: string;
}

const BrandingSchema: Schema<IBranding> = new Schema(
  {
    siteName: {
      type: String,
      required: true,
      default: 'NutriÉd',
    },
    siteDescription: {
      type: String,
      required: true,
      default: 'Plateforme de nutrition personnalisée',
    },
    logoUrl: {
      type: String,
      default: null,
    },
    logoPublicId: {
      type: String,
      default: null,
    },
    faviconUrl: {
      type: String,
      default: null,
    },
    faviconPublicId: {
      type: String,
      default: null,
    },
    primaryColor: {
      type: String,
      default: '#4F46E5', // Indigo
    },
    secondaryColor: {
      type: String,
      default: '#A855F7', // Purple
    },
    updatedBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Branding || mongoose.model<IBranding>('Branding', BrandingSchema);
