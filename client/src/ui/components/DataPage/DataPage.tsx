import "./datapage.css";
import type { InputDetail } from "./types";
import { useEffect, useRef, useState,  } from "react";

import type { APICRUDParams, DataRoute } from "@packages/utils";
import { handleError, PromiseError } from "@packages/utils";
import Modal from "../Modal/Modal";
import { batchDeleteData } from "../../../actions";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "../../../queries";
import Table from "../Table/Table";

type DataPageProps<T extends DataRoute> = {
  title: string,
  dataRoute: T,
  identifier: {keys: Array<keyof APICRUDParams[T]>, type: "number" | "name"};
  requiredInputColumnTypes: {
    [TableColumn in keyof Partial<APICRUDParams[T]>]: InputDetail
  },
  renamedColumns: {
    [RequiredColumn in keyof DataPageProps<T>["requiredInputColumnTypes"]]: string
  }
}

const DataPage = <T extends DataRoute>({
  title, dataRoute, identifier, requiredInputColumnTypes, renamedColumns
}: DataPageProps<T>) => {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(queryOptions[dataRoute]);

  const [selectedItemIndexes, setSelectedItemIndexes] = useState(new Int8Array(data.length).fill(0));
  const selectedIndexes = (() => {
    const arr: number[] = [];

    selectedItemIndexes.forEach((value, index) => {if (value === 1) arr.push(index)});

    return arr;
  })();

  const [modal, setModal] = useState<null | "insert" | "update" | "view">(null);
  const insertModal = useRef<HTMLDialogElement>(null);
  const updateModal = useRef<HTMLDialogElement>(null);
  const viewModal = useRef<HTMLDialogElement>(null);

  const [viewedItem, setViewedItem] = useState<APICRUDParams[T]>(data[0]);

  const deleteRows = async () => {
    const targetData: any[] = [];

    const selectedData = selectedIndexes.map(index => data[index]);

    const {keys, type} = identifier;

    selectedData.forEach(data => targetData.push(keys.map(key => data[key])));

    const deleted = await handleError(batchDeleteData(dataRoute, type, targetData));

    if (deleted instanceof PromiseError) throw new Error(deleted.error);

    queryClient.fetchQuery({queryKey: [dataRoute]});
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
      case "view":
        viewModal.current!.showModal();
        break;
    }
  }, [modal])

  return (
    <>
      <Modal 
        id="insert"
        ref={insertModal}
        details={requiredInputColumnTypes} 
        columns={renamedColumns} 
        route={dataRoute}
        operation="insert" 
        onClose={() => setModal(null)}
      />
      <Modal
        id="update"
        ref={updateModal}
        details={requiredInputColumnTypes} 
        columns={renamedColumns} 
        route={dataRoute}
        operation="update"
        selectedItem={data[selectedIndexes[0]]}
        onClose={() => setModal(null)}
      />
      <Modal
        id="view"
        ref={viewModal}
        columns={renamedColumns} 
        route={dataRoute}
        operation="view"
        selectedItem={viewedItem}
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
              <button className="delete" onClick={deleteRows}>
                Delete Selected
              </button>  :
              <>
                <button className="edit" onClick={() => setModal("update")}>
                  Edit
                </button>
                <button className="delete" onClick={deleteRows}>
                  Delete
                </button>
              </>
            :
            <button className="insert" onClick={() => setModal("insert")}>
              Add +
            </button>}
        </div>
        <Table 
          tableRows={data}
          columns={renamedColumns}
          viewStateSetter={setViewedItem}
          selectionStateSetter={setSelectedItemIndexes}
          onCellClick={() => setModal("view")}
        />
      </div>
    </>
  )
}

export default DataPage;