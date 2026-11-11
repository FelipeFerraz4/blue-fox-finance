import { ModalidadePagamento, RecorrenciaConta } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateStoreDto } from '../../stores/dto/store.dto';
import { CreateBuyerDto } from '../../buyers/dto/buyer.dto';
import { CreatePaymentMethodDto } from '../../payment-methods/dto/payment-method.dto';
import { CreateItemCategoryDto, CreateStoreCategoryDto } from '../../categories/dto/category.dto';
import { CreateBillDto } from '../../bills/dto/bill.dto';
import { FormKind } from '../bot.types';

export type FieldValue = string | number | null;
export type Values = Record<string, FieldValue>;
export interface Option {
  id: string;
  label: string;
}

/**
 * Campo de um cadastro. Rótulos e regras iguais aos formulários do site.
 * - `choice`: só botões (ou texto livre com `allowText`).
 * - Campos opcionais ganham o botão `skipLabel` (padrão "Pular").
 */
export interface FieldSpec {
  key: string;
  label: string;
  /** Rótulo curto para o botão de alterar no resumo */
  short?: string;
  type: 'text' | 'email' | 'day' | 'month' | 'date' | 'monthYear' | 'money' | 'int' | 'choice';
  required: boolean;
  hint?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  visible?: (v: Values) => boolean;
  choices?: (userId: string, prisma: PrismaService) => Promise<Option[]> | Option[];
  allowText?: boolean;
  /** Botões de atalho para campos de digitação (ex.: Hoje, Este mês) */
  quick?: (today: string) => Option[];
  skipLabel?: string;
}

export interface FormSpec {
  kind: FormKind;
  /** Ex.: "Nova loja" */
  title: string;
  /** Ex.: "Loja cadastrada" */
  doneLabel: string;
  fields: FieldSpec[];
  dto: new () => object;
  toDto: (v: Values) => Record<string, unknown>;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/** Mesmos rótulos da tela de Meios de Pagamento. */
const MODALIDADES: Option[] = [
  { id: ModalidadePagamento.CREDITO, label: 'Cartão de Crédito' },
  { id: ModalidadePagamento.DEBITO, label: 'Cartão de Débito' },
  { id: ModalidadePagamento.DINHEIRO_CONTA, label: 'Dinheiro / Saldo em Conta' },
  { id: ModalidadePagamento.OUTRO, label: 'Outro / Boleto / Financiamento' },
];

/** Mesmas cores pré-definidas da tela de Categorias de Itens. */
const CORES: Option[] = [
  { id: '#004aad', label: 'Azul Blue Fox' },
  { id: '#38b6ff', label: 'Ciano Blue Fox' },
  { id: '#0b132b', label: 'Azul-marinho' },
  { id: '#10b981', label: 'Esmeralda' },
  { id: '#f59e0b', label: 'Âmbar' },
  { id: '#ef4444', label: 'Vermelho' },
  { id: '#8b5cf6', label: 'Roxo' },
  { id: '#0ea5e9', label: 'Azul-céu' },
  { id: '#14b8a6', label: 'Turquesa' },
  { id: '#ec4899', label: 'Rosa' },
  { id: '#64748b', label: 'Cinza' },
];

const REPETICAO: Option[] = [
  { id: RecorrenciaConta.MENSAL, label: 'Mensal' },
  { id: RecorrenciaConta.ANUAL, label: 'Anual' },
  { id: RecorrenciaConta.UNICA, label: 'Avulsa' },
];

const name = (key: string, label: string, hint?: string): FieldSpec => ({
  key,
  label,
  short: 'Nome',
  type: 'text',
  required: true,
  maxLength: 120,
  hint,
});

const opt = <T>(value: FieldValue | undefined, map: (v: NonNullable<FieldValue>) => T): T | undefined =>
  value === null || value === undefined || value === '' ? undefined : map(value);

export const FORMS: Record<FormKind, FormSpec> = {
  loja: {
    kind: 'loja',
    title: 'Nova loja',
    doneLabel: 'Loja cadastrada',
    dto: CreateStoreDto,
    fields: [
      name('nome', 'Nome da Loja', 'Exemplo: Atacadão, Amazon, Farmácia São João'),
      {
        key: 'categoria',
        label: 'Categoria',
        type: 'choice',
        required: false,
        allowText: true,
        skipLabel: 'Sem categoria',
        hint: 'Toque numa opção ou digite o nome.',
        choices: async (userId, prisma) =>
          (await prisma.categoriaLoja.findMany({ where: { userId, ativo: true }, orderBy: { nome: 'asc' } })).map((c) => ({
            id: c.nome,
            label: c.nome,
          })),
      },
    ],
    toDto: (v) => ({ nome: v.nome, categoria: opt(v.categoria, String) }),
  },

  comprador: {
    kind: 'comprador',
    title: 'Novo comprador',
    doneLabel: 'Comprador cadastrado',
    dto: CreateBuyerDto,
    fields: [
      name('nome', 'Nome Completo do Comprador'),
      { key: 'email', label: 'E-mail', short: 'E-mail', type: 'email', required: false, maxLength: 254 },
    ],
    toDto: (v) => ({ nome: v.nome, email: opt(v.email, String) }),
  },

  meio: {
    kind: 'meio',
    title: 'Novo meio de pagamento',
    doneLabel: 'Meio de pagamento cadastrado',
    dto: CreatePaymentMethodDto,
    fields: [
      name('nome', 'Meio de Pagamento (Nome)', 'Exemplo: Nubank, Itaú Platinum, Pix Inter'),
      { key: 'modalidade', label: 'Modalidade', short: 'Modalidade', type: 'choice', required: true, choices: () => MODALIDADES },
      {
        key: 'diaFechamento',
        label: 'Dia de Fechamento da Fatura (1 a 31)',
        short: 'Fechamento',
        type: 'day',
        required: true,
        visible: (v) => v.modalidade === ModalidadePagamento.CREDITO,
      },
      {
        key: 'diaVencimento',
        label: 'Dia de Vencimento da Fatura (1 a 31)',
        short: 'Vencimento',
        type: 'day',
        required: true,
        visible: (v) => v.modalidade === ModalidadePagamento.CREDITO,
      },
      { key: 'instituicaoBanco', label: 'Banco', short: 'Banco', type: 'text', required: true, maxLength: 120, hint: 'Exemplo: Nubank, Itaú, Inter' },
    ],
    toDto: (v) => {
      const credito = v.modalidade === ModalidadePagamento.CREDITO;
      return {
        nome: v.nome,
        modalidade: v.modalidade,
        diaFechamento: credito ? v.diaFechamento : undefined,
        diaVencimento: credito ? v.diaVencimento : undefined,
        instituicaoBanco: v.instituicaoBanco,
      };
    },
  },

  'categoria-item': {
    kind: 'categoria-item',
    title: 'Nova categoria de item',
    doneLabel: 'Categoria de item cadastrada',
    dto: CreateItemCategoryDto,
    fields: [
      name('nome', 'Nome da Categoria', 'Exemplo: Alimentação, Tecnologia, Moradia'),
      { key: 'cor', label: 'Cor de Identificação', short: 'Cor', type: 'choice', required: false, skipLabel: 'Padrão', choices: () => CORES },
    ],
    toDto: (v) => ({ nome: v.nome, cor: opt(v.cor, String) }),
  },

  'categoria-loja': {
    kind: 'categoria-loja',
    title: 'Nova categoria de loja',
    doneLabel: 'Categoria de loja cadastrada',
    dto: CreateStoreCategoryDto,
    fields: [
      name('nome', 'Nome da Categoria', 'Exemplo: E-commerce, Supermercado, Farmácia'),
      { key: 'descricao', label: 'Descrição', short: 'Descrição', type: 'text', required: false, maxLength: 300 },
    ],
    toDto: (v) => ({ nome: v.nome, descricao: opt(v.descricao, String) }),
  },

  // Mesma ordem do formulário de Contas a Pagar do site
  conta: {
    kind: 'conta',
    title: 'Nova conta a pagar',
    doneLabel: 'Conta cadastrada',
    dto: CreateBillDto,
    fields: [
      {
        key: 'meioPagamentoId',
        label: 'Cartão',
        short: 'Cartão',
        type: 'choice',
        required: false,
        skipLabel: 'Nenhum',
        hint: 'Para a fatura de um cartão de crédito: o valor vem da soma das parcelas do mês.',
        choices: async (userId, prisma) =>
          (
            await prisma.paymentMethod.findMany({
              where: { userId, ativo: true, modalidade: ModalidadePagamento.CREDITO },
              orderBy: { nome: 'asc' },
            })
          ).map((m) => ({ id: m.id, label: m.nome })),
      },
      name('nome', 'Nome', 'Exemplo: Energia, Internet, Aluguel'),
      { key: 'categoria', label: 'Categoria', short: 'Categoria', type: 'text', required: false, maxLength: 120, hint: 'Exemplo: Moradia, Serviços' },
      { key: 'recorrencia', label: 'Repetição', short: 'Repetição', type: 'choice', required: true, choices: () => REPETICAO },
      {
        key: 'dataUnica',
        label: 'Vencimento',
        short: 'Vencimento',
        type: 'date',
        required: true,
        visible: (v) => v.recorrencia === RecorrenciaConta.UNICA,
      },
      {
        key: 'diaVencimento',
        label: 'Dia',
        short: 'Dia',
        type: 'day',
        required: true,
        hint: 'Dia do vencimento (1 a 31).',
        // Com cartão, vale o dia de vencimento do cartão
        visible: (v) => v.recorrencia !== RecorrenciaConta.UNICA && !v.meioPagamentoId,
      },
      {
        key: 'mesVencimento',
        label: 'Mês',
        short: 'Mês',
        type: 'month',
        required: true,
        visible: (v) => v.recorrencia === RecorrenciaConta.ANUAL,
        choices: () => MONTHS.map((m, i) => ({ id: String(i + 1), label: m })),
      },
      {
        key: 'valorPrevisto',
        label: 'Valor',
        short: 'Valor',
        type: 'money',
        required: false,
        skipLabel: 'Variável',
        hint: 'Se variar todo mês, toque em Variável e informe o valor ao confirmar o pagamento.',
        visible: (v) => !v.meioPagamentoId,
      },
      {
        key: 'lembrarDiasAntes',
        label: 'Aviso (dias)',
        short: 'Aviso',
        type: 'int',
        required: false,
        min: 0,
        max: 30,
        skipLabel: 'Padrão (2)',
        hint: 'Quantos dias antes do vencimento a conta aparece nos avisos.',
        quick: () => [1, 3, 5, 7].map((n) => ({ id: String(n), label: String(n) })),
      },
      {
        key: 'dataInicio',
        label: 'Início',
        short: 'Início',
        type: 'monthYear',
        required: false,
        skipLabel: 'Este mês',
        hint: 'Primeiro mês da conta. Digite <code>mm/aaaa</code>.',
        visible: (v) => v.recorrencia !== RecorrenciaConta.UNICA,
      },
      { key: 'observacoes', label: 'Observações', short: 'Observações', type: 'text', required: false, maxLength: 500 },
    ],
    toDto: (v) => {
      const unica = v.recorrencia === RecorrenciaConta.UNICA;
      const card = opt(v.meioPagamentoId, String);
      return {
        nome: v.nome,
        categoria: opt(v.categoria, String) ?? null,
        recorrencia: v.recorrencia,
        meioPagamentoId: card ?? null,
        dataUnica: unica ? v.dataUnica : null,
        diaVencimento: !unica && !card ? v.diaVencimento : null,
        mesVencimento: v.recorrencia === RecorrenciaConta.ANUAL ? Number(v.mesVencimento) : null,
        valorPrevisto: card ? null : (opt(v.valorPrevisto, Number) ?? null),
        lembrarDiasAntes: opt(v.lembrarDiasAntes, Number),
        dataInicio: unica ? undefined : opt(v.dataInicio, String),
        observacoes: opt(v.observacoes, String) ?? null,
      };
    },
  },
};

/** Ordem do menu /cadastrar. */
export const FORM_MENU: { kind: FormKind; label: string }[] = [
  { kind: 'loja', label: '🏪 Loja' },
  { kind: 'comprador', label: '👤 Comprador' },
  { kind: 'meio', label: '💳 Meio de pagamento' },
  { kind: 'categoria-item', label: '🏷 Categoria de item' },
  { kind: 'categoria-loja', label: '🗂 Categoria de loja' },
  { kind: 'conta', label: '🧾 Conta a pagar' },
];
