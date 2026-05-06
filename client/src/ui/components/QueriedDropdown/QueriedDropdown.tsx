import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";
import type { HTMLProps, JSX } from "react";
import type { DataRoute, RouteTableMapping } from "@packages/utils";

type DropdownProps<T extends (typeof queryOptions)[keyof typeof queryOptions]> = HTMLProps<HTMLSelectElement> & {
  queryOptions: T,
  column: {
    [K in DataRoute]: keyof RouteTableMapping[K]
  }[T["queryKey"][0]]
}

const QueriedDropdown = <T extends (typeof queryOptions)[keyof typeof queryOptions],>({queryOptions, column, defaultValue, required, ...props}: DropdownProps<T>) => {
  const {status, data, error} = useQuery(queryOptions as UseQueryOptions);

  const renderOnStatus = () => {
    if (!(data instanceof Array)) return <option>No array provided</option>

    switch (status) {
      case "pending": return <option value=""></option>;
      case "error": return <option value="error">Error</option>;
      case "success": {
        const uniqueOptions: Map<string, JSX.Element> = new Map();

        data.forEach((value, i) => uniqueOptions.set(value[column], <option value={value[column]} key={column as string}>{value[column]}</option>))

        return uniqueOptions;
      }
    }
  }

  return (
    <select {...props} required={required} defaultValue={!required ? "" : undefined}>
      {!required && <option value=""></option>}
      {renderOnStatus()}
    </select>
  )
}
export default QueriedDropdown