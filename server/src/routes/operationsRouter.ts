import { Router } from "express";
import { getAllOperations, getOperation } from "../controllers/operationsController.ts";

const operationsRouter = Router();

operationsRouter.get("/", getAllOperations);
operationsRouter.get("/:operationID", getOperation);

export default operationsRouter;