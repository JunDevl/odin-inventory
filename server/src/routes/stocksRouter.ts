import { Router } from "express";
import { getAllItemStocks, getItemStock } from "../controllers/stockController.ts";

const stocksRouter = Router({mergeParams: true});

stocksRouter.get("/", getAllItemStocks);
stocksRouter.get("/:itemName", getItemStock);

export default stocksRouter;