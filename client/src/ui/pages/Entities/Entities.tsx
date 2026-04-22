import Table from "../../components/Table/Table"
import { useQuery } from "@tanstack/react-query";
import { fetchAll } from "../../../actions";
import type { UUID } from "crypto";
import type { TableTypes } from "@app/utils";

type EntitiesProps = {}

const Entities = (props: EntitiesProps) => {
  const {status, error, data: entities} = useQuery({
    queryKey: ["entities"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "entities")
  })

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Entities" 
        dataArray={entities as TableTypes.EntityFranchise[]}
        requiredInputColumnTypes={{
          entity_name: "string",
          trade: "blank",
          address: "string",
          type: "string"
        }}
        renamedColumns={{
          entity_name: "Name",
          trade: "Trade",
          address: "Address",
          type: "Kind"
        }}>
      </Table>
    </>
  )
}
export default Entities