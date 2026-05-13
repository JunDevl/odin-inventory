import "./stocks.css"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { queryOptions } from "../../../queries";
import Table from "../../components/Table/Table";
import type { Stock } from "@packages/utils";
import Modal from "../../components/Modal/Modal";

const Stocks = () => {
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(queryOptions["stocks"]);

  const [modalActive, setModalActive] = useState(false);

  const modal = useRef<HTMLDialogElement>(null);

  const [selectedItemIndexes, setSelectedItemIndexes] = useState(new Int8Array(data.length).fill(0));
  const selectedIndexes = (() => {
    const arr: number[] = [];

    selectedItemIndexes.forEach((value, index) => {if (value === 1) arr.push(index)});

    return arr;
  })();

  const [viewedItem, setViewedItem] = useState(data[0]);

  useEffect(() => {
    if (modalActive) modal.current!.showModal(); 
  }, [modalActive])

  return (
    <>
      <h1>Stocks Overview</h1>
      <Modal 
        route="stocks"
        selectedItem={viewedItem}
        ref={modal}
        columns={{
          name: "Item Name",
          description: "Item Description",
          stock_quantity: "Quantity",
          asset_value_cents: "Asset Value"
        }}
        operation="view"
        onClose={() => setModalActive(false)}
      />
      <Table 
        tableRows={data}
        columns={{
          name: "Item Name",
          description: "Item Description",
          stock_quantity: "Quantity",
          asset_value_cents: "Asset Value"
        }}
        selectionStateSetter={setSelectedItemIndexes}
        viewStateSetter={setViewedItem}
        onCellClick={() => setModalActive(true)}
      />
    </>
  )
}

export default Stocks