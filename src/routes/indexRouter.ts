import { Router } from "express";
import { getStock } from "../controllers/stockController.ts";

const indexRouter = Router();

indexRouter.get("/", getStock);

export default indexRouter;