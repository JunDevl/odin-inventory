import { Router } from "express";
import { createEntity, getAllEntities, getEntity } from "../controllers/entitiesController.ts";

const entitiesRouter = Router({mergeParams: true});

entitiesRouter.get("/", getAllEntities);
entitiesRouter.get("/:entityName", getEntity);

entitiesRouter.post("/", createEntity);

export default entitiesRouter;