import { Router } from "express";
import { getAllItemStocks, getItemStock } from "../controllers/stockController.ts";

const stocksRouter = Router();

stocksRouter.get("/", getAllItemStocks);
stocksRouter.get("/:itemID", getItemStock);

export default stocksRouter;