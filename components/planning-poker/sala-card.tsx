import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { FaLink } from 'react-icons/fa';
import {
  FaCopy,
  FaCalendar,
  FaHouseLock,
  FaCrown,
} from 'react-icons/fa6';
import { GiTeamIdea } from 'react-icons/gi';
import { GrUserAdmin } from 'react-icons/gr';
import { toast } from 'sonner';

// components/sala-card.tsx - Interface simplificada
interface Sala {
  id: string;
  codigo: number;
  titulo: string;
  criado_por: string;
  inativo: boolean;
  protegida: boolean;
  data_criacao: string;
  data_alteracao: string;
  totalParticipantes: number;
  totalVotos: number;
  nomeDono: string;
  currentUserId?: string;
}

interface SalaCardProps {
  sala: Sala;
  onEntrarSala?: (salaId: string) => void;
  onCopiarLink?: (salaId: string) => void;
  currentUserId?: string;
}

export function SalaCard({
  sala,
  onEntrarSala,
  onCopiarLink,
  currentUserId,
}: SalaCardProps) {
  const isDono = sala.criado_por === currentUserId;

  // Agora data_criacao já é string, só precisa converter para Date
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(
        sala.codigo.toString(),
      );
      toast.success('Código copiado!', {
        description: `Código ${sala.codigo} copiado para a área de transferência.`,
      });
    } catch (error) {
      toast.error('Erro ao copiar código');
    }
  };

  const copiarLink = () => {
    if (onCopiarLink) {
      onCopiarLink(sala.id);
    }
  };

  return (
    <Card className="group border-l-4 border-l-blue-400 bg-gradient-to-br from-[#0f111a] to-[#1a1d2b] shadow-black/30 transition-all duration-300 hover:border-l-cyan-400 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex w-full flex-wrap items-center gap-2">
              <CardTitle className="line-clamp-2 w-full text-lg font-semibold text-white">
                {sala.titulo}
              </CardTitle>
              {isDono && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 border-yellow-300 bg-yellow-500 text-black"
                >
                  <FaCrown className="h-3 w-3" />
                  {sala.nomeDono}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-300">
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-cyan-400 text-cyan-300"
              >
                <FaCalendar className="h-4 w-4" />
                <span>
                  {formatarData(sala.data_criacao)}
                </span>
              </Badge>

              {sala.protegida && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-cyan-400 text-cyan-300"
                >
                  <FaHouseLock className="h-3 w-3" />
                  Protegida
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="default"
              className="cursor-pointer text-black transition-colors hover:bg-cyan-500"
              onClick={copiarCodigo}
            >
              <FaCopy className="mr-1 h-3 w-3 uppercase" />
              #Sala{sala.codigo}
            </Badge>

            {sala.inativo && (
              <Badge
                variant="destructive"
                className="bg-red-600 text-xs text-white uppercase"
              >
                Inativa
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <Button
              size={'sm'}
              className="flex items-center gap-1 bg-blue-600 text-white uppercase transition-all hover:bg-blue-500"
            >
              <GiTeamIdea className="h-4 w-4" />
              {sala.totalParticipantes} participante
              {sala.totalParticipantes !== 1 ? 's' : ''}
            </Button>

            {/* Mostrar votos se houver */}
            {sala.totalVotos > 0 && (
              <Badge className="bg-green-600 text-white">
                {sala.totalVotos} voto
                {sala.totalVotos !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copiarLink}
              className="flex items-center gap-1 border-cyan-400 text-cyan-300 transition-colors hover:bg-cyan-500 hover:text-black"
            >
              <FaLink className="h-4 w-4" />
              Link
            </Button>

            <Button
              size="sm"
              onClick={() => onEntrarSala?.(sala.id)}
              disabled={sala.inativo}
              className="flex items-center gap-1 bg-blue-600 text-white transition-all hover:bg-blue-500"
            >
              <GrUserAdmin className="h-4 w-4" />
              Entrar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
