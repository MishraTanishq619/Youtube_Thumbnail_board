import mongoose, { Schema, Document, Model } from 'mongoose';
import { IThumbnail } from './Thumbnail'; // Import the Thumbnail interface

// Define the interface for the Board document
export interface IBoard extends Document {
  name: string;
  videos: IThumbnail[];  // An array of Thumbnail documents
  user: String;
}

// Create the Board schema
const BoardSchema: Schema = new Schema(
  {
    name: { type: String, required: true },  // The name of the board
    videos: [{ type: Object }],  // Array of references to Thumbnail documents
    user: { type: String, required: true }, 
  },
  { timestamps: true }  // Adds createdAt and updatedAt fields
);

// Create and export the Board model
const Board: Model<IBoard> = mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema);

export default Board;
