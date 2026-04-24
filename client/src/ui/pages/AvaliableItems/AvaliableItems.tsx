import Table from "../../components/Table/Table";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";

type ItemsProps = {}

const AvaliableItems = (props: ItemsProps) => {
  const {status, error, data: items} = useQuery(queryOptions["items"])

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table 
        title="Avaliable Items" 
        dataArray={items}
        requiredInputColumnTypes={{
          name: {type: "string", inputPlaceholder: "default"},
          description: {type: "string", inputPlaceholder: "blank"}
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