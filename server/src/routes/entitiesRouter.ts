import { Router } from "express";
import { getAllEntities, getEntity } from "../controllers/entitiesController.ts";

const entitiesRouter = Router();

entitiesRouter.get("/", getAllEntities);
entitiesRouter.get("/:entityName", getEntity);

export default entitiesRouter;