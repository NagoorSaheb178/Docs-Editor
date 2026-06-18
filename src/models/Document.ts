import mongoose, { Schema, Document as MongooseDocument, Model } from 'mongoose';

export interface IDocument extends MongooseDocument {
  title: string;
  content: string; // JSON string or HTML string
  ownerId: mongoose.Types.ObjectId;
  sharedWithIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'Untitled Document',
    },
    content: {
      type: String, // We'll store HTML or Tiptap JSON here
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sharedWithIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

export const DocumentModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
