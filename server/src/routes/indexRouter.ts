import { Router } from "express";
import { getStocks } from "../controllers/stockController.ts";

const indexRouter = Router();

indexRouter.get("/", getStocks);

export default indexRouter;