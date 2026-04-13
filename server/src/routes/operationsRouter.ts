import { Router } from "express";
import { getAllOperations, getOperation } from "../controllers/operationsController.ts";

const operationsRouter = Router({mergeParams: true});

operationsRouter.get("/", getAllOperations);
operationsRouter.get("/:operationName", getOperation);

export default operationsRouter;