import type { UUID } from "node:crypto";

export class PromiseError<T> {
  public error: T;

  constructor(error: T) {
    this.error = error;
  }
}

export const handleError = async <T>(promise: Promise<T>) => {
  try {
    const res = await promise;

    return res;
  } catch (e: any) {
    return new PromiseError(e);
  }
}

export type Prettify<T> = T extends infer O
  ? { [ K in keyof O ]: O[ K ] }
  : never;

type ExhaustiveMapping<R extends string, T extends Record<R, unknown>> =
  Exclude<R, keyof T> extends never
    ? T
    : never;

export type DataRoute = "stocks" | "operations" | "entities" | "avaliable_items" | "item_categories" | "item_units";

export type EntityType = "service_provider" | "supplier" | "client";

export namespace TableTypes {
  export type EntityFranchise = {
    entity_user_id: UUID,
    entity_name: string,
    trade?: string | null,
    address: string,
    type?: EntityType | null,
    created_at?: Date | null
  }

  export type ItemCategory = {
    user_id: UUID,
    name: string,
    description?: string | null
  }

  export type ItemUnit = {
    user_id: UUID,
    name: string,
    description?: string | null,
    wikipedia_url?: string | null
  }

  export type Item = {
    user_id: UUID,
    name: string,
    description?: string | null,
    category_name?: string | null
  }

  export type Operation = {
    user_id: UUID,
    operation_id: number,
    item_user_id: UUID,
    item_name: string,
    unit_price_user_id: UUID,
    unit_price_id: number,
    unit_price_item_name: string,
    unit_name: string,
    price_cents: number,
    total_price_cents: number,
    history_id: number,
    quantity: number,
    addressee_user_id: UUID,
    addressee_entity_name: string,
    addressee_franchise_address: string,
    sendee_user_id: UUID,
    sendee_entity_name: string,
    sendee_franchise_address: string,
    shipped_at?: Date | null,
    arrived_at?: Date | null
  }
}

export type Stock = TableTypes.Item & {
  asset_value_cents: number,
  stock_quantity: number
}

export type APICRUDParams = ExhaustiveMapping<DataRoute, {
  stocks: Stock,
  operations: TableTypes.Operation,
  entities: TableTypes.EntityFranchise,
  avaliable_items: TableTypes.Item,
  item_categories: TableTypes.ItemCategory,
  item_units: TableTypes.ItemUnit
}>;

// export type EntityFranchise = {entityName: string, franchiseAddress: string};

// export type APICRUDParams = {
//   operations: {
//     operationId: number,
//     userUuid: UUID,
//     addressee: EntityFranchise,
//     sendee: EntityFranchise,
//     itemName: string,
//     quantity: number,
//     unit: string,
//     priceCents: number,
//     shippedAt?: Date,
//     arrivedAt?: Date
//   },

//   entities: {
//     userUuid: UUID,
//     name: string,
//     address: string,
//     type: string,
//     trade?: string
//   },

//   avaliable_items: {userUuid: UUID, name: string, description?: string, categoryName?: string},

//   item_categories: {userUuid: UUID, name: string, description?: string},

//   item_units: {userUuid: UUID, name: string, description?: string, wikipediaUrl?: string}
// }

// type APIToTableMapper = { 
//   [Route in DataRoute]: { 
//     [TableColumn in keyof APICRUDParams[Route]]: 
//       APICRUDParams[Route][TableColumn] extends EntityFranchise ? 
//         {
//           [EntityColumn in keyof EntityFranchise]: keyof RouteTableMapping[Route]
//         }
//         : keyof RouteTableMapping[Route]
//   }
// };

// export const APIParamsToTableColumns: APIToTableMapper = {
//   operations: {
//     operationId: "operation_id",
//     userUuid: "user_id",
//     addressee: {
//       entityName: "addressee_entity_name",
//       franchiseAddress: "addressee_franchise_address"
//     },
//     sendee: {
//       entityName: "sendee_entity_name",
//       franchiseAddress: "sendee_franchise_address"
//     },
//     itemName: "item_name",
//     quantity: "quantity",
//     unit: "unit_name",
//     priceCents: "price_cents",
//     shippedAt: "shipped_at",
//     arrivedAt: "arrived_at"
//   },
//   entities: {
//     userUuid: "entity_user_id",
//     name: "entity_name",
//     address: "address",
//     type: "type",
//     trade: "trade"
//   },
//   avaliable_items: {
//     userUuid: "user_id",
//     name: "name",
//     description: "description",
//     categoryName: "category_name"
//   },
//   item_units: {
//     userUuid: "user_id",
//     name: "name",
//     description: "description",
//     wikipediaUrl: "wikipedia_url"
//   },
//   item_categories: {
//     userUuid: "user_id",
//     name: "name",
//     description: "description"
//   }
// };

