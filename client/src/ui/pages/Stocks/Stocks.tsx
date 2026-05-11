import { useSuspenseQuery } from "@tanstack/react-query";
import "./stocks.css"
import { queryOptions } from "../../../queries";
import Table from "../../components/Table/Table";
import type { APICRUDParams } from "@packages/utils";
import { useState } from "react";

const Stocks = () => {
  const { data: operations } = useSuspenseQuery(queryOptions["operations"]);
  const { data: items } = useSuspenseQuery(queryOptions["avaliable_items"]);

  // const stockData = items.map(item => {
  //   const itemOperations = operations.filter(operation => operation.item_name === item.name);

  //   const stock_quantity = itemOperations.reduce((acc, cur) => acc + cur.quantity, 0)
    
  //   const asset_total_value = itemOperations.reduce((acc, cur) => acc + cur.quantity, 0);

  //   return {...item, stock_quantity, asset_total_value}
  // });

  const [selectedItemIndexes, setSelectedItemIndexes] = useState(new Int8Array(operations.length).fill(0));
  const selectedIndexes = (() => {
    const arr: number[] = [];

    selectedItemIndexes.forEach((value, index) => {if (value === 1) arr.push(index)});

    return arr;
  })();

  const [viewedItem, setViewedItem] = useState(/*stockData[0]*/items[0]);

  return (
    <>
      <h1>Stocks Overview</h1>
      <Table 
        tableRows={/*stockData*/items}
        columns={{
          name: "Item Name",
          description: "Item Description",
          // stock_quantity: "Quantity",
          // asset_total_value: "Asset Value"
        }}
        setSelectionState={setSelectedItemIndexes}
        setViewState={setViewedItem}
      />
    </>
  )
}

export default Stocks