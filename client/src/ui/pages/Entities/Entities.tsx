import Table from "../../components/Table/Table"
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";

type EntitiesProps = {}

const Entities = (props: EntitiesProps) => {
  const {status, error, data: entities} = useQuery(queryOptions["entities"])

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Entities" 
        dataArray={entities}
        requiredInputColumnTypes={{
          entity_name: {type: "string", inputPlaceholder: "default"},
          trade: {type: "string", inputPlaceholder: "blank"},
          address: {type: "string", inputPlaceholder: "default"},
          type: {type: "string", inputPlaceholder: "default"}
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