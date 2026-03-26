import type { RequestHandler } from "express";

export const getCategories: RequestHandler = async (req, res) => {
  res.render("index", { itemCategories: true });
}

export const getAvaliableItems: RequestHandler = async (req, res) => {
  res.render("index", { avaliableItems: true });
}