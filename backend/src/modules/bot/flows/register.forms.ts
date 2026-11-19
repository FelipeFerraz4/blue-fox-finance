import { ModalidadePagamento, RecorrenciaConta } from '@prisma/client';
import { CATEGORY_COLORS, normalizeHex } from '../../../common/constants/category-colors';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateStoreDto } from '../../stores/dto/store.dto';
import { CreateBuyerDto } from '../../buyers/dto/buyer.dto';
import { CreatePaymentMethodDto } from '../../payment-methods/dto/payment-method.dto';
import { CreateItemCategoryDto, CreateStoreCategoryDto } from '../../categories/dto/category.dto';
import { CreateBillDto } from '../../bills/dto/bill.dto';
import { FormKind } from '../bot.types';
import { t } from '../../../common/i18n/translate';
import { currentLocale } from '../../../common/i18n/locale-context';

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
  /** Texto digitado num campo de escolha que não bate com nenhuma opção (ex.: cor em hexadecimal) */
  parseText?: (text: string) => Option | null;
  /** Botões de opção por linha (padrão: 1, ou 2 com mais de 6 opções) */
  perRow?: number;
  /** Mensagem quando o texto digitado não serve (padrão: "Toque numa das opções.") */
  invalidText?: string;
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

/**
 * Rótulos, dicas e títulos ficam em português (chaves do t()) e são traduzidos pelo
 * RegisterFlow na hora de mostrar. Listas fixas de opções traduzem dentro de `choices`,
 * que roda no idioma do usuário em atendimento.
 */
const translated = (options: Option[]): Option[] => options.map((o) => ({ ...o, label: t(o.label) }));

/** Meses no idioma do usuário (Intl). */
const months = (): Option[] =>
  Array.from({ length: 12 }, (_, i) => {
    const name = new Date(Date.UTC(2024, i, 1)).toLocaleDateString(currentLocale().lang, { month: 'long', timeZone: 'UTC' });
    return { id: String(i + 1), label: name.charAt(0).toUpperCase() + name.slice(1) };
  });

/** Mesmos rótulos da tela de Meios de Pagamento. */
const MODALIDADES: Option[] = [
  { id: ModalidadePagamento.CREDITO, label: 'Cartão de Crédito' },
  { id: ModalidadePagamento.DEBITO, label: 'Cartão de Débito' },
  { id: ModalidadePagamento.DINHEIRO_CONTA, label: 'Dinheiro / Saldo em Conta' },
  { id: ModalidadePagamento.OUTRO, label: 'Outro / Boleto / Financiamento' },
];

/** Mesmas cores da tela de Categorias de Itens, com o emoji mais próximo. */
const CORES: Option[] = CATEGORY_COLORS.map((c) => ({ id: c.hex, label: `${c.emoji} ${c.label}` }));

/** Cor digitada: nome de uma cor da paleta ("verde"/"green") ou qualquer código hexadecimal ("#ff8800"). */
function parseColor(text: string): Option | null {
  const typed = text.trim().toLowerCase();
  const byName = CATEGORY_COLORS.find((c) => c.label.toLowerCase() === typed || t(c.label).toLowerCase() === typed);
  if (byName) return { id: byName.hex, label: `${byName.emoji} ${t(byName.label)}` };
  const hex = normalizeHex(text);
  return hex ? { id: hex, label: `🎨 ${hex}` } : null;
}

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
        skipLabel: 'Sem categoria',
        hint: 'Toque numa opção. Para criar uma categoria nova, use /novacategorialoja.',
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
      { key: 'modalidade', label: 'Modalidade', short: 'Modalidade', type: 'choice', required: true, choices: () => translated(MODALIDADES) },
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
      {
        key: 'cor',
        label: 'Cor de Identificação',
        short: 'Cor',
        type: 'choice',
        required: false,
        skipLabel: 'Automática',
        hint:
          'Toque numa cor ou digite qualquer outra em hexadecimal, ex.: <code>#ff8800</code> (pesquise "seletor de cores" no Google para achar o código).\n<i>Automática: uma cor que você ainda não usa.</i>',
        invalidText: 'Não reconheci essa cor. Toque numa opção ou digite um código como <code>#ff8800</code>.',
        choices: () => CORES.map((c, i) => ({ ...c, label: `${CATEGORY_COLORS[i].emoji} ${t(CATEGORY_COLORS[i].label)}` })),
        parseText: parseColor,
        perRow: 3,
      },
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
      name('nome', 'Nome', 'Exemplo: Energia, Internet, Aluguel'),
      {
        key: 'categoria',
        label: 'Categoria',
        short: 'Categoria',
        type: 'choice',
        required: false,
        skipLabel: 'Sem categoria',
        hint: 'Toque numa opção. Para criar uma categoria nova, use /novacategoria.',
        choices: async (userId, prisma) =>
          (await prisma.categoriaItem.findMany({ where: { userId, ativo: true }, orderBy: { nome: 'asc' } })).map((c) => ({
            id: c.nome,
            label: c.nome,
          })),
      },
      { key: 'recorrencia', label: 'Repetição', short: 'Repetição', type: 'choice', required: true, choices: () => translated(REPETICAO) },
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
        label: 'Vencimento',
        short: 'Vencimento',
        type: 'day',
        required: true,
        hint: 'Dia do vencimento (1 a 31).',
        visible: (v) => v.recorrencia !== RecorrenciaConta.UNICA,
      },
      {
        key: 'mesVencimento',
        label: 'Mês',
        short: 'Mês',
        type: 'month',
        required: true,
        visible: (v) => v.recorrencia === RecorrenciaConta.ANUAL,
        choices: () => months(),
      },
      {
        key: 'valorPrevisto',
        label: 'Valor',
        short: 'Valor',
        type: 'money',
        required: false,
        skipLabel: 'Variável',
        hint: 'Se variar todo mês/ano, toque em Variável para informar o valor a cada período.',
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
      return {
        nome: v.nome,
        categoria: opt(v.categoria, String) ?? null,
        recorrencia: v.recorrencia,
        meioPagamentoId: null,
        dataUnica: unica ? v.dataUnica : null,
        diaVencimento: !unica ? v.diaVencimento : null,
        mesVencimento: v.recorrencia === RecorrenciaConta.ANUAL ? Number(v.mesVencimento) : null,
        valorPrevisto: opt(v.valorPrevisto, Number) ?? null,
        lembrarDiasAntes: 2,
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
