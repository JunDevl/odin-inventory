import { useEffect, useRef, useState, type HTMLProps, type MouseEventHandler, type ReactNode } from "react";
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
  const dropitems = useRef<HTMLUListElement>(null);

  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);

  const handleDropdownHover = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    if (e.type === "mouseenter") { 
      setIsHoveringDropdown(true);
      return; 
    }

    if (e.type === "mouseleave") {
      setIsHoveringDropdown(false);

      return; 
    }
  }

  useEffect(() => {
    if (isHoveringDropdown) {
      dropitems.current?.classList.remove("hidden");
      return;
    }

    // const timeout = setTimeout(() => {
    //   if (!dropitems.current?.classList.contains("hidden")) dropitems.current?.classList.add("hidden");
    // }, 250);

    dropitems.current?.classList.add("hidden");

    // return clearTimeout(timeout);
  }, [isHoveringDropdown])

  return (
    <nav className="sidebar">
      <ul>
        <LILink id="menu_toggle">Menu</LILink>
        <LILink id="stocks" href="/" className={selectedTab === "stocks" ? "selected" : ""}>Stocks</LILink>
        <LILink id="operations" href="/operations" className={selectedTab === "operations" ? "selected" : ""}>Operations
        </LILink>
        <LILink id="storage_areas" href="/storages" className={selectedTab === "storages" ? "selected" : ""}>Storage Areas
        </LILink>
        <LILink id="clients/suppliers" href="/entities" className={selectedTab === "entities" ? "selected" : ""}
          >Clients/Suppliers</LILink>
        <li 
          className="drop-down" 
          id="items_group" 
          onMouseEnter={(e) => handleDropdownHover(e)} 
          onMouseLeave={(e) => handleDropdownHover(e)}
        >
          <p className="title">Items</p>
          <ul className="drop-items hidden" ref={dropitems}>
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

export default Sidebar;