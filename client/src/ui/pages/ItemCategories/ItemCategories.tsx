import Table from "../../components/Table/Table";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";

type CategoriesProps = {}

const ItemCategories = (props: CategoriesProps) => {
  const {status, error, data: categories} = useQuery(queryOptions["categories"])

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Item Categories" 
        dataArray={categories}
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