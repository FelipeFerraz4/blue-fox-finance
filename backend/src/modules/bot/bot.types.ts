import { CanalBot } from '@prisma/client';

/** Mensagem recebida de qualquer canal, já normalizada pelo adaptador. */
export interface BotIncoming {
  canal: CanalBot;
  externalUserId: string;
  chatId: string;
  username?: string;
  isPrivate: boolean;
  text?: string;
  callbackData?: string;
}

/** Botão: `data` volta como callback; `url` abre um link. */
export interface BotButton {
  label: string;
  data?: string;
  url?: string;
}

/** Resposta canal-agnóstica; `text` usa o subconjunto HTML do Telegram (<b>, <i>, <code>). */
export interface BotReply {
  text: string;
  buttons?: BotButton[][];
}

/** Rascunho do lançamento montado pelo assistente. */
export interface ExpenseDraft {
  valor?: number;
  nome?: string;
  loja?: string;
  lojaId?: string | null;
  categoria?: string;
  meioPagamentoId?: string;
  meioNome?: string;
  credito?: boolean;
  parcelas: number;
  data: string; // YYYY-MM-DD
  comprador?: string;
  compradorId?: string | null;
}

export type ExpenseStep = 'valor' | 'nome' | 'loja' | 'meio' | 'categoria' | 'comprador' | 'parcelas' | 'data' | 'confirmar';

/** Estado persistido da conversa em andamento. `nonce` invalida botões antigos. */
export type ConversationState =
  | { flow: 'gasto'; nonce: string; step: ExpenseStep; draft: ExpenseDraft; options?: string[] }
  | { flow: 'conta-valor'; nonce: string; occurrenceId: string; nome: string };

/** Contexto já resolvido de quem está falando com o bot. */
export interface BotUser {
  userId: string;
  canal: CanalBot;
  externalUserId: string;
}
