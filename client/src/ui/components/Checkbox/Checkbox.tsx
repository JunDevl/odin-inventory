import type { HTMLProps } from "react";
import "./checkbox.css";

type CheckboxProps = Omit<HTMLProps<HTMLInputElement>, "type"> & {}

const Checkbox = (props: CheckboxProps) => {
  return (
    <div className="checkbox">
      <input 
        type="checkbox"
        {...props}
      />
      <label htmlFor={props.id}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" fill="none" strokeWidth="5" rx="10" ry="10" className="border" />
          <path d="M 12, 12 l 76, 0 l 0, 76 l -76, 0 Z M 12, 12 l 76, 0 l 0, 76 l -76, 0 Z" className="fill" fillRule="evenodd" />
          <path d="M 26, 50 l 15, 15 l 35, -35" className="mark" />
        </svg>
      </label>
    </div>
  )
}
export default Checkbox