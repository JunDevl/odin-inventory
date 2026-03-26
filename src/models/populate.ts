import { config, populate } from "dotenv";

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
  }`, {ssl: true});

const populateDb = async () => {
  await sql`
    CREATE TABLE storage_areas (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      address TEXT
    )

    CREATE TABLE entities (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      franchise_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name TEXT NOT NULL,
      trade TEXT
    )

    CREATE TABLE item_category (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL UNIQUE
    )

    CREATE TABLE items (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      category_id REFERENCES item_category
    )

    CREATE TABLE item_units (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    )

    CREATE TABLE operations (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      shipped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      arrived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      item REFERENCES items NOT NULL,
      quantity NUMERIC NOT NULL,
      unit REFERENCES units,
      addressed_to REFERENCES entity,
      sent_by REFERENCES entity,
    )id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  `
}

populateDb();