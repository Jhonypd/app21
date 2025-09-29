import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  BarChart3,
  Users,
  Target,
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  vote?: string | React.ReactElement;
  hasVoted: boolean;
}

interface ResultsSummaryProps {
  participants: Participant[];
  isAnimatedMode: boolean;
}

export const ResultsSummary = ({
  participants,
  isAnimatedMode,
}: ResultsSummaryProps) => {
  const votedParticipants = participants.filter(
    (p) => p.hasVoted && p.vote,
  );

  if (votedParticipants.length === 0) {
    return null;
  }

  // Calculate vote distribution
  const voteDistribution = votedParticipants.reduce(
    (acc, p) => {
      const vote = p.vote!;
      acc[vote.toString()] =
        (acc[vote.toString()] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Find winning vote(s)
  const maxVotes = Math.max(
    ...Object.values(voteDistribution),
  );
  const winners = Object.entries(voteDistribution)
    .filter(([_, count]) => count === maxVotes)
    .map(([vote, _]) => vote);

  // Sort votes for display
  const sortedVotes = Object.entries(voteDistribution).sort(
    ([a], [b]) => {
      if (a === '?' && b !== '?') return 1;
      if (b === '?' && a !== '?') return -1;
      if (a === '?' && b === '?') return 0;
      return parseInt(a) - parseInt(b);
    },
  );

  return (
    <Card
      className={`bg-gradient-card border-border shadow-card ${
        isAnimatedMode ? 'animate-scale-in' : ''
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Trophy
            className={`text-primary h-5 w-5 ${isAnimatedMode ? 'animate-bounce' : ''}`}
          />
          <CardTitle className="text-foreground text-lg">
            Resultado da Votação
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Winners */}
        <div className="bg-primary/5 border-primary/20 rounded-lg border p-4 text-center">
          <p className="text-muted-foreground mb-2 text-sm">
            Pontuação Vencedora:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {winners.map((vote) => (
              <Badge
                key={vote}
                variant="secondary"
                className={`bg-gradient-primary text-primary-foreground px-4 py-2 text-2xl font-bold ${isAnimatedMode ? 'shadow-glow animate-pulse' : ''} `}
              >
                {vote}
              </Badge>
            ))}
          </div>
          {winners.length > 1 && (
            <p className="text-muted-foreground mt-2 text-xs">
              Empate entre múltiplas pontuações
            </p>
          )}
        </div>

        {/* Vote Distribution */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="text-muted-foreground h-4 w-4" />
            <h4 className="text-foreground font-medium">
              Distribuição dos Votos
            </h4>
          </div>

          <div className="space-y-2">
            {sortedVotes.map(([vote, count]) => {
              const percentage =
                (count / votedParticipants.length) * 100;
              const isWinner = winners.includes(vote);

              return (
                <div
                  key={vote}
                  className="flex items-center gap-3"
                >
                  <Badge
                    variant="outline"
                    className={`w-10 justify-center font-mono font-bold ${
                      isWinner
                        ? 'border-primary bg-primary/10'
                        : ''
                    }`}
                  >
                    {vote}
                  </Badge>

                  <div className="bg-muted relative h-6 flex-1 overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        isWinner
                          ? 'bg-gradient-primary'
                          : 'from-secondary to-secondary/60 bg-gradient-to-r'
                      } ${isAnimatedMode ? 'animate-pulse' : ''} `}
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="text-foreground absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {count} voto{count !== 1 ? 's' : ''} (
                      {percentage.toFixed(0)}%)
                    </div>
                  </div>

                  {isWinner && (
                    <Trophy
                      className={`text-primary h-4 w-4 ${isAnimatedMode ? 'animate-bounce' : ''}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="border-border grid grid-cols-2 gap-4 border-t pt-2">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Users className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground text-sm">
                Participantes
              </span>
            </div>
            <p className="text-foreground text-lg font-bold">
              {votedParticipants.length}/
              {participants.length}
            </p>
          </div>

          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Target className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground text-sm">
                Consenso
              </span>
            </div>
            <p className="text-foreground text-lg font-bold">
              {winners.length === 1
                ? '100%'
                : `${Math.round((maxVotes / votedParticipants.length) * 100)}%`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
