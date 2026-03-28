import { Router } from "express";
import { getAllEntities, getEntity } from "../controllers/entitiesController.ts";

const entitiesRouter = Router();

entitiesRouter.get("/", getAllEntities);
entitiesRouter.get("/:entityID", getEntity);

export default entitiesRouter;