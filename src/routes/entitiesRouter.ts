import { Router } from "express";
import { getEntities } from "../controllers/entitiesController.ts";

const entitiesRouter = Router();

entitiesRouter.get("/", getEntities);

export default entitiesRouter;