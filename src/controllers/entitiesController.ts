import type { RequestHandler } from "express";

export const getEntities: RequestHandler = async (req, res) => {
  res.render("index", { entities: true });
}