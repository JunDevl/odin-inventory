import { useEffect, useState } from "react";
import Table from "../../components/Table/Table";
import { fetchAll } from "../../../actions";

type OperationsProps = {}

const mockdata = [
  {
    abba: "abba", 
    boubba: "boubba"
  },
  {
    abba: "abba", 
    boubba: "boubba"
  }
]

const Operations = (props: OperationsProps) => {

  const [operations, setOperations] = useState(async () => {
    const stored = localStorage.getItem("operations");

    if (!stored) {
      const data = await fetchAll("operations");
      console.log(data);
      return data;
    }
  })

  return (
    <>
      <Table title="Operations" columns={["abba", "boubba"]} rowData={mockdata}>

      </Table>
    </>
  )
}
export default Operations