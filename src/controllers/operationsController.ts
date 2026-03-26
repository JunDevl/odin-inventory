import type { RequestHandler } from "express";

export const getOperations: RequestHandler = async (req, res) => {
  res.render("index", { operations: true });
}