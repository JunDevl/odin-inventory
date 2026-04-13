import { Router } from "express";
import { getAllEntities, getEntity } from "../controllers/entitiesController.ts";

const entitiesRouter = Router({mergeParams: true});

entitiesRouter.get("/", getAllEntities);
entitiesRouter.get("/:entityName", getEntity);

export default entitiesRouter;