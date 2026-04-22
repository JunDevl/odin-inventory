import type { RequestHandler } from "express";
import { retrieveUserOperation, retrieveAllUserOperation } from "../models/db.ts";
import { handleError, PromiseError } from "@app/utils";
import type { UUID } from "node:crypto";

export const getAllOperations: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;

  if (!id) {
    res.status(400)
    throw new Error("No user id provided.");
  }

  const operations = await handleError(retrieveAllUserOperation(id, true));

  if (operations instanceof PromiseError) {
    res.status(404)
    throw new Error(operations.error);
  }

  res.json(operations);
}

export const getOperation: RequestHandler = async (req, res) => {
  res.json({ operations: true });
}