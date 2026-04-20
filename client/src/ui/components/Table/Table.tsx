import { useEffect, useRef, useState,  } from "react";
import type { ChangeEvent, HTMLProps, MouseEvent, RefObject } from "react";
import Checkbox from "../Checkbox/Checkbox";
import "./table.css";

type TableProps<T extends Record<string, any>> = {
  dataArray: T[],
  title: string
} & HTMLProps<HTMLTableElement>

const Table = <T extends Record<string, any>,>({dataArray, title, ...props}: TableProps<T>) => {
  const selectAll = useRef<HTMLInputElement>(null);
  const rowSelectors = useRef<HTMLInputElement[]>([]);
  const tableBody = useRef<HTMLTableSectionElement>(null);

  const [selectedItems, setSelectedItems] = useState<Map<number, T>>(new Map());

  const [modal, setModal] = useState<null | "insert" | "update">(null);
  const insertModal = useRef<HTMLDialogElement>(null);
  const updateModal = useRef<HTMLDialogElement>(null);

  const selectAllItems = (e: ChangeEvent<HTMLInputElement, HTMLInputElement> | MouseEvent<HTMLTableHeaderCellElement | HTMLTableCellElement, globalThis.MouseEvent>) => {
    e.stopPropagation();

    const target = e.target as HTMLElement;

    if (!target.matches("input")) {
      const select = (target as HTMLTableHeaderCellElement | HTMLTableCellElement).querySelector("input");

      select!.checked = select!.checked ? false : true;
    }

    rowSelectors.current.forEach(select => {
      select.checked = select.checked ? false : true;

      const row = select.closest("tr");
      
      row!.toggleAttribute("selected");

      const i = Number(row?.dataset.index);

      setSelectedItems(selected => {
        const newSelected = new Map(selected);
      
        select.checked ? newSelected.set(i, dataArray[i]) : newSelected.delete(i);

        return newSelected;
      });
    })
  }

  const selectItem = (e: ChangeEvent<HTMLInputElement, HTMLInputElement> | MouseEvent<HTMLTableHeaderCellElement | HTMLTableCellElement, globalThis.MouseEvent>) => {
    e.stopPropagation();

    const target = e.target as HTMLElement;
    let select;

    if (!target.matches("input")) {
      select = (target as HTMLTableHeaderCellElement | HTMLTableCellElement).querySelector("input");

      select!.checked = select!.checked ? false : true;
    }

    select = target as HTMLInputElement;
    const row = (e.target as HTMLInputElement).closest("tr");

    row!.toggleAttribute("selected");

    const i = Number(row?.dataset.index);

    setSelectedItems(selected => {
      const newSelected = new Map(selected);
      
      select.checked ? newSelected.set(i, dataArray[i]) : newSelected.delete(i);

      return newSelected;
    });

  }

  const closeModal = (modal: RefObject<HTMLDialogElement | null>) => {
    modal.current!.close();
    setModal(null);
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

  return (
    <>
      <dialog id="insert" ref={insertModal}>
        <p>test</p>
        <button className="close" onClick={() => closeModal(insertModal)}>close</button>
      </dialog>
      <dialog id="update" ref={updateModal}>
        <p>test</p>
        <button className="close" onClick={() => closeModal(updateModal)}>close</button>
      </dialog>
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
          <button className="insert" onClick={() => setModal("insert")}>
            Add +
          </button>
        </div>
        {dataArray.length > 0 ?
          <table title={title} {...props}>
            <thead>
              <tr>
                <th scope="col" onClickCapture={selectAllItems} className="selectable" >
                  <div>
                    <Checkbox 
                      name="all" 
                      id="all" 
                      ref={selectAll}
                      onChange={selectAllItems}
                    />
                  </div>
                </th>
                {Object.keys(dataArray[0]).map(item => 
                  <th scope="col" key={item}>
                    {item}
                  </th>
                )}
              </tr>
            </thead>
            <tbody ref={tableBody}>
              {dataArray.map((item, index) =>
                <tr id={`row${index+1}`} key={`row${index+1}`} data-index={index}>
                  <th scope="row" onClickCapture={selectItem} className="selectable">
                    <div>
                      <Checkbox 
                        ref={element => {rowSelectors.current[index] = element as HTMLInputElement}}
                        name={`select${index}`}
                        id={`select${index}`}
                        className="select"
                        onChange={selectItem}
                      />
                    </div>
                  </th>
                  {Object.values(item).map((value, index) =>
                    <td key={index}>{value instanceof Date ? value.toLocaleString() : value}</td>
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