import { useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";
import { fetchAll } from "../../../actions";
import Table from "../../components/Table/Table";

type CategoriesProps = {}

const ItemCategories = (props: CategoriesProps) => {
  const {status, error, data: categories} = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "item_categories")
  })

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Item Categories" 
        dataArray={categories}
        requiredInputColumnTypes={{
          name: {type: "string", inputPlaceholder: "default"},
          description: {type: "string", inputPlaceholder: "blank"}
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