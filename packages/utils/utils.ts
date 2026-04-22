import type { UUID } from "node:crypto";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

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

export type EntityType = "service_provider" | "supplier" | "client";

type EntityFranchiseID = {entityName: string, franchiseAddress: string};

export type APICreateUpdateParams = {
  operations: {
    userUuid: UUID,
    addressee: EntityFranchiseID,
    sendee: EntityFranchiseID,
    itemName: string, 
    quantity: number,
    unit: string,
    priceCents: number,
    shippedAt?: Date,
    arrivedAt?: Date
  },

  entities: {
    userUuid: UUID, 
    name: string,
    address: string,
    type: string,
    trade?: string
  },

  avaliable_items: {userUuid: UUID, name: string, description?: string},

  item_categories: {userUuid: UUID, name: string, description?: string},

  item_units: {userUuid: UUID, name: string, description?: string, wikipediaUrl?: string}
}

export type DataRoute = keyof APICreateUpdateParams;

export namespace TableTypes {
  export type EntityFranchise = {
    entity_user_id: UUID,
    entity_name: string,
    trade: string | null,
    address: string,
    type: string | null,
    created_at: Date | null
  }

  export type ItemCategory = {
    user_id: UUID,
    name: string,
    description: string | null
  }

  export type ItemUnit = {
    user_id: UUID,
    name: string,
    description: string | null,
    wikipedia_url: string | null
  }

  export type Item = {
    user_id: UUID,
    name: string,
    description: string | null
  }

  export type Operation = {
    user_id: UUID,
    operation_id: number,
    item_name: string,
    unit_price_id: number,
    price_cents: number,
    total_price_cents: number,
    quantity: number,
    addressee_entity_name: string,
    addressee_franchise_address: string,
    sendee_entity_name: string,
    sendee_franchise_address: string,
    shipped_at: Date | null,
    arrived_at: Date | null,
  }
}

type ExhaustiveMapping<R extends string, T extends Record<R, unknown>> = T;

export type RouteTableMapping = ExhaustiveMapping<DataRoute, {
  operations: TableTypes.Operation,
  entities: TableTypes.EntityFranchise,
  avaliable_items: TableTypes.Item,
  item_categories: TableTypes.ItemCategory,
  item_units: TableTypes.ItemUnit
}>;