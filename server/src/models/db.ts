import { config } from "dotenv";

config();

import postgres from "postgres";
import { errorHandler } from "../../../utils.ts";
import type { UUID } from "node:crypto";

type EntityType = "service_provider" | "supplier" | "client";

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
  const created = await errorHandler(sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${username}, ${email}, ${hashedPassword})
    RETURNING users.id
  `)

  if (created.error) throw new Error(created.error);

  return created;
}

export const retrieveUser = async (email: string) => {
  const user = await errorHandler(sql`
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

export const insertUserOperation = async ({
  userUuid, addressee, sendee, itemId, quantity, unit, priceCents, shippedAt, arrivedAt
}: insertOperationParams) => {
  const {entityId: addresseeEntityId, franchiseId: adresseeFranchiseId} = addressee;

  const {entityId: sendeeEntityId, franchiseId: sendeeFranchiseId} = sendee;

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
    const insertedHistory = await errorHandler(sql`
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

    created = await errorHandler(sql`${createdOperationQuery(history_id)}`);

    if (created.error) {
      await sql`ROLLBACK`;
      throw new Error(created.error);
    }

    return created;
  } else {
    const lastPrice = await errorHandler(sql`SELECT (history_id) FROM (
      SELECT MAX(priced_at) FROM items_unit_price_history
    )`)

    if (lastPrice.error) throw new Error(lastPrice.error);

    const [row] = lastPrice;
    const {history_id} = row;

    created = await errorHandler(sql`${createdOperationQuery(history_id)}`);

    if (created.error) throw new Error(created.error);

    return created;
  }
}

const joinAllOperationsQuery = `
  JOIN items ON CONCAT(items.user_id, items.item_id) = CONCAT(operations.user_id, operations_item_id)
  JOIN items_unit_price_history ON CONCAT(items_unit_price_history.user_id, items_unit_price_history.unit_id, items_unit_price_history.history_id) = CONCAT(operations.user_id, operations.unit_id, operations.history_id)
  JOIN entities_franchises ON CONCAT(addressee.user_id, addressee.entity_id, addressee.franchise_id) = CONCAT(operations.user_id, operations.entity_id, operations.franchise_id)
  JOIN entities_franchises ON CONCAT(sendee.user_id, sendee.entity_id, sendee.franchise_id) = CONCAT(operations.user_id, operations.entity_id, operations.franchise_id)
`

export const retrieveUserOperation = async (userUuid: UUID, operationId: number, joinAll?: boolean) => {
  const sqlQuery = `
    SELECT * FROM operations
    WHERE user_id = ${userUuid}
    AND operation_id = ${operationId}
  `

  const operation = await errorHandler(joinAll ?
    sql`
      ${sqlQuery}
      ${joinAllOperationsQuery}
    ` : 
    sql`${sqlQuery}`
  )

  if (operation.error) throw new Error(operation.error);

  return operation;
}

export const retrieveAllUserOperation = async (userUuid: UUID, joinAll?: boolean) => {
  const sqlQuery = `
    SELECT * FROM operations
    WHERE user_id = ${userUuid}
  `;

  const operations = await errorHandler(joinAll ?
    sql`
      ${sqlQuery}
      ${joinAllOperationsQuery}
    ` :
    sql`${sqlQuery}`
  )

  if (operations.error) throw new Error(operations.error);

  return operations;
}

export const insertUserItem = async (userUuid: UUID, name: string, description?: string) => {
  const created = await errorHandler(sql`
    INSERT INTO items (user_id, name, description)
    VALUE (${userUuid}, ${name}, ${description ?? "NULL"})
  `)

  if (created.error) throw new Error(created.error);

  return created;
}

const joinItemCategoryQuery = `
  JOIN categories_of_items ON CONCAT(categories_of_items.item_user_id, categories_of_items.item_id) = CONCAT(items.user_id, items.item_id)
`

export const retrieveUserItem = async (userUuid: UUID, itemId: number, joinCategory?: boolean) => {
  const sqlQuery = `
    SELECT * FROM items
    WHERE user_id = ${userUuid}
    AND item_id = ${itemId}
  `

  const item = await errorHandler(joinCategory ?
    sql`
      ${sqlQuery}
      ${joinItemCategoryQuery}
    ` :
    sql`${sqlQuery}`
  )

  return item;
}

export const retrieveAllUserItems = async (userUuid: UUID, joinCategory?: boolean) => {
  const sqlQuery = `
    SELECT * FROM items
    WHERE user_id = ${userUuid}
  `

  const items = await errorHandler(joinCategory ?
    sql`
      ${sqlQuery}
      ${joinItemCategoryQuery}
    ` :
    sql`${sqlQuery}`
  )

  if (items.error) throw new Error(items.error);

  return items;
}

export const insertUserItemCategory = async (userUuid: UUID, name: string, description?: string) => {
  const created = await errorHandler(sql`
    INSERT INTO item_categories (user_id, name, description)
    VALUE (${userUuid}, ${name}, ${description ?? "NULL"})
  `)

  if (created.error) throw new Error(created.error);

  return created;
}

export const addUserCategoryToItem = async (userUuid: UUID, itemId: number, categoryId: number) => {
  const created = await errorHandler(sql`
    INSERT INTO categories_of_items (item_user_id, item_id, category_user_id, category_id)
    VALUE (${userUuid}, ${itemId}, ${userUuid}, ${categoryId})
  `)

  if (created.error) throw new Error(created.error);

  return created;
}

export const retrieveUserItemCategory = async (userUuid: UUID, categoryId: number) => {
  const category = await errorHandler(sql`
    SELECT * FROM item_categories
    WHERE user_id = ${userUuid}
    AND item_id = ${categoryId}
  `)

  if (category.error) throw new Error(category.error);

  return category;
}

export const retrieveAllUserItemCategories = async (userUuid: UUID) => {
  const categories = await errorHandler(sql`
    SELECT * FROM item_categories
    WHERE user_id = ${userUuid}
  `)

  if (categories.error) throw new Error(categories.error);

  return categories;
}

export const insertUserEntityFranchise = async (userUuid: UUID, name: string, address: string, trade?: string) => {
  const createdEntity = await errorHandler(sql`
    INSERT INTO entities (user_id, name, trade)
    VALUE (${userUuid}, ${name}, ${trade ?? "NULL"})
    RETURNING entity_id
  `)

  if (createdEntity.error) throw new Error(createdEntity.error);

  const [entityRow] = createdEntity;
  const {entity_id} = entityRow;

  const createdFranchise = await errorHandler(sql`
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

const joinFranchiseTypeQuery = (franchiseType: EntityType) => {
  const tableName = `outsourced_${franchiseType}_entity_franchises`

  return `
    JOIN ${sql(tableName)}
    ON CONCAT(${tableName}.user_id, ${tableName}.entity_id, ${tableName}.franchise_id) = (entities_franchises.user_id, entities_franchises.entity_id, entities_franchises.franchise_id)
  `
}

export const retrieveUserEntityFranchise = async (userUuid: UUID, entityId: number, franchiseId: number, joinType: EntityType) => {
  const sqlQuery = `
    SELECT * FROM entities
    WHERE user_id = ${userUuid}
    AND entity_id = ${entityId}
    JOIN entities_franchises ON CONCAT(entities_franchises.user_id, entities_franchises.entity_id, entities_franchises.franchise_id) = CONCAT(entities.user_id, entities.entity_id, ${franchiseId})
  `

  const entityFranchise = await errorHandler(joinType ?
    sql`
      ${sqlQuery}
      ${joinFranchiseTypeQuery(joinType)}
    ` :
    sql`${sqlQuery}`
  )

  if (entityFranchise.error) throw new Error(entityFranchise.error);

  return entityFranchise;
}

export const retrieveAllUserEntityFranchises = async (userUuid: UUID, joinType: EntityType) => {
  const sqlQuery = sql`
    SELECT * FROM entities
    WHERE user_id = ${userUuid}
    JOIN entities_franchises ON CONCAT(entities_franchises.user_id, entities_franchises.entity_id) = CONCAT(entities.user_id, entities.entity_id)
  `

  const entitiesFranchises = await errorHandler(joinType ? 
    sql`
      ${sqlQuery}
      ${joinFranchiseTypeQuery(joinType)}
    ` : 
    sql`${sqlQuery}`
  );

  if (entitiesFranchises.error) throw new Error(entitiesFranchises.error);

  return entitiesFranchises;
}

export const addTypeToEntityFranchise = async (userUuid: UUID, entityId: number, franchiseId: number, type: EntityType) => {
  const created = await errorHandler(sql`
    INSERT INTO ${sql(`outsourced_${type}_entity_franchises`)} 
    VALUE (${userUuid}, ${entityId}, ${franchiseId})
  `)

  if (created.error) throw new Error(created.error);

  return created;
}

export const retrieveAllUserEntityFranchisesOfType = async (userUuid: UUID, type: EntityType) => {
  const tableName = `outsourced_${type}_entity_franchises`

  const entitiesFranchises = await errorHandler(sql`
    SELECT * FROM entities_franchises
    JOIN ${sql(tableName)} 
    ON CONCAT(${sql(tableName)}.user_id, ${sql(tableName)}.entity_id, ${sql(tableName)}.franchise_id) = CONCAT(${userUuid}, entities_franchises.entity_id, entities_franchises.franchise_id)
  `)

  if (entitiesFranchises.error) throw new Error(entitiesFranchises.error);

  return entitiesFranchises;
}

export const insertUserStorageArea = async (userUuid: UUID, entityId: number, franchiseId: number, name: string, description: string, locationReference: string, address?: string) => {
  const createdStorage = await errorHandler(sql`
    INSERT INTO storage_areas (user_id, entity_id, franchise_id, name, description, location_reference, address)
    VALUE (${userUuid}, ${entityId}, ${franchiseId}, ${name}, ${description}, ${locationReference}, ${address ?? "NULL"})
    RETURNING storage_id
  `)

  if (createdStorage.error) throw new Error(createdStorage.error);

  return createdStorage;
}

const joinEntityFranchiseQuery = `
  JOIN entities_franchises
  ON CONCAT(entities_franchises.user_id, entities_franchises.entity_id, entities_franchises.franchise_id) = CONCAT(storage_areas.user_id, storage_areas.entity_id, storage_areas.franchise_id)
`

export const retrieveUserStorageArea = async (userUuid: UUID, entityId: number, franchiseId: number, storageAreaId: number, joinFranchise?: boolean) => {
  const sqlQuery = `
    SELECT * FROM storage_areas
    WHERE user_id = ${userUuid}
    AND entity_id = ${entityId}
    AND franchise_id = ${entityId}
  `

  const storageArea = await errorHandler(joinFranchise ? 
    sql`
      ${sqlQuery}
      ${joinEntityFranchiseQuery}
    ` :
    sql`${sqlQuery}`
  )

  if (storageArea.error) throw new Error(storageArea.error);

  return storageArea;
}

export const retrieveAlUserStorageAreas = async (userUuid: UUID, joinFranchise?: boolean) => {
  const sqlQuery = `
    SELECT * FROM storage_areas
    WHERE user_id = ${userUuid}
  `

  const storageArea = await errorHandler(joinFranchise ? 
    sql`
      ${sqlQuery}
      ${joinEntityFranchiseQuery}
    ` :
    sql`${sqlQuery}`
  )

  if (storageArea.error) throw new Error(storageArea.error);

  return storageArea;
}