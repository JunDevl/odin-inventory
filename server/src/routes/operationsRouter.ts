import { Router } from "express";
import { getOperations } from "../controllers/operationsController.ts";

const operationsRouter = Router();

operationsRouter.get("/", getOperations);

export default operationsRouter;