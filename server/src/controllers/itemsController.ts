import type { RequestHandler } from "express";
import { deleteUserItems, deleteUserItemCategories, deleteUserItemUnits, insertUserItem, insertUserItemCategory, insertUserItemUnit, retrieveAllUserItemCategories, retrieveAllUserItems, retrieveAllUserItemUnits, updateUserItemCategory, updateUserItemUnit, updateUserItem } from "../models/db.ts";
import { handleError, PromiseError } from "@packages/utils";
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
  const newData = req.body; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const unit = await handleError(insertUserItemUnit(id, newData));

  if (unit instanceof PromiseError) {
    res.status(404);
    throw new Error(unit.error);
  }

  res.send("Created");
}

export const updateItemUnit: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const {name} = req.body.old; // Implement sanitization...
  const newData = req.body.new; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const unit = await handleError(updateUserItemUnit(id, name, newData));

  if (unit instanceof PromiseError) {
    res.status(404);
    throw new Error(unit.error);
  }

  res.send("Created");
}

export const deleteItemUnits: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const unitNames = (req.query.names as string).split(",");

  if (!id || !unitNames) {
    res.status(400);
    throw new Error("Invalid parameters.");
  }

  const deleted = await handleError(deleteUserItemUnits(id, unitNames));

  if (deleted instanceof PromiseError) {
    res.status(404);
    throw new Error(deleted.error);
  }

  res.send(`Deleted item units ${unitNames}`);
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
  const newData = req.body; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const category = await handleError(insertUserItemCategory(id, newData));

  if (category instanceof PromiseError) {
    res.status(404);
    throw new Error(category.error);
  }

  res.send("Created");
}

export const updateItemCategory: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const {name} = req.body.old; // Implement sanitization...
  const newData = req.body.new; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const category = await handleError(updateUserItemCategory(id, name, newData));

  if (category instanceof PromiseError) {
    res.status(404);
    throw new Error(category.error);
  }

  res.send("Updated");
}

export const deleteItemCategories: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const categoryNames = (req.query.names as string).split(",");

  if (!id || !categoryNames) {
    res.status(400);
    throw new Error("Invalid parameters.");
  }

  const deleted = await handleError(deleteUserItemCategories(id, categoryNames));

  if (deleted instanceof PromiseError) {
    res.status(404);
    throw new Error(deleted.error);
  }

  res.send(`Deleted item categories ${categoryNames}`);
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
  const newData = req.body; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const item = await handleError(insertUserItem(id, newData));

  if (item instanceof PromiseError) {
    res.status(404);
    throw new Error(item.error);
  }

  res.send("Created");
}

export const updateAvaliableItem: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const {name} = req.body.old; // Implement sanitization...
  const newData = req.body.new; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const item = await handleError(updateUserItem(id, name, newData));

  if (item instanceof PromiseError) {
    res.status(404);
    throw new Error(item.error);
  }

  res.send("Updated");
}

export const deleteAvaliableItems: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const itemNames = (req.query.names as string).split(",");

  if (!id || !itemNames) {
    res.status(400);
    throw new Error("Invalid parameters.");
  }

  const deleted = await handleError(deleteUserItems(id, itemNames));

  if (deleted instanceof PromiseError) {
    res.status(404);
    throw new Error(deleted.error);
  }

  res.send(`Deleted items ${itemNames}`);
}