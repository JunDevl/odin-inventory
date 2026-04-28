import { useRef, type HTMLProps } from "react";
import type { InputDetail } from "../Table/types";
import QueriedDropdown from "../QueriedDropdown/QueriedDropdown";
import Checkbox from "../Checkbox/Checkbox";

type ModalProps = HTMLProps<HTMLDialogElement> & {
  details: InputDetail[]
  columns: Record<string, string>
}

const Modal = ({details, columns, ...props}: ModalProps) => {
  const modal = useRef<HTMLDialogElement>(null);

  const modalInput = (key: string, detail: InputDetail, operation: "insert" | "update") => {
    const dataType = detail.type instanceof Array ? detail.type[0] : detail.type;

    switch (dataType) {
      case "boolean": {
        const checked = !(operation === "insert") || !(detail.placeholder === "auto") ? 
        false :
        dataArray[selectedIndexes[0]][key as keyof TableData];

        return <Checkbox name={key} id={key} checked={checked}/>
      }
      case "number":
        return <input type="number" name={key} id={key} />
      case "string": {
        if ("listQueryOptions" in detail) {
          const {listQueryOptions: queryOptions, relatedColumnKey: column} = detail;

          return <QueriedDropdown queryOptions={queryOptions} column={column} />;
        }

        return <input type="text" name={key} id={key} />
      }
      case Date:
        return <input type="datetime-local" name={key} id={key} />
      default:
        return <input type="text" name={key} id={key} />
    }
  }

  return (
    <dialog id="insert" ref={modal} {...props}>
      <p>Insert new</p>
      <form action="POST">
        <ul>
          {Object.entries(details).map(([key, value]) => 
            <li key={key}>
              <label htmlFor={key}>{columns[key]}</label>
              {modalInput(key, value!, "insert")}
            </li>
          )}
        </ul>
        <button type="submit">Submit</button>
      </form>
      <button className="close" onClick={() => modal.current!.close()}>close</button>
    </dialog>
  )
}
export default Modal