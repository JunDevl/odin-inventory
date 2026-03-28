import { config, populate } from "dotenv";

config();

import postgres from "postgres";
import { readFileSync } from "node:fs";

(async () => {
  const sqlSchema = readFileSync("./schema.sql", {encoding: "utf-8"});

  if (!sqlSchema) throw new Error ("Schema SQL files not found.");

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
    }`, {ssl: true});

  await sql`${sqlSchema}`.simple()
})()