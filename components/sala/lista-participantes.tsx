import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { CardParticipante } from './card-participante';
import { Button } from '../ui/button';
import { BanIcon } from 'lucide-react';
interface Participante {
  id: string;
  nome: string;
  inativo: boolean;
  role: number; // 0=Dono, 1=Admin, 2=Membro, 3=Visitante
  online?: boolean;
  // mudei a role para obrigatória porque sempre vem da API
}
// id: participante.id,
//         nome: participante.nome,
//         voto: voto ? voto.valor.toString() : null,
//         votou: !!voto,
//         votoId: voto?.id,

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
  eProprietario: boolean;
  usuarioAtualId: string;
  loadingAcao: boolean;
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
  eProprietario,
  handleAnularVoto,
  usuarioAtualId,
  loadingAcao,
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

          return (
            <CarouselItem
              key={participante.id}
              className="basis-1/2 md:basis-1/2 lg:basis-1/3"
            >
              <div className="flex items-center">
                <CardParticipante
                  layout="vertical"
                  participante={{
                    id: participante.id,
                    nome: participante.nome,
                    role: participante.role,
                  }}
                  jaExistia={true}
                  meuRole={meuRole}
                  mostrarAcoes={false} // Desabilitar ações na sala de planning
                  voto={
                    votoParticipante?.voto
                      ? votoParticipante.voto
                      : null
                  } // depois tem que buscar o voto real
                  votosRevelados={votosRevelados}
                />

                {/* Status do voto */}
                <div className="flex items-center gap-2">
                  {/* Botão anular voto (apenas proprietário) */}
                  {eProprietario &&
                    votoParticipante?.votou &&
                    votoParticipante.votoId &&
                    participante.id !== usuarioAtualId && (
                      <Button
                        onClick={() =>
                          handleAnularVoto(
                            votoParticipante.votoId!,
                            participante.nome,
                          )
                        }
                        disabled={loadingAcao}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-all hover:bg-red-500/30 disabled:cursor-not-allowed"
                        title="Anular voto"
                      >
                        <BanIcon className="h-4 w-4" />
                      </Button>
                    )}
                </div>
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
