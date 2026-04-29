import type { RouteTableMapping, QueryKeysMapping, DataQueryKeys } from "@app/utils";
import { queryOptions } from "../../../queries";

export type TableData = RouteTableMapping[keyof RouteTableMapping];

type Primitive = "string" | "number" | "boolean" | DateConstructor;
type InputTypeAttribute = Primitive | [Primitive, "list"];
type PlaceholderBehavior = "blank" | "auto";

type InputType<T extends InputTypeAttribute> = {
  type: T,
  placeholder: PlaceholderBehavior,
  notMandatory?: boolean
};

type InputQueryable = {
  [K in DataQueryKeys]: InputType<InputTypeAttribute> & {
    listQueryOptions: (typeof queryOptions)[K],
    relatedColumnKey: keyof QueryKeysMapping[K]
  }
}[DataQueryKeys];


export type InputDetail = InputType<InputTypeAttribute> | InputQueryable;