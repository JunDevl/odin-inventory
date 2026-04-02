import type { HTMLProps, ReactNode } from "react";
import "./table.css"

type TableProps = {
  children?: ReactNode
  columns: string[],
  rowData: Record<string, any>[]
} & HTMLProps<HTMLTableElement>

const Table = ({children, rowData, title, ...props}: TableProps) => {
  return (
    <>
      <h1>{title}</h1>
      <div className="table-utils">
        <div className="filter">
          <p>
            s 
          </p>
          <input type="text" className="search" id="search" name="search"/>
          <button className="filter">
            F
          </button>
        </div>
        <button>
          Add +
        </button>
      </div>
      <table title={title} {...props}>
        <thead>
          <tr>
            <th scope="col">Person</th>
            <th scope="col">Most interest in</th>
            <th scope="col">Age</th>
          </tr>
        </thead>
        <tbody>
        <tr>
          <th scope="row">Chris</th>
          <td>HTML tables</td>
          <td>22</td>
        </tr>
        <tr>
          <th scope="row">Dennis</th>
          <td>Web accessibility</td>
          <td>45</td>
        </tr>
        <tr>
          <th scope="row">Sarah</th>
          <td>JavaScript frameworks</td>
          <td>29</td>
        </tr>
        <tr>
          <th scope="row">Karen</th>
          <td>Web performance</td>
          <td>36</td>
        </tr>
      </tbody>
        {children}
      </table>
    </>
  )
}

export default Table;