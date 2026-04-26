import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JWTPayload {
  userId: string;
  email: string;
}


export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};


export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.jwt.secret) as JWTPayload;
};


export const generateVerificationToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};


export const getCurrentWeekKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  
 
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  
  return `${year}-${weekNumber.toString().padStart(2, '0')}`;
};

export default {
  generateToken,
  verifyToken,
  generateVerificationToken,
  getCurrentWeekKey,
};
