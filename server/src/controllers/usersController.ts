import type { RequestHandler } from "express";
import argon2 from "argon2"
import { insertNewUser, retrieveUser } from "../models/db.ts";
import { errorHandler, PromiseError } from "@app/utils";

export const createUser: RequestHandler = async (req, res) => {
  const { username, email, password, initData } = req.body;

  const hashedPassword = await argon2.hash(password, {
    memoryCost: 65536,
    parallelism: 4,
    timeCost: 5
  })

  const createdUser = await errorHandler(insertNewUser(username, email, hashedPassword, initData));

  if (createdUser instanceof PromiseError) {
    res.status(500)
    throw new Error(createdUser.error);
  }

  const [row] = createdUser;
  const {id: createdUserUUID} = row!;

  res.send(createdUserUUID); 
}

export const authenticateUser: RequestHandler = async (req, res) => {
  const email = req.query.email as string;
  const pass = req.query.pass as string;

  if (!email || !pass) {
    res.status(400);
    if (!email) throw new Error(`Invalid query parameters, ${
      !email && pass ? "no e-mail provided." :
      !pass && email ? "no password provided." :
      "no arguments provided at all."}`)
    throw new Error("Invalid query parameters.");
  }

  const dbRecord = await errorHandler(retrieveUser(email));

  if (dbRecord instanceof PromiseError) {
    res.status(404);
    throw new Error(dbRecord.error);
  }

  const [row] = dbRecord;
  const {id: uuid, password_hash: hash} = row as {id: string, password_hash: string};

  const validated = await argon2.verify((hash as unknown) as string, pass);

  if (!validated) {
    res.statusCode = 401;
    res.send("Wrong password.");
    return;
  }

  res.send(uuid);
}