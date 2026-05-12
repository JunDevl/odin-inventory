import { config } from "dotenv";

config();

import postgres from "postgres";
import { handleError, PromiseError } from "@packages/utils";
import type { UUID } from "node:crypto";
import { entityFranchises, itemCategories, items, itemUnits, unitPriceHistory, operations, categoriesOfItems} from "./newUserData.ts";
import type { EntityType, APICRUDParams } from "@packages/utils";

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

export const deleteUser = async(user_id: UUID) => {
  const deleted = await handleError(sql`
    DELETE FROM users
    WHERE user_id = ${user_id}
  `)
  
  if (deleted instanceof PromiseError) throw new Error(deleted.error);

  return deleted;
}

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

export const retrieveUser = async (userIdentifier: {email: string} | {user_id: UUID}) => {

  const user = await handleError(sql`
    SELECT * FROM users
    WHERE ${sql(userIdentifier, (Object.keys(userIdentifier) as (keyof typeof userIdentifier)[]))}
  `)

  if (user instanceof PromiseError) throw new Error(user.error);

  return user;
}

type EntityFranchiseID = {entityName: string, franchiseAddress: string};

type insertOperationParams = {
  user_id: UUID,
  addressee: EntityFranchiseID,
  sendee: EntityFranchiseID,
  item_name: string, 
  quantity: number,
  unit: string,
  price_cents: number | null,
  shippedAt?: Date | null,
  arrivedAt?: Date | null
}

export const deleteUserOperations = async(user_id: UUID, operation_ids: number[]) => {
  const deleted = await handleError(sql`
    DELETE FROM operations
    WHERE user_id = ${user_id}
    AND operation_id IN ${sql(operation_ids)}
  `)
  
  if (deleted instanceof PromiseError) throw new Error(deleted.error);

  return deleted;
}

export const insertUserOperation = async (user_id: UUID, newOperation: Omit<APICRUDParams["operations"], "operation_id">) => {
  const {
    addressee_entity_name, addressee_franchise_address, sendee_entity_name, sendee_franchise_address, item_name, quantity, unit_name, price_cents, shipped_at, arrived_at
  } = newOperation;

  const priceHistory = await handleError(price_cents ? sql`
      INSERT INTO 
      items_unit_price_history (item_user_id, item_name, unit_user_id, unit_name, price_cents)
      VALUES (${user_id}, ${item_name}, ${user_id}, ${unit_name}, ${price_cents})
      RETURNING history_id;
    ` :
    sql`
      SELECT history_id FROM items_unit_price_history
      WHERE priced_at = (
        SELECT MAX(priced_at) FROM items_unit_price_history
        WHERE item_user_id = ${user_id}
        AND item_name = ${item_name}
      )
    `)

  if (priceHistory instanceof PromiseError) {
    await sql`ROLLBACK`
    throw new Error(priceHistory.error);
  }

  const [row] = priceHistory;

  if (!row) throw new Error("No price was registered for the specified item.")

  const {history_id} = row;

  newOperation.user_id = user_id;
  newOperation.unit_price_id = history_id;

  delete (newOperation as any).unit_name;
  delete (newOperation as any).price_cents;

  const created = await handleError(sql`
    INSERT INTO operations ${sql(newOperation, (Object.keys(newOperation) as (keyof typeof newOperation)[]))}
  `);

  /*
    user_id, 
    item_user_id, 
    item_name,
    unit_price_user_id,
    unit_price_item_name,
    unit_price_id,
    quantity,
    addressee_user_id,
    addressee_entity_name,
    addressee_franchise_address,
    sendee_user_id,
    sendee_entity_name,
    sendee_franchise_address,
    shipped_at,
    arrived_at
  */ 

  if (created instanceof PromiseError) {
    await sql`ROLLBACK`;
    throw new Error(created.error);
  }
  
  return created;
}

export const updateUserOperation = async (user_id: UUID, operation_id: number, newOperation: Partial<APICRUDParams["operations"]>) => {
  delete newOperation.user_id, newOperation.operation_id;

  const {item_name, unit_name, price_cents} = newOperation;

  const priceHistory = await handleError(price_cents && item_name && unit_name ? sql`
      INSERT INTO 
      items_unit_price_history (item_user_id, item_name, unit_user_id, unit_name, price_cents)
      VALUES (${user_id}, ${item_name}, ${user_id}, ${unit_name}, ${price_cents})
      RETURNING history_id;
    ` :
    sql`
      SELECT history_id FROM operations
      WHERE user_id = ${user_id} AND operation_id = ${operation_id}
    `)

  if (priceHistory instanceof PromiseError) {
    await sql`ROLLBACK`
    throw new Error(priceHistory.error);
  }

  const [row] = priceHistory;

  if (!row) throw new Error("No price was registered for the specified item.")

  const {history_id} = row;

  newOperation.history_id = history_id;

  const updated = await handleError(sql`
    UPDATE operations 
    SET 
      ${sql(newOperation, (Object.keys(newOperation) as (keyof typeof newOperation)[]))}
    WHERE user_id = ${user_id} AND operation_id = ${operation_id}
  `);

  /* 
    item_name = ${item_name},
    unit_price_item_name = ${item_name},
    unit_price_id = ${priceHistoryID},
    quantity = ${quantity},
    addressee_user_id = ${user_id},
    addressee_entity_name = ${addressee_entity_name},
    addressee_franchise_address = ${adresseeFranchiseAddress},
    sendee_user_id = ${user_id},
    sendee_entity_name = ${sendeeEntityName},
    sendee_franchise_address = ${sendeeFranchiseAddress},
    shipped_at = ${shippedAt ?? null},
    arrived_at = ${arrivedAt ?? null}
  */

  if (updated instanceof PromiseError) {
    await sql`ROLLBACK`;
    throw new Error(updated.error);
  }
  
  return updated;
}

const joinAllOperationsQuery = 
  `JOIN items i ON CONCAT(i.user_id, name) = CONCAT(operations.user_id, operations.item_name)
  JOIN items_unit_price_history p ON CONCAT(p.item_user_id, p.item_name, history_id) = CONCAT(operations.user_id, operations.unit_price_item_name, operations.unit_price_id)`

export const retrieveUserOperation = async (user_id: UUID, operation_id: number, joinAll?: boolean) => {
  const operation = await handleError(
    sql`
      SELECT * FROM operations_with_totals AS operations
      ${joinAll ? sql.unsafe(joinAllOperationsQuery) : sql.unsafe("")}
      WHERE user_id = ${user_id}
      AND operation_id = ${operation_id}
    `
  )

  if (operation instanceof PromiseError) throw new Error(operation.error);

  return operation;
}

export const retrieveAllUserOperation = async (user_id: UUID, joinAll?: boolean) => {
  const operations = await handleError(sql`
    SELECT * FROM operations_with_totals AS operations
    ${joinAll ? sql.unsafe(joinAllOperationsQuery) : sql.unsafe("")}
    WHERE operations.user_id = ${user_id}
  `)

  if (operations instanceof PromiseError) throw new Error(operations.error);

  return operations;
}

export const deleteUserItems = async (user_id: UUID, names: string[]) => {
  const deletedItem = await handleError(sql`
    DELETE FROM items
    WHERE user_id = ${user_id} 
    AND name IN ${sql(names)}
  `);

  if (deletedItem instanceof PromiseError) throw new Error(deletedItem.error);

  return deletedItem;
}

export const insertUserItem = async (user_id: UUID, {name, description, category_name}: APICRUDParams["avaliable_items"]) => {
  const createdItem = await handleError(sql`
    INSERT INTO items (user_id, name, description)
    VALUES (${user_id}, ${name}, ${description ?? null})
  `);

  if (category_name) {
    const categoryAdded = await handleError(sql`
      INSERT INTO categories_of_items (item_user_id, item_name, category_user_id, category_name)
      VALUES (${user_id}, ${name}, ${user_id}, ${category_name})
    `);

    if (categoryAdded instanceof PromiseError) throw new Error(categoryAdded.error);
  }

  if (createdItem instanceof PromiseError) throw new Error(createdItem.error);

  return createdItem;
}

export const updateUserItem = async (user_id: UUID, old_name: string, newItem: Partial<APICRUDParams["avaliable_items"]>) => {
  const {category_name} = newItem;

  delete newItem.user_id;

  const item = {name: newItem.name, description: newItem.description};

  const updatedItem = await handleError(sql`
    UPDATE items 
    SET ${sql(item, (Object.keys(item) as (keyof typeof item)[]))}
    WHERE user_id = ${user_id} AND name = ${old_name}
  `);

  const categoryParams = {item_name: newItem.name, category_name}

  if (category_name) {
    const categoryUpdated = await handleError(sql`
      UPDATE categories_of_items 
      SET ${sql(categoryParams, (Object.keys(categoryParams) as (keyof typeof categoryParams)[]))}
      WHERE item_user_id = ${user_id} AND item_name = ${old_name}
    `);

    if (categoryUpdated instanceof PromiseError) throw new Error(categoryUpdated.error);
  }

  if (updatedItem instanceof PromiseError) throw new Error(updatedItem.error);

  return updatedItem;
}

const joinItemCategoryQuery = 
  `LEFT JOIN categories_of_items c ON CONCAT(c.item_user_id, c.item_name) = CONCAT(items.user_id, items.name)`

export const retrieveUserItem = async (user_id: UUID, name: string, joinCategory?: boolean) => {
  const item = await handleError(sql`
    SELECT * FROM items
    ${joinCategory ? sql.unsafe(joinItemCategoryQuery) : sql.unsafe("")}
    WHERE user_id = ${user_id}
    AND name = ${name}  
  `)

  return item;
}

export const retrieveAllUserItems = async (user_id: UUID, joinCategory?: boolean) => {
  const items = await handleError(sql`
    SELECT * FROM items
    ${joinCategory ? sql.unsafe(joinItemCategoryQuery) : sql.unsafe("")}
    WHERE user_id = ${user_id}
  `);

  if (items instanceof PromiseError) throw new Error(items.error);

  return items;
}

export const deleteUserItemCategories = async (user_id: UUID, names: string[]) => {
  const deletedCategory = await handleError(sql`
    DELETE FROM item_categories
    WHERE user_id = ${user_id} 
    AND name IN ${sql(names)}
  `);

  if (deletedCategory instanceof PromiseError) throw new Error(deletedCategory.error);

  return deletedCategory;
}

export const insertUserItemCategory = async (user_id: UUID, {name, description}: APICRUDParams["item_categories"]) => {
  const created = await handleError(sql`
    INSERT INTO item_categories (user_id, name, description)
    VALUES (${user_id}, ${name}, ${description ?? null})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  return created;
}

export const updateUserItemCategory = async (user_id: UUID, old_name: string, newCategory: Partial<APICRUDParams["item_categories"]>) => {
  delete newCategory.user_id;
  
  const updated = await handleError(sql`
    UPDATE item_categories 
    SET ${sql(newCategory, (Object.keys(newCategory) as (keyof typeof newCategory)[]))}
    WHERE user_id = ${user_id} AND name = ${old_name}
  `)

  if (updated instanceof PromiseError) throw new Error(updated.error);

  return updated;
}

export const retrieveUserItemCategory = async (user_id: UUID, categoryName: string) => {
  const category = await handleError(sql`
    SELECT * FROM item_categories
    WHERE user_id = ${user_id} AND name = ${categoryName}
  `)

  if (category instanceof PromiseError) throw new Error(category.error);

  return category;
}

export const retrieveAllUserItemCategories = async (user_id: UUID) => {
  const categories = await handleError(sql`
    SELECT * FROM item_categories
    WHERE user_id = ${user_id}
  `)

  if (categories instanceof PromiseError) throw new Error(categories.error);

  return categories;
}

export const deleteUserItemUnits = async (user_id: UUID, names: string[]) => {
  const deletedUnit = await handleError(sql`
    DELETE FROM item_units
    WHERE user_id = ${user_id} 
    AND name IN ${sql(names)}
  `);

  if (deletedUnit instanceof PromiseError) throw new Error(deletedUnit.error);

  return deletedUnit;
}

export const insertUserItemUnit = async (user_id: UUID, {name, description, wikipedia_url}: APICRUDParams["item_units"]) => {
  const created = await handleError(sql`
    INSERT INTO item_units (user_id, name, description, wikipedia_url)
    VALUES (${user_id}, ${name}, ${description ?? null}, ${wikipedia_url ?? null})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  return created;
}

export const updateUserItemUnit = async (user_id: UUID, old_name: string, newUnit: Partial<APICRUDParams["item_units"]>) => {
  delete newUnit.user_id;

  const updated = await handleError(sql`
    UPDATE item_units 
    SET ${sql(newUnit, (Object.keys(newUnit) as (keyof typeof newUnit)[]))}
    WHERE user_id = ${user_id} AND name = ${old_name}
  `)

  if (updated instanceof PromiseError) throw new Error(updated.error);

  return updated;
}

export const retrieveUserItemUnit = async (user_id: UUID, unitName: string) => {
  const unit = await handleError(sql`
    SELECT * FROM item_units
    WHERE user_id = ${user_id}
    AND name = ${unitName}
  `)

  if (unit instanceof PromiseError) throw new Error(unit.error);

  return unit;
}

export const retrieveAllUserItemUnits = async (user_id: UUID) => {
  const units = await handleError(sql`
    SELECT * FROM item_units
    WHERE user_id = ${user_id}
  `)

  if (units instanceof PromiseError) throw new Error(units.error);

  return units;
}

export const deleteUserEntityFranchises = async (user_id: UUID, names: string[]) => {
  const deletedEntity = await handleError(sql`
    DELETE FROM entities
    WHERE user_id = ${user_id} 
    AND name IN ${sql(names)}
  `);

  if (deletedEntity instanceof PromiseError) throw new Error(deletedEntity.error);

  return deletedEntity;
}

export const insertUserEntityFranchise = async (user_id: UUID, {entity_name, address, trade}: APICRUDParams["entities"]) => {
  const createdEntity = await handleError(sql`
    INSERT INTO entities (user_id, name, trade)
    VALUES (${user_id}, ${entity_name}, ${trade ?? null})
    RETURNING entity_id
  `)

  if (createdEntity instanceof PromiseError) throw new Error(createdEntity.error);

  const createdFranchise = await handleError(sql`
    INSERT INTO entities_ranchises (user_id, entity_name, address)
    VALUES (${user_id}, ${entity_name}, ${address})
    RETURNING (user_id, franchise_id)
  `)

  if (createdFranchise instanceof PromiseError) {
    await sql`ROLLBACK`;
    throw new Error(createdFranchise.error);
  }

  return createdFranchise;
}

export const updateUserEntityFranchise = async (user_id: UUID, {old_entity_name, old_address}: {old_entity_name: string, old_address: string}, newEntityFranchise: Partial<APICRUDParams["entities"]>) => {
  delete newEntityFranchise.entity_user_id;

  const entity = {trade: newEntityFranchise.trade, entity_name: newEntityFranchise.entity_name}

  const updatedEntity = await handleError(sql`
    UPDATE entities 
    SET ${sql(entity, (Object.keys(entity) as (keyof typeof entity)[]))}
    WHERE user_id = ${user_id} AND name = ${old_entity_name}
  `)

  if (updatedEntity instanceof PromiseError) throw new Error(updatedEntity.error);
  
  const franchise = {entity_name: newEntityFranchise.entity_name, address: newEntityFranchise.address};
  
  const updatedFranchise = await handleError(sql`
    UPDATE entities_ranchises 
    SET ${sql(franchise, (Object.keys(franchise) as (keyof typeof franchise)[]))}
    WHERE entity_user_id = ${user_id} AND
          entity_name = ${old_entity_name} AND
          address = ${old_address}
  `)

  if (updatedFranchise instanceof PromiseError) {
    await sql`ROLLBACK`;
    throw new Error(updatedFranchise.error);
  }

  return updatedFranchise;
}

const joinFranchiseOfType = 
  `LEFT JOIN outsourced_entity_franchise_types t ON CONCAT(t.franchise_user_id, t.entity_name, t.franchise_address) = CONCAT(f.entity_user_id, f.entity_name, f.address)`

export const retrieveUserEntityFranchise = async (user_id: UUID, entityName: string, address: string, joinType?: boolean) => {
  const entityFranchise = await handleError(sql`
    SELECT entities.*, f.*, t.type FROM entities
    JOIN entities_franchises f ON CONCAT(f.entity_user_id, f.entity_name, f.address) = CONCAT(entities.user_id, entities.entity_name, ${address})
    ${joinType ? sql.unsafe(joinFranchiseOfType) : sql.unsafe("")}
    WHERE user_id = ${user_id}
    AND entity_name = ${entityName}
  `)

  if (entityFranchise instanceof PromiseError) throw new Error(entityFranchise.error);

  return entityFranchise;
}

export const retrieveAllUserEntityFranchises = async (user_id: UUID, joinType?: boolean) => {
  const entitiesFranchises = await handleError(sql`
    SELECT entities.*, f.*, t.type FROM entities
    JOIN entities_franchises f 
    ON CONCAT(f.entity_user_id, f.entity_name) = CONCAT(entities.user_id, entities.name)
    ${joinType ? sql.unsafe(joinFranchiseOfType) : sql.unsafe("")}
    WHERE user_id = ${user_id}
  `);

  if (entitiesFranchises instanceof PromiseError) throw new Error(entitiesFranchises.error);

  return entitiesFranchises;
}

export const addTypeToEntityFranchise = async (user_id: UUID, entityName: number, address: number, type: EntityType) => {
  const created = await handleError(sql`
    INSERT INTO ${sql(`outsourced_${type}_entity_franchises`)} 
    VALUES (${user_id}, ${entityName}, ${address})
  `)

  if (created instanceof PromiseError) throw new Error(created.error);

  return created;
}

export const retrieveAllUserEntityFranchisesOfType = async (user_id: UUID, type: EntityType) => {
  const entitiesFranchises = await handleError(sql`
    SELECT * FROM entities_franchises
    JOIN outsourced_entity_franchise_types t
    ON CONCAT(t.user_id, t.entity_name, t.franchise_address) = CONCAT(${user_id}, entities_franchises.entity_name, entities_franchises.address)
    WHERE t.type = ${type}
  `)

  if (entitiesFranchises instanceof PromiseError) throw new Error(entitiesFranchises.error);

  return entitiesFranchises;
}