import { Router } from "express";
import { getAllItemCategories, getAllAvaliableItems, getAvaliableItem, getItemCategory, getAllItemUnits, getItemUnit, createAvaliableItem, createItemCategory, createItemUnit, deleteAvaliableItems, deleteItemUnits, deleteItemCategories, updateAvaliableItem, updateItemCategory, updateItemUnit } from "../controllers/itemsController.ts";
import path from "path";
import express from "express";

const __dirname = path.resolve();
 
const assetsPath = path.join(__dirname, "public");

const itemsRouter = Router({mergeParams: true});

itemsRouter.use(express.static(assetsPath));

itemsRouter.get("/avaliable", getAllAvaliableItems);
itemsRouter.get("/avaliable/:itemName", getAvaliableItem);

itemsRouter.post("/avaliable", createAvaliableItem);

itemsRouter.delete("/avaliable", deleteAvaliableItems);

itemsRouter.put("/avaliable", updateAvaliableItem);

itemsRouter.get("/categories", getAllItemCategories);
itemsRouter.get("/categories/:categoryName", getItemCategory);

itemsRouter.post("/categories", createItemCategory);

itemsRouter.delete("/categories", deleteItemCategories);

itemsRouter.put("/categories", updateItemCategory);

itemsRouter.get("/units", getAllItemUnits);
itemsRouter.get("/units/:unitName", getItemUnit);

itemsRouter.post("/units", createItemUnit);

itemsRouter.delete("/units", deleteItemUnits);

itemsRouter.put("/units", updateItemUnit);

export default itemsRouter;