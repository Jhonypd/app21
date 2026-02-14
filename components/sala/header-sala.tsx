import { DoorOpenIcon, UnplugIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { FaCrown } from 'react-icons/fa';

interface HeaderSalaProps {
  aoVoltar: () => void;
  titulo: string;
  subtitulo?: string;
  podeEncerrarSessao?: boolean;
  handleEncerrarSessao: () => void;
  loadingAcao: boolean;
}

const HeaderSala: React.FC<HeaderSalaProps> = ({
  aoVoltar,
  podeEncerrarSessao = false,
  handleEncerrarSessao,
  loadingAcao,
  titulo,
  subtitulo,
}) => {
  return (
    <div className="mb-3 flex items-center gap-3">
      <Button
        onClick={() => aoVoltar()}
        className="flex h-10 w-10 items-center justify-center rounded-sm bg-white/5 py-4 transition-all hover:bg-white/10 active:scale-95"
      >
        <DoorOpenIcon className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <h1 className="text-xl">{titulo}</h1>
        <p className="flex w-fit items-center gap-1 text-xs font-semibold whitespace-nowrap text-gray-400">
          <FaCrown className="text-amber-500" /> {subtitulo}
        </p>
      </div>

      {podeEncerrarSessao && (
        <Button
          onClick={handleEncerrarSessao}
          disabled={loadingAcao}
          className="flex items-center gap-2 rounded-xl bg-red-600/20 px-3 py-2 text-red-400 transition-all hover:bg-red-600/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          title="Encerrar sessão para todos"
        >
          <UnplugIcon className="h-4 w-4" />
          <span className="hidden text-xs md:inline">
            Encerrar Sessão
          </span>
        </Button>
      )}
    </div>
  );
};

export default HeaderSala;
