import type { RequestHandler } from "express";
import argon2 from "argon2"
import { insertNewUser, retrieveUser } from "../models/db.ts";
import { handlePromiseError } from "../utils.ts";

export const createUser: RequestHandler = async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await argon2.hash(password, {
    memoryCost: 65536,
    parallelism: 4,
    timeCost: 5
  })

  const createdUser = await handlePromiseError(insertNewUser(username, email, hashedPassword));

  if (createdUser.error) {
    res.statusCode = 500
    res.send(createdUser.error);
    return;
  }

  const [row] = createdUser;
  const {id: createdUserUUID} = row;

  res.send(createdUserUUID); 
}

export const authenticateUser: RequestHandler = async (req, res) => {
  const email = req.query.email as string;
  const pass = req.query.pass as string;

  if (!email || !pass) {
    res.statusCode = 400;
    res.send("Invalid query parameters.");
    return;
  }

  const dbRecord = await handlePromiseError(retrieveUser(email));

  if (dbRecord.error) {
    res.statusCode = 404;
    res.send(dbRecord.error);
    return;
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