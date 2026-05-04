import Table from "../../components/Table/Table";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";
import type { DataRoute } from "@app/utils";

type ItemsProps = {}

const AvaliableItems = (props: ItemsProps) => {
  const route: DataRoute = "avaliable_items";

  const {status, error, data: items} = useQuery(queryOptions[route])

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Avaliable Items" 
        dataArray={items}
        dataRoute={route}
        requiredInputColumnTypes={{
          name: {type: "string", placeholder: "blank"},
          description: {type: "string", placeholder: "blank", notMandatory: true},
          category_name: {
            type: ["string", "list"], 
            placeholder: "blank", 
            notMandatory: true,
            listQueryOptions: queryOptions["item_categories"],
            relatedColumnKey: "name"
          }
        }}
        renamedColumns={{
          name: "Item Name",
          description: "Description",
          category_name: "Category"
        }}
      >
      </Table>
    </>
  )
}
export default AvaliableItems