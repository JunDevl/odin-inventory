import Table from "../../components/Table/Table"
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";
import type { DataRoute } from "@packages/utils";

type EntitiesProps = {}

const Entities = (props: EntitiesProps) => {
  const route: DataRoute = "entities"

  const {status, error, data: entities} = useQuery(queryOptions[route])

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Entities" 
        dataArray={entities}
        dataRoute={route}
        identifier={{key: "name", type: "name"}}
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