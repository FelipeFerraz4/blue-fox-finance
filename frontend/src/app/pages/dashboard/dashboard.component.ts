import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardOverview } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="dashboard-page">
      <!-- Cabeçalho com Seletor de Período -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5">
              <path d="M3 3v18h18"/>
              <path d="M18 9l-5 5-4-4-3 3"/>
            </svg>
            Dashboard Financeiro
          </h1>
          <p class="page-subtitle">Acompanhamento consolidado de gastos, parcelas e projeção de faturas</p>
        </div>

        <div class="period-selector card-filter">
          <button (click)="changeMonth(-1)" class="btn-icon" title="Mês Anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          
          <div class="current-month-display">
            <span class="month-label">{{ formatMonthLabel(selectedMonth) }}</span>
            <input
              type="month"
              [(ngModel)]="selectedMonth"
              (change)="loadData()"
              class="month-input-hidden"
              #monthPicker
            />
          </div>

          <button (click)="changeMonth(1)" class="btn-icon" title="Próximo Mês">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Estado de Carregamento -->
      <div *ngIf="loading" class="loading-state card">
        <div class="spinner"></div>
        <p>Carregando indicadores financeiros...</p>
      </div>

      <!-- Conteúdo Principal -->
      <div *ngIf="!loading && overview" class="dashboard-content">
        <!-- 4 KPI Cards Principais + Card Total Parcelado -->
        <div class="kpi-grid">
          <!-- KPI 1: TOTAL A PAGAR ESTE MÊS -->
          <div class="kpi-card highlight-card">
            <div class="kpi-icon-wrap primary">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-title">TOTAL A PAGAR ESTE MÊS</span>
              <span class="kpi-value text-primary">{{ overview.totalPagarEsteMes | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              <span class="kpi-subtext">Competência {{ formatMonthLabel(overview.mesReferencia) }}</span>
            </div>
          </div>

          <!-- KPI 2: TOTAL A PAGAR PRÓXIMO MÊS -->
          <div class="kpi-card">
            <div class="kpi-icon-wrap warning">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-title">TOTAL A PAGAR PRÓXIMO MÊS</span>
              <span class="kpi-value text-warning">{{ overview.totalPagarProximoMes | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              <span class="kpi-subtext">Fatura do mês seguinte</span>
            </div>
          </div>

          <!-- KPI 3: SALDO DEVEDOR FUTURO -->
          <div class="kpi-card">
            <div class="kpi-icon-wrap danger">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-title">SALDO DEVEDOR FUTURO</span>
              <span class="kpi-value text-danger">{{ overview.saldoDevedorFuturo | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              <span class="kpi-subtext">Parcelas a partir do 2º mês</span>
            </div>
          </div>

          <!-- KPI 4: TOTAL GERAL CONTRATADO -->
          <div class="kpi-card">
            <div class="kpi-icon-wrap info">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-title">TOTAL GERAL CONTRATADO</span>
              <span class="kpi-value">{{ overview.totalGeralContratado | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              <span class="kpi-subtext">Total histórico registrado</span>
            </div>
          </div>
        </div>

        <!-- Indicador Adicional: TOTAL PARCELADO vs À VISTA -->
        <div class="card sub-summary-card">
          <div class="split-info">
            <div class="split-item">
              <span class="split-label">TOTAL Parcelado no Mês</span>
              <span class="split-val font-semibold">{{ overview.totalParceladoMes | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
            </div>
            <div class="divider"></div>
            <div class="split-item">
              <span class="split-label">TOTAL À Vista no Mês</span>
              <span class="split-val font-semibold">{{ overview.totalAVistaMes | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
            </div>
            <div class="divider"></div>
            <div class="split-item">
              <span class="split-label">Compromisso Total no Mês</span>
              <span class="split-val text-primary font-bold">{{ overview.totalPagarEsteMes | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
            </div>
          </div>
        </div>

        <!-- Layout em Duas Colunas: Detalhamento & Resumo -->
        <div class="dashboard-tables-grid">
          <!-- TABELA: DETALHAMENTO DE COMPRAS & PARCELAS DO MÊS -->
          <div class="card table-card-left">
            <div class="card-title">
              <div class="title-with-badge">
                <span>DETALHAMENTO DE COMPRAS & PARCELAS do Mês</span>
                <span class="badge badge-primary">{{ overview.detalhamentoComprasMes.length }} itens</span>
              </div>
            </div>

            <div *ngIf="overview.detalhamentoComprasMes.length > 0; else noParcelas">
              <div class="desktop-table-container">
                <div class="table-responsive">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Comprador</th>
                        <th>Item / Compra</th>
                        <th>Data</th>
                        <th>Meio de Pagamento</th>
                        <th>Tipo</th>
                        <th>Parcela</th>
                        <th class="text-right">Valor da Parcela</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of overview.detalhamentoComprasMes">
                        <td>
                          <span class="comprador-tag">{{ item.comprador }}</span>
                        </td>
                        <td>
                          <div class="item-details">
                            <span class="item-name font-medium">{{ item.itemCompra }}</span>
                            <span class="item-store text-muted">{{ item.loja }}</span>
                          </div>
                        </td>
                        <td>{{ item.data | date:'dd/MM/yyyy' }}</td>
                        <td>
                          <span class="badge badge-gray">{{ item.meioPagamento }}</span>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="item.tipo === 'Parcelado' ? 'badge-warning' : 'badge-success'">
                            {{ item.tipo }}
                          </span>
                        </td>
                        <td>
                          <span class="parcela-badge">{{ item.parcela }}</span>
                        </td>
                        <td class="text-right font-semibold">
                          {{ item.valorParcela | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Cards Mobile: Detalhamento de Compras & Parcelas -->
              <div class="mobile-cards-container">
                <div *ngFor="let item of overview.detalhamentoComprasMes" class="dashboard-mobile-card">
                  <!-- Topo: Nome do Item/Compra em destaque e Valor da Parcela -->
                  <div class="dash-card-top">
                    <div class="dash-card-title-wrap">
                      <span class="dash-card-item-name">{{ item.itemCompra }}</span>
                      <span class="dash-card-store text-muted">{{ item.loja }}</span>
                    </div>
                    <div class="dash-card-price-wrap">
                      <span class="dash-card-val text-primary font-bold">
                        {{ item.valorParcela | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                      </span>
                      <span class="parcela-badge">{{ item.parcela }}</span>
                    </div>
                  </div>

                  <!-- Metadados: Data e Comprador -->
                  <div class="dash-card-meta">
                    <div class="meta-item">
                      <span class="meta-label">Data:</span>
                      <span class="meta-val">{{ item.data | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Comprador:</span>
                      <span class="comprador-tag">{{ item.comprador }}</span>
                    </div>
                  </div>

                  <!-- Badges: Meio de Pagamento e Tipo -->
                  <div class="dash-card-badges">
                    <span class="badge badge-gray">{{ item.meioPagamento }}</span>
                    <span class="badge" [ngClass]="item.tipo === 'Parcelado' ? 'badge-warning' : 'badge-success'">
                      {{ item.tipo }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <ng-template #noParcelas>
              <div class="empty-state">
                <p>Nenhuma fatura ou parcela com vencimento para este mês.</p>
                <a routerLink="/lancamentos/novo" class="btn btn-primary btn-sm mt-3">+ Adicionar Lançamento</a>
              </div>
            </ng-template>
          </div>

          <!-- TABELA: RESUMO POR MEIO DE PAGAMENTO -->
          <div class="card table-card-right">
            <div class="card-title">
              <span>RESUMO POR MEIO DE PAGAMENTO</span>
            </div>

            <div *ngIf="overview.resumoMeioPagamento.length > 0; else noResumo">
              <div class="desktop-table-container">
                <div class="table-responsive">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Meio de Pagamento</th>
                        <th class="text-right">Total no Mês</th>
                        <th class="text-right">% do Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let r of overview.resumoMeioPagamento">
                        <td>
                          <div class="payment-method-row">
                            <span class="font-medium">{{ r.meioPagamento }}</span>
                            <span class="text-muted text-xs">{{ r.instituicaoBanco }}</span>
                          </div>
                          <!-- Barra de Progresso Visual -->
                          <div class="progress-bar-bg">
                            <div class="progress-bar-fill" [style.width.%]="r.percentualDoTotal"></div>
                          </div>
                        </td>
                        <td class="text-right font-semibold">
                          {{ r.totalNoMes | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                        </td>
                        <td class="text-right font-medium">
                          <span class="percentage-badge">{{ r.percentualDoTotal }}%</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Cards Mobile: Resumo Meio de Pagamento -->
              <div class="mobile-cards-container">
                <div *ngFor="let r of overview.resumoMeioPagamento" class="payment-summary-mobile-card">
                  <div class="payment-card-top">
                    <div class="payment-card-title-wrap">
                      <span class="payment-card-name font-bold">{{ r.meioPagamento }}</span>
                      <span class="text-muted text-xs">{{ r.instituicaoBanco }}</span>
                    </div>
                    <div class="payment-card-val-wrap text-right">
                      <span class="payment-card-total font-bold text-primary">
                        {{ r.totalNoMes | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                      </span>
                      <span class="percentage-badge">{{ r.percentualDoTotal }}%</span>
                    </div>
                  </div>
                  <!-- Barra de Progresso Visual -->
                  <div class="progress-bar-bg mt-2">
                    <div class="progress-bar-fill" [style.width.%]="r.percentualDoTotal"></div>
                  </div>
                </div>
              </div>
            </div>

            <ng-template #noResumo>
              <div class="empty-state">
                <p>Sem movimentações no mês selecionado.</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .dashboard-page .page-header {
      margin-bottom: 0;
    }

    .period-selector {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      padding: 0.35rem 0.65rem;
      box-shadow: var(--shadow-sm);
      white-space: nowrap;
      flex-wrap: nowrap;
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      width: 32px;
      height: 32px;
      padding: 0;
      border-radius: 6px;
      color: var(--gray-600);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
      flex-shrink: 0;
    }

    .btn-icon:hover {
      background: var(--gray-100);
      color: var(--gray-900);
    }

    .current-month-display {
      position: relative;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }

    .month-label {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--gray-800);
      padding: 0 0.5rem;
      text-transform: capitalize;
      white-space: nowrap;
      display: inline-block;
      line-height: 1;
      text-align: center;
    }

    .month-input-hidden {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }

    .kpi-card {
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      padding: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
      transition: transform 0.15s, box-shadow 0.15s;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .kpi-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-icon-wrap.primary {
      background: #eff6ff;
      color: #2563eb;
    }
    .kpi-icon-wrap.warning {
      background: #fffbeb;
      color: #d97706;
    }
    .kpi-icon-wrap.danger {
      background: #fef2f2;
      color: #dc2626;
    }
    .kpi-icon-wrap.info {
      background: #f0fdfa;
      color: #0d9488;
    }

    .kpi-content {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .kpi-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--gray-500);
      letter-spacing: 0.04em;
    }

    .kpi-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--gray-900);
      letter-spacing: -0.02em;
    }

    .kpi-subtext {
      font-size: 0.75rem;
      color: var(--gray-400);
    }

    .text-primary { color: #2563eb !important; }
    .text-warning { color: #d97706 !important; }
    .text-danger { color: #dc2626 !important; }
    .text-right { text-align: right !important; }

    .sub-summary-card {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border: 1px dashed var(--gray-300);
    }

    .split-info {
      display: flex;
      align-items: center;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .split-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .split-label {
      font-size: 0.8rem;
      color: var(--gray-500);
      text-transform: uppercase;
      font-weight: 600;
    }

    .split-val {
      font-size: 1.15rem;
      margin-top: 0.15rem;
    }

    .divider {
      width: 1px;
      height: 36px;
      background: var(--gray-300);
    }

    .dashboard-tables-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-top: 0;
    }

    @media (max-width: 1024px) {
      .dashboard-tables-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-page {
        gap: 1.25rem;
      }

      .dashboard-content {
        gap: 1.25rem;
      }

      .page-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
        margin-bottom: 0;
      }

      .page-header > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 100%;
      }

      .page-title {
        justify-content: center;
        text-align: center;
      }

      .page-subtitle {
        text-align: center;
      }

      .period-selector {
        margin: 0 auto;
        align-self: center;
        display: inline-flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: center !important;
        flex-wrap: nowrap !important;
        width: auto;
        max-width: 100%;
        white-space: nowrap;
      }

      .current-month-display {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        white-space: nowrap !important;
      }

      .month-label {
        white-space: nowrap !important;
        line-height: 1 !important;
      }

      .btn-icon {
        width: 32px !important;
        height: 32px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
        gap: 0.85rem;
      }

      .kpi-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 1.25rem 1rem;
        gap: 0.65rem;
      }

      .kpi-content {
        align-items: center;
        text-align: center;
      }

      .kpi-title,
      .kpi-value,
      .kpi-subtext {
        text-align: center;
      }

      .sub-summary-card {
        text-align: center;
        padding: 1.25rem 1rem;
      }

      .split-info {
        flex-direction: column;
        gap: 0.85rem;
        text-align: center;
      }

      .split-item {
        align-items: center;
        text-align: center;
      }

      .divider {
        width: 60px;
        height: 1px;
        background: var(--gray-300);
        margin: 0.15rem auto;
      }

      .dashboard-tables-grid {
        gap: 1.25rem;
        margin-top: 0;
      }

      .card-title {
        text-align: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .title-with-badge {
        justify-content: center;
        text-align: center;
        flex-wrap: wrap;
      }

      .desktop-table-container {
        display: none !important;
      }

      .mobile-cards-container {
        display: flex !important;
        flex-direction: column;
        gap: 0.85rem;
      }
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .comprador-tag {
      font-weight: 600;
      color: var(--gray-800);
    }

    .item-details {
      display: flex;
      flex-direction: column;
    }

    .item-name {
      color: var(--gray-900);
    }

    .item-store {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .parcela-badge {
      font-weight: 700;
      background: var(--gray-100);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      color: var(--gray-700);
    }

    .progress-bar-bg {
      height: 4px;
      background: var(--gray-200);
      border-radius: 9999px;
      margin-top: 0.4rem;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    .percentage-badge {
      background: var(--primary-light);
      color: var(--primary);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .empty-state {
      padding: 2.5rem 1rem;
      text-align: center;
      color: var(--gray-500);
    }

    .loading-state {
      padding: 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--gray-500);
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .desktop-table-container {
      display: block;
    }

    .mobile-cards-container {
      display: none;
    }

    /* Cards Mobile no Dashboard */
    .dashboard-mobile-card {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 2px 6px rgba(0, 74, 173, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      text-align: left;
    }

    .dash-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .dash-card-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      text-align: left;
    }

    .dash-card-item-name {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 1.05rem;
      font-weight: 700;
      color: #0b132b;
      line-height: 1.3;
    }

    .dash-card-store {
      font-size: 0.82rem;
      color: var(--gray-600);
    }

    .dash-card-price-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    .dash-card-val {
      font-size: 1.05rem;
      color: var(--primary);
    }

    .dash-card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.4rem 0;
      border-top: 1px dashed var(--gray-200);
      border-bottom: 1px dashed var(--gray-200);
      font-size: 0.82rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .meta-label {
      color: var(--gray-500);
      font-size: 0.78rem;
    }

    .meta-val {
      color: var(--gray-800);
      font-weight: 600;
    }

    .dash-card-badges {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .payment-summary-mobile-card {
      background: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 0.85rem 1rem;
      box-shadow: 0 2px 6px rgba(0, 74, 173, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      text-align: left;
    }

    .payment-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
    }

    .payment-card-title-wrap {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .payment-card-name {
      font-family: var(--font-headers, 'Outfit', sans-serif);
      font-size: 0.95rem;
      color: #0b132b;
    }

    .payment-card-val-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .payment-card-total {
      font-size: 0.95rem;
      color: var(--primary);
    }
  `],
})
export class DashboardComponent implements OnInit {
  selectedMonth: string = '';
  overview: DashboardOverview | null = null;
  loading: boolean = true;

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit() {
    const now = new Date();
    this.selectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.dashboardService.getOverview(this.selectedMonth).subscribe({
      next: (data) => {
        this.overview = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard:', err);
        this.loading = false;
      },
    });
  }

  changeMonth(delta: number) {
    const [year, month] = this.selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    this.selectedMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.loadData();
  }

  formatMonthLabel(monthStr?: string): string {
    if (!monthStr || !monthStr.includes('-')) return '';
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }
}
