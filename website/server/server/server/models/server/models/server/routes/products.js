import express from "express";
import { Product } from "../models/Product.js";

export const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
  const products = await Product.find({ active: true }).sort({ createdAt: -1 });
  res.json(products);
});