import { config } from "dotenv";

config();

import express, { Router } from "express";
import cors from "cors";
import path from "path";

import operationsRouter from "./routes/operationsRouter.ts";
import entitiesRouter from "./routes/entitiesRouter.ts";
import itemsRouter from "./routes/itemsRouter.ts";
import usersRouter from "./routes/usersRouter.ts";

const apiRouter = Router();
const dataRouter = Router({mergeParams: true});

const __dirname = path.resolve();

const app = express();

const PORT = 3000;

app.use(cors({
  origin: /^https:\/\/odin-inventory-client$/
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

apiRouter.use("/users", usersRouter);
apiRouter.use("/:userID", dataRouter);

dataRouter.use("/operations", operationsRouter);
dataRouter.use("/entities", entitiesRouter);
dataRouter.use("/items", itemsRouter);

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.send(err.message);
})

app.listen(PORT, (err) => err ? console.log(err) : console.log(`Listening on port ${PORT}\n`));