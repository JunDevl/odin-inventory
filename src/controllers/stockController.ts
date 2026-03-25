import type { RequestHandler } from "express";

export const getStock: RequestHandler = async (req, res) => {
  res.render("index");
}