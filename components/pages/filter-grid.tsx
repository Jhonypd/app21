import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const FilterGrid = ({
  children,
  className = "",
}: Props) => {
  return (
    <div className={cn("grid w-full grid-cols-12 gap-4", className)}>
      {children}
    </div>
  );
};
