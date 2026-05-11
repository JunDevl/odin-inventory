import type { RequestHandler } from "express";
import { deleteUserEntityFranchises, insertUserEntityFranchise, retrieveAllUserEntityFranchises, updateUserEntityFranchise } from "../models/db.ts";
import { handleError, PromiseError } from "@packages/utils";
import type { UUID } from "node:crypto";

export const getAllEntities: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  
  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const entities = await handleError(retrieveAllUserEntityFranchises(id, true));

  if (entities instanceof PromiseError) {
    res.status(404);
    throw new Error(entities.error);
  }

  res.json(entities);
}

export const getEntity: RequestHandler = async (req, res) => {
  res.json({ entities: true });
}

export const createEntity: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const newEntity = req.body; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const entity = await handleError(insertUserEntityFranchise(id, newEntity));

  if (entity instanceof PromiseError) {
    res.status(404);
    throw new Error(entity.error);
  }

  res.send("Created");
}

export const updateEntity: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const {name, address} = req.body.old; // Implement sanitization...
  const newData = req.body.new; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const entity = await handleError(updateUserEntityFranchise(id, {old_entity_name: name, old_address: address}, newData));

  if (entity instanceof PromiseError) {
    res.status(404);
    throw new Error(entity.error);
  }

  res.send("Updated");
}

export const deleteEntities: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const entityNames = (req.query.names as string).split(",");

  if (!id || !entityNames) {
    res.status(400);
    throw new Error("Invalid parameters.");
  }

  const deleted = await handleError(deleteUserEntityFranchises(id, entityNames));

  if (deleted instanceof PromiseError) {
    res.status(404);
    throw new Error(deleted.error);
  }

  res.send(`Deleted item units ${entityNames}`);
}