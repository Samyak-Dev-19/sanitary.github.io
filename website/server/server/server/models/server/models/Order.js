import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    email: String,
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        qty: Number,
        priceCents: Number
      }
    ],
    amountTotalCents: Number,
    currency: { type: String, default: "usd" },

    stripeCheckoutSessionId: String,
    stripePaymentIntentId: String,
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created"
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);