import type { ChangeEvent, HTMLProps, MouseEvent } from "react";
import "./table.css";
import { Suspense, useEffect, useRef } from "react";

import Checkbox from "../Checkbox/Checkbox";

const LoadingRowsFallback = () => {
  return <tr className="loading">
    <td></td>
  </tr>
}

type TableProps<T extends Record<string, any>> = {
  tableRows: T[],
  columns: {
    [RequiredColumn in keyof T]?: string
  },
  viewStateSetter: React.Dispatch<React.SetStateAction<T>>,
  selectionStateSetter: React.Dispatch<React.SetStateAction<Int8Array<ArrayBuffer>>>,
  onRowHover?: React.MouseEventHandler<HTMLTableRowElement>,
  onCellClick?: React.MouseEventHandler<HTMLTableDataCellElement>
} & HTMLProps<HTMLTableElement>

const Table = <T extends Record<string, any>>({
  tableRows, columns, viewStateSetter, selectionStateSetter, onRowHover, onCellClick, ...props
}: TableProps<T>) => {
  const selectAll = useRef<HTMLInputElement>(null);
  const rowSelectors = useRef<HTMLInputElement[]>([]);
  const tableBody = useRef<HTMLTableSectionElement>(null);

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

      selectionStateSetter(previousSelected => {
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
    
    selectionStateSetter(previousSelected => {
      const newSelected = new Int8Array(previousSelected);

      newSelected[i] = checkbox!.checked ? 1 : 0;

      return newSelected;
    });
  }

  const showCellData = (index: number, key: keyof T) => {
    const currentCellValue = tableRows[index][key];

    if (!currentCellValue) return "";

    if ((currentCellValue as any) instanceof Date) return currentCellValue.toLocaleString();

    if ((key as string).includes("cent")) {
      const dollar = currentCellValue as number / 100;

      const dollarFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
      
      return dollarFormat.format(dollar);
    }

    if ((key as string).includes("url")) return <a href={currentCellValue as string} target="_blank">{currentCellValue as string}</a>;

    if ((key as string) === "type") {
      return (currentCellValue as string)
        .split("_")
        .map(text => `${text[0].toUpperCase()}${text.slice(1)}`)
        .reduce((prev, cur) => `${prev} ${cur}`)
    }

    return currentCellValue as any; 
  }

  useEffect(() => selectionStateSetter(new Int8Array(tableRows.length).fill(0)), [tableRows])

  return (
    <table {...props} id="data-table">
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
          {Object.values(columns).map(col => 
            <th scope="col" key={col}>
              {col}
            </th>
          )}
        </tr>
      </thead>
      <tbody ref={tableBody}>
        <Suspense fallback={<LoadingRowsFallback />}>
          {tableRows.map((_, index) =>
            <tr 
              id={`row${index+1}`} 
              key={`row${index+1}`} 
              data-index={index} 
              onMouseEnter={(e) => {
                viewStateSetter(tableRows[index]);
                if (onRowHover) onRowHover(e);
              }}
            >
              <th scope="row" onClickCapture={selectItem} className="selectable">
                <Checkbox 
                  ref={element => {rowSelectors.current[index] = element as HTMLInputElement}}
                  name={`select${index}`}
                  id={`select${index}`}
                  className="select"
                  onChange={selectItem}
                />
              </th>
              {Object.keys(columns).map((key) =>
                <td key={key} onClick={/*() => setModal("view")*/onCellClick}>
                  {showCellData(index, key)}
                </td>
              )}
            </tr>
          )}
        </Suspense>
      </tbody>
    </table>
  )
}

export default Table;