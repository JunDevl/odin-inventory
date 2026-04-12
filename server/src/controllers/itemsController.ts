import type { RequestHandler } from "express";
import { retrieveAllUserItemCategories, retrieveAllUserItems } from "../models/db.ts";
import { errorHandler, PromiseError } from "@app/utils";
import type { UUID } from "node:crypto";

export const getAllItemCategories: RequestHandler = async (req, res) => {
  const id = req.query.userId as UUID;

  const categories = await errorHandler(retrieveAllUserItemCategories(id));

  if (categories instanceof PromiseError) {
    res.status(404);
    throw new Error(categories.error);
  }

  return categories;
}

export const getItemCategory: RequestHandler = async (req, res) => {
  res.json({ itemCategories: true });
}

export const getAllAvaliableItems: RequestHandler = async (req, res) => {
  const id = req.query.userId as UUID;

  const items = await errorHandler(retrieveAllUserItems(id));

  if (items instanceof PromiseError) {
    res.status(404);
    throw new Error(items.error);
  }

  return items;
}

export const getAvaliableItem: RequestHandler = async (req, res) => {
  res.json({ avaliableItems: true });
}