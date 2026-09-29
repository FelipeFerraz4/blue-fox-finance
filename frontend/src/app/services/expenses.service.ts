import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Lancamento,
  CreateLancamentoDto,
  LancamentoGrouped,
  PreviewInstallmentItem,
  PaginatedExpenses,
} from '../models/lancamento.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private readonly baseUrl = `${environment.apiUrl}/expenses`;

  constructor(private readonly http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    mesReferencia?: string;
    loja?: string;
    lojaId?: string;
    categoriaLoja?: string;
    meioPagamentoId?: string;
    categoria?: string;
    comprador?: string;
    compradorId?: string;
    search?: string;
  }): Observable<PaginatedExpenses> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.mesReferencia) httpParams = httpParams.set('mesReferencia', params.mesReferencia);
    if (params?.loja) httpParams = httpParams.set('loja', params.loja);
    if (params?.lojaId) httpParams = httpParams.set('lojaId', params.lojaId);
    if (params?.categoriaLoja) httpParams = httpParams.set('categoriaLoja', params.categoriaLoja);
    if (params?.meioPagamentoId) httpParams = httpParams.set('meioPagamentoId', params.meioPagamentoId);
    if (params?.categoria) httpParams = httpParams.set('categoria', params.categoria);
    if (params?.comprador) httpParams = httpParams.set('comprador', params.comprador);
    if (params?.compradorId) httpParams = httpParams.set('compradorId', params.compradorId);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<PaginatedExpenses>(this.baseUrl, { params: httpParams });
  }

  getGrouped(month?: string): Observable<LancamentoGrouped[]> {
    let httpParams = new HttpParams();
    if (month) httpParams = httpParams.set('month', month);

    return this.http.get<LancamentoGrouped[]>(`${this.baseUrl}/grouped`, { params: httpParams });
  }

  getById(id: string): Observable<Lancamento> {
    return this.http.get<Lancamento>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateLancamentoDto): Observable<Lancamento> {
    return this.http.post<Lancamento>(this.baseUrl, dto);
  }

  update(id: string, dto: Partial<CreateLancamentoDto>): Observable<Lancamento> {
    return this.http.put<Lancamento>(`${this.baseUrl}/${id}`, dto);
  }

  previewInstallments(data: {
    dataCompra: string;
    valorTotal: number;
    numeroParcelas: number;
    meioPagamentoId: string;
  }): Observable<PreviewInstallmentItem[]> {
    return this.http.post<PreviewInstallmentItem[]>(
      `${this.baseUrl}/preview-installments`,
      data,
    );
  }

  delete(id: string): Observable<Lancamento> {
    return this.http.delete<Lancamento>(`${this.baseUrl}/${id}`);
  }
}
