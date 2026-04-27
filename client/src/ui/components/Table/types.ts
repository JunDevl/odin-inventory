import type { RouteTableMapping, QueryKeysMapping } from "@app/utils";
import { queryOptions } from "../../../queries";

export type TableData = RouteTableMapping[keyof RouteTableMapping];

type Primitive = "string" | "number" | "boolean" | DateConstructor;
type InputTypeAttribute = Primitive | [Primitive, "list"];

type PlaceholderBehavior = "default" | "auto" | "blank";

type LimitedQueryOption = (typeof queryOptions)[keyof typeof queryOptions];

type testable = keyof QueryKeysMapping[typeof queryOptions["items"]["queryKey"][0]];

type part1<T> = {
  type: T,
  placeholder: PlaceholderBehavior
}

type part2<T extends LimitedQueryOption> = {
  listQueryOptions: T,
  relatedColumnKey: keyof QueryKeysMapping[T["queryKey"][0]]
}

type inptype<T, U = unknown> = [U] extends [LimitedQueryOption] ? part1<T> & part2<U> : part1<T>;

type InputType<T, U = unknown> = [U] extends [LimitedQueryOption] ? {
  type: T,
  placeholder: PlaceholderBehavior,
  listQueryOptions: U,
  relatedColumnKey: keyof QueryKeysMapping[U["queryKey"][0]]
} : never;

export type InputDetail<T = unknown> = T extends InputType<any> ?
  T["type"] extends InputTypeAttribute ? 
    InputType<InputTypeAttribute, T["listQueryOptions"]> :
  Omit<T, "listQueryOptions" | "relatedColumnKey"> :
never