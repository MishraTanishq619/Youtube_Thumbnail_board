// models/Thumbnail.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the interface for the Thumbnail document
export interface IThumbnail extends Document {
  title: string;
  thumbnail: string;   // URL or path to the thumbnail image
  views: number;
  likes: number;
}

// Create the Thumbnail schema
const ThumbnailSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    views: { type: Number, required: true, default: 0 },
    likes: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }  // Adds createdAt and updatedAt fields
);

// Create and export the model
const Thumbnail: Model<IThumbnail> = mongoose.models.Thumbnail || mongoose.model<IThumbnail>('Thumbnail', ThumbnailSchema);

export default Thumbnail;
