import { Router } from "express";
import { createUser, authenticateUser } from "../controllers/usersController.ts";

const userRouter = Router({mergeParams: true});

userRouter.post("/", createUser);
userRouter.get("/auth", authenticateUser);

export default userRouter;