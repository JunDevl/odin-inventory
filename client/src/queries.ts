import type { UUID } from "node:crypto";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { DataQueryKeys } from "@app/utils";
import { fetchAll } from "./actions";

export const queryOptions = {
  operations: {
    queryKey: ["operations"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "operations"),
    staleTime: Infinity
  },
  units: {
    queryKey: ["units"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "item_units"),
    staleTime: Infinity
  },
  categories: {
    queryKey: ["categories"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "item_categories"),
    staleTime: Infinity
  },
  items: {
    queryKey: ["items"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "avaliable_items"),
    staleTime: Infinity
  },
  entities: {
    queryKey: ["entities"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "entities"),
    staleTime: Infinity
  },
} satisfies { [k in DataQueryKeys]: UseQueryOptions & {queryKey: [DataQueryKeys]} } as const;