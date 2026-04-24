import Table from "../../components/Table/Table";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";

type UnitsProps = {}

const ItemUnits = (props: UnitsProps) => {
  const {status, error, data: units} = useQuery(queryOptions["units"])

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Item Units" 
        dataArray={units}
        requiredInputColumnTypes={{
          name: {type: "string", inputPlaceholder: "default"},
          description: {type: "string", inputPlaceholder: "blank"},
          wikipedia_url: {type: "string", inputPlaceholder: "blank"}
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