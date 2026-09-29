import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentMethod, CreatePaymentMethodDto } from '../models/payment-method.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodsService {
  private readonly baseUrl = `${environment.apiUrl}/payment-methods`;

  constructor(private readonly http: HttpClient) {}

  getAll(onlyActive = false): Observable<PaymentMethod[]> {
    let params = new HttpParams();
    if (onlyActive) {
      params = params.set('onlyActive', 'true');
    }
    return this.http.get<PaymentMethod[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<PaymentMethod> {
    return this.http.get<PaymentMethod>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreatePaymentMethodDto): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(this.baseUrl, dto);
  }

  update(id: string, dto: Partial<CreatePaymentMethodDto>): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string, force = true): Observable<PaymentMethod> {
    const params = new HttpParams().set('force', force.toString());
    return this.http.delete<PaymentMethod>(`${this.baseUrl}/${id}`, { params });
  }
}
