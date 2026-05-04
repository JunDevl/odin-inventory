import Table from "../../components/Table/Table.tsx";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";
import type { DataRoute } from "@app/utils";

type OperationsProps = {}

const Operations = (props: OperationsProps) => {
  const route: DataRoute = "operations";

  const {status, error, data: operations} = useQuery(queryOptions[route])

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Operations" 
        dataArray={operations}
        dataRoute={route}
        requiredInputColumnTypes={{
          item_name: {
            type: ["string", "list"], 
            placeholder: "blank", 
            listQueryOptions: queryOptions["avaliable_items"],
            relatedColumnKey: "name"
          },
          unit_name: {
            type: ["string", "list"], 
            placeholder: "auto", 
            listQueryOptions: queryOptions["item_units"],
            relatedColumnKey: "name"
          },
          price_cents: {type: "number", placeholder: "auto"},
          quantity: {type: "number", placeholder: "blank"},
          addressee_entity_name: {
            type: ["string", "list"], 
            placeholder: "blank", 
            listQueryOptions: queryOptions["entities"],
            relatedColumnKey: "entity_name"
          },
          addressee_franchise_address: {
            type: ["string", "list"], 
            placeholder: "blank", 
            listQueryOptions: queryOptions["entities"],
            relatedColumnKey: "address"
          },
          sendee_entity_name: {
            type: ["string", "list"], 
            placeholder: "blank", 
            listQueryOptions: queryOptions["entities"],
            relatedColumnKey: "entity_name"
          },
          sendee_franchise_address: {
            type: ["string", "list"], 
            placeholder: "blank", 
            listQueryOptions: queryOptions["entities"],
            relatedColumnKey: "address"
          },
          shipped_at: {type: Date, placeholder: "blank", notMandatory: true},
          arrived_at: {type: Date, placeholder: "blank", notMandatory: true}
        }}
        renamedColumns={{
          item_name: "Item",
          quantity: "Quantity",
          unit_name: "Unit",
          price_cents: "Unit Price",
          total_price_cents: "Total",
          sendee_entity_name: "Sendee Name",
          addressee_entity_name: "Addressee Name",
          shipped_at: "Shipped at",
          arrived_at: "Arrived at"
        }}>
      </Table>
    </>
  )
}
export default Operations