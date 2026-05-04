import type { RequestHandler } from "express";
import { insertUserItem, insertUserItemCategory, insertUserItemUnit, retrieveAllUserItemCategories, retrieveAllUserItems, retrieveAllUserItemUnits } from "../models/db.ts";
import { handleError, PromiseError } from "@app/utils";
import type { UUID } from "node:crypto";

export const getAllItemUnits: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
    
  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const units = await handleError(retrieveAllUserItemUnits(id));

  if (units instanceof PromiseError) {
    res.status(404);
    throw new Error(units.error);
  }

  res.json(units);
}

export const getItemUnit: RequestHandler = async (req, res) => {
  
}

export const createItemUnit: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const params = req.body; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const unit = await handleError(insertUserItemUnit(params));

  if (unit instanceof PromiseError) {
    res.status(404);
    throw new Error(unit.error);
  }

  res.send("Created");
}

export const getAllItemCategories: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
    
  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const categories = await handleError(retrieveAllUserItemCategories(id));

  if (categories instanceof PromiseError) {
    res.status(404);
    throw new Error(categories.error);
  }

  res.json(categories);
}

export const getItemCategory: RequestHandler = async (req, res) => {
  res.json({ itemCategories: true });
}

export const createItemCategory: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const params = req.body; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const category = await handleError(insertUserItemCategory(params));

  if (category instanceof PromiseError) {
    res.status(404);
    throw new Error(category.error);
  }

  res.send("Created");
}

export const getAllAvaliableItems: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
    
  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const items = await handleError(retrieveAllUserItems(id, true));

  if (items instanceof PromiseError) {
    res.status(404);
    throw new Error(items.error);
  }

  res.json(items);
}

export const getAvaliableItem: RequestHandler = async (req, res) => {
  res.json({ avaliableItems: true });
}

export const createAvaliableItem: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const params = req.body; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const item = await handleError(insertUserItem(params));

  if (item instanceof PromiseError) {
    res.status(404);
    throw new Error(item.error);
  }

  res.send("Created");
}