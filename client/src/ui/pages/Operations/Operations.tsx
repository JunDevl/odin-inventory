import Table from "../../components/Table/Table";
import { fetchAll } from "../../../actions";
import { useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";

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
      <Table title="Operations" dataArray={operations}>
      </Table>
    </>
  )
}
export default Operations