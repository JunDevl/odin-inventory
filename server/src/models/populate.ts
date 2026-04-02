import { config } from "dotenv";

config(
  {path:"../../.env"}
);

import postgres from "postgres";
import { readFileSync } from "node:fs";

(async () => {

  try {
    const sqlSchema = readFileSync("./schema.sql", {encoding: "utf-8"});

    if (!sqlSchema) throw new Error ("Schema SQL files not found.");

    const sql = postgres(
      `postgresql://${
        process.env["PGUSER"]
      }:${
        process.env["PGPASSWORD"]
      }@${
        process.env["PGHOST"]
      }/${
        process.env["PGDATABASE"]
      }?sslmode=${
        process.env["PGSSLMODE"]
      }&channel_binding=${
        process.env["PGCHANNELBINDING"]
      }`
    );

    const createdSchema = await sql.unsafe(sqlSchema);
  } catch (e) {
    console.log(e)
  }
})()