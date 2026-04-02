import type { RequestHandler } from "express";

export const getAllItemStocks: RequestHandler = async (req, res) => {
  res.json({ stocks: true });
}

export const getItemStock: RequestHandler = async (req, res) => {
  res.json({ stocks: true });
}