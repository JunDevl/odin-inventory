import { config } from "dotenv";

config();

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

