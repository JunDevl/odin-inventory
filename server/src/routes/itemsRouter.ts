import { Router } from "express";
import { getAllItemCategories, getAllAvaliableItems, getAvaliableItem, getItemCategory, getAllItemUnits, getItemUnit, createAvaliableItem, createItemCategory, createItemUnit } from "../controllers/itemsController.ts";
import path from "path";
import express from "express";

const __dirname = path.resolve();
 
const assetsPath = path.join(__dirname, "public");

const itemsRouter = Router({mergeParams: true});

itemsRouter.use(express.static(assetsPath));

itemsRouter.get("/avaliable", getAllAvaliableItems);
itemsRouter.get("/avaliable/:itemName", getAvaliableItem);

itemsRouter.get("/categories", getAllItemCategories);
itemsRouter.get("/categories/:categoryName", getItemCategory);

itemsRouter.get("/units", getAllItemUnits);
itemsRouter.get("/units/:unitName", getItemUnit);

itemsRouter.post("/avaliable", createAvaliableItem);

itemsRouter.post("/categories", createItemCategory);

itemsRouter.post("/units", createItemUnit);

export default itemsRouter;