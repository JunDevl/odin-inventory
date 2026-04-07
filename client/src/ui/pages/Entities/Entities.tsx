import type { title } from "process";
import Table from "../../components/Table/Table"
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAll } from "../../../actions";

const Bouba = [
  {
    name: "brand",
    age: 15
  },
  {
    name: "luke",
    age: 16
  }
]

type EntitiesProps = {}

const Entities = (props: EntitiesProps) => {
  const {status, error, data: entities} = useQuery({
    queryKey: ["entities"],
    queryFn: () => fetchAll("entities")
  })

  if (status) return <p>Loading...</p>

  if (error) return <p>Error</p>

  return (
    <Table dataArray={entities} title="Entities">

    </Table>
  )
}
export default Entities