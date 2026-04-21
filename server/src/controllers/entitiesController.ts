import type { RequestHandler } from "express";
import { retrieveAllUserEntityFranchises } from "../models/db.ts";
import { handleError, PromiseError } from "@app/utils";
import type { UUID } from "node:crypto";

export const getAllEntities: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  
  if (!id) {
    res.status(400)
    throw new Error("No user id provided.");
  }

  const entities = await handleError(retrieveAllUserEntityFranchises(id));

  if (entities instanceof PromiseError) {
    res.status(404)
    throw new Error(entities.error);
  }

  res.json(entities);
}

export const getEntity: RequestHandler = async (req, res) => {
  res.json({ entities: true });
}