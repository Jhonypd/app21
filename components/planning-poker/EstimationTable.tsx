import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  vote?: string | React.ReactElement;
  hasVoted: boolean;
}

interface EstimationTableProps {
  currentStory: string;
  participants: Participant[];
  areVotesRevealed: boolean;
  isAdmin: boolean;
  onRevealVotes: () => void;
  onResetVotes: () => void;
}

export const EstimationTable = ({
  currentStory,
  participants,
  areVotesRevealed,
  isAdmin,
  onRevealVotes,
  onResetVotes,
}: EstimationTableProps) => {
  const votedCount = participants.filter(
    (p) => p.hasVoted,
  ).length;
  const totalCount = participants.length;
  const allVoted =
    votedCount === totalCount && totalCount > 0;

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-foreground mb-2 text-xl">
              História Atual
            </CardTitle>
            <p className="text-muted-foreground bg-muted/50 rounded-md p-3">
              {currentStory ||
                'Nenhuma história selecionada'}
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant={
                  areVotesRevealed ? 'outline' : 'secondary'
                }
                onClick={onRevealVotes}
                disabled={!allVoted}
                className="flex items-center gap-2"
              >
                {areVotesRevealed ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {areVotesRevealed ? 'Ocultar' : 'Revelar'}
              </Button>

              <Button
                variant="outline"
                onClick={onResetVotes}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Votos: {votedCount} de {totalCount}
          </div>

          {allVoted && !areVotesRevealed && (
            <Badge
              variant="secondary"
              className="bg-gradient-secondary text-secondary-foreground animate-pulse"
            >
              Todos votaram!
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="bg-muted/30 border-border flex items-center justify-between rounded-lg border p-3"
            >
              <span className="text-foreground mr-2 truncate font-medium">
                {participant.name}
              </span>

              <div className="flex items-center gap-2">
                {participant.hasVoted ? (
                  <>
                    {areVotesRevealed ? (
                      <Badge
                        variant="outline"
                        className="font-mono font-bold"
                      >
                        {participant.vote}
                      </Badge>
                    ) : (
                      <div className="bg-gradient-primary border-primary/20 h-6 w-8 animate-pulse rounded border-2" />
                    )}
                  </>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-muted-foreground"
                  >
                    Aguardando...
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
