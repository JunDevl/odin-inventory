import { config } from "dotenv";

config();

import express from "express";
import cors from "cors";
import path from "path";

import indexRouter from "./routes/indexRouter.ts";
import operationsRouter from "./routes/operationsRouter.ts";
import storagesRouter from "./routes/storagesRouter.ts";
import entitiesRouter from "./routes/entitiesRouter.ts";
import itemsRouter from "./routes/itemsRouter.ts";

const __dirname = path.resolve();

const app = express();

const PORT = 3000;

app.use(cors({
  origin: "http://localhost:5173"
}))
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);
app.use("/operations", operationsRouter);
app.use("/storages", storagesRouter);
app.use("/entities", entitiesRouter);
app.use("/items", itemsRouter);

app.listen(PORT, (err) => err ? console.log(err) : console.log(`Listening on port ${PORT}\n`));