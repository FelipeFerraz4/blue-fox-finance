import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ExpensesService } from '../../services/expenses.service';
import { PaymentMethodsService } from '../../services/payment-methods.service';
import { StoresService } from '../../services/stores.service';
import { BuyersService } from '../../services/buyers.service';
import { CategoriesService } from '../../services/categories.service';
import { PaymentMethod } from '../../models/payment-method.model';
import { Store } from '../../models/store.model';
import { Buyer } from '../../models/buyer.model';
import { CategoriaItem } from '../../models/category.model';
import { CreateLancamentoDto, PreviewInstallmentItem, TipoLancamento } from '../../models/lancamento.model';

export interface ExpenseItemForm {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number | string;
  valorUnitario: number | string;
  valorTotal: number | string;
  observacoes: string;
}

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="expense-form-page">
      <!-- Cabeçalho da Página -->
      <div class="page-header">
        <div class="page-header-content">
          <div class="title-with-pill">
            <div class="header-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <h1 class="page-title">Novo Lançamento</h1>
          </div>
          <p class="page-subtitle">Preencha os dados da compra e adicione os itens adquiridos</p>
        </div>

        <a routerLink="/lancamentos" class="btn btn-secondary btn-pill">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>Voltar para Lançamentos</span>
        </a>
      </div>

      <div class="form-layout-grid">
        <!-- Coluna Principal (Formulário) -->
        <div class="form-main-content">
          <form (ngSubmit)="onSubmit()" novalidate>
            <!-- Alerta de Erro de Validação ou Servidor -->
            <div *ngIf="formErrorMessage" class="alert-box alert-error mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ formErrorMessage }}</span>
            </div>

            <!-- Alerta de Sucesso -->
            <div *ngIf="formSuccessMessage" class="alert-box alert-success mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{{ formSuccessMessage }}</span>
            </div>

            <!-- Card 1: Dados Gerais da Compra (Comuns a todos os itens) -->
            <div class="card form-section-card">
              <div class="section-card-header">
                <div class="section-title-wrap">
                  <div class="section-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="section-title">Dados Gerais da Compra</h2>
                    <p class="section-desc">Metadados compartilhados por todos os itens deste recibo ou nota fiscal</p>
                  </div>
                </div>
              </div>

              <!-- Linha 1: Comprador & Loja -->
              <div class="form-row">
                <div class="form-group">
                  <div class="label-with-action">
                    <label class="form-label">Comprador *</label>
                    <a routerLink="/compradores" class="btn-manage-link" title="Gerenciar Compradores">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>Gerenciar Compradores</span>
                    </a>
                  </div>
                  <!-- Conforme solicitado: exibe APENAS o nome do comprador -->
                  <select
                    name="compradorSelect"
                    [(ngModel)]="selectedBuyerId"
                    (change)="onBuyerSelected()"
                    [class.is-invalid]="formSubmitted && !selectedBuyerId"
                    class="form-control"
                  >
                    <option value="" disabled>Selecione um comprador...</option>
                    <option *ngFor="let b of buyers" [value]="b.id">
                      {{ b.nome }}
                    </option>
                    <option value="OUTRO">Outro comprador (digitar manualmente)...</option>
                  </select>
                  <span *ngIf="formSubmitted && !selectedBuyerId" class="field-error-msg">
                    Selecione um comprador da lista ou escolha "Outro comprador"
                  </span>

                  <input
                    *ngIf="selectedBuyerId === 'OUTRO'"
                    type="text"
                    name="compradorManual"
                    [(ngModel)]="commonData.comprador"
                    [class.is-invalid]="formSubmitted && (!commonData.comprador || !commonData.comprador.trim())"
                    placeholder="Digite o nome do comprador..."
                    class="form-control mt-2"
                  />
                  <span *ngIf="formSubmitted && selectedBuyerId === 'OUTRO' && (!commonData.comprador || !commonData.comprador.trim())" class="field-error-msg">
                    Digite o nome do comprador
                  </span>
                </div>

                <div class="form-group">
                  <div class="label-with-action">
                    <label class="form-label">Loja / Estabelecimento *</label>
                    <a routerLink="/lojas" class="btn-manage-link" title="Gerenciar Lojas e Categorias">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <span>Gerenciar Lojas</span>
                    </a>
                  </div>
                  <select
                    name="lojaSelect"
                    [(ngModel)]="selectedStoreId"
                    (change)="onStoreSelected()"
                    [class.is-invalid]="formSubmitted && !selectedStoreId"
                    class="form-control"
                  >
                    <option value="" disabled>Selecione uma loja cadastrada...</option>
                    <option *ngFor="let s of stores" [value]="s.id">
                      {{ s.nome }} {{ s.categoria ? '(' + s.categoria + ')' : '' }}
                    </option>
                    <option value="OUTRA">Outra loja (digitar manualmente)...</option>
                  </select>
                  <span *ngIf="formSubmitted && !selectedStoreId" class="field-error-msg">
                    Selecione uma loja da lista ou escolha "Outra loja"
                  </span>

                  <input
                    *ngIf="selectedStoreId === 'OUTRA'"
                    type="text"
                    name="lojaManual"
                    [(ngModel)]="commonData.loja"
                    [class.is-invalid]="formSubmitted && (!commonData.loja || !commonData.loja.trim())"
                    placeholder="Digite o nome da loja..."
                    class="form-control mt-2"
                  />
                  <span *ngIf="formSubmitted && selectedStoreId === 'OUTRA' && (!commonData.loja || !commonData.loja.trim())" class="field-error-msg">
                    Digite o nome da loja
                  </span>
                </div>
              </div>

              <!-- Linha 2: Data da Compra & Meio de Pagamento -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Data da Compra *</label>
                  <input
                    type="date"
                    name="data"
                    [(ngModel)]="commonData.data"
                    (change)="onValuesChanged()"
                    [class.is-invalid]="formSubmitted && !commonData.data"
                    class="form-control"
                  />
                  <span *ngIf="formSubmitted && !commonData.data" class="field-error-msg">
                    Informe a data da compra
                  </span>
                </div>

                <div class="form-group">
                  <div class="label-with-action">
                    <label class="form-label">Meio de Pagamento *</label>
                    <a routerLink="/meios-pagamento" class="btn-manage-link" title="Gerenciar Meios de Pagamento">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      <span>Gerenciar Meios</span>
                    </a>
                  </div>
                  <select
                    name="meioPagamentoId"
                    [(ngModel)]="commonData.meioPagamentoId"
                    (change)="onPaymentMethodChange()"
                    [class.is-invalid]="formSubmitted && !commonData.meioPagamentoId"
                    class="form-control"
                  >
                    <option value="" disabled>Selecione um meio de pagamento...</option>
                    <option *ngFor="let m of paymentMethods" [value]="m.id">
                      {{ m.nome }} ({{ m.instituicaoBanco }} - {{ formatModalidade(m.modalidade) }})
                    </option>
                  </select>
                  <span *ngIf="formSubmitted && !commonData.meioPagamentoId" class="field-error-msg">
                    Selecione o meio de pagamento
                  </span>
                </div>
              </div>

              <!-- Linha 3: Tipo e Número de Parcelas -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Tipo de Pagamento *</label>
                  <select
                    name="tipo"
                    [(ngModel)]="commonData.tipo"
                    (change)="onTipoChange()"
                    class="form-control"
                  >
                    <option value="A_VISTA">À Vista</option>
                    <option value="PARCELADO">Parcelado</option>
                  </select>
                </div>

                <div class="form-group" *ngIf="commonData.tipo === 'PARCELADO'">
                  <label class="form-label">Número de Parcelas *</label>
                  <input
                    type="number"
                    name="numeroParcelas"
                    min="1"
                    max="48"
                    [(ngModel)]="commonData.numeroParcelas"
                    (input)="onValuesChanged()"
                    class="form-control"
                  />
                </div>
              </div>
            </div>

            <!-- Seção 2: Cards Dinâmicos de Itens da Compra -->
            <div class="items-section-header mt-4">
              <div class="items-title-wrap">
                <h2 class="items-section-title">
                  Itens / Produtos da Compra
                  <span class="badge-count">{{ items.length }}</span>
                </h2>
                <p class="section-desc">Cada card abaixo será registrado como um lançamento individual mantendo os dados da compra</p>
              </div>

              <button
                type="button"
                (click)="addItem()"
                class="btn btn-outline btn-pill btn-sm-add"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>+ Adicionar Item</span>
              </button>
            </div>

            <!-- Lista de Cards dos Itens -->
            <div class="items-cards-list">
              <div
                *ngFor="let item of items; let i = index; trackBy: trackByItemId"
                class="card item-card"
              >
                <!-- Topo do Card do Item -->
                <div class="item-card-header">
                  <div class="item-header-left">
                    <span class="item-index-badge">Item #{{ i + 1 }}</span>
                    <span *ngIf="item.nome" class="item-header-name">{{ item.nome }}</span>
                  </div>

                  <button
                    *ngIf="items.length > 1"
                    type="button"
                    (click)="removeItem(i)"
                    class="btn-remove-item"
                    title="Excluir este item da compra"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    <span>Excluir Item</span>
                  </button>
                </div>

                <!-- Corpo com Campos do Item -->
                <div class="item-card-body">
                  <!-- Linha 1: Nome & Categoria -->
                  <div class="form-row">
                    <div class="form-group flex-2">
                      <label class="form-label">Nome / Descrição do Item *</label>
                      <input
                        type="text"
                        [name]="'item_nome_' + item.id"
                        [(ngModel)]="item.nome"
                        [class.is-invalid]="formSubmitted && (!item.nome || !item.nome.trim())"
                        class="form-control"
                        placeholder="ex: Teclado Mecânico, Arroz 5kg, Remédio..."
                      />
                      <span *ngIf="formSubmitted && (!item.nome || !item.nome.trim())" class="field-error-msg">
                        Informe o nome ou descrição do item
                      </span>
                    </div>

                    <div class="form-group flex-1">
                      <label class="form-label">Categoria *</label>
                      <input
                        type="text"
                        [name]="'item_categoria_' + item.id"
                        [(ngModel)]="item.categoria"
                        list="categoriasList"
                        [class.is-invalid]="formSubmitted && (!item.categoria || !item.categoria.trim())"
                        class="form-control"
                        placeholder="Selecione ou digite..."
                      />
                      <datalist id="categoriasList">
                        <option *ngFor="let cat of itemCategoriesList" [value]="cat.nome">
                        <option value="Alimentação">
                        <option value="Supermercado">
                        <option value="Moradia">
                        <option value="Transporte">
                        <option value="Tecnologia">
                        <option value="Saúde">
                        <option value="Lazer">
                        <option value="Educação">
                        <option value="Vestuário">
                        <option value="Outros">
                      </datalist>
                      <span *ngIf="formSubmitted && (!item.categoria || !item.categoria.trim())" class="field-error-msg">
                        Informe a categoria
                      </span>
                    </div>
                  </div>

                  <!-- Linha 2: Quantidade, Valor Unitário e Valor Total -->
                  <div class="form-row price-row">
                    <div class="form-group col-qty">
                      <label class="form-label">Quantidade *</label>
                      <input
                        type="text"
                        inputmode="decimal"
                        [name]="'item_qtd_' + item.id"
                        [(ngModel)]="item.quantidade"
                        (input)="recalculateItemTotal(i)"
                        [class.is-invalid]="formSubmitted && isQtyInvalid(item)"
                        class="form-control text-center font-bold"
                        placeholder="Ex: 1 ou 0,350"
                      />
                      <span *ngIf="formSubmitted && isQtyInvalid(item)" class="field-error-msg">
                        Informe a quantidade
                      </span>
                    </div>

                    <div class="form-group col-unit">
                      <label class="form-label">Valor Unitário (R$) *</label>
                      <input
                        type="text"
                        inputmode="decimal"
                        [name]="'item_unit_' + item.id"
                        [(ngModel)]="item.valorUnitario"
                        (input)="recalculateItemTotal(i)"
                        class="form-control"
                        placeholder="0,00"
                      />
                    </div>

                    <div class="form-group col-total">
                      <label class="form-label">Valor Total (R$) *</label>
                      <input
                        type="text"
                        inputmode="decimal"
                        [name]="'item_total_' + item.id"
                        [(ngModel)]="item.valorTotal"
                        (input)="onItemTotalInput(i)"
                        [class.is-invalid]="formSubmitted && isTotalInvalid(item)"
                        class="form-control font-bold text-total"
                        placeholder="Calculado automaticamente"
                      />
                      <span *ngIf="formSubmitted && isTotalInvalid(item)" class="field-error-msg">
                        Informe valor maior que R$ 0,00
                      </span>
                    </div>
                  </div>

                  <!-- Linha 3: Observações do Item -->
                  <div class="form-group mb-0">
                    <label class="form-label text-xs">Observações do item (opcional)</label>
                    <input
                      type="text"
                      [name]="'item_obs_' + item.id"
                      [(ngModel)]="item.observacoes"
                      class="form-control form-control-sm"
                      placeholder="Detalhes ou anotações específicas deste item..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Botão Largo para Adicionar Outro Item -->
            <div class="add-item-action-area mt-3">
              <button
                type="button"
                (click)="addItem()"
                class="btn-add-item-block"
              >
                <div class="plus-icon-circle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <span>Adicionar Mais Um Item a Esta Compra</span>
              </button>
            </div>

            <!-- Botão de Salvar Lançamentos -->
            <div class="form-actions mt-4">
              <button
                type="submit"
                [disabled]="submitting"
                class="btn btn-primary btn-pill btn-block"
              >
                <span *ngIf="!submitting" class="btn-submit-content">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  <span>
                    Salvar {{ items.length }} Lançamento{{ items.length > 1 ? 's' : '' }}
                  </span>
                </span>
                <span *ngIf="submitting" class="btn-submit-content">
                  <svg class="spinner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                  </svg>
                  <span>Gravando {{ items.length }} Lançamento{{ items.length > 1 ? 's' : '' }}...</span>
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Painel Lateral: Resumo da Compra & Simulação da Fatura -->
        <div class="side-panel">
          <div class="card preview-card">
            <h3 class="card-title">
              <span>Resumo da Compra</span>
            </h3>

            <!-- Caixa de Totais Consolidados -->
            <div class="purchase-summary-box">
              <div class="summary-line">
                <span class="summary-label">Itens na Compra:</span>
                <span class="summary-value-badge">{{ items.length }} {{ items.length === 1 ? 'item' : 'itens' }}</span>
              </div>
              <div class="summary-line total-highlight">
                <span class="summary-label">Total Consolidado:</span>
                <span class="summary-total-value">
                  {{ getTotalPurchase() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </span>
              </div>
            </div>

            <!-- Informações do Meio de Pagamento Selecionado -->
            <div *ngIf="selectedPaymentMethod" class="selected-method-info">
              <div class="method-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#004aad" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <span>{{ selectedPaymentMethod.nome }} ({{ selectedPaymentMethod.instituicaoBanco }})</span>
              </div>
              <div *ngIf="selectedPaymentMethod.modalidade === 'CREDITO'" class="invoice-rules-box">
                <span class="text-xs text-muted">Regras de Fatura:</span>
                <div class="rule-pills">
                  <span class="rule-pill">
                    Fechamento: Dia <strong>{{ selectedPaymentMethod.diaFechamento || 'N/D' }}</strong>
                  </span>
                  <span class="rule-pill">
                    Vencimento: Dia <strong>{{ selectedPaymentMethod.diaVencimento || 'N/D' }}</strong>
                  </span>
                </div>
              </div>
            </div>

            <!-- Tabela de Parcelas Calculadas sobre o Total da Compra -->
            <div class="installments-section-title mt-3">
              <span class="text-xs font-bold text-muted uppercase">Projeção da Fatura</span>
            </div>

            <div *ngIf="previewInstallmentsList.length > 0; else noPreview" class="mt-2">
              <div class="desktop-table-container">
                <div class="table-responsive">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Parcela</th>
                        <th>Competência</th>
                        <th>Vencimento</th>
                        <th class="text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let p of previewInstallmentsList">
                        <td><strong>{{ p.numero }} / {{ p.totalParcelas }}</strong></td>
                        <td>{{ p.mesReferencia }}</td>
                        <td>{{ p.dataVencimento | date:'dd/MM/yyyy' }}</td>
                        <td class="text-right font-bold text-primary">
                          {{ p.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Cards Mobile de Projeção de Parcelas -->
              <div class="mobile-cards-container">
                <div *ngFor="let p of previewInstallmentsList" class="parcela-mobile-card">
                  <div class="parcela-card-header">
                    <span class="parcela-num font-bold">Parcela {{ p.numero }} de {{ p.totalParcelas }}</span>
                    <span class="parcela-val font-bold text-primary">
                      {{ p.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </span>
                  </div>
                  <div class="parcela-card-body">
                    <div class="meta-item">
                      <span class="meta-label">Competência:</span>
                      <span class="meta-val">{{ p.mesReferencia }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Vencimento:</span>
                      <span class="meta-val">{{ p.dataVencimento | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ng-template #noPreview>
              <div class="empty-preview">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p class="text-muted text-sm mt-2">
                  Informe o valor dos itens e selecione a data e meio de pagamento para visualizar a projeção das faturas.
                </p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .expense-form-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .page-header-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.35rem;
    }

    .title-with-pill {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .header-icon-box {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.2) 0%, rgba(0, 74, 173, 0.2) 100%);
      color: #004aad;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 74, 173, 0.12);
    }

    .header-icon-box svg {
      width: 20px;
      height: 20px;
    }

    @media (max-width: 768px) {
      .header-icon-box {
        width: 34px;
        height: 34px;
        border-radius: 8px;
      }
      .header-icon-box svg {
        width: 18px;
        height: 18px;
      }
      .title-with-pill {
        gap: 0.5rem;
      }
      .page-title {
        font-size: 1.15rem;
      }
    }

    @media (max-width: 480px) {
      .header-icon-box {
        width: 30px;
        height: 30px;
        border-radius: 7px;
      }
      .header-icon-box svg {
        width: 16px;
        height: 16px;
      }
      .page-title {
        font-size: 1.05rem;
      }
    }

    .page-title {
      font-family: var(--font-outfit), sans-serif;
      font-weight: 800;
      font-size: 1.35rem;
      letter-spacing: -0.02em;
      color: var(--gray-900);
      line-height: 1.25;
      margin: 0;
    }

    .page-subtitle {
      font-family: var(--font-inter), sans-serif;
      font-size: 0.88rem;
      color: var(--gray-500);
      margin: 0.15rem 0 0 0;
    }

    .form-layout-grid {
      display: grid;
      grid-template-columns: 1.65fr 1fr;
      gap: 1.5rem;
      align-items: flex-start;
    }

    @media (max-width: 1024px) {
      .form-layout-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Card de Seção (Dados Gerais) */
    .form-section-card {
      background: #ffffff;
      border: 1px solid rgba(0, 74, 173, 0.12);
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 74, 173, 0.05);
      padding: 1.5rem;
    }

    .section-card-header {
      margin-bottom: 1.25rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid rgba(0, 74, 173, 0.08);
    }

    .section-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .section-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #eef6ff;
      color: #004aad;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .section-title {
      font-family: var(--font-outfit), sans-serif;
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--gray-900);
      margin: 0;
      letter-spacing: -0.01em;
    }

    .section-desc {
      font-family: var(--font-inter), sans-serif;
      font-size: 0.82rem;
      color: var(--gray-500);
      margin: 0.15rem 0 0 0;
    }

    /* Ações de Labels (Gerenciar Lojas / Compradores) */
    .label-with-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }

    .label-with-action .form-label {
      margin-bottom: 0;
    }

    .btn-manage-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.55rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #004aad;
      background: #eff6ff;
      border: 1px solid rgba(56, 182, 255, 0.35);
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      line-height: 1.2;
      transition: all 0.15s ease-in-out;
    }

    .btn-manage-link:hover {
      background: #dbeafe;
      color: #003080;
      border-color: #38b6ff;
      transform: translateY(-1px);
    }

    /* Seção dos Itens */
    .items-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .items-title-wrap {
      flex: 1;
    }

    .items-section-title {
      font-family: var(--font-outfit), sans-serif;
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--gray-900);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .badge-count {
      font-size: 0.78rem;
      font-weight: 700;
      color: #004aad;
      background: #eef6ff;
      border: 1px solid rgba(56, 182, 255, 0.35);
      padding: 0.2rem 0.6rem;
      border-radius: 50px;
    }

    .btn-sm-add {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.45rem 1rem;
    }

    /* Cards Individuais de Cada Item */
    .items-cards-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .item-card {
      background: #ffffff;
      border: 1px solid rgba(0, 74, 173, 0.12);
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(0, 74, 173, 0.04);
      padding: 0;
      overflow: hidden;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .item-card:hover {
      border-color: rgba(56, 182, 255, 0.4);
      box-shadow: 0 4px 14px rgba(0, 74, 173, 0.07);
    }

    .item-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.25rem;
      background: #f8fafc;
      border-bottom: 1px solid rgba(0, 74, 173, 0.08);
    }

    .item-header-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .item-index-badge {
      font-family: var(--font-outfit), sans-serif;
      font-weight: 700;
      font-size: 0.78rem;
      color: #004aad;
      background: #eef6ff;
      border: 1px solid rgba(56, 182, 255, 0.35);
      padding: 0.2rem 0.6rem;
      border-radius: 50px;
    }

    .item-header-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--gray-700);
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .btn-remove-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #dc2626;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 0.3rem 0.65rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-remove-item:hover {
      background: #fee2e2;
      color: #b91c1c;
      border-color: #fca5a5;
      transform: translateY(-1px);
    }

    .item-card-body {
      padding: 1.25rem;
    }

    .flex-2 { flex: 2; }
    .flex-1 { flex: 1; }

    .price-row {
      display: flex;
      gap: 1rem;
    }

    .col-qty {
      flex: 0 0 100px;
    }

    .col-unit {
      flex: 1;
    }

    .col-total {
      flex: 1.2;
    }

    .text-total {
      color: #004aad !important;
      font-size: 1.05rem;
    }

    /* Botão Largo de Adicionar Item (Final da Lista) */
    .btn-add-item-block {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.9rem;
      border: 2px dashed rgba(56, 182, 255, 0.6);
      border-radius: 14px;
      background: rgba(56, 182, 255, 0.04);
      color: #004aad;
      font-family: var(--font-outfit), sans-serif;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-add-item-block:hover {
      background: rgba(56, 182, 255, 0.12);
      border-color: #004aad;
      color: #003080;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(0, 74, 173, 0.1);
    }

    .plus-icon-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #eef6ff;
      color: #004aad;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Botão Principal de Submissão */
    .btn-block {
      width: 100%;
      padding: 0.9rem;
      font-size: 1.05rem;
      font-weight: 700;
    }

    .btn-submit-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .spinner-icon {
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Painel Lateral */
    .preview-card {
      background: #ffffff;
      border: 1px solid rgba(0, 74, 173, 0.12);
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 74, 173, 0.05);
      position: sticky;
      top: 5rem;
      padding: 1.5rem;
    }

    .card-title {
      font-family: var(--font-outfit), sans-serif;
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--gray-900);
      margin: 0 0 1rem 0;
    }

    .purchase-summary-box {
      background: linear-gradient(135deg, rgba(56, 182, 255, 0.08) 0%, rgba(0, 74, 173, 0.08) 100%);
      border: 1px solid rgba(0, 74, 173, 0.12);
      border-radius: 12px;
      padding: 1rem 1.15rem;
      margin-bottom: 1rem;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.4rem;
    }

    .summary-line.total-highlight {
      margin-top: 0.6rem;
      padding-top: 0.6rem;
      border-top: 1px dashed rgba(0, 74, 173, 0.18);
      margin-bottom: 0;
    }

    .summary-label {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--gray-700);
    }

    .summary-value-badge {
      font-size: 0.78rem;
      font-weight: 700;
      color: #004aad;
      background: #ffffff;
      border: 1px solid rgba(56, 182, 255, 0.4);
      padding: 0.2rem 0.6rem;
      border-radius: 50px;
    }

    .summary-total-value {
      font-family: var(--font-outfit), sans-serif;
      font-size: 1.35rem;
      font-weight: 800;
      color: #004aad;
      letter-spacing: -0.02em;
    }

    .selected-method-info {
      background: #f8fafc;
      border: 1px solid rgba(0, 74, 173, 0.1);
      border-radius: 12px;
      padding: 0.85rem;
      margin-bottom: 0.85rem;
    }

    .method-badge {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-weight: 700;
      color: var(--gray-800);
      font-size: 0.88rem;
    }

    .invoice-rules-box {
      margin-top: 0.5rem;
    }

    .rule-pills {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.35rem;
      flex-wrap: wrap;
    }

    .rule-pill {
      background: #eef6ff;
      color: #004aad;
      border: 1px solid rgba(56, 182, 255, 0.35);
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      font-size: 0.75rem;
    }

    .empty-preview {
      padding: 2rem 1rem;
      text-align: center;
    }

    .alert-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 500;
    }

    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    .alert-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }

    .field-error-msg {
      color: #dc2626;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      display: block;
      font-weight: 500;
    }

    .is-invalid {
      border-color: #ef4444 !important;
      background-color: #fff8f8 !important;
    }

    .text-right { text-align: right !important; }
    .text-center { text-align: center !important; }
    .text-xs { font-size: 0.75rem; }
    .font-bold { font-weight: 700; }
    .text-muted { color: var(--gray-500); }
    .uppercase { text-transform: uppercase; }
    .mb-0 { margin-bottom: 0 !important; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1rem; }

    @media (max-width: 640px) {
      .price-row {
        flex-direction: column;
        gap: 0.5rem;
      }
      .col-qty {
        flex: 1;
      }
    }

    /* Responsividade Desktop vs Mobile na Pré-visualização de Parcelas */
    .desktop-table-container {
      display: block;
    }

    .mobile-cards-container {
      display: none;
    }

    @media (max-width: 768px) {
      .desktop-table-container {
        display: none !important;
      }

      .mobile-cards-container {
        display: flex !important;
        flex-direction: column;
        gap: 0.65rem;
      }
    }

    .parcela-mobile-card {
      background: #ffffff;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .parcela-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .parcela-num {
      font-size: 0.9rem;
      color: #0b132b;
    }

    .parcela-val {
      font-size: 1rem;
    }

    .parcela-card-body {
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .meta-label {
      color: var(--gray-500);
      font-size: 0.78rem;
    }

    .meta-val {
      color: var(--gray-800);
      font-weight: 600;
    }
  `]
})
export class ExpenseFormComponent implements OnInit {
  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethod: PaymentMethod | null = null;
  previewInstallmentsList: PreviewInstallmentItem[] = [];
  stores: Store[] = [];
  selectedStoreId: string = '';
  buyers: Buyer[] = [];
  selectedBuyerId: string = '';
  submitting: boolean = false;
  formSubmitted: boolean = false;
  formErrorMessage: string | null = null;
  formSuccessMessage: string | null = null;

  // Metadados comuns compartilhados por todos os itens da compra
  commonData = {
    comprador: '',
    compradorId: undefined as string | undefined,
    loja: '',
    lojaId: undefined as string | undefined,
    data: new Date().toISOString().split('T')[0],
    meioPagamentoId: '',
    tipo: 'A_VISTA' as TipoLancamento,
    numeroParcelas: 1,
  };

  // Lista dinâmica de cards de itens/produtos
  items: ExpenseItemForm[] = [
    {
      id: 'item_1',
      nome: '',
      categoria: '',
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
      observacoes: '',
    },
  ];

  itemCategoriesList: CategoriaItem[] = [];

  constructor(
    private readonly expensesService: ExpensesService,
    private readonly paymentMethodsService: PaymentMethodsService,
    private readonly storesService: StoresService,
    private readonly buyersService: BuyersService,
    private readonly categoriesService: CategoriesService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.loadStores();
    this.loadBuyers();
    this.loadPaymentMethods();
    this.loadItemCategories();
  }

  loadItemCategories() {
    this.categoriesService.getItemCategories(true).subscribe({
      next: (cats) => (this.itemCategoriesList = cats),
      error: (err) => console.error('Erro ao buscar categorias de itens:', err),
    });
  }

  trackByItemId(index: number, item: ExpenseItemForm): string {
    return item.id;
  }

  loadBuyers() {
    this.buyersService.getAll(true).subscribe({
      next: (buyers) => {
        this.buyers = buyers;
        if (buyers.length > 0 && !this.selectedBuyerId) {
          this.selectedBuyerId = buyers[0].id;
          this.onBuyerSelected();
        }
      },
      error: (err) => console.error('Erro ao buscar compradores:', err),
    });
  }

  onBuyerSelected() {
    if (this.selectedBuyerId === 'OUTRO') {
      this.commonData.comprador = '';
      this.commonData.compradorId = undefined;
    } else {
      const found = this.buyers.find((b) => b.id === this.selectedBuyerId);
      if (found) {
        this.commonData.comprador = found.nome;
        this.commonData.compradorId = found.id;
      }
    }
  }

  loadStores() {
    this.storesService.getAll().subscribe({
      next: (stores) => {
        this.stores = stores;
        if (stores.length > 0 && !this.selectedStoreId) {
          this.selectedStoreId = stores[0].id;
          this.onStoreSelected();
        }
      },
      error: (err) => console.error('Erro ao buscar lojas:', err),
    });
  }

  onStoreSelected() {
    if (this.selectedStoreId === 'OUTRA') {
      this.commonData.lojaId = undefined;
      this.commonData.loja = '';
    } else {
      const found = this.stores.find((s) => s.id === this.selectedStoreId);
      if (found) {
        this.commonData.lojaId = found.id;
        this.commonData.loja = found.nome;

        // Se a loja tiver categoria e os itens estiverem sem categoria, pré-preenche
        if (found.categoria) {
          for (const it of this.items) {
            if (!it.categoria || !it.categoria.trim()) {
              it.categoria = found.categoria;
            }
          }
        }
      }
    }
  }

  loadPaymentMethods() {
    this.paymentMethodsService.getAll(true).subscribe({
      next: (methods) => {
        this.paymentMethods = methods;
        if (methods.length > 0 && !this.commonData.meioPagamentoId) {
          this.commonData.meioPagamentoId = methods[0].id;
          this.selectedPaymentMethod = methods[0];
          this.onValuesChanged();
        }
      },
      error: (err) => console.error('Erro ao buscar meios de pagamento:', err),
    });
  }

  getDefaultCategory(): string {
    if (this.selectedStoreId && this.selectedStoreId !== 'OUTRA') {
      const found = this.stores.find((s) => s.id === this.selectedStoreId);
      if (found?.categoria) return found.categoria;
    }
    return '';
  }

  addItem() {
    const defaultCat = this.getDefaultCategory();
    const uniqueId = 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    this.items.push({
      id: uniqueId,
      nome: '',
      categoria: defaultCat,
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
      observacoes: '',
    });
    this.onValuesChanged();
  }

  removeItem(index: number) {
    if (this.items.length <= 1) return;
    this.items.splice(index, 1);
    this.onValuesChanged();
  }

  parseMoney(val: any): number {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const str = String(val).trim().replace('R$', '').trim();
    if (str.includes(',')) {
      const normalized = str.replace(/\./g, '').replace(',', '.');
      const num = parseFloat(normalized);
      return isNaN(num) ? 0 : Number(num.toFixed(2));
    }
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Number(num.toFixed(2));
  }

  parseQuantity(val: any): number {
    if (typeof val === 'number') {
      return isNaN(val) || val <= 0 ? 0 : val;
    }
    if (!val) return 0;
    const str = String(val).trim();
    if (str.includes(',')) {
      const normalized = str.replace(/\./g, '').replace(',', '.');
      const num = parseFloat(normalized);
      return isNaN(num) || num <= 0 ? 0 : Number(num.toFixed(3));
    }
    const num = parseFloat(str);
    return isNaN(num) || num <= 0 ? 0 : Number(num.toFixed(3));
  }

  recalculateItemTotal(index: number) {
    const item = this.items[index];
    if (!item) return;

    const qty = this.parseQuantity(item.quantidade);
    const unit = this.parseMoney(item.valorUnitario);
    if (qty > 0 && unit > 0) {
      item.valorTotal = Number((qty * unit).toFixed(2));
    }
    this.onValuesChanged();
  }

  onItemTotalInput(index: number) {
    const item = this.items[index];
    if (!item) return;

    const qty = this.parseQuantity(item.quantidade);
    const total = this.parseMoney(item.valorTotal);
    if (qty > 0 && total > 0) {
      item.valorUnitario = Number((total / qty).toFixed(2));
    }
    this.onValuesChanged();
  }

  getTotalPurchase(): number {
    const sum = this.items.reduce((acc, it) => acc + this.parseMoney(it.valorTotal), 0);
    return Number(sum.toFixed(2));
  }

  onPaymentMethodChange() {
    this.selectedPaymentMethod =
      this.paymentMethods.find((m) => m.id === this.commonData.meioPagamentoId) || null;
    this.onValuesChanged();
  }

  onTipoChange() {
    if (this.commonData.tipo === 'A_VISTA') {
      this.commonData.numeroParcelas = 1;
    } else if (!this.commonData.numeroParcelas || this.commonData.numeroParcelas < 2) {
      this.commonData.numeroParcelas = 2;
    }
    this.onValuesChanged();
  }

  onValuesChanged() {
    const total = this.getTotalPurchase();
    const n = this.commonData.tipo === 'PARCELADO' ? (this.commonData.numeroParcelas || 1) : 1;

    if (total > 0 && this.commonData.meioPagamentoId && this.commonData.data) {
      this.expensesService
        .previewInstallments({
          dataCompra: this.commonData.data,
          valorTotal: total,
          numeroParcelas: n,
          meioPagamentoId: this.commonData.meioPagamentoId,
        })
        .subscribe({
          next: (items) => {
            this.previewInstallmentsList = items;
          },
          error: (err) => console.error('Erro ao prever parcelas:', err),
        });
    } else {
      this.previewInstallmentsList = [];
    }
  }

  formatModalidade(modalidade: string): string {
    switch (modalidade) {
      case 'CREDITO': return 'Crédito';
      case 'DEBITO': return 'Débito';
      case 'DINHEIRO_CONTA': return 'Conta/Dinheiro';
      default: return 'Outro';
    }
  }

  isTotalInvalid(item: ExpenseItemForm): boolean {
    return !item.valorTotal || this.parseMoney(item.valorTotal) <= 0;
  }

  isQtyInvalid(item: ExpenseItemForm): boolean {
    return this.parseQuantity(item.quantidade) <= 0;
  }

  onSubmit() {
    this.formSubmitted = true;
    this.formErrorMessage = null;
    this.formSuccessMessage = null;

    // 1. Validação de Comprador
    if (!this.selectedBuyerId) {
      this.formErrorMessage = 'Por favor, selecione um Comprador.';
      return;
    }

    if (this.selectedBuyerId === 'OUTRO') {
      if (!this.commonData.comprador || !this.commonData.comprador.trim()) {
        this.formErrorMessage = 'Por favor, digite o nome do Comprador.';
        return;
      }
      this.commonData.compradorId = undefined;
    }

    // 2. Validação de Loja
    if (!this.selectedStoreId) {
      this.formErrorMessage = 'Por favor, selecione uma Loja / Estabelecimento.';
      return;
    }

    if (this.selectedStoreId === 'OUTRA') {
      if (!this.commonData.loja || !this.commonData.loja.trim()) {
        this.formErrorMessage = 'Por favor, digite o nome da Loja.';
        return;
      }
      this.commonData.lojaId = undefined;
    } else {
      const store = this.stores.find((s) => s.id === this.selectedStoreId);
      if (store) {
        this.commonData.loja = store.nome;
        this.commonData.lojaId = store.id;
      }
    }

    if (!this.commonData.loja || !this.commonData.loja.trim()) {
      this.formErrorMessage = 'Por favor, selecione ou informe o nome da Loja.';
      return;
    }

    // 3. Validação de Data e Meio de Pagamento
    if (!this.commonData.data) {
      this.formErrorMessage = 'Por favor, selecione a Data da Compra.';
      return;
    }

    if (!this.commonData.meioPagamentoId) {
      this.formErrorMessage = 'Por favor, selecione o Meio de Pagamento.';
      return;
    }

    // 4. Validação da Lista de Itens
    if (this.items.length === 0) {
      this.formErrorMessage = 'Adicione pelo menos um item à compra.';
      return;
    }

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const itemNum = i + 1;

      if (!item.nome || !item.nome.trim()) {
        this.formErrorMessage = `Por favor, informe o Nome / Descrição do Item #${itemNum}.`;
        return;
      }

      if (!item.categoria || !item.categoria.trim()) {
        this.formErrorMessage = `Por favor, informe a Categoria do Item #${itemNum}.`;
        return;
      }

      const qty = this.parseQuantity(item.quantidade);
      if (qty <= 0) {
        this.formErrorMessage = `A quantidade do Item #${itemNum} ("${item.nome.trim()}") deve ser informada e maior que 0.`;
        return;
      }
      let unit = this.parseMoney(item.valorUnitario);
      let total = this.parseMoney(item.valorTotal);

      if (total <= 0 && unit > 0) {
        total = Number((qty * unit).toFixed(2));
        item.valorTotal = total;
      } else if (unit <= 0 && total > 0) {
        unit = Number((total / qty).toFixed(2));
        item.valorUnitario = unit;
      }

      if (total <= 0) {
        this.formErrorMessage = `O valor total do Item #${itemNum} ("${item.nome.trim()}") deve ser maior que R$ 0,00.`;
        return;
      }
    }

    const numeroParcelas =
      this.commonData.tipo === 'PARCELADO' ? (Number(this.commonData.numeroParcelas) || 1) : 1;

    // 5. Montar as requisições individuais para o backend existente
    const requests = this.items.map((item) => {
      const qty = this.parseQuantity(item.quantidade);
      const unit = this.parseMoney(item.valorUnitario);
      const total = this.parseMoney(item.valorTotal);

      const payload: CreateLancamentoDto = {
        comprador: this.commonData.comprador,
        compradorId: this.commonData.compradorId,
        loja: this.commonData.loja,
        lojaId: this.commonData.lojaId,
        data: this.commonData.data,
        meioPagamentoId: this.commonData.meioPagamentoId,
        tipo: this.commonData.tipo,
        numeroParcelas: numeroParcelas,
        nome: item.nome.trim(),
        categoria: item.categoria.trim(),
        quantidade: qty,
        valorUnitario: unit,
        valorTotal: total,
        observacoes: item.observacoes?.trim() || undefined,
      };

      return this.expensesService.create(payload);
    });

    this.submitting = true;
    forkJoin(requests).subscribe({
      next: (results) => {
        this.submitting = false;
        const count = results.length;
        this.formSuccessMessage = `${count} ${count === 1 ? 'lançamento salvo' : 'lançamentos salvos'} com sucesso!`;
        setTimeout(() => {
          this.router.navigate(['/lancamentos']);
        }, 700);
      },
      error: (err) => {
        this.submitting = false;
        console.error('Erro ao salvar lançamentos:', err);
        const msg =
          err.error?.message ||
          (Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.message);
        this.formErrorMessage =
          'Erro ao salvar: ' + (typeof msg === 'string' ? msg : JSON.stringify(msg));
      },
    });
  }
}
