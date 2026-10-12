export type DropdownSize = 'sm' | 'md' | 'lg';
export type DropdownVariant = 'default' | 'primary' | 'outline' | 'ghost' | 'navy';
export type DropdownRounded = 'sm' | 'md' | 'lg' | 'pill';
export type BadgeColorVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';

export interface DropdownOption<T = any> {
  /** Valor associado ao item (primitivo, id ou objeto) */
  value: T;
  /** Texto principal exibido para a opção */
  label: string;
  /** Texto secundário explicativo ou auxiliar */
  sublabel?: string;
  /** Ícone SVG customizado, emoji ou identificador */
  icon?: string;
  /** Tag ou crachá de identificação da opção */
  badge?: string;
  /** Variante cromática do badge */
  badgeColor?: BadgeColorVariant;
  /** Flag indicando se a opção está desabilitada para seleção */
  disabled?: boolean;
  /** Categoria ou grupo ao qual o item pertence */
  group?: string;
  /** Referência ao objeto de dados original */
  raw?: any;
}

export interface DropdownGroup<T = any> {
  name: string;
  options: DropdownOption<T>[];
}
