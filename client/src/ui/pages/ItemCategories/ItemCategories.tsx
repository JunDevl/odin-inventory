import Table from "../../components/Table/Table";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";
import type { DataRoute } from "@packages/utils";

type CategoriesProps = {}

const ItemCategories = (props: CategoriesProps) => {
  const route: DataRoute = "item_categories"

  const {status, error, data: categories} = useQuery(queryOptions[route])

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Item Categories" 
        dataArray={categories}
        dataRoute={route}
        identifier={{key: "name", type: "name"}}
        requiredInputColumnTypes={{
          name: {type: "string", placeholder: "blank"},
          description: {type: "string", placeholder: "blank", notMandatory: true}
        }}
        renamedColumns={{
          name: "Category Name",
          description: "Description"
        }}
      >
      </Table>
    </>
  )
}
export default ItemCategories