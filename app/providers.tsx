"use client";

import { ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: Readonly<ProvidersProps>) {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
}
