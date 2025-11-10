import {
  MdCheckCircle,
  MdEmail,
  MdWarning,
} from 'react-icons/md';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';

interface ConfirmacaoEmailContaProps {
  setContaCriada: (value: boolean) => void;
}

const CHECKLIST_ITEMS = [
  'Abra seu aplicativo de e-mail favorito',
  'Procure por um e-mail do Planning Poker Ágil',
  'Clique no botão de confirmação dentro do e-mail',
  'Pronto! Faça login e comece a usar',
];

const ConfirmacaoEmailConta = ({
  setContaCriada,
}: ConfirmacaoEmailContaProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-lg duration-500">
      {/* Header */}
      <div className="mb-8 space-y-4 text-center">
        <div className="bg-primary/10 shadow-primary/20 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg">
          <MdEmail className="text-primary h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-foreground text-3xl font-bold">
            Verifique seu e-mail
          </h2>
          <div className="bg-primary mx-auto h-1 w-16 rounded-full" />
        </div>

        <p className="text-muted-foreground text-lg leading-relaxed">
          Estamos quase lá! Enviamos um link mágico para o
          endereço que você cadastrou. Basta clicar no link
          para ativar sua conta.
        </p>
      </div>

      {/* Card Principal */}
      <Card className="border-primary/20 shadow-primary/5 border-2 shadow-xl">
        <CardHeader className="from-primary/10 to-primary/5 bg-gradient-to-r">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full">
              <MdCheckCircle className="text-primary h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Aguardando confirmação
              </CardTitle>
              <CardDescription className="text-base">
                Verifique sua caixa de entrada
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Checklist */}
          <div className="bg-muted/50 space-y-4 rounded-lg p-4">
            <p className="text-foreground font-medium">
              O que fazer agora:
            </p>
            <div className="space-y-3">
              {CHECKLIST_ITEMS.map((texto, index) => {
                const isLastItem =
                  index === CHECKLIST_ITEMS.length - 1;

                return (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                        isLastItem
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-primary/10'
                      }`}
                    >
                      <span
                        className={`text-sm font-bold ${
                          isLastItem
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-primary'
                        }`}
                      >
                        {isLastItem ? '✓' : index + 1}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {texto}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alert de Spam */}
          <div className="flex items-start gap-3 rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <MdWarning className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Não encontrou?</strong> Verifique sua
              pasta de{' '}
              <span className="font-semibold">spam</span> ou{' '}
              <span className="font-semibold">
                lixo eletrônico
              </span>
              . Às vezes o e-mail pode parar por lá!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 space-y-4 text-center">
        <Button
          variant="link"
          className="text-primary hover:text-primary/80 text-lg font-medium transition-colors"
          onClick={() => setContaCriada(false)}
        >
          ← Voltar para o login
        </Button>

        <p className="text-muted-foreground text-sm">
          Problemas com o e-mail?{' '}
          <button
            onClick={() => setContaCriada(false)}
            className="text-primary font-medium hover:underline"
          >
            Tente novamente
          </button>
        </p>
      </div>
    </div>
  );
};

export default ConfirmacaoEmailConta;
