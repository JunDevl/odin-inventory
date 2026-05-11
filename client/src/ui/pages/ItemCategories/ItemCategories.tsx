import DataPage from "../../components/DataPage/DataPage";

const ItemCategories = () => {
  return (
    <DataPage 
      title="Item Categories" 
      dataRoute={"item_categories"}
      identifier={{keys: ["name"], type: "name"}}
      requiredInputColumnTypes={{
        name: {type: "string", placeholder: "blank"},
        description: {type: "string", placeholder: "blank", notMandatory: true}
      }}
      renamedColumns={{
        name: "Category Name",
        description: "Description"
      }}
    >
    </DataPage>
  )
}

export default ItemCategories