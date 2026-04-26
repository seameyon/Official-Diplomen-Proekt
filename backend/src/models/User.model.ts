import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/user.types.js';

const HealthProfileSchema = new Schema({}, { 
  _id: false, 
  strict: false // Accept any fields
});

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 8,
    select: false 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  avatar: String,
  bio: { type: String, maxlength: 500 },
  isEmailVerified: { type: Boolean, default: true },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  healthProfile: { type: HealthProfileSchema },
  hasCompletedOnboarding: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  theme: { type: String, default: 'dark' },
  language: { type: String, default: 'bg' },
}, { 
  timestamps: true,
  strict: false, // Accept any fields at user level too
  toJSON: {
    transform: (_doc, ret) => {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    }
  }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch {
    return false;
  }
};

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
