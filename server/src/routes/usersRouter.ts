import { Router } from "express";
import { createUser, authenticateUser, deleteUserController } from "../controllers/usersController.ts";

const userRouter = Router({mergeParams: true});

userRouter.get("/auth", authenticateUser);

userRouter.post("/", createUser);

userRouter.delete("/:userID", deleteUserController);

export default userRouter;