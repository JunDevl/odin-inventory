import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import type { APICRUDParams, DataRoute, Stock } from "@packages/utils";
import { fetchAll } from "./actions";
import { queryClient } from "./main";

export const queryOptions: { [K in DataRoute]: UseSuspenseQueryOptions<APICRUDParams[K][]> } = {
  stocks: {
    queryKey: ["stocks"],
    queryFn: async () => {
      const [items, operations] = await Promise.all([
        queryClient.fetchQuery(queryOptions["avaliable_items"]),
        queryClient.fetchQuery(queryOptions["operations"])
      ]);

      const stockData: Stock[] = items
        .map(item => {
          const itemOperations = operations.filter(operation => operation.item_name === item.name);

          const userEntityName = localStorage.getItem("userName");
          const stock_quantity = itemOperations.reduce((acc, cur) => {
            if (cur.addressee_entity_name === userEntityName) 
              return acc + Number(cur.quantity);
            
            if (cur.sendee_entity_name === userEntityName)
              return acc - Number(cur.quantity);

            return 0;
          }, 0);
          
          const asset_value_cents = itemOperations.reduce((acc, cur) => {
            if (cur.addressee_entity_name === userEntityName) 
              return acc + Number(cur.price_cents);
            
            if (cur.sendee_entity_name === userEntityName)
              return acc - Number(cur.price_cents);

            return 0;
          }, 0);

          return {...item, stock_quantity, asset_value_cents};
        })
        .filter(stock => stock.stock_quantity !== 0 || stock.asset_value_cents !== 0);

      return stockData;
    },
  },
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
}