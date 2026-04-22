import type { RequestHandler } from "express";
import { retrieveAllUserItemCategories, retrieveAllUserItems, retrieveAllUserItemUnits } from "../models/db.ts";
import { handleError, PromiseError } from "@app/utils";
import type { UUID } from "node:crypto";

export const getAllItemUnits: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
    
  if (!id) {
    res.status(400)
    throw new Error("No user id provided.");
  }

  const units = await handleError(retrieveAllUserItemUnits(id));

  if (units instanceof PromiseError) {
    res.status(404)
    throw new Error(units.error);
  }

  res.json(units);
}

export const getItemUnit: RequestHandler = async (req, res) => {

}

export const getAllItemCategories: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
    
  if (!id) {
    res.status(400)
    throw new Error("No user id provided.");
  }

  const categories = await handleError(retrieveAllUserItemCategories(id));

  if (categories instanceof PromiseError) {
    res.status(404)
    throw new Error(categories.error);
  }

  res.json(categories);
}

export const getItemCategory: RequestHandler = async (req, res) => {
  res.json({ itemCategories: true });
}

export const getAllAvaliableItems: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
    
  if (!id) {
    res.status(400)
    throw new Error("No user id provided.");
  }

  const items = await handleError(retrieveAllUserItems(id, true));

  if (items instanceof PromiseError) {
    res.status(404)
    throw new Error(items.error);
  }

  res.json(items);
}

export const getAvaliableItem: RequestHandler = async (req, res) => {
  res.json({ avaliableItems: true });
}