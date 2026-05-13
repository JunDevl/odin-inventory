import type { DataRoute, APICRUDParams } from "@packages/utils";
import { queryOptions } from "../../../queries";

export type TableData = APICRUDParams[keyof APICRUDParams];

type Primitive = "string" | "number" | "boolean" | DateConstructor;
type InputTypeAttribute = Primitive | [Primitive, "list"];
type PlaceholderBehavior = "blank" | "auto";

type InputType<T extends InputTypeAttribute> = {
  type: T,
  placeholder: PlaceholderBehavior,
  list?: any[],
  notMandatory?: boolean
};

type InputQueryable = {
  [K in DataRoute]: InputType<InputTypeAttribute> & {
    listQueryOptions: (typeof queryOptions)[K],
    relatedColumnKey: keyof APICRUDParams[K]
  }
}[DataRoute];


export type InputDetail = InputType<InputTypeAttribute> | InputQueryable;