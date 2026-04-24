import Table from "../../components/Table/Table";
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
            inputPlaceholder: "default", 
            listQueryOptions: queryOptions["items"],
            relatedKey: "name"
          },
          unit_name: {
            type: ["string", "list"], 
            inputPlaceholder: "auto", 
            listQueryOptions: queryOptions["units"],
            relatedKey: "name"
          },
          price_cents: {type: "number", inputPlaceholder: "auto"},
          quantity: {type: "number", inputPlaceholder: "default"},
          addressee_entity_name: {
            type: ["string", "list"], 
            inputPlaceholder: "default", 
            listQueryOptions: queryOptions["entities"],
            relatedKey: "entity_name"
          },
          addressee_franchise_address: {
            type: ["string", "list"], 
            inputPlaceholder: "default", 
            listQueryOptions: queryOptions["entities"],
            relatedKey: "franchise_address"
          },
          sendee_entity_name: {
            type: ["string", "list"], 
            inputPlaceholder: "default", 
            listQueryOptions: queryOptions["entities"],
            relatedKey: "entity_name"
          },
          sendee_franchise_address: {
            type: ["string", "list"], 
            inputPlaceholder: "default", 
            listQueryOptions: queryOptions["entities"],
            relatedKey: "franchise_address"
          },
          shipped_at: {type: Date, inputPlaceholder: "blank"},
          arrived_at: {type: Date, inputPlaceholder: "blank"}
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