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
          entity_name: {type: "string", placeholder: "blank"},
          trade: {type: "string", placeholder: "blank", notMandatory: true},
          address: {type: "string", placeholder: "blank"},
          type: {type: "string", placeholder: "blank"}
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