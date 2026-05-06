import type { RequestHandler } from "express";
import { retrieveUserOperation, retrieveAllUserOperation, insertUserOperation, deleteUserOperations } from "../models/db.ts";
import { handleError, PromiseError } from "@packages/utils";
import type { UUID } from "node:crypto";

export const getAllOperations: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const operations = await handleError(retrieveAllUserOperation(id, true));

  if (operations instanceof PromiseError) {
    res.status(404);
    throw new Error(operations.error);
  }

  res.json(operations);
}

export const getOperation: RequestHandler = async (req, res) => {
  res.json({ operations: true });
}

export const createOperation: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const params = req.body; // Implement sanitization...

  if (!id) {
    res.status(400);
    throw new Error("No user id provided.");
  }

  const operation = await handleError(insertUserOperation(params));

  if (operation instanceof PromiseError) {
    res.status(404);
    throw new Error(operation.error);
  }

  res.send("Created");
}

export const deleteOperations: RequestHandler = async (req, res) => {
  const userId = req.params.userID as UUID;
  const ids = (req.query.ids as string).split(",").map(id => Number(id));

  const operation = await handleError(deleteUserOperations(userId, ids));

  if (operation instanceof PromiseError) {
    res.status(404);
    throw new Error(operation.error);
  }

  res.send("Deleted operations");
}