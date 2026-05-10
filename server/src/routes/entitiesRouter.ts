import { Router } from "express";
import { createEntity, deleteEntities, getAllEntities, getEntity, updateEntity } from "../controllers/entitiesController.ts";

const entitiesRouter = Router({mergeParams: true});

entitiesRouter.get("/", getAllEntities);
entitiesRouter.get("/:entityName", getEntity);

entitiesRouter.post("/", createEntity);

entitiesRouter.delete("/", deleteEntities);

entitiesRouter.put("/", updateEntity);

export default entitiesRouter;