import { EmailInput } from '@/components/inputs/input-email';

const ConfirmacaoEmail = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">
          Verifique seu email
        </h1>
        <p>
          Enviamos um link de confirmação para seu email.
          Clique no link para ativar sua conta.
        </p>

        <div className="mt-6 flex justify-center">
          <EmailInput
            onChange={() => {}}
            value=""
            label="Email"
            placeholder="seu@email.com"
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmacaoEmail;
