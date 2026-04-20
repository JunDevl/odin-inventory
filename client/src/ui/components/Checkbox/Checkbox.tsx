import type { HTMLProps } from "react";
import "./checkbox.css";

type CheckboxProps = Omit<HTMLProps<HTMLInputElement>, "type"> & {}

const Checkbox = (props: CheckboxProps) => {
  const {className, ...inputProps} = props;

  return (
    <div className={`checkbox${className ? ` ${className}` : ""}`}>
      <input 
        type="checkbox"
        {...inputProps}
      />
      <label htmlFor={inputProps.id}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" rx="10" ry="10" className="border"/>
          <path d="M 13, 13 l 74, 0 l 0, 74 l -74, 0 Z M 13, 13 l 74, 0 l 0, 74 l -74, 0 Z" className="fill" />
          <path d="M 26, 50 l 15, 15 l 35, -35" className="mark"/>
        </svg>
      </label>
    </div>
  )
}
export default Checkbox