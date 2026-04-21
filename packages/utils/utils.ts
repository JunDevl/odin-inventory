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

export type APIMutationParams = {
  operations: {
    userUuid: UUID,
    addressee: EntityFranchiseID,
    sendee: EntityFranchiseID,
    itemName: string, 
    quantity: number,
    unit: string,
    priceCents: number | null,
    shippedAt?: Date | null,
    arrivedAt?: Date | null
  },

  entities: {
    userUuid: UUID, 
    name: string,
    address: string, 
    trade?: string
  },

  avaliable_items: {userUuid: UUID, name: string, description?: string},

  item_categories: {userUuid: UUID, name: string, description?: string},

  item_units: {userUuid: UUID, name: string, description?: string, wikipediaUrl: string}
}

export type Route = keyof APIMutationParams;