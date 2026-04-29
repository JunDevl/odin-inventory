import "./table.css";
import { useEffect, useRef, useState,  } from "react";
import type { ChangeEvent, HTMLProps, MouseEvent } from "react";
import type { TableData, InputDetail } from "./types";

import Checkbox from "../Checkbox/Checkbox";
import Modal from "../Modal/Modal";

type TableProps<T extends TableData> = {
  dataArray: T[],
  title: string,
  requiredInputColumnTypes: {
    [Column in keyof T | (string & {})]?: InputDetail
  },
  renamedColumns: {
    [Column in keyof T | (string & {})]?: string
  }
} & HTMLProps<HTMLTableElement>

const Table = <T extends TableData,>({dataArray, title, requiredInputColumnTypes, renamedColumns, ...props}: TableProps<T>) => {
  const selectAll = useRef<HTMLInputElement>(null);
  const rowSelectors = useRef<HTMLInputElement[]>([]);
  const tableBody = useRef<HTMLTableSectionElement>(null);

  const [selectedItemIndexes, setSelectedItemIndexes] = useState(new Int8Array(dataArray.length).fill(0));
  const selectedIndexes = (() => {
    const arr: number[] = [];

    selectedItemIndexes.forEach((value, index) => {if (value === 1) arr.push(index)});

    return arr;
  })();

  const [modal, setModal] = useState<null | "insert" | "update">(null);
  const insertModal = useRef<HTMLDialogElement>(null);
  const updateModal = useRef<HTMLDialogElement>(null);

  const selectAllItems = (e: ChangeEvent<HTMLInputElement, HTMLInputElement> | MouseEvent<HTMLTableHeaderCellElement | HTMLTableCellElement, globalThis.MouseEvent>) => {
    e.stopPropagation();

    const target = e.target as HTMLElement;

    if (target.matches("label")) return;

    const targetIsInput = target.matches("input");

    const checkbox = !targetIsInput ?
      target.querySelector("input") :
      target as HTMLInputElement;

    if (!targetIsInput) checkbox!.checked = checkbox!.checked ? false : true;

    rowSelectors.current.forEach(selector => {
      selector.checked = selector.checked ? false : true;

      const row = selector.closest("tr");
      
      row!.toggleAttribute("selected");

      const i = Number(row?.dataset.index);

      setSelectedItemIndexes(previousSelected => {
        const newSelected = new Int8Array(previousSelected);

        newSelected[i] = selector.checked ? 1 : 0;

        return newSelected;
      });
    })
  }

  const selectItem = (e: ChangeEvent<HTMLInputElement, HTMLInputElement> | MouseEvent<HTMLTableHeaderCellElement | HTMLTableCellElement, globalThis.MouseEvent>) => {
    e.stopPropagation();

    const target = e.target as HTMLElement;

    if (target.matches("label")) return;

    const targetIsInput = target.matches("input");

    const checkbox = !targetIsInput ?
      target.querySelector("input") :
      target as HTMLInputElement;

    if (!targetIsInput) checkbox!.checked = checkbox!.checked ? false : true;
    
    const row = (e.target as HTMLInputElement).closest("tr");

    row!.toggleAttribute("selected");

    const i = Number(row?.dataset.index);
    
    setSelectedItemIndexes(previousSelected => {
      const newSelected = new Int8Array(previousSelected);

      newSelected[i] = checkbox!.checked ? 1 : 0;

      return newSelected;
    });
  }
  
  useEffect(() => {
    if (!modal) return;

    switch(modal) {
      case "insert":
        insertModal.current!.showModal();
        break;
      case "update":
        updateModal.current!.showModal();
        break;
    }
  }, [modal])

  const showCellData = (index: number, key: keyof T) => {
    const data = dataArray[index][key];

    if (!data) return "";

    if (data instanceof Date) return data.toLocaleString();

    if ((key as string).includes("cent")) {
      const dollar = data as number / 100;

      const dollarFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
      
      return dollarFormat.format(dollar);
    }

    if ((key as string).includes("url")) {
      return <a href={data as string} target="_blank">{data as any}</a>
    }

    if ((key as string) === "type") {
      return (data as string)
        .split("_")
        .map(text => `${text[0].toUpperCase()}${text.slice(1)}`)
        .reduce((prev, cur) => `${prev} ${cur}`)
    }

    return data as any; 
  }

  return (
    <>
      <Modal 
        id="insert"
        ref={insertModal}
        details={requiredInputColumnTypes} 
        columns={renamedColumns} 
        operation="insert" 
        onClose={() => setModal(null)}
      />
      <Modal
        id="update"
        ref={updateModal}
        details={requiredInputColumnTypes} 
        columns={renamedColumns} 
        operation="update"
        selectedItem={dataArray[selectedIndexes[0]]}
        onClose={() => setModal(null)}
      />
      <h1>{title}</h1>
      <div className="table">
        <div className="table-utils">
          <div className="filter">
            <p className="search_icon">
              <svg viewBox="0 0 24 24" fill="transparent" xmlns="http://www.w3.org/2000/svg">
                <g id="Interface / Search_Magnifying_Glass">
                  <path id="Vector" d="M15 15L21 21M10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
            </p>
            <input type="text" className="search" id="search" name="search"/>
            <button className="expand">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3 7C3 6.44772 3.44772 6 4 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7ZM6 12C6 11.4477 6.44772 11 7 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H7C6.44772 13 6 12.5523 6 12ZM9 17C9 16.4477 9.44772 16 10 16H14C14.5523 16 15 16.4477 15 17C15 17.5523 14.5523 18 14 18H10C9.44772 18 9 17.5523 9 17Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          {selectedIndexes.length > 0 ? 
            selectedIndexes.length > 1 ? 
              <button className="delete" onClick={() => console.log("delete selected")}>
                Delete Selected
              </button>  :
              <>
                <button className="edit" onClick={() => setModal("update")}>
                  Edit
                </button>
                <button className="delete" onClick={() => console.log("delete")}>
                  Delete
                </button>
              </>
            :
            <button className="insert" onClick={() => setModal("insert")}>
              Add +
            </button>}
        </div>
        {dataArray.length > 0 ?
          <table title={title} {...props}>
            <thead>
              <tr>
                <th scope="col" onClickCapture={selectAllItems} className="selectable" >

                    <Checkbox 
                      name="all" 
                      id="all" 
                      ref={selectAll}
                      onChange={selectAllItems}
                    />

                </th>
                {Object.values(renamedColumns).map(col => 
                  <th scope="col" key={col}>
                    {col}
                  </th>
                )}
              </tr>
            </thead>
            <tbody ref={tableBody}>
              {dataArray.map((_, index) =>
                <tr id={`row${index+1}`} key={`row${index+1}`} data-index={index}>
                  <th scope="row" onClickCapture={selectItem} className="selectable">

                      <Checkbox 
                        ref={element => {rowSelectors.current[index] = element as HTMLInputElement}}
                        name={`select${index}`}
                        id={`select${index}`}
                        className="select"
                        onChange={selectItem}
                      />

                  </th>
                  {Object.keys(renamedColumns).map((key) =>
                    <td key={key}>
                      {showCellData(index, key as keyof T)}
                    </td>
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