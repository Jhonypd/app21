import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { CardParticipante } from './card-participante';
import CardVotacaoSimples from './card-participante-simples';

interface Participante {
  id: string;
  nome: string;
  inativo: boolean;
  role: number;
  online?: boolean;
}

interface ParticipanteComVoto
  extends Pick<Participante, 'id' | 'nome'> {
  voto: string | null;
  votou: boolean;
  votoId?: string;
}

interface ListaParticipantesProps {
  participantesOnline: Participante[];
  participantesComVotos: ParticipanteComVoto[];
  meuRole: number;
  votosRevelados: boolean;
  handleAnularVoto: (
    votoId: string,
    nomeParticipante: string,
  ) => void;
}

const ListaParticipantes: React.FC<
  ListaParticipantesProps
> = ({
  participantesOnline,
  participantesComVotos,
  meuRole,
  votosRevelados,
  handleAnularVoto,
}) => {
  return (
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full rounded-2xl bg-slate-600/10 p-1.5"
    >
      <CarouselContent className="-ml-1">
        {participantesOnline.map((participante) => {
          const votoParticipante =
            participantesComVotos.find(
              (p) => p.id === participante.id,
            );

          // Roles 2 e 3: Card simples com flip
          if (meuRole >= 2) {
            return (
              <CarouselItem
                key={participante.id}
                className="basis-1/2 pl-2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <CardVotacaoSimples
                  participante={participante}
                  voto={votoParticipante?.voto || null}
                  votou={votoParticipante?.votou || false}
                  votosRevelados={votosRevelados}
                />
              </CarouselItem>
            );
          }

          // Roles 0 e 1: Card completo (Dono/Admin)
          return (
            <CarouselItem
              key={participante.id}
              className="basis-1/2 pl-2 md:basis-1/2 lg:basis-1/3"
            >
              <div className="space-y-2">
                <CardParticipante
                  layout="vertical"
                  participante={{
                    id: participante.id,
                    nome: participante.nome,
                    role: participante.role,
                  }}
                  jaExistia={true}
                  meuRole={meuRole}
                  mostrarAcoes={false}
                  voto={votoParticipante?.voto || null}
                  votosRevelados={votosRevelados}
                  votoId={votoParticipante?.votoId}
                  onAnularVoto={handleAnularVoto}
                />
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="ml-3" />
      <CarouselNext className="mr-3" />
    </Carousel>
  );
};

export default ListaParticipantes;
