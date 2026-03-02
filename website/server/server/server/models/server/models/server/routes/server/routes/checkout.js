import express from "express";
import Stripe from "stripe";
import { config } from "../config.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";

export const checkoutRouter = express.Router();
const stripe = new Stripe(config.stripeSecretKey);

checkoutRouter.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart } = req.body; // [{ productId, qty }]
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    // Load products from DB (never trust client price)
    const ids = cart.map(i => i.productId);
    const products = await Product.find({ _id: { $in: ids }, active: true });

    const line_items = cart.map(item => {
      const p = products.find(x => String(x._id) === String(item.productId));
      if (!p) throw new Error("Invalid product in cart");

      // OPTION A: Use price_data (simple)
      return {
        quantity: Math.max(1, Number(item.qty || 1)),
        price_data: {
          currency: "usd",
          product_data: { name: p.name, images: [p.imageUrl] },
          unit_amount: p.priceCents
        }
      };

      // OPTION B (recommended): Use Stripe Price IDs
      // return { quantity: item.qty, price: p.stripePriceId };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${config.clientUrl}/?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.clientUrl}/?canceled=1`
    }); // Checkout Session create :contentReference[oaicite:4]{index=4}

    // Create order as "created" (mark "paid" via webhook)
    const amountTotalCents = line_items.reduce(
      (sum, li) => sum + li.quantity * li.price_data.unit_amount,
      0
    );

    await Order.create({
      items: cart.map(item => {
        const p = products.find(x => String(x._id) === String(item.productId));
        return {
          productId: p._id,
          name: p.name,
          qty: Math.max(1, Number(item.qty || 1)),
          priceCents: p.priceCents
        };
      }),
      amountTotalCents,
      stripeCheckoutSessionId: session.id,
      status: "created"
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Checkout failed" });
  }
});