/** Situação do vínculo da conta com o bot (GET /bot/link). */
export interface BotLinkStatus {
  enabled: boolean;
  botUsername: string | null;
  vinculo: {
    canal: 'TELEGRAM';
    username: string | null;
    createdAt: string;
  } | null;
}

/** Código de uso único para conectar (POST /bot/link/code). */
export interface BotLinkCode {
  url: string;
  expiraEm: string;
}
