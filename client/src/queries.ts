import type { UseQueryOptions } from "@tanstack/react-query";
import type { DataRoute } from "@packages/utils";
import { fetchAll } from "./actions";

export const queryOptions = {
  operations: {
    queryKey: ["operations"],
    queryFn: () => fetchAll("operations"),
    staleTime: Infinity
  },
  item_units: {
    queryKey: ["item_units"],
    queryFn: () => fetchAll("item_units"),
    staleTime: Infinity
  },
  item_categories: {
    queryKey: ["item_categories"],
    queryFn: () => fetchAll("item_categories"),
    staleTime: Infinity
  },
  avaliable_items: {
    queryKey: ["avaliable_items"],
    queryFn: () => fetchAll("avaliable_items"),
    staleTime: Infinity
  },
  entities: {
    queryKey: ["entities"],
    queryFn: () => fetchAll("entities"),
    staleTime: Infinity
  },
} satisfies { [k in DataRoute]: UseQueryOptions & { queryKey: [k] } };