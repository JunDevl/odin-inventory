import type { RequestHandler } from "express";

export const getAllEntities: RequestHandler = async (req, res) => {
  res.json({ entities: true });
}

export const getEntity: RequestHandler = async (req, res) => {
  res.json({ entities: true });
}