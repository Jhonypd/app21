// Tipos canônicos re-exportados de services/types
// LoginRequest = LoginPayload, CadastroRequest = CriarContaPayload
export {
  type LoginPayload as LoginRequest,
  type CriarContaPayload as CadastroRequest,
} from '@/services/types';
