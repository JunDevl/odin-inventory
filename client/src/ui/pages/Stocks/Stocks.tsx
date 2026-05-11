import { useSuspenseQuery } from "@tanstack/react-query";
import "./stocks.css"
import { queryOptions } from "../../../queries";
import Table from "../../components/Table/Table";
import { useState } from "react";

const Stocks = () => {
  const { data } = useSuspenseQuery(queryOptions["stocks"]);

  const [selectedItemIndexes, setSelectedItemIndexes] = useState(new Int8Array(data.length).fill(0));
  const selectedIndexes = (() => {
    const arr: number[] = [];

    selectedItemIndexes.forEach((value, index) => {if (value === 1) arr.push(index)});

    return arr;
  })();

  const [viewedItem, setViewedItem] = useState(data[0]);

  return (
    <>
      <h1>Stocks Overview</h1>
      <Table 
        tableRows={data}
        columns={{
          name: "Item Name",
          description: "Item Description",
          stock_quantity: "Quantity",
          asset_value_cents: "Asset Value"
        }}
        setSelectionState={setSelectedItemIndexes}
        setViewState={setViewedItem}
      />
    </>
  )
}

export default Stocks