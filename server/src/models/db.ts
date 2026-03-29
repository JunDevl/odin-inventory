import { config } from "dotenv";

config(
  {path:"../../.env"}
);

import postgres from "postgres";

const sql = postgres(`
  postgresql://${
    process.env["ROLE_NAME"]
  }:${
    process.env["DB_PASSWORD"]
  }@${
    process.env["HOST_NAME"]
  }${
    process.env["DATABASE_PORT"] ? `:${process.env["DATABASE_PORT"]}` : ""
  }/${
    process.env["DATABASE_NAME"]
  }`,
  {ssl: true}
);

export const insertNewUser = async (username: string, email: string, hashedPassword: string) => {
  try {
    const created = await sql`
      INSERT INTO users
      VALUES (${username}, ${email}, ${hashedPassword})
    `

    return created;
  } catch (e) {
    console.log(e)
  }
}

export const retrieveUserPasswordHash = async (email: string) => {
  try {
    const hash = await sql`
      SELECT (password_hash) FROM users
      WHERE email = ${email}
    `

    return hash;
  } catch (e) {
    console.log(e);
  }
}

export const retrieveUserUUID = async (email: string) => {
  try {
    const uuid = await sql`
      SELECT (uuid) FROM users
      WHERE email = ${email}
    `

    return uuid;
  } catch (e) {
    console.log(e);
  }
}