import type { RequestHandler } from "express";

export const getEntities: RequestHandler = async (req, res) => {
  res.json({ entities: true });
}