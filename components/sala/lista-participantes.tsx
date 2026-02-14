import React from 'react';
import { CardParticipante } from './card-participante';
import CardVotacaoSimples from './card-participante-simples';
import { ModalBase } from './modal-base';
import { Button } from '../ui/button';
import { UsersIcon } from 'lucide-react';
import { CustomButton } from '../ui/custom-button';

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
  const [open, setOpen] = React.useState(false);

  const mostrarParticipantes = (mostrar: boolean) => {
    setOpen(mostrar);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => mostrarParticipantes(true)}
        className="relative"
      >
        <UsersIcon />
        <p>Participantes</p>
        <span className="bg-accent absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full text-[10px]">
          {participantesOnline.length}
        </span>
      </Button>
      <ModalBase
        onOpenChange={mostrarParticipantes}
        open={open}
        titulo={
          <div className="flex w-full items-center gap-2 truncate text-left text-nowrap text-ellipsis">
            <UsersIcon className="h-5 w-5" /> Participantes
            da Sala
          </div>
        }
        botoesAcoes={
          <CustomButton
            variant={'outline'}
            className="uppercase"
            onClick={() => mostrarParticipantes(false)}
          >
            Fechar
          </CustomButton>
        }
      >
        <div className="flex h-full w-full flex-col px-3">
          <div className="py-2">
            <h2 className="flex items-center gap-2 md:text-sm">
              Online {participantesOnline.length} /{' '}
              {participantesComVotos.length}
            </h2>
          </div>
          <div className="mx-auto grid max-h-96 min-h-72 w-full grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3 lg:grid-cols-4">
            {participantesOnline.map((participante) => {
              const votoParticipante =
                participantesComVotos.find(
                  (p) => p.id === participante.id,
                );

              // Roles 2 e 3: Card simples com flip
              if (meuRole >= 2) {
                return (
                  <CardVotacaoSimples
                    key={participante.id}
                    participante={participante}
                    voto={votoParticipante?.voto || null}
                    votou={votoParticipante?.votou || false}
                    votosRevelados={votosRevelados}
                  />
                );
              }

              // Roles 0 e 1: Card completo (Dono/Admin)
              return (
                <div
                  className="space-y-2"
                  key={participante.id}
                >
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
              );
            })}
          </div>
        </div>
      </ModalBase>
    </>
  );
};

export default ListaParticipantes;
