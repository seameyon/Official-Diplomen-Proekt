import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFavorite extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  recipeId: Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  recipeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Recipe', 
    required: true,
    index: true 
  },
}, { 
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: (_doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

FavoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
export default Favorite;
