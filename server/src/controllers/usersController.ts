import type { RequestHandler } from "express";
import argon2 from "argon2"
import { insertNewUser, retrieveUserPasswordHash, retrieveUserUUID } from "../models/db.ts";

export const createUser: RequestHandler = async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await argon2.hash(password, {
    memoryCost: 65536,
    parallelism: 4,
    timeCost: 5
  })

  const createdUser = await insertNewUser(username, email, hashedPassword);

  if (!createdUser) {
    res.statusCode = 500
    res.send("Error");
  }

  res.send("ok");
}

export const authenticateUser: RequestHandler = async (req, res) => {
  const email = req.query.email as string;
  const pass = req.query.pass as string;

  if (!email || !pass) {
    res.statusCode = 400;
    res.send("Invalid query parameters.");
  }

  const hash = await retrieveUserPasswordHash(email);

  if (!hash || !hash[0]) {
    res.statusCode = 404;
    res.send("User not found.");
    return;
  }

  const validated = await argon2.verify((hash[0] as unknown) as string, pass);

  if (!validated) {
    res.statusCode = 401;
    res.send("Wrong password.");
    return;
  }

  const uuid = await retrieveUserUUID(email);

  res.send(uuid![0]);
}