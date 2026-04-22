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
          item_name: "string",
          unit_name: "auto",
          price_cents: "auto",
          quantity: "number",
          addressee_entity_name: "string",
          addressee_franchise_address: "string",
          sendee_entity_name: "string",
          sendee_franchise_address: "string",
          shipped_at: "blank",
          arrived_at: "blank"
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