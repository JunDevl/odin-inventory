import { Router } from "express";
import { getAllItemCategories, getAllAvaliableItems, getAvaliableItem, getItemCategory } from "../controllers/itemsController.ts";
import path from "path";
import express from "express";

const __dirname = path.resolve();
 
const assetsPath = path.join(__dirname, "public");

const itemsRouter = Router();

itemsRouter.use(express.static(assetsPath));

itemsRouter.get("/avaliable", getAllAvaliableItems);
itemsRouter.get("/avaliable/itemID", getAvaliableItem);

itemsRouter.get("/categories", getAllItemCategories);
itemsRouter.get("/categories/categoryID", getItemCategory);

export default itemsRouter;