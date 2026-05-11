import { queryOptions } from "../../../queries";
import DataPage from "../../components/DataPage/DataPage";

const AvaliableItems = () => {
  return (
    <DataPage 
      title="Avaliable Items" 
      dataRoute="avaliable_items"
      identifier={{keys: ["name"], type: "name"}}
      requiredInputColumnTypes={{
        name: {type: "string", placeholder: "blank"},
        description: {type: "string", placeholder: "blank", notMandatory: true},
        category_name: {
          type: ["string", "list"], 
          placeholder: "blank", 
          notMandatory: true,
          listQueryOptions: queryOptions["item_categories"],
          relatedColumnKey: "name"
        }
      }}
      renamedColumns={{
        name: "Item Name",
        description: "Description",
        category_name: "Category"
      }}
    >
    </DataPage>
  )
}

export default AvaliableItems