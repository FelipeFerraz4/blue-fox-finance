import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  DropdownOption,
  DropdownGroup,
  DropdownSize,
  DropdownVariant,
  DropdownRounded,
  BadgeColorVariant
} from './searchable-dropdown.model';

@Component({
  selector: 'app-searchable-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableDropdownComponent),
      multi: true
    }
  ],
  templateUrl: './searchable-dropdown.component.html',
  styleUrl: './searchable-dropdown.component.css'
})
export class SearchableDropdownComponent implements ControlValueAccessor, OnInit, OnChanges {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('triggerBtn') triggerBtn?: ElementRef<HTMLButtonElement>;

  // === DADOS E CONFIGURAÇÃO ===
  @Input() options: any[] = [];
  @Input() value: any = null;

  @Input() valueField: string = 'value';
  @Input() labelField: string = 'label';
  @Input() sublabelField: string = 'sublabel';
  @Input() iconField: string = 'icon';
  @Input() badgeField: string = 'badge';
  @Input() badgeColorField: string = 'badgeColor';
  @Input() groupField: string = 'group';
  @Input() disabledField: string = 'disabled';

  // === COMPORTAMENTO & TEXTOS ===
  @Input() placeholder: string = 'Selecione uma opção...';
  @Input() searchPlaceholder: string = 'Pesquisar...';
  @Input() emptyMessage: string = 'Nenhum resultado encontrado';
  @Input() multiple: boolean = false;
  @Input() maxDisplayedTags: number = 3;
  @Input() showSearch: boolean = true;
  @Input() clearable: boolean = true;
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = true;
  @Input() invalid: boolean = false;
  @Input() maxHeight: string = '300px';

  // === ESTILO & VARIANTES ===
  @Input() size: DropdownSize = 'md';
  @Input() variant: DropdownVariant = 'default';
  @Input() rounded: DropdownRounded = 'md';
  @Input() customClass: string = '';

  // === CRIAÇÃO DE NOVOS ITENS DINÂMICOS ===
  @Input() allowCreate: boolean = false;
  @Input() createOptionText: string = '+ Adicionar item personalizado:';

  // === FUNÇÕES CUSTOMIZADAS ===
  @Input() customFilter?: (search: string, option: DropdownOption) => boolean;

  // === TEMPLATES CUSTOMIZADOS ===
  @Input() customOptionTemplate?: TemplateRef<any>;
  @Input() customTriggerTemplate?: TemplateRef<any>;
  @Input() customHeaderTemplate?: TemplateRef<any>;
  @Input() customFooterTemplate?: TemplateRef<any>;
  @Input() emptyTemplate?: TemplateRef<any>;

  // === EVENTOS DE SAÍDA ===
  @Output() valueChange = new EventEmitter<any>();
  @Output() optionSelect = new EventEmitter<DropdownOption>();
  @Output() optionDeselect = new EventEmitter<DropdownOption>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() createNew = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  // === ESTADO INTERNO ===
  isOpen: boolean = false;
  searchTerm: string = '';
  normalizedOptions: DropdownOption[] = [];
  filteredOptions: DropdownOption[] = [];
  groupedOptions: DropdownGroup[] = [];
  hasGroups: boolean = false;
  highlightedOption: DropdownOption | null = null;
  highlightedIndex: number = -1;

  // Callbacks do ControlValueAccessor
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.refreshOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] || changes['valueField'] || changes['labelField']) {
      this.refreshOptions();
    }
  }

  // === GETTERS CALCULADOS ===
  get hasValue(): boolean {
    if (this.multiple) {
      return Array.isArray(this.value) && this.value.length > 0;
    }
    return this.value !== null && this.value !== undefined && this.value !== '';
  }

  get selectedOption(): DropdownOption | null {
    if (this.multiple || !this.hasValue) return null;
    return (
      this.normalizedOptions.find((opt) => this.valuesAreEqual(opt.value, this.value)) || {
        label: String(this.value),
        value: this.value
      }
    );
  }

  get selectedOptions(): DropdownOption[] {
    if (!this.multiple) {
      return this.selectedOption ? [this.selectedOption] : [];
    }
    if (!Array.isArray(this.value)) return [];

    return this.value.map((val) => {
      const found = this.normalizedOptions.find((opt) => this.valuesAreEqual(opt.value, val));
      return found || { label: String(val), value: val };
    });
  }

  get displayedTags(): DropdownOption[] {
    return this.selectedOptions.slice(0, this.maxDisplayedTags);
  }

  get extraTagsCount(): number {
    return Math.max(0, this.selectedOptions.length - this.maxDisplayedTags);
  }

  get canCreateCustomOption(): boolean {
    if (!this.searchTerm || !this.searchTerm.trim()) return false;
    const cleanSearch = this.normalizeSearchText(this.searchTerm);
    return !this.normalizedOptions.some(
      (opt) => this.normalizeSearchText(opt.label) === cleanSearch
    );
  }

  // === CONTROLE DE ABERTURA / FECHAMENTO ===
  toggleDropdown(): void {
    if (this.disabled) return;
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    if (this.disabled || this.isOpen) return;
    this.isOpen = true;
    this.highlightedIndex = -1;
    this.highlightedOption = null;
    this.filterOptions();
    this.opened.emit();

    setTimeout(() => {
      if (this.showSearch && this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
    }, 50);
  }

  closeDropdown(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.searchTerm = '';
    this.filterOptions();
    this.onTouched();
    this.closed.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.closeDropdown();
      if (this.triggerBtn) {
        this.triggerBtn.nativeElement.focus();
      }
    }
  }

  // === BUSCA E FILTRAGEM ===
  onSearchInput(): void {
    this.searchChange.emit(this.searchTerm);
    this.filterOptions();
    this.highlightedIndex = 0;
    this.updateHighlightedOption();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchChange.emit('');
    this.filterOptions();
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  private filterOptions(): void {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.filteredOptions = [...this.normalizedOptions];
    } else {
      const searchNormalized = this.normalizeSearchText(this.searchTerm);

      if (this.customFilter) {
        this.filteredOptions = this.normalizedOptions.filter((opt) =>
          this.customFilter!(this.searchTerm, opt)
        );
      } else {
        this.filteredOptions = this.normalizedOptions.filter((opt) => {
          const labelMatch = this.normalizeSearchText(opt.label).includes(searchNormalized);
          const sublabelMatch = opt.sublabel
            ? this.normalizeSearchText(opt.sublabel).includes(searchNormalized)
            : false;
          const badgeMatch = opt.badge
            ? this.normalizeSearchText(opt.badge).includes(searchNormalized)
            : false;
          return labelMatch || sublabelMatch || badgeMatch;
        });
      }
    }

    this.buildGroups();
  }

  private normalizeSearchText(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  // === SELEÇÃO DE ITENS ===
  isOptionSelected(opt: DropdownOption): boolean {
    if (this.multiple) {
      if (!Array.isArray(this.value)) return false;
      return this.value.some((val) => this.valuesAreEqual(val, opt.value));
    }
    return this.valuesAreEqual(this.value, opt.value);
  }

  selectOption(opt: DropdownOption): void {
    if (opt.disabled || this.disabled) return;

    if (this.multiple) {
      const currentList: any[] = Array.isArray(this.value) ? [...this.value] : [];
      const existsIndex = currentList.findIndex((v) => this.valuesAreEqual(v, opt.value));

      if (existsIndex > -1) {
        currentList.splice(existsIndex, 1);
        this.optionDeselect.emit(opt);
      } else {
        currentList.push(opt.value);
        this.optionSelect.emit(opt);
      }
      this.updateValue(currentList);
    } else {
      this.updateValue(opt.value);
      this.optionSelect.emit(opt);
      this.closeDropdown();
      if (this.triggerBtn) {
        this.triggerBtn.nativeElement.focus();
      }
    }
  }

  deselectOption(opt: DropdownOption, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.disabled) return;

    if (this.multiple) {
      const currentList = Array.isArray(this.value) ? [...this.value] : [];
      const filtered = currentList.filter((v) => !this.valuesAreEqual(v, opt.value));
      this.updateValue(filtered);
      this.optionDeselect.emit(opt);
    } else {
      this.clearSelection();
    }
  }

  selectAllFiltered(): void {
    if (!this.multiple || this.disabled) return;
    const currentList = Array.isArray(this.value) ? [...this.value] : [];
    this.filteredOptions.forEach((opt) => {
      if (!opt.disabled && !currentList.some((v) => this.valuesAreEqual(v, opt.value))) {
        currentList.push(opt.value);
      }
    });
    this.updateValue(currentList);
  }

  clearSelection(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.disabled) return;

    const emptyVal = this.multiple ? [] : null;
    this.updateValue(emptyVal);
    this.clear.emit();
  }

  handleCreateNew(): void {
    const term = this.searchTerm.trim();
    if (!term) return;

    this.createNew.emit(term);

    if (!this.multiple) {
      this.closeDropdown();
    }
    this.searchTerm = '';
    this.filterOptions();
  }

  private updateValue(newValue: any): void {
    this.value = newValue;
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
  }

  private valuesAreEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a === null || a === undefined || b === null || b === undefined) return false;
    if (typeof a === 'object' && typeof b === 'object') {
      if (a.id !== undefined && b.id !== undefined) return a.id === b.id;
      if (a.value !== undefined && b.value !== undefined) return a.value === b.value;
    }
    return false;
  }

  // === TECLADO E ACESSIBILIDADE ===
  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        event.preventDefault();
        this.openDropdown();
        break;
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateOptions(-1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedOption) {
          this.selectOption(this.highlightedOption);
        } else if (this.allowCreate && this.canCreateCustomOption) {
          this.handleCreateNew();
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;
    }
  }

  private navigateOptions(direction: number): void {
    if (this.filteredOptions.length === 0) return;

    this.highlightedIndex += direction;
    if (this.highlightedIndex < 0) {
      this.highlightedIndex = this.filteredOptions.length - 1;
    } else if (this.highlightedIndex >= this.filteredOptions.length) {
      this.highlightedIndex = 0;
    }

    this.updateHighlightedOption();
  }

  private updateHighlightedOption(): void {
    if (
      this.highlightedIndex >= 0 &&
      this.highlightedIndex < this.filteredOptions.length
    ) {
      this.highlightedOption = this.filteredOptions[this.highlightedIndex];
    } else {
      this.highlightedOption = null;
    }
  }

  // === NORMALIZAÇÃO DE OPÇÕES ===
  private refreshOptions(): void {
    if (!Array.isArray(this.options)) {
      this.normalizedOptions = [];
      this.filteredOptions = [];
      this.groupedOptions = [];
      return;
    }

    this.normalizedOptions = this.options.map((item) => this.normalizeItem(item));
    this.filterOptions();
  }

  private normalizeItem(item: any): DropdownOption {
    if (item === null || item === undefined) {
      return { label: '', value: item };
    }

    // Caso seja tipo primitivo (string, number, boolean)
    if (typeof item !== 'object') {
      return {
        label: String(item),
        value: item,
        raw: item
      };
    }

    // Se já é um DropdownOption completo com value e label
    const val = this.extractValue(item);
    const lbl = this.extractLabel(item);
    const sublbl = this.extractSublabel(item);
    const icon = item[this.iconField] || item.icon;
    const badge = item[this.badgeField] || item.badge;
    const badgeColor: BadgeColorVariant = item[this.badgeColorField] || item.badgeColor || 'primary';
    const disabled = Boolean(item[this.disabledField] || item.disabled);
    const group = item[this.groupField] || item.group || item.categoria;

    return {
      value: val,
      label: lbl,
      sublabel: sublbl,
      icon,
      badge,
      badgeColor,
      disabled,
      group,
      raw: item
    };
  }

  private extractValue(item: any): any {
    if (this.valueField && item[this.valueField] !== undefined) {
      return item[this.valueField];
    }
    if (item.value !== undefined) return item.value;
    if (item.id !== undefined) return item.id;
    return item;
  }

  private extractLabel(item: any): string {
    if (this.labelField && item[this.labelField] !== undefined) {
      return String(item[this.labelField]);
    }
    if (item.label !== undefined) return String(item.label);
    if (item.nome !== undefined) return String(item.nome);
    if (item.name !== undefined) return String(item.name);
    if (item.descricao !== undefined) return String(item.descricao);
    if (item.title !== undefined) return String(item.title);
    return String(item);
  }

  private extractSublabel(item: any): string | undefined {
    if (this.sublabelField && item[this.sublabelField] !== undefined) {
      return String(item[this.sublabelField]);
    }
    if (item.sublabel !== undefined) return String(item.sublabel);
    if (item.descricao !== undefined && this.labelField !== 'descricao') return String(item.descricao);
    if (item.email !== undefined) return String(item.email);
    return undefined;
  }

  private buildGroups(): void {
    const groupsMap = new Map<string, DropdownOption[]>();
    let foundGroup = false;

    for (const opt of this.filteredOptions) {
      if (opt.group) {
        foundGroup = true;
        const list = groupsMap.get(opt.group) || [];
        list.push(opt);
        groupsMap.set(opt.group, list);
      } else {
        const list = groupsMap.get('Geral') || [];
        list.push(opt);
        groupsMap.set('Geral', list);
      }
    }

    this.hasGroups = foundGroup;

    if (foundGroup) {
      this.groupedOptions = Array.from(groupsMap.entries()).map(([name, options]) => ({
        name,
        options
      }));
    } else {
      this.groupedOptions = [];
    }
  }

  // === MÉTODOS CONTROL VALUE ACCESSOR ===
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // === TRACKBY HELPERS ===
  trackByOptionValue(_: number, opt: DropdownOption): any {
    return opt.value;
  }

  trackByGroupName(_: number, group: DropdownGroup): string {
    return group.name;
  }
}
