import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, BarChart3, Users, Target } from "lucide-react";

interface Participant {
	id: string;
	name: string;
	vote?: string;
	hasVoted: boolean;
}

interface ResultsSummaryProps {
	participants: Participant[];
	isAnimatedMode: boolean;
}

export const ResultsSummary = ({ participants, isAnimatedMode }: ResultsSummaryProps) => {
	const votedParticipants = participants.filter((p) => p.hasVoted && p.vote);

	if (votedParticipants.length === 0) {
		return null;
	}

	// Calculate vote distribution
	const voteDistribution = votedParticipants.reduce((acc, p) => {
		const vote = p.vote!;
		acc[vote] = (acc[vote] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	// Find winning vote(s)
	const maxVotes = Math.max(...Object.values(voteDistribution));
	const winners = Object.entries(voteDistribution)
		.filter(([_, count]) => count === maxVotes)
		.map(([vote, _]) => vote);

	// Sort votes for display
	const sortedVotes = Object.entries(voteDistribution).sort(([a], [b]) => {
		if (a === "?" && b !== "?") return 1;
		if (b === "?" && a !== "?") return -1;
		if (a === "?" && b === "?") return 0;
		return parseInt(a) - parseInt(b);
	});

	return (
		<Card
			className={`bg-gradient-card border-border shadow-card ${
				isAnimatedMode ? "animate-scale-in" : ""
			}`}
		>
			<CardHeader className="pb-4">
				<div className="flex items-center gap-2">
					<Trophy className={`w-5 h-5 text-primary ${isAnimatedMode ? "animate-bounce" : ""}`} />
					<CardTitle className="text-lg text-foreground">Resultado da Votação</CardTitle>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Winners */}
				<div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
					<p className="text-sm text-muted-foreground mb-2">Pontuação Vencedora:</p>
					<div className="flex items-center justify-center gap-2 flex-wrap">
						{winners.map((vote) => (
							<Badge
								key={vote}
								variant="secondary"
								className={`
                  text-2xl font-bold py-2 px-4 bg-gradient-primary text-primary-foreground
                  ${isAnimatedMode ? "animate-pulse shadow-glow" : ""}
                `}
							>
								{vote}
							</Badge>
						))}
					</div>
					{winners.length > 1 && (
						<p className="text-xs text-muted-foreground mt-2">Empate entre múltiplas pontuações</p>
					)}
				</div>

				{/* Vote Distribution */}
				<div>
					<div className="flex items-center gap-2 mb-3">
						<BarChart3 className="w-4 h-4 text-muted-foreground" />
						<h4 className="font-medium text-foreground">Distribuição dos Votos</h4>
					</div>

					<div className="space-y-2">
						{sortedVotes.map(([vote, count]) => {
							const percentage = (count / votedParticipants.length) * 100;
							const isWinner = winners.includes(vote);

							return (
								<div key={vote} className="flex items-center gap-3">
									<Badge
										variant="outline"
										className={`font-mono font-bold w-10 justify-center ${
											isWinner ? "border-primary bg-primary/10" : ""
										}`}
									>
										{vote}
									</Badge>

									<div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
										<div
											className={`
                        h-full rounded-full transition-all duration-1000 ease-out
                        ${
													isWinner
														? "bg-gradient-primary"
														: "bg-gradient-to-r from-secondary to-secondary/60"
												}
                        ${isAnimatedMode ? "animate-pulse" : ""}
                      `}
											style={{ width: `${percentage}%` }}
										/>
										<div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">
											{count} voto{count !== 1 ? "s" : ""} ({percentage.toFixed(0)}%)
										</div>
									</div>

									{isWinner && (
										<Trophy
											className={`w-4 h-4 text-primary ${isAnimatedMode ? "animate-bounce" : ""}`}
										/>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 mb-1">
							<Users className="w-4 h-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Participantes</span>
						</div>
						<p className="text-lg font-bold text-foreground">
							{votedParticipants.length}/{participants.length}
						</p>
					</div>

					<div className="text-center">
						<div className="flex items-center justify-center gap-1 mb-1">
							<Target className="w-4 h-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Consenso</span>
						</div>
						<p className="text-lg font-bold text-foreground">
							{winners.length === 1
								? "100%"
								: `${Math.round((maxVotes / votedParticipants.length) * 100)}%`}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
