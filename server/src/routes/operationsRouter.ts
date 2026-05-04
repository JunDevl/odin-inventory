import { Router } from "express";
import { createOperation, deleteOperation, getAllOperations, getOperation } from "../controllers/operationsController.ts";

const operationsRouter = Router({mergeParams: true});

operationsRouter.get("/", getAllOperations);
operationsRouter.get("/:operationName", getOperation);

operationsRouter.post("/", createOperation);

operationsRouter.delete("/:operationID", deleteOperation);

export default operationsRouter;