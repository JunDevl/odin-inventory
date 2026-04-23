import Table from "../../components/Table/Table";
import { fetchAll } from "../../../actions";
import { useQuery, type UndefinedInitialDataOptions, type UseQueryOptions } from "@tanstack/react-query";
import type { UUID } from "crypto";
import type { Prettify } from "@app/utils";

type OperationsProps = {}

const Operations = (props: OperationsProps) => {
  const queryOptions = {
    queryKey: ["operations"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "operations")
  } // fix

  const {status, error, data: operations} = useQuery(queryOptions)

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Operations" 
        dataArray={operations}
        requiredInputColumnTypes={{
          item_name: {type: ["string", "list"], inputPlaceholder: "default", /*fix :vD*/listQueryKey: "items"},
          unit_name: {type: ["string", "list"], inputPlaceholder: "auto", listQueryKey: "units"},
          price_cents: {type: "number", inputPlaceholder: "auto"},
          quantity: {type: "number", inputPlaceholder: "default"},
          addressee_entity_name: {type: ["string", "list"], inputPlaceholder: "default", listQueryKey: "entities"},
          addressee_franchise_address: {type: ["string", "list"], inputPlaceholder: "default", listQueryKey: "entities"},
          sendee_entity_name: {type: ["string", "list"], inputPlaceholder: "default", listQueryKey: "entities"},
          sendee_franchise_address: {type: ["string", "list"], inputPlaceholder: "default", listQueryKey: "entities"},
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