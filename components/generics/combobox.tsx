"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatusDropdownMenuProps {
	initialStatus?: string;
	options?: Array<{ label: string; icon: React.ElementType }>;
	onStatusChange?: (newStatus: string) => void;
}

export const Combobox: React.FC<StatusDropdownMenuProps> = ({
	initialStatus = "Ativo",
	options = [
		{
			label: "Ativo",
			icon: (props) => <div className="w-2 h-2 rounded-full bg-green-500" {...props} />,
		},
		{
			label: "Inativo",
			icon: (props) => <div className="w-2 h-2 rounded-full bg-red-500" {...props} />,
		},
	],
	onStatusChange,
}) => {
	const [status, setStatus] = React.useState(initialStatus);
	const [open, setOpen] = React.useState(false);

	const handleSelect = (label: string) => {
		setStatus(label);
		setOpen(false);
		if (onStatusChange) onStatusChange(label);
	};

	return (
		<div className="flex items-center justify-between rounded-md sm:flex-row sm:items-center z-[1015] pl-2">
			<p className="text-sm font-medium leading-none">
				<span
					className={`rounded-lg px-2 py-1 text-xs ${
						status === "Ativo" ? "bg-green-500 text-white" : "bg-red-500 text-white"
					}`}
				>
					{status}
				</span>
			</p>
			<DropdownMenu open={open} onOpenChange={setOpen} modal>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="w-fit p-0">
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-fit z-[1026]">
					<DropdownMenuGroup>
						{options.map(({ label, icon: Icon }) => (
							<DropdownMenuItem key={label} onSelect={() => handleSelect(label)}>
								{Icon && <Icon className="mr-2 h-4 w-4" />}
								{label}
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
