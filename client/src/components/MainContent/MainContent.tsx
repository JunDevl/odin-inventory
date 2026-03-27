import type { HTMLProps, ReactNode } from "react";
import "./main_content.css"

type MainContentProps = {
  children?: ReactNode
} & HTMLProps<HTMLDivElement>

const MainContent = ({children, ...props}: MainContentProps) => {
  return (
    <main {...props}>
      {children}
    </main>
  )
}

export default MainContent;