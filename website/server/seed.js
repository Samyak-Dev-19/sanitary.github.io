import { connectDb } from "./db.js";
import { Product } from "./models/Product.js";

await connectDb();

await Product.deleteMany({});
await Product.insertMany([
  {
    name: "Ultra Comfort Pads",
    priceCents: 1200,
    imageUrl: "https://images.unsplash.com/photo-1588776814546-ec7e9a6f7c88"
  },
  {
    name: "Night Protection Pads",
    priceCents: 1500,
    imageUrl: "https://images.unsplash.com/photo-1588776814664-b5e6c6b6fbb2"
  },
  {
    name: "Organic Cotton Pads",
    priceCents: 1800,
    imageUrl: "https://images.unsplash.com/photo-1588776814640-d5fa2c4d1c08"
  }
]);

console.log("✅ Seeded products");
process.exit(0);