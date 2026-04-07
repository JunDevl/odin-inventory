import type { HTMLProps, ReactNode } from "react";
import "./table.css"

type TableProps = {
  dataArray: Record<string, any>[],
  title: string
} & HTMLProps<HTMLTableElement>

const Table = ({dataArray, title, ...props}: TableProps) => {
  return (
    <>
      <h1>{title}</h1>
      <div className="table">
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
        {dataArray.length > 0 ?
          <table title={title} {...props}>
            <thead>
              <tr>
                {Object.keys(dataArray[0]).map(item => 
                  <th scope="col">
                    {item}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {dataArray.map(item =>
                <tr>
                  {Object.values(item).map(value =>
                    <td>{value}</td>
                  )}
                </tr>
              )}
            </tbody>
          </table> :
          <p>Not found</p>
        }
      </div>
    </>
  )
}

export default Table;