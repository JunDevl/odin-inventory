import type { RequestHandler } from "express";

export const getStocks: RequestHandler = async (req, res) => {
  res.json({ stocks: true });
}