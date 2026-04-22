import Table from "../../components/Table/Table";
import { fetchAll } from "../../../actions";
import { useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";
import type { TableTypes } from "@app/utils";

type OperationsProps = {}

const Operations = (props: OperationsProps) => {

  const {status, error, data: operations} = useQuery({
    queryKey: ["operations"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "operations")
  })

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Operations" 
        dataArray={operations as TableTypes.Operation[]}
        requiredInputColumnTypes={{
          item_name: {type: "string", inputPlaceholder: "default"},
          unit_name: {type: "string", inputPlaceholder: "auto"},
          price_cents: {type: "number", inputPlaceholder: "auto"},
          quantity: {type: "number", inputPlaceholder: "default"},
          addressee_entity_name: {type: "string", inputPlaceholder: "default"},
          addressee_franchise_address: {type: "string", inputPlaceholder: "default"},
          sendee_entity_name: {type: "string", inputPlaceholder: "default"},
          sendee_franchise_address: {type: "string", inputPlaceholder: "default"},
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