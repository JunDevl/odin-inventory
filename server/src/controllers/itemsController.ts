import type { RequestHandler } from "express";

export const getCategories: RequestHandler = async (req, res) => {
  res.json({ itemCategories: true });
}

export const getAvaliableItems: RequestHandler = async (req, res) => {
  res.json({ avaliableItems: true });
}