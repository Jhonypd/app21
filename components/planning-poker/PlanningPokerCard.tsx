import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlanningPokerCardProps {
	value: string;
	isSelected?: boolean;
	isRevealed?: boolean;
	isAnimatedMode?: boolean;
	onClick?: () => void;
	className?: string;
}

export const PlanningPokerCard = ({
	value,
	isSelected = false,
	isRevealed = false,
	isAnimatedMode = false,
	onClick,
	className,
}: PlanningPokerCardProps) => {
	return (
		<Card
			className={cn(
				"relative w-20 h-28 sm:w-24 sm:h-32 cursor-pointer transition-all duration-300",
				"bg-gradient-card border-2 shadow-soft hover:shadow-card",
				"flex items-center justify-center group",
				isSelected && "border-primary bg-gradient-primary shadow-glow scale-105",
				!isSelected && "border-border hover:border-primary/50 hover:scale-105",
				isRevealed && "animate-pulse",
				isAnimatedMode && "hover:animate-bounce hover:shadow-glow",
				isAnimatedMode && isSelected && "animate-scale-in shadow-glow",
				className
			)}
			onClick={onClick}
		>
			<div
				className={cn(
					"text-2xl sm:text-3xl font-bold transition-colors duration-300",
					isSelected ? "text-primary-foreground" : "text-foreground",
					"group-hover:scale-110 transition-transform duration-300",
					isAnimatedMode && "group-hover:animate-pulse"
				)}
			>
				{value}
			</div>

			{/* Subtle background pattern */}
			<div
				className={cn(
					"absolute inset-0 opacity-5 bg-gradient-to-br from-primary to-accent rounded-lg",
					isSelected && "opacity-20"
				)}
			/>

			{/* Selection indicator */}
			{isSelected && (
				<div
					className={cn(
						"absolute -top-2 -right-2 w-4 h-4 bg-secondary rounded-full border-2 border-background",
						isAnimatedMode ? "animate-bounce" : "animate-pulse"
					)}
				/>
			)}
		</Card>
	);
};
