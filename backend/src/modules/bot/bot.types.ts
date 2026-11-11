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

/**
 * Rascunho do lançamento montado pelo assistente. Mesmos campos e ordem da
 * tela "Novo Lançamento" do site; nada vem preenchido sem perguntar
 * (os padrões do perfil só aparecem como sugestão).
 */
export interface ExpenseDraft {
  comprador?: string;
  compradorId?: string | null;
  loja?: string;
  lojaId?: string | null;
  data?: string; // YYYY-MM-DD
  meioPagamentoId?: string;
  meioNome?: string;
  modalidade?: string;
  tipo?: 'A_VISTA' | 'PARCELADO';
  parcelas?: number;
  nome?: string;
  categoria?: string;
  quantidade?: number;
  valorUnitario?: number;
}

export type ExpenseStep =
  | 'comprador'
  | 'loja'
  | 'data'
  | 'meio'
  | 'tipo'
  | 'parcelas'
  | 'nome'
  | 'categoria'
  | 'quantidade'
  | 'valor'
  | 'confirmar';

/** Estado persistido da conversa em andamento. `nonce` invalida botões antigos. */
export type ConversationState =
  | { flow: 'gasto'; nonce: string; step: ExpenseStep; draft: ExpenseDraft; options?: string[] }
  | { flow: 'conta-valor'; nonce: string; occurrenceId: string; nome: string }
  | {
      flow: 'cadastro';
      nonce: string;
      form: FormKind;
      step: string;
      /** Valores já respondidos (chave do campo → valor) e rótulo exibido de cada escolha */
      values: Record<string, string | number | null>;
      labels: Record<string, string>;
      /** Campos já respondidos (inclui os pulados) */
      answered: string[];
      options?: string[];
    };

/** Cadastros disponíveis pelo bot (os mesmos do site). */
export type FormKind = 'loja' | 'comprador' | 'meio' | 'categoria-item' | 'categoria-loja' | 'conta';

/** Contexto já resolvido de quem está falando com o bot. */
export interface BotUser {
  userId: string;
  canal: CanalBot;
  externalUserId: string;
}
