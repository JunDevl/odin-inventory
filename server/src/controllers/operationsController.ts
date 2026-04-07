import type { RequestHandler } from "express";
import { retrieveUserOperation, retrieveAllUserOperation } from "../models/db.ts";
import { errorHandler, PromiseError } from "@app/utils";
import type { UUID } from "node:crypto";

export const getAllOperations: RequestHandler = async (req, res) => {
  const id = req.query.userId as UUID;

  const operations = await errorHandler(retrieveAllUserOperation(id));

  if (operations instanceof PromiseError) {
    res.statusCode = 404;
    res.send(operations.error);
    return;
  }

  return operations;
}

export const getOperation: RequestHandler = async (req, res) => {
  res.json({ operations: true });
}