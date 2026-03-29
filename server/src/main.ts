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
import usersRouter from "./routes/usersRouter.ts";

const __dirname = path.resolve();

const app = express();

const PORT = 3000;

app.use(cors({
  origin: "http://localhost:5173"
}))
app.use(express.urlencoded({ extended: true }));

const apiRouter = Router();
app.use("/api", apiRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/stocks", stocksRouter);
apiRouter.use("/operations", operationsRouter);
apiRouter.use("/storages", storagesRouter);
apiRouter.use("/entities", entitiesRouter);
apiRouter.use("/items", itemsRouter);

app.listen(PORT, (err) => err ? console.log(err) : console.log(`Listening on port ${PORT}\n`));