import DataPage from "../../components/DataPage/DataPage";

const Entities = () => {
  return (
    <DataPage 
      title="Entities" 
      dataRoute="entities"
      identifier={{keys: ["entity_name", "address"], type: "name"}}
      requiredInputColumnTypes={{
        entity_name: {type: "string", placeholder: "blank"},
        trade: {type: "string", placeholder: "blank", notMandatory: true},
        address: {type: "string", placeholder: "blank"},
        type: {type: ["string", "list"], placeholder: "blank", list: ["client", "service_provider", "supplier"]}
      }}
      renamedColumns={{
        entity_name: "Name",
        trade: "Trade",
        address: "Address",
        type: "Kind"
      }}>
    </DataPage>
  )
}

export default Entities