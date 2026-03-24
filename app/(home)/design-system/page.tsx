import { Metadata } from 'next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ButtonCustom } from '@/components/button-custom';

const solidPalette = [
   {
      name: 'Background',
      token: '--background',
      description: 'Plano de fundo principal da aplicação.',
   },
   {
      name: 'Foreground',
      token: '--foreground',
      description: 'Texto padrão com alto contraste.',
   },
   {
      name: 'Card',
      token: '--card',
      description: 'Superfícies elevadas e cartões.',
   },
   {
      name: 'Border',
      token: '--border',
      description: 'Divisores, contornos e linhas sutis.',
   },
   {
      name: 'Accent',
      token: '--accent',
      description: 'Destaques e botões secundários.',
   },
   {
      name: 'Primary',
      token: '--primary',
      description: 'CTAs e links principais.',
   },
];

const gradientPalette = [
   {
      name: 'Primário',
      className: 'bg-gradient-to-br from-purple-600 to-pink-600',
      description: 'Hero, CTAs e botões principais.',
   },
   {
      name: 'Secundário',
      className: 'bg-gradient-to-br from-purple-500 to-pink-500',
      description: 'Estados alternativos e cards especiais.',
   },
   {
      name: 'Success',
      className: 'bg-gradient-to-br from-green-500 to-emerald-500',
      description: 'Confirmações e status positivos.',
   },
   {
      name: 'Danger',
      className: 'bg-gradient-to-br from-red-500 to-rose-500',
      description: 'Ações destrutivas e alertas.',
   },
];

const textSamples = [
   {
      label: 'Título / Display',
      className: 'text-2xl font-semibold text-card-foreground',
      sample: 'Heading — PlanningHub',
      description: 'Usado em manchetes e títulos de seção.',
   },
   {
      label: 'Corpo',
      className: 'text-base text-card-foreground/90',
      sample: 'Texto padrão para descrições e parágrafos.',
      description: 'Conteúdo principal em cards e páginas.',
   },
   {
      label: 'Muted',
      className: 'text-sm text-muted-foreground',
      sample: 'Labels, dicas de formulário e metadados.',
      description: 'Complementa informações secundárias.',
   },
   {
      label: 'Acento',
      className: 'text-sm font-semibold text-[var(--color-chart-3)]',
      sample: 'Status positivo ou link destacado.',
      description: 'Feedback visual para sucesso ou links.',
   },
];

const buttonShowcase = [
   { label: 'Primário', props: { variant: 'hero' as const } },
   { label: 'Secundário', props: { variant: 'secondary' as const } },
   { label: 'Ghost', props: { variant: 'ghost' as const } },
   { label: 'Destrutivo', props: { variant: 'destructive' as const } },
   {
      label: 'Primário (disabled)',
      props: { variant: 'hero' as const, disabled: true },
   },
   {
      label: 'Secundário (disabled)',
      props: { variant: 'secondary' as const, disabled: true },
   },
];

export const metadata: Metadata = {
   title: 'Design System',
};

const ColorSwatch = ({
   name,
   token,
   description,
}: {
   name: string;
   token: string;
   description: string;
}) => (
   <div className="border-border/60 bg-card/70 rounded-2xl border p-4">
      <div
         className="h-16 w-full rounded-xl border border-white/5"
         style={{ background: `var(${token})` }}
      ></div>
      <div className="mt-3 space-y-1">
         <p className="text-card-foreground text-sm font-semibold">{name}</p>
         <p className="text-muted-foreground text-xs">{description}</p>
         <p className="text-muted-foreground/70 text-xs">{token}</p>
      </div>
   </div>
);

const GradientSwatch = ({
   name,
   className,
   description,
}: {
   name: string;
   className: string;
   description: string;
}) => (
   <div className="border-border/60 bg-card/70 rounded-2xl border p-4">
      <div
         className={`h-16 w-full rounded-xl border border-white/5 ${className}`}
      ></div>
      <div className="mt-3 space-y-1">
         <p className="text-card-foreground text-sm font-semibold">{name}</p>
         <p className="text-muted-foreground text-xs">{description}</p>
      </div>
   </div>
);

const TextSample = ({
   label,
   className,
   sample,
   description,
}: {
   label: string;
   className: string;
   sample: string;
   description: string;
}) => (
   <div className="border-border/60 bg-card/70 rounded-2xl border p-4">
      <p className="text-muted-foreground text-xs font-semibold uppercase">
         {label}
      </p>
      <p className={`mt-2 ${className}`}>{sample}</p>
      <p className="text-muted-foreground mt-3 text-xs">{description}</p>
   </div>
);

const DesignSystemPage = () => {
   return (
      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
         <header className="space-y-2">
            <p className="text-muted-foreground text-sm">
               Guia visual de referência do PlanningHub.
            </p>
            <h1 className="text-card-foreground text-3xl font-semibold">
               Design System
            </h1>
         </header>

         <Card className="border-border/50 bg-card/80">
            <CardHeader>
               <CardTitle className="text-xl">Cores sólidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {solidPalette.map((color) => (
                     <ColorSwatch
                        key={color.name}
                        {...color}
                     />
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="border-border/50 bg-card/80">
            <CardHeader>
               <CardTitle className="text-xl">Gradientes</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {gradientPalette.map((gradient) => (
                     <GradientSwatch
                        key={gradient.name}
                        {...gradient}
                     />
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="border-border/50 bg-card/80">
            <CardHeader>
               <CardTitle className="text-xl">Botões</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
               {buttonShowcase.map(({ label, props }) => (
                  <div
                     key={label}
                     className="border-border/40 bg-card/70 rounded-2xl border p-4"
                  >
                     <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase">
                        {label}
                     </p>
                     <ButtonCustom
                        fullWidth
                        {...props}
                     >
                        {label}
                     </ButtonCustom>
                  </div>
               ))}
            </CardContent>
         </Card>

         <Card className="border-border/50 bg-card/80">
            <CardHeader>
               <CardTitle className="text-xl">Texto e hierarquia</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
               {textSamples.map((sample) => (
                  <TextSample
                     key={sample.label}
                     {...sample}
                  />
               ))}
            </CardContent>
         </Card>

         <Card className="border-border/50 bg-card/80">
            <CardHeader>
               <CardTitle className="text-xl">
                  Componentes em contexto
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4 md:grid-cols-2">
                  <div className="border-border/50 bg-card/80 rounded-3xl border p-6">
                     <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                           <p className="text-muted-foreground text-sm">
                              Card padrão
                           </p>
                           <h3 className="text-card-foreground text-lg font-semibold">
                              Sessão ativa
                           </h3>
                        </div>
                        <Badge
                           className="w-fit"
                           variant="success"
                        >
                           Online
                        </Badge>
                     </div>
                     <p className="text-muted-foreground mt-4 text-sm">
                        Exemplo de card com glass effect, texto secundário e
                        badges seguindo o design system.
                     </p>
                     <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <ButtonCustom
                           className="w-full sm:w-auto"
                           variant="hero"
                        >
                           Primário
                        </ButtonCustom>
                        <ButtonCustom
                           className="w-full sm:w-auto"
                           variant="secondary"
                        >
                           Secundário
                        </ButtonCustom>
                        <ButtonCustom
                           className="w-full sm:w-auto"
                           variant="destructive"
                           size="sm"
                        >
                           Remover
                        </ButtonCustom>
                     </div>
                  </div>

                  <div className="border-border/50 bg-card/80 rounded-3xl border p-6">
                     <p className="text-muted-foreground text-sm">
                        Estados e badges
                     </p>
                     <div className="mt-4 flex flex-wrap gap-3">
                        <Badge variant="success">Sucesso</Badge>
                        <Badge variant="destructive">Erro</Badge>
                        <Badge variant="warning">Atenção</Badge>
                        <Badge variant="info">Informação</Badge>
                        <Badge variant="neutral">Neutro</Badge>
                     </div>
                     <div className="border-border/40 bg-card/60 text-muted-foreground mt-6 space-y-3 rounded-2xl border p-4 text-sm">
                        <p>
                           <span className="text-card-foreground font-semibold">
                              Texto primário
                           </span>{' '}
                           convive com descrições{' '}
                           <span className="text-muted-foreground">
                              (texto secundário)
                           </span>{' '}
                           e estados{' '}
                           <span className="text-[var(--color-chart-3)]">
                              (acentos)
                           </span>{' '}
                           para reforçar hierarquia visual.
                        </p>
                        <p className="text-muted-foreground/80 text-xs">
                           Desabilitado / subtle
                        </p>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   );
};

export default DesignSystemPage;
