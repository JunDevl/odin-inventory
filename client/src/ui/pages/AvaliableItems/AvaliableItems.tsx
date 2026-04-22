import { useQuery } from "@tanstack/react-query";
import { fetchAll } from "../../../actions";
import Table from "../../components/Table/Table";
import type { UUID } from "crypto";
import type { TableTypes } from "@app/utils";

type ItemsProps = {}

const AvaliableItems = (props: ItemsProps) => {
  const {status, error, data: items} = useQuery({
    queryKey: ["items"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "avaliable_items")
  })

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Avaliable Items" 
        dataArray={items as TableTypes.Item[]}
        requiredInputColumnTypes={{
          name: "string",
          description: "blank"
        }}
        renamedColumns={{
          name: "Item Name",
          description: "Description"
        }}
      >
      </Table>
    </>
  )
}
export default AvaliableItems