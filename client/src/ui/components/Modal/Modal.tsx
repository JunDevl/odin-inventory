import type { InputDetail } from "../DataPage/types";
import type { APICRUDParams, DataRoute } from "@packages/utils";
import type { DialogHTMLAttributes, RefObject, SubmitEvent } from "react";
import { handleError, PromiseError } from "@packages/utils";

import { useRef } from "react";
import Dropdown from "../Dropdown/Dropdown";
import Checkbox from "../Checkbox/Checkbox";

import { createData, updateData } from "../../../actions";
import { useQueryClient } from "@tanstack/react-query";

type ModalProps<T extends DataRoute> = 
DialogHTMLAttributes<HTMLDialogElement> & {
    route: T,
    ref?: RefObject<HTMLDialogElement | null>
  } & ({
    details: {[TableColumn in keyof Partial<APICRUDParams[T]>]: InputDetail},
    columns: {[RequiredColumn in keyof ModalProps<T>["details"]]: string},
    operation: "insert",
    selectedItem?: null
  } | {
    details: {[TableColumn in keyof Partial<APICRUDParams[T]>]: InputDetail},
    columns: {[RequiredColumn in keyof ModalProps<T>["details"]]: string},
    operation: "update",
    selectedItem: APICRUDParams[T]
  } | {
    details?: null,
    columns: {[RequiredColumn in keyof Partial<APICRUDParams[T]>]: string},
    operation: "view",
    selectedItem: APICRUDParams[T]
  });

const Modal = <T extends DataRoute,>({details, columns, route, ref, operation, selectedItem, ...props}: ModalProps<T>) => {
  const queryClient = useQueryClient();
  
  const modal = ref ?? useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const formInputs = useRef<Map<string, (HTMLInputElement | HTMLSelectElement)>>(new Map());

  const modalInput = (key: string, detail: InputDetail) => {
    if (operation === "view") throw new Error("Can't call this function in view mode.");

    const dataType = detail.type instanceof Array ? detail.type[0] : detail.type;
    const required = !detail.notMandatory;
    const initialValue: any = selectedItem ? selectedItem[key as keyof typeof selectedItem] : "";

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
          defaultValue={initialValue as any}
          required={required}
        />
      case "string": {
        if ("listQueryOptions" in detail) {
          const {listQueryOptions: queryOptions, relatedColumnKey: column} = detail;

          return (
            <Dropdown 
              name={key}
              id={key}
              queryOptions={queryOptions as any}
              route={route}
              column={column as keyof APICRUDParams[typeof route]} 
              ref={element => {formInputs.current.set(key, element as HTMLSelectElement)}}
              defaultValue={initialValue}
              required={required}
            />
          );
        }

        if ("list" in detail) {
          return <Dropdown 
            name={key}
            id={key}
            route={route}
            optionsList={detail.list!}
            ref={element => {formInputs.current.set(key, element as HTMLSelectElement)}}
            defaultValue={initialValue}
            required={required}
          />
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
    if (operation === "view") throw new Error("Can't call this function in view mode.");

    e.preventDefault();

    const formData = new FormData(form.current!);

    let newData: APICRUDParams[typeof route] = {} as any;

    Object.keys(details).forEach(tableColumn => {
      const data = formData.get(tableColumn);

      let parsedValue;

      switch (formInputs.current.get(tableColumn)?.type!) {
        case "number": parsedValue = Number(data); break;
        case "checkbox": parsedValue = Boolean(data); break;
        default: parsedValue = String(data);
      }
      parsedValue = parsedValue || null;

      (newData as any)[tableColumn] = parsedValue;
    });

    const data = await handleError(
      operation === "insert" ? 
        createData(route, newData) : 
        updateData(route, selectedItem, newData)
    )

    if (data instanceof PromiseError) throw new Error(data.error);

    queryClient.fetchQuery({queryKey: [route]});
    
    formInputs.current.forEach(input => 
      input.type !== "checkbox" ? input.value = "" : input.checked = false
    );
  }

  return (
    <dialog id="insert" ref={modal} {...props}>
      <h2>{
        operation === "insert" ? "Insert new item to collection" : 
        operation === "update" ? "Update item" : "View item"
      }</h2>
      {operation !== "view" ?
        <form action="POST" onSubmit={e => handleSubmit(e)} ref={form}>
          <ul>{
            Object.entries(details).map(([key, value]) => 
              <li key={key}>
                <label className="column_name" htmlFor={key}>{columns[key as keyof typeof columns]}</label>
                {modalInput(key, value as any)} 
              </li>
            ) 
          }</ul>
          <button type="submit">Submit</button>
        </form> :
        <div>
          <ul>{
            Object.entries(columns).map(([key]) => 
              <li key={key}>
                <h4 className="column_name">{columns[key as keyof APICRUDParams[T]]}</h4>
                {selectedItem && 
                  <p>
                    {selectedItem[key as keyof APICRUDParams[T]] instanceof Date ? 
                      (selectedItem[key as keyof APICRUDParams[T]] as any).toDateString() : 
                      selectedItem[key as keyof APICRUDParams[T]]}
                    </p>
                }
              </li>
            ) 
          }</ul>
        </div>
      }
      <button className="close" onClick={() => modal.current!.close()}>Close</button>
    </dialog>
  )
}
export default Modal