import type { HTMLProps, ReactNode } from "react";

type TableProps = {
  children?: ReactNode
} & HTMLProps<HTMLTableElement>

const Table = ({children, ...props}: TableProps) => {
  return (
    <table {...props}>
      {children}
    </table>
  )
}

export default Table;