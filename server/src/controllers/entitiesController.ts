import type { RequestHandler } from "express";
import { retrieveAllUserEntityFranchises } from "../models/db.ts";
import { errorHandler, PromiseError } from "@app/utils";
import type { UUID } from "node:crypto";

export const getAllEntities: RequestHandler = async (req, res) => {
  const id = req.query.userId as UUID;
  
  const entitiesFranchises = await errorHandler(retrieveAllUserEntityFranchises(id));

  if (entitiesFranchises instanceof PromiseError) {
    res.statusCode = 404;
    res.send(entitiesFranchises.error);
    return;
  }

  return entitiesFranchises;
}

export const getEntity: RequestHandler = async (req, res) => {
  res.json({ entities: true });
}