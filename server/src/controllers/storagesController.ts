import type { RequestHandler } from "express";

export const getStorages: RequestHandler = async (req, res) => {
  res.json({ storages: true });
}