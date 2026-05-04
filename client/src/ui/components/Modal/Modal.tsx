import type { InputDetail, TableData } from "../Table/types";
import type { DataRoute, APICreateUpdateParams, EntityFranchise, RouteTableMapping } from "@app/utils";
import type { DialogHTMLAttributes, RefObject, SubmitEvent } from "react";

import { useRef } from "react";
import QueriedDropdown from "../QueriedDropdown/QueriedDropdown";
import Checkbox from "../Checkbox/Checkbox";

import { createData, updateData } from "../../../actions";
import { useQueryClient } from "@tanstack/react-query";

type APIToTableMapper = { 
  [Route in DataRoute]: { 
    [TableColumn in keyof APICreateUpdateParams[Route]]: 
      APICreateUpdateParams[Route][TableColumn] extends EntityFranchise ? 
        {
          [EntityColumn in keyof EntityFranchise]: keyof RouteTableMapping[Route]
        }
        : keyof RouteTableMapping[Route]
  }
};

export const APIParamsToTableColumns: APIToTableMapper = {
  operations: {
    userUuid: "user_id",
    addressee: {
      entityName: "addressee_entity_name",
      franchiseAddress: "addressee_franchise_address"
    },
    sendee: {
      entityName: "sendee_entity_name",
      franchiseAddress: "sendee_franchise_address"
    },
    itemName: "item_name",
    quantity: "quantity",
    unit: "unit_name",
    priceCents: "price_cents",
    shippedAt: "shipped_at",
    arrivedAt: "arrived_at"
  },
  entities: {
    userUuid: "entity_user_id",
    name: "entity_name",
    address: "address",
    type: "type",
    trade: "trade"
  },
  avaliable_items: {
    userUuid: "user_id",
    name: "name",
    description: "description",
    categoryName: "category_name"
  },
  item_units: {
    userUuid: "user_id",
    name: "name",
    description: "description",
    wikipediaUrl: "wikipedia_url"
  },
  item_categories: {
    userUuid: "user_id",
    name: "name",
    description: "description"
  }
};

type ModalProps = DialogHTMLAttributes<HTMLDialogElement> & {
  details: {
    [TableColumn in keyof TableData | (string & {})]?: InputDetail
  },
  columns: {
    [RequiredColumn in keyof ModalProps["details"]]?: string
  },
  route: DataRoute
  ref?: RefObject<HTMLDialogElement | null>
} & ({
  operation: "insert",
  selectedItem?: never
} | {
  operation: "update",
  selectedItem: Record<string, any>
})

const Modal = ({details, columns, route, ref, operation, selectedItem, ...props}: ModalProps) => {
  const queryClient = useQueryClient();
  
  const modal = ref ?? useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const formInputs = useRef<Map<keyof typeof columns, (HTMLInputElement | HTMLSelectElement)>>(new Map());

  const modalInput = (key: keyof typeof details, detail: InputDetail, index: number) => {
    const dataType = detail.type instanceof Array ? detail.type[0] : detail.type;
    const required = !detail.notMandatory;

    switch (dataType) {
      case "boolean": 
        return <Checkbox 
          name={key} 
          id={key} 
          checked={false} 
          ref={element => {formInputs.current.set(key, element as HTMLInputElement)}} 
          required={required}
        />
      case "number":
        return <input 
          type="number" 
          name={key} 
          id={key} 
          ref={element => {formInputs.current.set(key, element as HTMLInputElement)}} 
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
              required={required}
            />
          );
        }

        return <input 
          type="text" 
          name={key} 
          id={key} 
          ref={element => {formInputs.current.set(key, element as HTMLInputElement)}} 
          required={required}
        />
      }
      case Date:
        return <input 
          type="datetime-local" 
          name={key} 
          id={key} 
          ref={element => {formInputs.current.set(key, element as HTMLInputElement)}}
          required={required}
        />
      default:
        return <input 
          type="text" 
          name={key} 
          id={key} 
          ref={element => {formInputs.current.set(key, element as HTMLInputElement)}}
          required={required}
        />
    }
  }

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
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

    createData(route, params).then((res) => {queryClient.fetchQuery({queryKey: [route]})});
  }

  return (
    <dialog id="insert" ref={modal} {...props}>
      <h3>{operation === "insert" ? "Insert new item to collection" : "Update item"}</h3>
      <form action="POST" onSubmit={e => handleSubmit(e)} ref={form}>
        <ul>
          {Object.entries(details).map(([key, value], index) => 
            <li key={key}>
              <label htmlFor={key}>{columns[key]}</label>
              {modalInput(key, value!, index)}
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