import { Router } from "express";
import { getStorages } from "../controllers/storagesController.ts";

const storagesRouter = Router();

storagesRouter.get("/", getStorages);

export default storagesRouter;