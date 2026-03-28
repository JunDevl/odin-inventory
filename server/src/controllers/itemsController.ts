import type { RequestHandler } from "express";

export const getAllItemCategories: RequestHandler = async (req, res) => {
  res.json({ itemCategories: true });
}

export const getItemCategory: RequestHandler = async (req, res) => {
  res.json({ itemCategories: true });
}

export const getAllAvaliableItems: RequestHandler = async (req, res) => {
  res.json({ avaliableItems: true });
}

export const getAvaliableItem: RequestHandler = async (req, res) => {
  res.json({ avaliableItems: true });
}