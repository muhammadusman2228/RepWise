import dotenv from "dotenv";

dotenv.config({ quiet: true });

const config = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRETS: process.env.JWT_SECRETS,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3000",
  EMAIL_HOST: process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com",
  EMAIL_PORT: Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587,
  EMAIL_SECURE: (process.env.EMAIL_SECURE || process.env.SMTP_SECURE) === "true",
  EMAIL_USER: process.env.EMAIL_USER || process.env.SMTP_USER,
  EMAIL_PASS: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "RepWise",
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
};

export default config;
