import type { HTMLProps, ReactNode } from "react";
import "./sidebar.css";

type LILinkProps = {
  children?: ReactNode
} & HTMLProps<HTMLLIElement> & HTMLProps<HTMLAnchorElement>

const LILink = ({children, ...props}: LILinkProps) => {
  return <li {...props}>
    {children}
  </li>
}

type SidebarProps = {
  selectedTab: string
}

const Sidebar = ({selectedTab}: SidebarProps) => {
  return (
    <nav className="side-bav">
      <ul>
        <LILink id="menu_toggle">Menu</LILink>
        <LILink id="stocks" href="/" className={selectedTab === "stocks" ? "selected" : ""}>Stocks</LILink>
        <LILink id="operations" href="/operations" className={selectedTab === "operations" ? "selected" : ""}>Operations
        </LILink>
        <LILink id="storage_areas" href="/storages" className={selectedTab === "storages" ? "selected" : ""}>Storage Areas
        </LILink>
        <LILink id="clients/suppliers" href="/entities" className={selectedTab === "entities" ? "selected" : ""}
          >Clients/Suppliers</LILink>
        <li className="drop-down" id="items_group">
          <p className="title">Items</p>
          <ul className="drop-items hidden">
            <LILink id="items" href="/items/avaliable" className={selectedTab === "avaliableItems" ? "selected" : ""}
              >Avaliable Items</LILink>
            <LILink id="categories" href="/items/categories" className={selectedTab === "itemsCategories" ? "selected" : ""}>Item
              Categories</LILink>
          </ul>
        </li>
      </ul>
    </nav>
  )
}

export default Sidebar