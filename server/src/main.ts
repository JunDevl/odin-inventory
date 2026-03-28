import { config } from "dotenv";

config();

import express, { Router } from "express";
import cors from "cors";
import path from "path";

import stocksRouter from "./routes/stocksRouter.ts";
import operationsRouter from "./routes/operationsRouter.ts";
import storagesRouter from "./routes/storagesRouter.ts";
import entitiesRouter from "./routes/entitiesRouter.ts";
import itemsRouter from "./routes/itemsRouter.ts";

const __dirname = path.resolve();

const app = express();
const apiRouter = Router();

const PORT = 3000;

app.use(cors({
  origin: "http://localhost:5173"
}))
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

apiRouter.use("/stocks", stocksRouter);
apiRouter.use("/operations", operationsRouter);
apiRouter.use("/storages", storagesRouter);
apiRouter.use("/entities", entitiesRouter);
apiRouter.use("/items", itemsRouter);

app.listen(PORT, (err) => err ? console.log(err) : console.log(`Listening on port ${PORT}\n`));