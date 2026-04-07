import { useRef, useState, type HTMLProps, type MouseEventHandler, type ReactNode } from "react";
import { Link, useLocation, useParams } from "react-router";
import "./sidebar.css";

type SidebarProps = {}

const Sidebar = (props: SidebarProps) => {
  const { userUUID } = useParams();
  const location = useLocation();

  const dropitems = useRef<HTMLUListElement>(null);
  const isHoveringDropdown = useRef(false);

  const getRelativePath = (path: string) => `/${userUUID}/${path}`;
  
  const handleDropdownHover = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    if (e.type === "mouseenter") {
      dropitems.current?.classList.remove("hidden");
      isHoveringDropdown.current = true;
      return;
    }

    if (e.type === "mouseleave") {
      isHoveringDropdown.current = false;
      setTimeout(() => {
        if (!isHoveringDropdown.current) dropitems.current?.classList.add("hidden");
      }, 150)
      return;
    }
  }

  return (
    <nav className="sidebar">
      <ul className="top">
        <li id="menu_toggle">Menu</li>
        <li id="stocks" className={location.pathname === getRelativePath("stocks") ? "selected" : ""}>
          <Link to={getRelativePath("stocks")} relative="path">Stocks</Link>
        </li>
        <li id="operations" className={location.pathname === getRelativePath("operations") ? "selected" : ""}>
          <Link to={getRelativePath("operations")} relative="path">Operations</Link>
        </li>
        <li id="clients/suppliers" className={location.pathname === getRelativePath("entities") ? "selected" : ""}>
          <Link to={getRelativePath("entities")} relative="path">Clients/Providers</Link>
        </li>
        <li 
          className="drop-down" 
          id="items_group" 
          onMouseEnter={(e) => handleDropdownHover(e)} 
          onMouseLeave={(e) => handleDropdownHover(e)}
        >
          <p className="title">Items</p>
          <ul className="drop-items hidden" ref={dropitems}>
            <li id="items" className={location.pathname === getRelativePath("items/avaliable") ? "selected" : ""}>
              <Link to={getRelativePath("items/avaliable")} relative="path">
                Avaliable Items
              </Link>
            </li>
            <li id="categories" className={location.pathname === getRelativePath("items/categories") ? "selected" : ""}>
              <Link to={getRelativePath("items/categories")} relative="path">
                Item Categories
              </Link>
            </li>
          </ul>
        </li>
      </ul>
      <ul className="bottom">
        <li>Account</li>
      </ul>
    </nav>
  )
}

export default Sidebar;