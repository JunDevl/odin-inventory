import { useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";
import { fetchAll } from "../../../actions";
import Table from "../../components/Table/Table";
import type { TableTypes } from "@app/utils";

type UnitsProps = {}

const ItemUnits = (props: UnitsProps) => {
  const {status, error, data: units} = useQuery({
    queryKey: ["units"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "item_units")
  })

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Item Units" 
        dataArray={units as TableTypes.Item[]}
        requiredInputColumnTypes={{
          name: "string",
          description: "blank",
          wikipedia_url: "blank"
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