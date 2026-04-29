import { useRef, type DialogHTMLAttributes, type RefObject } from "react";
import type { InputDetail, TableData } from "../Table/types";
import QueriedDropdown from "../QueriedDropdown/QueriedDropdown";
import Checkbox from "../Checkbox/Checkbox";

type ModalProps = DialogHTMLAttributes<HTMLDialogElement> & {
  details: {
    [Column in keyof TableData | (string & {})]?: InputDetail
  },
  columns: {
    [Column in keyof TableData | (string & {})]?: string
  },
  ref?: RefObject<HTMLDialogElement | null>
} & ({
  operation: "insert",
  selectedItem?: never
} | {
  operation: "update",
  selectedItem: Record<string, any>
})

const Modal = ({details, columns, operation, selectedItem, ref, ...props}: ModalProps) => {
  const modal = ref ?? useRef<HTMLDialogElement>(null);

  const modalInput = (key: string, detail: InputDetail) => {
    const dataType = detail.type instanceof Array ? detail.type[0] : detail.type;
    const required = !detail.notMandatory;

    switch (dataType) {
      case "boolean": 
        return <Checkbox name={key} id={key} checked={false} required={required}/>
      case "number":
        return <input type="number" name={key} id={key} required={required}/>
      case "string": {
        if ("listQueryOptions" in detail) {
          const {listQueryOptions: queryOptions, relatedColumnKey: column} = detail;

          return (
            <QueriedDropdown 
              name={key}
              id={key}
              queryOptions={queryOptions} 
              column={column} 
              required={required}
            />
          );
        }

        return <input type="text" name={key} id={key} required={required}/>
      }
      case Date:
        return <input type="datetime-local" name={key} id={key} required={required}/>
      default:
        return <input type="text" name={key} id={key} required={required}/>
    }
  }

  return (
    <dialog id="insert" ref={modal} {...props}>
      <h3>{operation === "insert" ? "Insert new item to collection" : "Update item"}</h3>
      <form action="POST">
        <ul>
          {Object.entries(details).map(([key, value]) => 
            <li key={key}>
              <label htmlFor={key}>{columns[key]}</label>
              {modalInput(key, value!)}
            </li>
          )}
        </ul>
        <button type="submit">Submit</button>
      </form>
      <button className="close" onClick={() => modal.current!.close()}>Close</button>
    </dialog>
  )
}
export default Modal