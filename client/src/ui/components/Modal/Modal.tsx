import type { InputDetail, TableData } from "../Table/types";
import type { DataRoute } from "@packages/utils";
import { handleError, PromiseError, APIParamsToTableColumns } from "@packages/utils";
import type { DialogHTMLAttributes, RefObject, SubmitEvent } from "react";

import { useRef } from "react";
import QueriedDropdown from "../QueriedDropdown/QueriedDropdown";
import Checkbox from "../Checkbox/Checkbox";

import { createData, updateData } from "../../../actions";
import { useQueryClient } from "@tanstack/react-query";

type ModalProps = DialogHTMLAttributes<HTMLDialogElement> & {
  details: {
    [TableColumn in keyof TableData | (string & {})]?: InputDetail
  },
  columns: {
    [RequiredColumn in keyof ModalProps["details"]]: string
  },
  route: DataRoute
  ref?: RefObject<HTMLDialogElement | null>
} & ({
  operation: "insert",
  selectedItem?: undefined
} | {
  operation: "update",
  selectedItem: Record<string, any>
} | {
  operation: "view",
  selectedItem: Record<string, any> | null
})

const Modal = ({details, columns, route, ref, operation, selectedItem, ...props}: ModalProps) => {
  const queryClient = useQueryClient();
  
  const modal = ref ?? useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const formInputs = useRef<Map<keyof typeof columns, (HTMLInputElement | HTMLSelectElement)>>(new Map());

  const modalInput = (key: keyof typeof details, detail: InputDetail, index: number) => {
    const dataType = detail.type instanceof Array ? detail.type[0] : detail.type;
    const required = !detail.notMandatory;
    const initialValue = selectedItem ? selectedItem[key] : "";

    switch (dataType) {
      case "boolean": 
        return <Checkbox
          name={key}
          id={key}
          checked={false}
          ref={element => {formInputs.current.set(key, element as HTMLInputElement)}}
          defaultChecked={initialValue || false}
          required={required}
        />
      case "number":
        return <input 
          type="number" 
          name={key} 
          id={key} 
          ref={element => {formInputs.current.set(key, element as HTMLInputElement)}} 
          defaultValue={initialValue}
          required={required}
        />
      case "string": {
        if ("listQueryOptions" in detail) {
          const {listQueryOptions: queryOptions, relatedColumnKey: column} = detail;

          return (
            <QueriedDropdown 
              name={key}
              id={key}
              queryOptions={queryOptions} 
              column={column} 
              ref={element => {formInputs.current.set(key, element as HTMLSelectElement)}}
              defaultValue={initialValue}
              required={required}
            />
          );
        }

        return <input 
          type="text" 
          name={key} 
          id={key} 
          ref={element => {formInputs.current.set(key, element as HTMLInputElement)}} 
          defaultValue={initialValue}
          required={required}
        />
      }
      case Date:
        return <input 
          type="datetime-local" 
          name={key} 
          id={key} 
          ref={element => {formInputs.current.set(key, element as HTMLInputElement)}}
          defaultValue={initialValue}
          required={required}
        />
      default:
        return <input 
          type="text" 
          name={key} 
          id={key} 
          ref={element => {formInputs.current.set(key, element as HTMLInputElement)}}
          defaultValue={initialValue}
          required={required}
        />
    }
  }

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(form.current!);
    
    if (operation === "update") {
      

      return;
    }

    const params: Record<string, any> = {};

    Object.keys(details).forEach(detail => {
      const data = formData.get(detail);
      let parsedData = formInputs.current.get(detail)?.type === "number" ? Number(data) : data;
      parsedData = parsedData || null;

      const routeAPIMapper = APIParamsToTableColumns[route];

      for (const [outerKey, outerValue] of Object.entries(routeAPIMapper)) {
        if (outerValue === detail) params[outerKey] = parsedData;

        if (typeof outerValue === "object" && outerValue !== null) {
          for (const [innerKey, innerValue] of Object.entries(outerValue)) {
            if (innerValue === detail) {
              params[outerKey] = params[outerKey] ?? {};
              params[outerKey][innerKey] = parsedData;
            }
          }
        }
      }
    });

    const data = await handleError(createData(route, params));

    if (data instanceof PromiseError) throw new Error(data.error);

    queryClient.fetchQuery({queryKey: [route]});
    
    formInputs.current.forEach(input => 
      input.type !== "checkbox" ? input.value = "" : input.checked = false
    );
  }

  return (
    <dialog id="insert" ref={modal} {...props}>
      <h2>
        {
          operation === "insert" ? "Insert new item to collection" : 
          operation === "update" ? "Update item" : "View item"
        }
      </h2>
      <form action="POST" onSubmit={e => handleSubmit(e)} ref={form}>
        <ul>
          {
            Object.entries(details).map(([key, value], index) => 
              <li key={key}>
                {
                  operation !== "view" ?
                    <>
                      <label className="column_name" htmlFor={key}>{columns[key]}</label>
                      {modalInput(key, value!, index)} 
                    </> :
                    <>
                      <h4 className="column_name">{columns[key]}</h4>
                      {selectedItem && 
                        <p>{selectedItem[key] instanceof Date ? selectedItem[key].toDateString() : selectedItem[key]}</p>
                      }
                    </>
                }
              </li>
            ) 
          }
        </ul>
        <button type="submit">Submit</button>
      </form>
      <button className="close" onClick={() => modal.current!.close()}>Close</button>
    </dialog>
  )
}
export default Modal