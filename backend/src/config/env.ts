import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Simple Gmail config
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  
  // Groq AI
  GROQ_API_KEY: z.string().optional(),
  
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = {
  port: parseInt(parsed.data.PORT, 10),
  nodeEnv: parsed.data.NODE_ENV,
  mongoUri: parsed.data.MONGODB_URI,
  jwt: {
    secret: parsed.data.JWT_SECRET,
    expiresIn: parsed.data.JWT_EXPIRES_IN,
  },
  // Gmail config
  emailUser: parsed.data.EMAIL_USER || '',
  emailPass: parsed.data.EMAIL_PASS || '',
  groqApiKey: parsed.data.GROQ_API_KEY || '',
  frontendUrl: parsed.data.FRONTEND_URL,
};
