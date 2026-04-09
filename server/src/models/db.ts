import { config } from "dotenv";

config();

import postgres from "postgres";
import { errorHandler, PromiseError } from "@app/utils";
import type { UUID } from "node:crypto";
import { entityFranchises, itemCategories, items, itemUnits, unitPriceHistory, operations} from "./newUserData.ts";
import entitiesRouter from "../routes/entitiesRouter.ts";

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

export const insertNewUser = async (username: string, email: string, hashedPassword: string, initUserData?: boolean) => {
  const created = await errorHandler(sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${username}, ${email}, ${hashedPassword})
    RETURNING users.id
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  if (initUserData) {
    const uniqueEntities = Array.from(new Map(entityFranchises.map(entityFranchise => [entityFranchise.name, entityFranchise]))).map(item => item[1]);

    const entities = await sql`INSERT INTO entities ${sql(uniqueEntities, 'name', 'trade')} RETURNING entities`

    let franchisesWithEntityID: Record<string, any>[] = [];
    entities.forEach(entity => {
      const franchise = entityFranchises
        .filter(entityFranchise => entityFranchise.name === entity.name)
        .map(entityFranchise => ({...entityFranchises, entity_id: entity.id}));

      franchisesWithEntityID.push(franchise);
    });

    await sql`INSERT INTO entities_franchises ${sql(franchisesWithEntityID)}`;

    await sql`INSERT INTO item_categories ${sql(itemCategories)}`;

    await sql`INSERT INTO item_units ${sql(itemUnits)}`;

    await sql`INSERT INTO items ${sql(items)}`;

    await sql`INSERT INTO items_unit_price_history ${sql(unitPriceHistory)}`;

    await sql`INSERT INTO operations ${sql(operations)}`;

  }

  return created;
}

export const retrieveUser = async (email: string) => {
  const user = await errorHandler(sql`
    SELECT * FROM users
    WHERE email = ${email}
  `)

  if (user instanceof PromiseError) throw new Error(user.error);

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
      VALUES (
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
      VALUES (${userUuid}, ${itemId}, ${userUuid}, ${unit}, ${priceCents})
      RETURNING history_id;
    `)

    if (insertedHistory instanceof PromiseError) {
      await sql`ROLLBACK`
      throw new Error(insertedHistory.error);
    }

    const [row] = insertedHistory;
    const {history_id} = row!;

    created = await errorHandler(sql`${createdOperationQuery(history_id)}`);

    if (created instanceof PromiseError) {
      await sql`ROLLBACK`;
      throw new Error(created.error);
    }

    return created;
  } else {
    const lastPrice = await errorHandler(sql`SELECT (history_id) FROM (
      SELECT MAX(priced_at) FROM items_unit_price_history
      WHERE user_id = ${userUuid}
      AND item_id = ${itemId}
    )`)

    if (lastPrice instanceof PromiseError) throw new Error(lastPrice.error);

    const [row] = lastPrice;

    if (!row) throw new Error("No price was registered for the specified item.")

    const {history_id} = row;

    created = await errorHandler(sql`${createdOperationQuery(history_id)}`);

    if (created instanceof PromiseError) throw new Error(created.error);

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

  if (operation instanceof PromiseError) throw new Error(operation.error);

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

  if (operations instanceof PromiseError) throw new Error(operations.error);

  return operations;
}

export const insertUserItem = async (userUuid: UUID, name: string, description?: string) => {
  const created = await errorHandler(sql`
    INSERT INTO items (user_id, name, description)
    VALUES (${userUuid}, ${name}, ${description ?? "NULL"})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

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

  if (items instanceof PromiseError) throw new Error(items.error);

  return items;
}

export const insertUserItemCategory = async (userUuid: UUID, name: string, description?: string) => {
  const created = await errorHandler(sql`
    INSERT INTO item_categories (user_id, name, description)
    VALUES (${userUuid}, ${name}, ${description ?? "NULL"})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  return created;
}

export const addUserCategoryToItem = async (userUuid: UUID, itemId: number, categoryId: number) => {
  const created = await errorHandler(sql`
    INSERT INTO categories_of_items (item_user_id, item_id, category_user_id, category_id)
    VALUES (${userUuid}, ${itemId}, ${userUuid}, ${categoryId})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  return created;
}

export const retrieveUserItemCategory = async (userUuid: UUID, categoryId: number) => {
  const category = await errorHandler(sql`
    SELECT * FROM item_categories
    WHERE user_id = ${userUuid}
    AND item_id = ${categoryId}
  `)

  if (category instanceof PromiseError) throw new Error(category.error);

  return category;
}

export const retrieveAllUserItemCategories = async (userUuid: UUID) => {
  const categories = await errorHandler(sql`
    SELECT * FROM item_categories
    WHERE user_id = ${userUuid}
  `)

  if (categories instanceof PromiseError) throw new Error(categories.error);

  return categories;
}

export const insertUserEntityFranchise = async (userUuid: UUID, name: string, address: string, trade?: string) => {
  const createdEntity = await errorHandler(sql`
    INSERT INTO entities (user_id, name, trade)
    VALUES (${userUuid}, ${name}, ${trade ?? "NULL"})
    RETURNING entity_id
  `)

  if (createdEntity instanceof PromiseError) throw new Error(createdEntity.error);

  const [entityRow] = createdEntity;
  const {entity_id} = entityRow!;

  const createdFranchise = await errorHandler(sql`
    INSERT INTO entities_ranchises (user_id, entity_id, address)
    VALUES (${userUuid}, ${entity_id}, ${address})
    RETURNING (user_id, franchise_id)
  `)

  if (createdFranchise instanceof PromiseError) {
    await sql`ROLLBACK`;
    throw new Error(createdFranchise.error);
  }

  return createdFranchise;
}

const joinFranchiseOfType = `
    JOIN outsourced_entity_franchise_types
    ON CONCAT(entities_franchises.user_id, entities_franchises.entity_id, entities_franchises.franchise_id) = (entities_franchises.user_id, entities_franchises.entity_id, entities_franchises.franchise_id)
  `

export const retrieveUserEntityFranchise = async (userUuid: UUID, entityId: number, franchiseId: number, joinType?: boolean) => {
  const sqlQuery = `
    SELECT * FROM entities
    WHERE user_id = ${userUuid}
    AND entity_id = ${entityId}
    JOIN entities_franchises ON CONCAT(entities_franchises.user_id, entities_franchises.entity_id, entities_franchises.franchise_id) = CONCAT(entities.user_id, entities.entity_id, ${franchiseId})
  `

  const entityFranchise = await errorHandler(joinType ?
    sql`
      ${sqlQuery}
      ${joinFranchiseOfType}
    ` :
    sql`${sqlQuery}`
  )

  if (entityFranchise instanceof PromiseError) throw new Error(entityFranchise.error);

  return entityFranchise;
}

const joinFranchiseTypeQuery = `

`

export const retrieveAllUserEntityFranchises = async (userUuid: UUID, joinType?: boolean) => {
  const sqlQuery = sql`
    SELECT * FROM entities
    WHERE user_id = ${userUuid}
    JOIN entities_franchises ON CONCAT(entities_franchises.user_id, entities_franchises.entity_id) = CONCAT(entities.user_id, entities.entity_id)
  `

  const entitiesFranchises = await errorHandler(joinType ? 
    sql`
      ${sqlQuery}
      ${joinFranchiseOfType}
    ` : 
    sql`${sqlQuery}`
  );

  if (entitiesFranchises instanceof PromiseError) throw new Error(entitiesFranchises.error);

  return entitiesFranchises;
}

export const addTypeToEntityFranchise = async (userUuid: UUID, entityId: number, franchiseId: number, type: EntityType) => {
  const created = await errorHandler(sql`
    INSERT INTO ${sql(`outsourced_${type}_entity_franchises`)} 
    VALUES (${userUuid}, ${entityId}, ${franchiseId})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  return created;
}

export const retrieveAllUserEntityFranchisesOfType = async (userUuid: UUID, type: EntityType) => {
  const tableName = 'outsourced_entity_franchise_types';

  const entitiesFranchises = await errorHandler(sql`
    SELECT * FROM entities_franchises
    JOIN ${sql(tableName)} 
    ON CONCAT(${sql(tableName)}.user_id, ${sql(tableName)}.entity_id, ${sql(tableName)}.franchise_id) = CONCAT(${userUuid}, entities_franchises.entity_id, entities_franchises.franchise_id)
    WHERE ${sql(tableName)}.type = ${type}
  `)

  if (entitiesFranchises instanceof PromiseError) throw new Error(entitiesFranchises.error);

  return entitiesFranchises;
}