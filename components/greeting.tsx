interface GreetingProps {
  nome: string;
}

export function Greeting({ nome }: GreetingProps) {
  const calculaPeriodoDia = () => {
    const horaAtual = new Date().getHours();
    if (horaAtual < 12) return 'Bom dia';
    if (horaAtual < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const sorteMensagensDev = [
    'Dia de fazer delete sem where!',
    'Hora de codar com café e muito GPT!',
    'Vamos otimizar esse código ruim!',
    'Sem bugs não tem graça!',
    'Hoje é dia de deploy sem rollback!',
    'Que tal um pouco de refatoração?',
  ];
  const mensagemSorte =
    sorteMensagensDev[
      Math.floor(Math.random() * sorteMensagensDev.length)
    ];

  return (
    <div className="mb-8">
      <h2 className="mb-1 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl text-transparent">
        {calculaPeriodoDia()}, {nome}
      </h2>
      <p className="text-sm text-gray-500">
        {mensagemSorte}
      </p>
    </div>
  );
}
