import { RefreshCcwIcon } from 'lucide-react';
import { GiTerror } from 'react-icons/gi';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
interface ErrosProps {
  titleError?: string;
  descriptionErro: string;
  refreshFunction: () => Promise<void>;
}
export function ButtonTentarNovamente({
  titleError,
  descriptionErro,
  refreshFunction,
}: ErrosProps) {
  return (
    <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="text-primary h-32 w-32 [&_svg:not([class*='size-'])]:size-20"
        >
          <GiTerror size={50} />
        </EmptyMedia>
        <EmptyTitle>{titleError}</EmptyTitle>
      </EmptyHeader>
      <EmptyContent className="bg-secondary rounded-sm p-6">
        <EmptyDescription className="text-destructive text-lg font-medium">
          {descriptionErro}
        </EmptyDescription>
        <Button
          onClick={refreshFunction}
          variant="outline"
          size={'sm'}
        >
          Tentar novamente
        </Button>
      </EmptyContent>
    </Empty>
  );
}
