import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    priceCents: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    active: { type: Boolean, default: true },

    // OPTIONAL (recommended for real ecommerce):
    // If you create Prices in Stripe, store priceId here.
    stripePriceId: { type: String }
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);