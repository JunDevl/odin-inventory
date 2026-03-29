import { Router } from "express";
import { createUser, authenticateUser } from "../controllers/usersController.ts";

const userRouter = Router();

userRouter.post("/", createUser);
userRouter.get("/auth", authenticateUser);

export default userRouter;