import Table from "../../components/Table/Table";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";
import type { DataRoute } from "@packages/utils";

type UnitsProps = {}

const ItemUnits = (props: UnitsProps) => {
  const route: DataRoute = "item_units";

  const {status, error, data: units} = useQuery(queryOptions[route])

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Item Units" 
        dataArray={units}
        dataRoute={route}
        identifier={{key: "name", type: "name"}}
        requiredInputColumnTypes={{
          name: {type: "string", placeholder: "blank"},
          description: {type: "string", placeholder: "blank", notMandatory: true},
          wikipedia_url: {type: "string", placeholder: "blank", notMandatory: true}
        }}
        renamedColumns={{
          name: "Unit Name",
          description: "Descripton",
          wikipedia_url: "Wikipedia Link"
        }}
      >
      </Table>
    </>
  )
}
export default ItemUnits