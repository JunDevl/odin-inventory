import { Router } from "express";
import { getAllStorages, getStorage } from "../controllers/storagesController.ts";

const storagesRouter = Router();

storagesRouter.get("/", getAllStorages);
storagesRouter.get("/:storageID", getStorage);

export default storagesRouter;