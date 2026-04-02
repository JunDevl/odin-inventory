import type { RequestHandler } from "express";

export const getAllStorages: RequestHandler = async (req, res) => {
  res.json({ storages: true });
}

export const getStorage: RequestHandler = async (req, res) => {
  res.json({ storages: true });
}