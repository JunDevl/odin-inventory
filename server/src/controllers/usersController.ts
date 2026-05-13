import type { RequestHandler } from "express";
import type { UUID } from "node:crypto";
import argon2 from "argon2"
import { insertNewUser, retrieveUser, deleteUser } from "../models/db.ts";
import { handleError, PromiseError } from "@packages/utils";

export const createUser: RequestHandler = async (req, res) => {
  const { username, email, password, initData } = req.body;

  const hashedPassword = await argon2.hash(password, {
    memoryCost: 65536,
    parallelism: 4,
    timeCost: 5
  })

  const createdUser = await handleError(insertNewUser(username, email, hashedPassword, initData));

  if (createdUser instanceof PromiseError) {
    res.status(500)
    throw new Error(createdUser.error);
  }

  res.json(createdUser);
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

  const dbRecord = await handleError(retrieveUser({email}));

  if (dbRecord instanceof PromiseError) {
    res.status(404);
    throw new Error(dbRecord.error);
  }

  const [row] = dbRecord;
  const {id: uuid, password_hash: hash, name} = row as Record<string, any>;

  const validated = await argon2.verify(hash, pass);

  if (!validated) {
    res.statusCode = 401;
    res.send("Wrong password.");
    return;
  }

  res.json({uuid, name});
}

export const deleteUserController: RequestHandler = async (req, res) => {
  const id = req.params.userID as UUID;
  const pass = req.query.pass as string;

  if (!id || !pass) {
    res.status(400);
    throw new Error("Invalid parameters.");
  }

  const dbRecord = await handleError(retrieveUser({user_id: id}));

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

  const deleted = await handleError(deleteUser(id));

  if (deleted instanceof PromiseError) {
    res.status(404);
    throw new Error(deleted.error);
  }

  res.send(`Deleted user of UUID ${id}`);
}