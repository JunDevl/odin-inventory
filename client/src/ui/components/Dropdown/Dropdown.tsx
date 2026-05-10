import type { HTMLProps, JSX } from "react";
import type { APICRUDParams, DataRoute } from "@packages/utils";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";

type DropdownProps<T extends DataRoute> = 
  HTMLProps<HTMLSelectElement> &
  { route: T } &
  (
    { optionsList?: null, queryOptions: (typeof queryOptions)[T], column: keyof APICRUDParams[T] } |
    { optionsList: any[], queryOptions?: null, column?: null }
  )

const Dropdown = <T extends DataRoute,>(
  {route, column, optionsList, queryOptions, defaultValue, required, ...props}: DropdownProps<T>
) => {
  if (optionsList) 
    return (
      <select {...props} required={required} defaultValue={defaultValue}>
        {!required && <option value=""></option>}
        {optionsList.map(item => 
          <option value={item} key={item}>
            {item}
          </option>
        )}
      </select>
    )

  const {status, data, error} = useQuery(queryOptions);

  const renderOnStatus: () => JSX.Element[] = () => {
    if (!(data instanceof Array)) return [<option key={null}>No array provided</option>]

    switch (status) {
      case "pending": return [<option value="" key={null}></option>];
      case "error": return [<option value="error" key={null}>{String(error)}</option>];
      case "success": {
        const uniqueOptions: Map<string, any> = new Map();

        data.forEach(item => uniqueOptions.set(String(item[column]), item));

        const optionElements: JSX.Element[] = [];

        uniqueOptions.forEach((item, index) => optionElements.push(
          <option 
            value={item[column]} 
            key={index}
            selected={item[column] === defaultValue}
          >
            {item[column]}
          </option>
        ))

        return optionElements;
      }
    }
  }

  return (
    <select {...props} required={required}>
      {!required && <option value=""></option>}
      {renderOnStatus()}
    </select>
  )
}
export default Dropdown