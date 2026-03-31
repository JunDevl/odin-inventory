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

type EntityFranchiseID = {entityId: number, franchiseId: number};

type insertOperationParams = {
  userUuid: UUID,
  addressee: EntityFranchiseID,
  sendee: EntityFranchiseID,
  itemId: number, 
  quantity: number,
  unit: string,
  priceCents: number | null,
  shippedAt?: Date | null,
  arrivedAt?: Date | null
}

export const insertOperation = async (
  {userUuid, addressee, sendee, itemId, quantity, unit, priceCents, shippedAt, arrivedAt}: insertOperationParams) => 
{
  const {entityId: addresseeEntityId, franchiseId: adresseeFranchiseId} = addressee;

  const {entityId: sendeeEntityId, franchiseId: sendeeFranchiseId} = addressee;

  let shippedAtQuery;
  let arrivedAtQuery;

  if (!(shippedAt instanceof Date)) shippedAtQuery = shippedAt === null ? "NULL" : "DEFAULT";
  else shippedAtQuery = Number(shippedAt);

  if (!(arrivedAt instanceof Date)) arrivedAtQuery = arrivedAt === null ? "NULL" : "DEFAULT";
  else arrivedAtQuery = Number(arrivedAt);

  const createdOperationQuery = (priceHistoryId: string) => `
      INSERT INTO 
      operations (
                    user_id, 
                    user_item_id, 
                    item_id,
                    unit_price_user_id,
                    unit_price_item_id,
                    unit_price_id,
                    quantity,
                    adressee_user_id,
                    adressee_entity_id,
                    adressee_franchise_id,
                    sendee_user_id,
                    sendee_entity_id,
                    sendee_franchise_id,
                    shipped_at
                    arrived_at
                  )
      VALUE (
        ${userUuid},
        ${userUuid},
        ${itemId},
        ${userUuid},
        ${itemId},
        ${priceHistoryId},
        ${quantity},
        ${userUuid},
        ${addresseeEntityId},
        ${adresseeFranchiseId},
        ${userUuid},
        ${sendeeEntityId},
        ${sendeeFranchiseId},
        ${shippedAtQuery}
        ${arrivedAtQuery}
      )
    `;

  let created;

  if (priceCents) {
    const insertedHistory = await handlePromiseError(sql`
      INSERT INTO 
      items_unit_price_history (user_id, item_id, unit_user_id, unit_name, price_cents)
      VALUE (${userUuid}, ${itemId}, ${userUuid}, ${unit}, ${priceCents})
      RETURNING history_id;
    `)

    if (insertedHistory.error) {
      await sql`ROLLBACK`
      throw new Error(insertedHistory.error);
    }

    const [row] = insertedHistory;
    const {history_id} = row;

    created = await handlePromiseError(sql`${createdOperationQuery(history_id)}`);

    if (created.error) {
      await sql`ROLLBACK`;
      throw new Error(created.error);
    }

    return created;
  } else {
    const lastPrice = await handlePromiseError(sql`SELECT (history_id) FROM (
      SELECT MAX(priced_at) FROM items_unit_price_history
    )`)

    if (lastPrice.error) throw new Error(lastPrice.error);

    const [row] = lastPrice;
    const {history_id} = row;

    created = await handlePromiseError(sql`${createdOperationQuery(history_id)}`);

    if (created.error) throw new Error(created.error);

    return created;
  }
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

export const insertItem = async (userUuid: UUID, name: string, description?: string) => {
  const created = await handlePromiseError(sql`
    INSERT INTO items (user_id, name, description)
    VALUE (${userUuid}, ${name}, ${description ?? "NULL"})
  `)

  if (created.error) throw new Error(created.error);

  return created;
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

export const insertItemCategory = async (userUuid: UUID, name: string, description?: string) => {
  const created = await handlePromiseError(sql`
    INSERT INTO item_categories (user_id, name, description)
    VALUE (${userUuid}, ${name}, ${description ?? "NULL"})
  `)

  if (created.error) throw new Error(created.error);

  return created;
}

export const addCategoryToItem = async (userUuid: UUID, itemId: number, categoryId: number) => {
  const created = await handlePromiseError(sql`
    INSERT INTO categories_of_items (item_user_id, item_id, category_user_id, category_id)
    VALUE (${userUuid}, ${itemId}, ${userUuid}, ${categoryId})
  `)

  if (created.error) throw new Error(created.error);

  return created;
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

export const insertEntityFranchise = async (userUuid: UUID, name: string, address: string, trade?: string) => {
  const createdEntity = await handlePromiseError(sql`
    INSERT INTO entities (user_id, name, trade)
    VALUE (${userUuid}, ${name}, ${trade ?? "NULL"})
    RETURNING entity_id
  `)

  if (createdEntity.error) throw new Error(createdEntity.error);

  const [entityRow] = createdEntity;
  const {entity_id} = entityRow;

  const createdFranchise = await handlePromiseError(sql`
    INSERT INTO entities_ranchises (user_id, entity_id, address)
    VALUE (${userUuid}, ${entity_id}, ${address})
    RETURNING (user_id, franchise_id)
  `)

  if (createdFranchise.error) {
    await sql`ROLLBACK`;
    throw new Error(createdFranchise.error);
  }

  return createdFranchise;
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