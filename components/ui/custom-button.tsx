import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon?: ReactNode;
	text?: string;
	variant?: "default" | "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	fullWidth?: boolean;
	disabled?: boolean;
	loading?: boolean;
	iconPosition?: "left" | "right";
	rounded?: boolean;
	children?: ReactNode;
}

export const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
	(
		{
			icon,
			text,
			disabled = false,
			loading = false,
			variant = "default",
			size = "md",
			fullWidth = false,
			iconPosition = "left",
			rounded = false,
			children,
			className,
			...props
		},
		ref
	) => {
		const variants = {
			default: [
				"bg-gradient-to-r from-slate-50 to-slate-100",
				"hover:from-slate-100 hover:to-slate-200",
				"active:from-slate-200 active:to-slate-300",
				"text-slate-900 border border-slate-200",
				"hover:border-slate-300 shadow-sm hover:shadow-md",
			].join(" "),

			primary: [
				"bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700",
				"hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800",
				"active:from-indigo-800 active:via-purple-800 active:to-indigo-900",
				"text-white shadow-lg hover:shadow-xl",
				"ring-2 ring-transparent hover:ring-indigo-200",
			].join(" "),

			secondary: [
				"bg-gradient-to-r from-gray-600 to-gray-700",
				"hover:from-gray-700 hover:to-gray-800",
				"active:from-gray-800 active:to-gray-900",
				"text-white shadow-md hover:shadow-lg",
			].join(" "),

			destructive: [
				"bg-gradient-to-r from-red-500 via-rose-500 to-red-600",
				"hover:from-red-600 hover:via-rose-600 hover:to-red-700",
				"active:from-red-700 active:via-rose-700 active:to-red-800",
				"text-white shadow-md hover:shadow-lg",
				"ring-2 ring-transparent hover:ring-red-200",
			].join(" "),

			outline: [
				"border-2 border-slate-300 bg-transparent",
				"hover:border-slate-400 hover:bg-slate-50",
				"active:bg-slate-100 text-slate-700",
				"hover:text-slate-900 shadow-sm hover:shadow-md",
			].join(" "),

			ghost: [
				"bg-transparent hover:bg-slate-100",
				"active:bg-slate-200 text-slate-700",
				"hover:text-slate-900",
			].join(" "),

			link: [
				"bg-transparent text-indigo-600",
				"hover:text-indigo-800 hover:underline",
				"active:text-indigo-900 p-0 h-auto",
				"shadow-none hover:shadow-none",
			].join(" "),
		};

		const sizes = {
			xs: "px-2 py-1 text-xs min-h-[24px]",
			sm: "px-3 py-1.5 text-sm min-h-[32px]",
			md: "px-4 py-2 text-base min-h-[40px]",
			lg: "px-6 py-3 text-lg min-h-[48px]",
			xl: "px-8 py-4 text-xl min-h-[56px]",
		};

		const disabledStyles = [
			"disabled:opacity-50 disabled:cursor-not-allowed",
			"disabled:hover:shadow-sm disabled:active:transform-none",
			"disabled:hover:scale-100",
		].join(" ");

		const baseStyles = [
			"font-medium transition-all duration-300 ease-in-out",
			"inline-flex items-center justify-center gap-2",
			"focus:outline-none focus:ring-2 focus:ring-offset-2",
			"transform hover:scale-[1.02] active:scale-[0.98]",
			variant === "link" ? "" : "rounded-lg",
			rounded ? "rounded-full" : "",
		].join(" ");

		// Loading spinner component
		const LoadingSpinner = () => (
			<svg
				className="animate-spin h-4 w-4"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					className="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					strokeWidth="4"
				/>
				<path
					className="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
		);

		const renderIcon = () => {
			if (loading) return <LoadingSpinner />;
			if (!icon) return null;
			return <span className="flex items-center shrink-0">{icon}</span>;
		};

		const renderContent = () => {
			const content = text || children;

			if (!content && !icon && !loading) return null;

			if (iconPosition === "right") {
				return (
					<>
						{content && <span className="truncate">{content}</span>}
						{renderIcon()}
					</>
				);
			}

			return (
				<>
					{renderIcon()}
					{content && <span className="truncate">{content}</span>}
				</>
			);
		};

		return (
			<button
				ref={ref}
				className={cn(
					baseStyles,
					variants[variant],
					sizes[size],
					fullWidth && "w-full",
					disabledStyles,
					className
				)}
				disabled={disabled || loading}
				{...props}
			>
				{renderContent()}
			</button>
		);
	}
);

CustomButton.displayName = "CustomButton";
