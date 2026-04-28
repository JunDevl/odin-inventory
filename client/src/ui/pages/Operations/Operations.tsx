import Table from "../../components/Table/Table.tsx";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";

type OperationsProps = {}

const Operations = (props: OperationsProps) => {
  const {status, error, data: operations} = useQuery(queryOptions["operations"])

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Operations" 
        dataArray={operations}
        requiredInputColumnTypes={{
          item_name: {
            type: ["string", "list"], 
            placeholder: "default", 
            listQueryOptions: queryOptions["items"],
            relatedColumnKey: "name"
          },
          unit_name: {
            type: ["string", "list"], 
            placeholder: "auto", 
            listQueryOptions: queryOptions["units"],
            relatedColumnKey: "name"
          },
          price_cents: {type: "number", placeholder: "auto"},
          quantity: {type: "number", placeholder: "default"},
          addressee_entity_name: {
            type: ["string", "list"], 
            placeholder: "default", 
            listQueryOptions: queryOptions["entities"],
            relatedColumnKey: "entity_name"
          },
          addressee_franchise_address: {
            type: ["string", "list"], 
            placeholder: "default", 
            listQueryOptions: queryOptions["entities"],
            relatedColumnKey: "address"
          },
          sendee_entity_name: {
            type: ["string", "list"], 
            placeholder: "default", 
            listQueryOptions: queryOptions["entities"],
            relatedColumnKey: "entity_name"
          },
          sendee_franchise_address: {
            type: ["string", "list"], 
            placeholder: "default", 
            listQueryOptions: queryOptions["entities"],
            relatedColumnKey: "address"
          },
          shipped_at: {type: Date, placeholder: "blank"},
          arrived_at: {type: Date, placeholder: "blank"}
        }}
        renamedColumns={{
          item_name: "Item",
          quantity: "Quantity",
          unit_name: "Unit",
          price_cents: "Unit Price",
          total_price_cents: "Total",
          sendee_entity_name: "Sendee Name",
          addressee_entity_name: "Addressee Name"
        }}>
      </Table>
    </>
  )
}
export default Operations