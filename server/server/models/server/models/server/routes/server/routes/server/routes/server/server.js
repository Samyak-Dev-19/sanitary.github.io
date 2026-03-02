import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { connectDb } from "./db.js";

import { productsRouter } from "./routes/products.js";
import { checkoutRouter } from "./routes/checkout.js";
import { webhookRouter } from "./routes/webhook.js";

const app = express();

// Stripe webhook uses raw body, so mount it BEFORE json middleware
app.use("/api/webhook", webhookRouter);

app.use(cors({ origin: config.clientUrl }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/products", productsRouter);
app.use("/api/checkout", checkoutRouter);

await connectDb();

app.listen(config.port, () => {
  console.log(`✅ Server running on http://localhost:${config.port}`);
});