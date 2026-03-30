import { config } from "dotenv";

config();

import postgres from "postgres";
import { handlePromiseError } from "../utils.ts";
import type { UUID } from "node:crypto";

type EntityType = "service_provider" | "provider" | "client";

const sql = postgres(`
    postgresql://${
      process.env["PGUSER"]
    }:${
      process.env["PGPASSWORD"]
    }@${
      process.env["PGHOST"]
    }/${
      process.env["PGDATABASE"]
    }
  `,
  { ssl: true }
);

export const insertNewUser = async (username: string, email: string, hashedPassword: string) => {
  const created = await handlePromiseError(sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${username}, ${email}, ${hashedPassword})
    RETURNING users.id
  `)

  if (created.error) throw new Error(created.error);

  return created;
}

export const retrieveUser = async (email: string) => {
  const user = await handlePromiseError(sql`
    SELECT * FROM users
    WHERE email = ${email}
  `)

  if (user.error) throw new Error(user.error);

  return user;
}

export const retrieveOperation = async (userUuid: UUID, operationId: number) => {
  const operation = await handlePromiseError(sql`
    SELECT * FROM operations
    WHERE user_id = ${userUuid}
    AND operation_id = ${operationId}
  `)

  if (operation.error) throw new Error(operation.error);

  return operation;
}

export const retrieveAllUserOperation = async (userUuid: UUID) => {
  const operations = await handlePromiseError(sql`
    SELECT * FROM operations
    WHERE user_id = ${userUuid}
  `)

  if (operations.error) throw new Error(operations.error);

  return operations;
}

export const retrieveItem = async (userUuid: UUID, itemId: number) => {
  const item = await handlePromiseError(sql`
    SELECT * FROM items
    WHERE user_id = ${userUuid}
    AND item_id = ${itemId}
  `)

  if (item.error) throw new Error(item.error);

  return item;
}

export const retrieveAllUserItems = async (userUuid: UUID) => {
  const items = await handlePromiseError(sql`
    SELECT * FROM items
    WHERE user_id = ${userUuid}
  `)

  if (items.error) throw new Error(items.error);

  return items;
}

export const retrieveItemCategory = async (userUuid: UUID, categoryId: number) => {
  const category = await handlePromiseError(sql`
    SELECT * FROM item_categories
    WHERE user_id = ${userUuid}
    AND item_id = ${categoryId}
  `)

  if (category.error) throw new Error(category.error);

  return category;
}

export const retrieveAllUserItemCategories = async (userUuid: UUID) => {
  const categories = await handlePromiseError(sql`
    SELECT * FROM item_categories
    WHERE user_id = ${userUuid}
  `)

  if (categories.error) throw new Error(categories.error);

  return categories;
}

export const retrieveUserEntityFranchise = async (userUuid: UUID, entityId: number, franchiseId: number) => {
  const entityFranchise = await handlePromiseError(sql`
    SELECT * FROM entities_franchises
    WHERE user_id = ${userUuid}
    AND entity_id = ${entityId}
    AND franchise_id = ${franchiseId}
  `)

  if (entityFranchise.error) throw new Error(entityFranchise.error);

  return entityFranchise;
}

export const retrieveAllUserEntityFranchises = async (userUuid: UUID) => {
  const entitiesFranchises = await handlePromiseError(sql`
    SELECT * FROM entities_franchises
    WHERE user_id = ${userUuid}
  `)

  if (entitiesFranchises.error) throw new Error(entitiesFranchises.error);

  return entitiesFranchises;
}