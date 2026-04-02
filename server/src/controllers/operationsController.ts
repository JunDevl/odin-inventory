import type { RequestHandler } from "express";

export const getAllOperations: RequestHandler = async (req, res) => {
  res.json({ operations: true });
}

export const getOperation: RequestHandler = async (req, res) => {
  res.json({ operations: true });
}