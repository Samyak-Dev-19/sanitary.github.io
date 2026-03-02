import express from "express";
import Stripe from "stripe";
import { config } from "../config.js";
import { Order } from "../models/Order.js";

export const webhookRouter = express.Router();
const stripe = new Stripe(config.stripeSecretKey);

// IMPORTANT: raw body required for Stripe signature verification
webhookRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripeWebhookSecret
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        await Order.findOneAndUpdate(
          { stripeCheckoutSessionId: session.id },
          {
            status: "paid",
            email: session.customer_details?.email
          }
        );
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook handler error:", err);
      res.status(500).send("Webhook handler failed");
    }
  }
);