import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Bill,
  BillAlerts,
  BillMonthOverview,
  BillOccurrence,
  CreateBillDto,
  PayBillOccurrenceDto,
} from '../../../shared/model/types/bill.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BillsService {
  private readonly baseUrl = `${environment.apiUrl}/bills`;

  /** Último resultado de /bills/alerts (selo do menu e card do dashboard). */
  readonly alerts = signal<BillAlerts | null>(null);

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Bill[]> {
    return this.http.get<Bill[]>(this.baseUrl);
  }

  create(dto: CreateBillDto): Observable<Bill> {
    return this.http.post<Bill>(this.baseUrl, dto).pipe(tap(() => this.refreshAlerts()));
  }

  update(id: string, dto: Partial<CreateBillDto>): Observable<Bill> {
    return this.http.put<Bill>(`${this.baseUrl}/${id}`, dto).pipe(tap(() => this.refreshAlerts()));
  }

  delete(id: string): Observable<Bill> {
    return this.http.delete<Bill>(`${this.baseUrl}/${id}`).pipe(tap(() => this.refreshAlerts()));
  }

  getOccurrences(month?: string): Observable<BillMonthOverview> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month);
    }
    return this.http.get<BillMonthOverview>(`${this.baseUrl}/occurrences`, { params });
  }

  getAlerts(): Observable<BillAlerts> {
    return this.http
      .get<BillAlerts>(`${this.baseUrl}/alerts`)
      .pipe(tap((alerts) => this.alerts.set(alerts)));
  }

  /** Atualiza o signal de avisos ignorando erros (ex.: usuário sem sessão). */
  refreshAlerts(): void {
    this.getAlerts().subscribe({ error: () => {} });
  }

  pay(occurrenceId: string, dto: PayBillOccurrenceDto): Observable<BillOccurrence> {
    return this.http
      .patch<BillOccurrence>(`${this.baseUrl}/occurrences/${occurrenceId}/pay`, dto)
      .pipe(tap(() => this.refreshAlerts()));
  }

  unpay(occurrenceId: string): Observable<BillOccurrence> {
    return this.http
      .patch<BillOccurrence>(`${this.baseUrl}/occurrences/${occurrenceId}/unpay`, {})
      .pipe(tap(() => this.refreshAlerts()));
  }
}
