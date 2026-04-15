import Table from "../../components/Table/Table"
import { useQuery } from "@tanstack/react-query";
import { fetchAll } from "../../../actions";
import type { UUID } from "crypto";

type EntitiesProps = {}

const Entities = (props: EntitiesProps) => {
  const {status, error, data: entities} = useQuery({
    queryKey: ["entities"],
    queryFn: () => fetchAll(localStorage.getItem("userUUID")! as UUID, "entities")
  })

  if (status === "pending") return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <>
      <Table title="Entities" dataArray={entities}>
      </Table>
    </>
  )
}
export default Entities