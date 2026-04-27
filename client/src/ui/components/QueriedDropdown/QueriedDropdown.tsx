import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { HTMLProps, JSX } from "react";

type DropdownProps = HTMLProps<HTMLSelectElement> & {
  queryOptions: UseQueryOptions
}

const QueriedDropdown = ({queryOptions, ...props}: DropdownProps) => {
  const {status, data, error} = useQuery(queryOptions);

  const renderOnStatus = () => {
    if (!(data instanceof Array)) return <option>No array provided</option>

    switch (status) {
      case "pending": return <option value=""></option>;
      case "error": return <option value="error">Error</option>;
      case "success": {
        const uniqueOptions: JSX.Element[] = [];

        data.forEach((value, i) => {
          if (value !== data[i-1]) uniqueOptions.push(<option value={value} key={value}>{value}</option>)
        })

        return uniqueOptions;
      }
    }
  }

  return (
    <select {...props} >
      {renderOnStatus()}
    </select>
  )
}
export default QueriedDropdown