import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};

for (const [k, v] of Object.entries(config)) {
  if (!v && ["mongoUri", "stripeSecretKey"].includes(k)) {
    console.warn(`[WARN] Missing env var for: ${k}`);
  }
}