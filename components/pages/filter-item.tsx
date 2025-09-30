import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  
  className?: string;
 
}

export const FilterItem = ({
  children,
  
  className = "",
  
}: Props) => {
 

  return <div className={cn(className)}>{children}</div>;
};
