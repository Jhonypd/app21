import { PlanningPokerCard } from "./PlanningPokerCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VotingDeckProps {
	selectedValue?: string;
	onVoteSelect: (value: string) => void;
	isDisabled?: boolean;
	isAnimatedMode?: boolean;
}

// Fibonacci sequence commonly used in Planning Poker
const FIBONACCI_VALUES = ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?"];

export const VotingDeck = ({
	selectedValue,
	onVoteSelect,
	isDisabled = false,
	isAnimatedMode = false,
}: VotingDeckProps) => {
	return (
		<Card className="bg-gradient-card border-border shadow-card">
			<CardHeader className="pb-4">
				<CardTitle className="text-lg text-foreground">Escolha sua estimativa</CardTitle>
				<p className="text-sm text-muted-foreground">
					Clique em um card para votar. Use "?" `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` se não
					souber estimar.
				</p>
			</CardHeader>

			<CardContent>
				<div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-3 justify-items-center">
					{FIBONACCI_VALUES.map((value) => (
						<PlanningPokerCard
							key={value}
							value={value}
							isSelected={selectedValue === value}
							isAnimatedMode={isAnimatedMode}
							onClick={() => !isDisabled && onVoteSelect(value)}
							className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
						/>
					))}
				</div>

				{selectedValue && (
					<div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
						<p className="text-sm text-muted-foreground mb-1">Seu voto:</p>
						<p className="text-2xl font-bold text-primary">{selectedValue}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
