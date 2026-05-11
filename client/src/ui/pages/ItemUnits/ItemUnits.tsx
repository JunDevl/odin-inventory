import DataPage from "../../components/DataPage/DataPage";

const ItemUnits = () => {
  return (
    <DataPage 
      title="Item Units" 
      dataRoute="item_units"
      identifier={{keys: ["name"], type: "name"}}
      requiredInputColumnTypes={{
        name: {type: "string", placeholder: "blank"},
        description: {type: "string", placeholder: "blank", notMandatory: true},
        wikipedia_url: {type: "string", placeholder: "blank", notMandatory: true}
      }}
      renamedColumns={{
        name: "Unit Name",
        description: "Descripton",
        wikipedia_url: "Wikipedia Link"
      }}
    >
    </DataPage>
  )
}

export default ItemUnits