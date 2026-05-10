import dotenv from "dotenv";
dotenv.config();

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`❌ Missing environment variable: ${key}`);
  return value;
};

export const JWT_SECRET    = getEnv("JWT_SECRET");
export const JWT_EXPIRES_IN = getEnv("JWT_EXPIRES_IN");

export const CLIENT_URL = getEnv("ClIENT_URL");
export const PORT       = getEnv("PORT");

export const RESEND_API_KEY = getEnv("RESEND_API_KEY");
export const EMAIL_FROM     = getEnv("EMAIL_FROM");

export const AWS_REGION        = getEnv("AWS_REGION");
export const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT;  
