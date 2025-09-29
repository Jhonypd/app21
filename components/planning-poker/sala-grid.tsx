// components/salas-grid.tsx
import { Input } from '@/components/ui/input';
import { Search, Grid3X3, List, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useState } from 'react';
import { SalaCard } from '@/components/planning-poker/sala-card';

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
}

interface SalasGridProps {
  salas: Sala[];
  currentUserId?: string;
  onEntrarSala?: (salaId: string) => void;
  onCopiarLink?: (salaId: string) => void;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'todas' | 'ativas' | 'minhas';

export function SalasGrid({
  salas,
  currentUserId,
  onEntrarSala,
  onCopiarLink,
}: SalasGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] =
    useState<ViewMode>('grid');
  const [filter, setFilter] =
    useState<FilterType>('ativas');

  const filteredSalas = salas.filter((sala) => {
    // Filtro por busca
    const matchesSearch =
      sala.titulo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      sala.codigo.toString().includes(searchTerm);

    // Filtro por tipo
    const matchesFilter =
      filter === 'todas'
        ? true
        : filter === 'ativas'
          ? !sala.inativo
          : filter === 'minhas'
            ? sala.criado_por === currentUserId
            : true;

    return matchesSearch && matchesFilter;
  });

  const salasAtivas = salas.filter((sala) => !sala.inativo);
  const minhasSalas = salas.filter(
    (sala) => sala.criado_por === currentUserId,
  );

  return (
    <div className="container space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="w-full flex-1 sm:max-w-md">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Buscar por título ou código..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="border border-gray-700 bg-[#1a1d2b] pl-10 text-white placeholder-gray-400 transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Tabs
            value={filter}
            onValueChange={(value) =>
              setFilter(value as FilterType)
            }
          >
            <TabsList className="rounded-md border border-gray-700 bg-[#0f111a]">
              <TabsTrigger
                value="ativas"
                className="text-white hover:text-cyan-400"
              >
                Ativas ({salasAtivas.length})
              </TabsTrigger>
              <TabsTrigger
                value="minhas"
                className="text-white hover:text-cyan-400"
              >
                Minhas ({minhasSalas.length})
              </TabsTrigger>
              <TabsTrigger
                value="todas"
                className="text-white hover:text-cyan-400"
              >
                Todas ({salas.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex rounded-lg border">
            <Button
              variant={
                viewMode === 'grid' ? 'default' : 'ghost'
              }
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-9 bg-[#0f111a] px-3 text-white transition-colors hover:bg-cyan-500 hover:text-black"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={
                viewMode === 'list' ? 'default' : 'ghost'
              }
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-9 bg-[#0f111a] px-3 text-white transition-colors hover:bg-cyan-500 hover:text-black"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid/List de salas */}
      {filteredSalas.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <Users className="mx-auto h-16 w-16 text-cyan-400" />
          <h3 className="mb-2 text-lg font-semibold text-white">
            Nenhuma sala encontrada
          </h3>
          <p className="text-gray-300">
            {searchTerm
              ? 'Tente ajustar os termos da busca.'
              : 'Crie a primeira sala para começar!'}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          }
        >
          {filteredSalas.map((sala) => (
            <SalaCard
              key={sala.id}
              sala={{ ...sala, currentUserId }}
              currentUserId={currentUserId}
              onEntrarSala={onEntrarSala}
              onCopiarLink={onCopiarLink}
            />
          ))}
        </div>
      )}

      {/* Estatísticas */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
        <span>Total: {salas.length} salas</span>
        <span>•</span>
        <span>Ativas: {salasAtivas.length}</span>
        {currentUserId && (
          <>
            <span>•</span>
            <span>Minhas: {minhasSalas.length}</span>
          </>
        )}
      </div>
    </div>
  );
}
