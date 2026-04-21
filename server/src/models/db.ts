import { config } from "dotenv";

config();

import postgres from "postgres";
import { handleError, PromiseError } from "@app/utils";
import type { UUID } from "node:crypto";
import { entityFranchises, itemCategories, items, itemUnits, unitPriceHistory, operations, categoriesOfItems} from "./newUserData.ts";
import type { EntityType, APIMutationParams } from "@app/utils";

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
  const created = await handleError(sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${username}, ${email}, ${hashedPassword})
    RETURNING (users.id, users.name)
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  if (initUserData) {
    const [row] = created;
    const {id} = row!;

    const uniqueEntities = 
      Array.from(
        new Map(
          entityFranchises.map(entityFranchise => 
            [entityFranchise.name, 
            ({...entityFranchise, trade: entityFranchise.trade ?? null, user_id: id})]
          )
        )
      )
      .map(item => item[1]);

    await sql`INSERT INTO entities ${sql(uniqueEntities, 'user_id', 'name', 'trade')}`

    let franchisesWithEntityID: Record<string, any>[] = [];

    for (const entity of uniqueEntities) {
      const franchise = entityFranchises
        .filter(entityFranchise => entityFranchise.name === entity.name)
        .map(entityFranchise => ({
          ...entityFranchise, 
          entity_user_id: id, 
          franchise_user_id: id, 
          entity_name: entityFranchise.name, 
          franchise_entity_name: 
          entityFranchise.name,
          franchise_address: entityFranchise.address
        }));

      franchisesWithEntityID.push(...franchise);
    }

    await sql`INSERT INTO entities_franchises ${sql(franchisesWithEntityID, 'entity_user_id', 'entity_name', 'address')}`;

    await sql`INSERT INTO outsourced_entity_franchise_types ${
      sql(
        franchisesWithEntityID, 
        "franchise_user_id", 
        "entity_name", 
        "franchise_address", 
        "type"
      )}`;

    const createUserExampleItems = 
    sql`INSERT INTO items ${
      sql(items.map(item => ({...item, user_id: id})))
    }`;

    const createUserExampleItemCategories = 
    sql`INSERT INTO item_categories ${
      sql(itemCategories.map(category => ({...category, user_id: id})))
    }`;

    const createUserExampleItemUnits = 
    sql`INSERT INTO item_units ${
      sql(itemUnits.map(unit => ({...unit, user_id: id})))
    }`;

    await Promise.all([
      createUserExampleItems,
      createUserExampleItemCategories,
      createUserExampleItemUnits
    ])

    const addCategoryToExampleItems =
    sql`INSERT INTO categories_of_items ${
      sql(categoriesOfItems.map(categoryOfItem => (
        {...categoryOfItem, item_user_id: id, category_user_id: id}
      )))
    }`;

    const addPriceHistoryToExampleItems =
    await sql`INSERT INTO items_unit_price_history ${
      sql(unitPriceHistory.map(history => ({
        ...history, 
        item_user_id: id, 
        unit_user_id: id
      })))
    }`;

    await Promise.all([
      addCategoryToExampleItems,
      addPriceHistoryToExampleItems
    ])

    const operationsWithUnitPricesID: Record<string, any>[] = [];
    
    for (const operation of operations) {
      const latestPrice = await sql`
        SELECT MAX(history_id) FROM items_unit_price_history
        WHERE item_name = ${operation.item_name}
        ${
          operation.shipped_at ? sql`AND priced_at <= ${operation.shipped_at}` :
          operation.arrived_at ? sql`AND priced_at <= ${operation.arrived_at}` :
          sql``
        }
      `

      const [row] = latestPrice;
      const {max: unitPriceID} = row!

      let addressee;
      let sendee;

      if (!operation.addressee_entity_name) {
        const userEntityFranchise = await sql`
          SELECT * FROM entities_franchises
          WHERE entity_user_id = ${id}
          AND entity_name = ${username}
        `;

        const [row] = userEntityFranchise;

        addressee = {name: row!.entity_name, address: row!.address};
      } else addressee = {name: operation.addressee_entity_name, address: operation.addressee_franchise_address};

      if (!operation.sendee_entity_name) {
        const userEntityFranchise = await sql`
          SELECT * FROM entities_franchises
          WHERE entity_user_id = ${id}
          AND entity_name = ${username}
        `;

        const [row] = userEntityFranchise;

        sendee = {name: row!.entity_name, address: row!.address};
      } else sendee = {name: operation.sendee_entity_name, address: operation.sendee_franchise_address};

      operationsWithUnitPricesID.push({
        ...operation, 
        user_id: id,
        item_user_id: id,
        unit_price_user_id: id,
        unit_price_item_name: operation.item_name,
        unit_price_id: unitPriceID,
        addressee_user_id: id,
        addressee_entity_name: addressee.name,
        addressee_franchise_address: addressee.address, 
        sendee_user_id: id,
        sendee_entity_name: sendee.name,
        sendee_franchise_address: sendee.address
      })
    }

    await sql`INSERT INTO operations ${sql(operationsWithUnitPricesID)}`;
  }

  return created;
}

export const retrieveUser = async (email: string) => {
  const user = await handleError(sql`
    SELECT * FROM users
    WHERE email = ${email}
  `)

  if (user instanceof PromiseError) throw new Error(user.error);

  return user;
}

type EntityFranchiseID = {entityName: string, franchiseAddress: string};

type insertOperationParams = {
  userUuid: UUID,
  addressee: EntityFranchiseID,
  sendee: EntityFranchiseID,
  itemName: string, 
  quantity: number,
  unit: string,
  priceCents: number | null,
  shippedAt?: Date | null,
  arrivedAt?: Date | null
}

export const insertUserOperation = async ({
  userUuid, addressee, sendee, itemName, quantity, unit, priceCents, shippedAt, arrivedAt
}: APIMutationParams["operations"]) => {
  const {entityName: addresseeEntityName, franchiseAddress: adresseeFranchiseAddress} = addressee;

  const {entityName: sendeeEntityName, franchiseAddress: sendeeFranchiseAddress} = sendee;

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
        item_user_id, 
        item_name,
        unit_price_user_id,
        unit_price_item_name,
        unit_price_id,
        quantity,
        adressee_user_id,
        adressee_entity_name,
        adressee_franchise_addres,
        sendee_user_id,
        sendee_entity_name,
        sendee_franchise_address,
        shipped_at
        arrived_at
      )
      VALUES (
        ${userUuid},
        ${userUuid},
        ${itemName},
        ${userUuid},
        ${itemName},
        ${priceHistoryId},
        ${quantity},
        ${userUuid},
        ${addresseeEntityName},
        ${adresseeFranchiseAddress},
        ${userUuid},
        ${sendeeEntityName},
        ${sendeeFranchiseAddress},
        ${shippedAtQuery}
        ${arrivedAtQuery}
      )
    `;

  let created;

  if (priceCents) {
    const insertedHistory = await handleError(sql`
      INSERT INTO 
      items_unit_price_history (user_id, item_id, unit_user_id, unit_name, price_cents)
      VALUES (${userUuid}, ${itemName}, ${userUuid}, ${unit}, ${priceCents})
      RETURNING history_id;
    `)

    if (insertedHistory instanceof PromiseError) {
      await sql`ROLLBACK`
      throw new Error(insertedHistory.error);
    }

    const [row] = insertedHistory;
    const {history_id} = row!;

    created = await handleError(sql`${createdOperationQuery(history_id)}`);

    if (created instanceof PromiseError) {
      await sql`ROLLBACK`;
      throw new Error(created.error);
    }

    return created;
  } else {
    const lastPrice = await handleError(sql`SELECT (history_id) FROM (
      SELECT MAX(priced_at) FROM items_unit_price_history
      WHERE user_id = ${userUuid}
      AND item_id = ${itemName}
    )`)

    if (lastPrice instanceof PromiseError) throw new Error(lastPrice.error);

    const [row] = lastPrice;

    if (!row) throw new Error("No price was registered for the specified item.")

    const {history_id} = row;

    created = await handleError(sql`${createdOperationQuery(history_id)}`);

    if (created instanceof PromiseError) throw new Error(created.error);

    return created;
  }
}

const joinAllOperationsQuery = `
  JOIN items ON CONCAT(items.user_id, name) = CONCAT(operations.user_id, operations.item_name)
  JOIN items_unit_price_history ON CONCAT(items_unit_price_history.item_user_id, items_unit_price_history.item_name, history_id) = CONCAT(operations.user_id, operations.unit_price_item_name, operations.unit_price_id)
  JOIN entities_franchises 
    ON CONCAT(entity_user_id, entity_name, address) = CONCAT(operations.user_id, operations.addressee_entity_name, operations.addressee_franchise_address)
    OR CONCAT(entity_user_id, entity_name, address) = CONCAT(operations.user_id, operations.sendee_entity_name, operations.sendee_franchise_address)
`

export const retrieveUserOperation = async (userUuid: UUID, operationId: number, joinAll?: boolean) => {
  const operation = await handleError(
    sql`
      SELECT * FROM operations
      ${joinAll ? joinAllOperationsQuery : ""}
      WHERE user_id = ${userUuid}
      AND operation_id = ${operationId}
    `
  )

  if (operation instanceof PromiseError) throw new Error(operation.error);

  return operation;
}

export const retrieveAllUserOperation = async (userUuid: UUID, joinAll?: boolean) => {
  const operations = await handleError(joinAll ? sql`
    SELECT * FROM operations
    ${joinAllOperationsQuery}
    WHERE operations.user_id = ${userUuid}
  ` : sql`
    SELECT * FROM operations
    WHERE operations.user_id = ${userUuid}
  `)

  if (operations instanceof PromiseError) throw new Error(operations.error);

  return operations;
}

export const insertUserItem = async ({userUuid, name, description}: APIMutationParams["avaliable_items"]) => {
  const created = await handleError(sql`
    INSERT INTO items (user_id, name, description)
    VALUES (${userUuid}, ${name}, ${description ?? "NULL"})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  return created;
}

const joinItemCategoryQuery = `
  JOIN categories_of_items ON CONCAT(item_user_id, item_name) = CONCAT(items.user_id, items.name)
`

export const retrieveUserItem = async (userUuid: UUID, name: string, joinCategory?: boolean) => {
  const item = await handleError(joinCategory ?
    sql`
      SELECT * FROM items
      ${joinItemCategoryQuery}
      WHERE user_id = ${userUuid}
      AND name = ${name}
    ` :
    sql`
      SELECT * FROM items
      WHERE user_id = ${userUuid}
      AND name = ${name}
    `
  )

  return item;
}

export const retrieveAllUserItems = async (userUuid: UUID, joinCategory?: boolean) => {
  const items = await handleError(joinCategory ?
    sql`
      SELECT * FROM items
      ${joinItemCategoryQuery}
      WHERE user_id = ${userUuid}
    ` :
    sql`
      SELECT * FROM items
      WHERE user_id = ${userUuid}
    `
  )

  if (items instanceof PromiseError) throw new Error(items.error);

  return items;
}

export const insertUserItemCategory = async ({userUuid, name, description}: APIMutationParams["item_categories"]) => {
  const created = await handleError(sql`
    INSERT INTO item_categories (user_id, name, description)
    VALUES (${userUuid}, ${name}, ${description ?? "NULL"})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  return created;
}

export const addUserCategoryToItem = async (userUuid: UUID, itemName: string, categoryName: string) => {
  const created = await handleError(sql`
    INSERT INTO categories_of_items (item_user_id, item_id, category_user_id, category_id)
    VALUES (${userUuid}, ${itemName}, ${userUuid}, ${categoryName})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  return created;
}

export const retrieveUserItemCategory = async (userUuid: UUID, categoryName: string) => {
  const category = await handleError(sql`
    SELECT * FROM item_categories
    WHERE user_id = ${userUuid}
    AND name = ${categoryName}
  `)

  if (category instanceof PromiseError) throw new Error(category.error);

  return category;
}

export const retrieveAllUserItemCategories = async (userUuid: UUID) => {
  const categories = await handleError(sql`
    SELECT * FROM item_categories
    WHERE user_id = ${userUuid}
  `)

  if (categories instanceof PromiseError) throw new Error(categories.error);

  return categories;
}

export const insertUserItemUnit = async ({userUuid, name, description, wikipediaUrl}: APIMutationParams["item_units"]) => {
  const created = await handleError(sql`
    INSERT INTO item_units (user_id, name, description, wikipedia_url)
    VALUES (${userUuid}, ${name}, ${description ?? "NULL"}, ${wikipediaUrl ?? "NULL"})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  return created;
}

export const retrieveUserItemUnit = async (userUuid: UUID, unitName: string) => {
  const unit = await handleError(sql`
    SELECT * FROM item_units
    WHERE user_id = ${userUuid}
    AND name = ${unitName}
  `)

  if (unit instanceof PromiseError) throw new Error(unit.error);

  return unit;
}

export const retrieveAllUserItemUnits = async (userUuid: UUID) => {
  const units = await handleError(sql`
    SELECT * FROM item_units
    WHERE user_id = ${userUuid}
  `)

  if (units instanceof PromiseError) throw new Error(units.error);

  return units;
}

export const insertUserEntityFranchise = async ({userUuid, name, address, trade}: APIMutationParams["entities"]) => {
  const createdEntity = await handleError(sql`
    INSERT INTO entities (user_id, name, trade)
    VALUES (${userUuid}, ${name}, ${trade ?? "NULL"})
    RETURNING entity_id
  `)

  if (createdEntity instanceof PromiseError) throw new Error(createdEntity.error);

  const [entityRow] = createdEntity;
  const {entity_name} = entityRow!;

  const createdFranchise = await handleError(sql`
    INSERT INTO entities_ranchises (user_id, entity_name, address)
    VALUES (${userUuid}, ${entity_name}, ${address})
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
    ON CONCAT(outsourced_entity_franchise_types.franchise_user_id, outsourced_entity_franchise_types.entity_name, outsourced_entity_franchise_types.franchise_address) = (entities_franchises.entity_user_id, entities_franchises.entity_name, entities_franchises.address)
  `

export const retrieveUserEntityFranchise = async (userUuid: UUID, entityName: string, address: string, joinType?: boolean) => {
  const sqlQuery = `
    SELECT * FROM entities
    JOIN entities_franchises ON CONCAT(entities_franchises.entity_user_id, entities_franchises.entity_name, entities_franchises.address) = CONCAT(entities.user_id, entities.entity_name, ${address})
    WHERE user_id = ${userUuid}
    AND entity_name = ${entityName}
  `

  const entityFranchise = await handleError(joinType ?
    sql`
      SELECT * FROM entities
      JOIN entities_franchises ON CONCAT(entities_franchises.entity_user_id, entities_franchises.entity_name, entities_franchises.address) = CONCAT(entities.user_id, entities.entity_name, ${address})
      ${joinFranchiseOfType}
      WHERE user_id = ${userUuid}
      AND entity_name = ${entityName}
    ` :
    sql`
      SELECT * FROM entities
      JOIN entities_franchises ON CONCAT(entities_franchises.entity_user_id, entities_franchises.entity_name, entities_franchises.address) = CONCAT(entities.user_id, entities.entity_name, ${address})
      WHERE user_id = ${userUuid}
      AND entity_name = ${entityName}
    `
  )

  if (entityFranchise instanceof PromiseError) throw new Error(entityFranchise.error);

  return entityFranchise;
}

export const retrieveAllUserEntityFranchises = async (userUuid: UUID, joinType?: boolean) => {
  const sqlQuery = sql`
    SELECT * FROM entities
    JOIN entities_franchises ON CONCAT(entities_franchises.entity_user_id, entities_franchises.entity_name) = CONCAT(entities.user_id, entities.name)
    WHERE user_id = ${userUuid}
  `

  const entitiesFranchises = await handleError(joinType ? 
    sql`
      SELECT * FROM entities
      JOIN entities_franchises ON CONCAT(entities_franchises.entity_user_id, entities_franchises.entity_name) = CONCAT(entities.user_id, entities.name)
      ${joinFranchiseOfType}
      WHERE user_id = ${userUuid}
    ` : 
    sql`
      SELECT * FROM entities
      JOIN entities_franchises ON CONCAT(entities_franchises.entity_user_id, entities_franchises.entity_name) = CONCAT(entities.user_id, entities.name)
      WHERE user_id = ${userUuid}
    `
  );

  if (entitiesFranchises instanceof PromiseError) throw new Error(entitiesFranchises.error);

  return entitiesFranchises;
}

export const addTypeToEntityFranchise = async (userUuid: UUID, entityName: number, address: number, type: EntityType) => {
  const created = await handleError(sql`
    INSERT INTO ${sql(`outsourced_${type}_entity_franchises`)} 
    VALUES (${userUuid}, ${entityName}, ${address})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  return created;
}

export const retrieveAllUserEntityFranchisesOfType = async (userUuid: UUID, type: EntityType) => {
  const tableName = 'outsourced_entity_franchise_types';

  const entitiesFranchises = await handleError(sql`
    SELECT * FROM entities_franchises
    JOIN ${sql(tableName)} 
    ON CONCAT(${tableName}.user_id, ${tableName}.entity_name, ${tableName}.franchise_address) = CONCAT(${userUuid}, entities_franchises.entity_name, entities_franchises.address)
    WHERE ${sql(tableName)}.type = ${type}
  `)

  if (entitiesFranchises instanceof PromiseError) throw new Error(entitiesFranchises.error);

  return entitiesFranchises;
}