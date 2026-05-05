import { Router } from "express";
import { createOperation, deleteOperations, getAllOperations, getOperation } from "../controllers/operationsController.ts";

const operationsRouter = Router({mergeParams: true});

operationsRouter.get("/", getAllOperations);
operationsRouter.get("/:operationName", getOperation);

operationsRouter.post("/", createOperation);

operationsRouter.delete("/", deleteOperations);

export default operationsRouter;