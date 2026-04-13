import { Router } from "express";
import { getAllOperations, getOperation } from "../controllers/operationsController.ts";

const operationsRouter = Router();

operationsRouter.get("/", getAllOperations);
operationsRouter.get("/:operationName", getOperation);

export default operationsRouter;