import type { HTMLProps, JSX } from "react";
import type { DataRoute, RouteTableMapping } from "@packages/utils";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";

type DropdownProps<T extends (typeof queryOptions)[keyof typeof queryOptions]> = HTMLProps<HTMLSelectElement> & {
  queryOptions: T,
  column: {
    [K in DataRoute]: keyof RouteTableMapping[K]
  }[T["queryKey"][0]]
}

const QueriedDropdown = <T extends (typeof queryOptions)[keyof typeof queryOptions],>({queryOptions, column, defaultValue, required, ...props}: DropdownProps<T>) => {
  const {status, data, error} = useQuery(queryOptions as UseQueryOptions);

  const renderOnStatus: () => JSX.Element[] = () => {
    if (!(data instanceof Array)) return [<option key={null}>No array provided</option>]

    switch (status) {
      case "pending": return [<option value="" key={null}></option>];
      case "error": return [<option value="error" key={null}>{String(error)}</option>];
      case "success": {
        const uniqueOptions: Map<string, JSX.Element> = new Map();

        data.forEach(item => 
          uniqueOptions.set(
            item[column], 
            <option 
              value={item[column]} 
              key={column as string}
            >
              {item[column]}
            </option>
          )
        )

        return Object.values(uniqueOptions);
      }
    }
  }

  return (
    <select {...props} required={required} defaultValue={status === "success" ? defaultValue : ""}>
      {!required && <option value=""></option>}
      {renderOnStatus()}
    </select>
  )
}
export default QueriedDropdown