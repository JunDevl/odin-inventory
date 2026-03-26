import { Router } from "express";
import { getCategories, getAvaliableItems } from "../controllers/itemsController.ts";
import path from "path";
import express from "express";

const __dirname = path.resolve();
 
const assetsPath = path.join(__dirname, "public");

const itemsRouter = Router();

itemsRouter.use(express.static(assetsPath));

itemsRouter.get("/avaliable", getAvaliableItems);
itemsRouter.get("/categories", getCategories);

export default itemsRouter;