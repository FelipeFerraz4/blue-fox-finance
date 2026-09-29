import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Buyer, CreateBuyerDto, UpdateBuyerDto } from '../models/buyer.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BuyersService {
  private readonly baseUrl = `${environment.apiUrl}/buyers`;

  constructor(private readonly http: HttpClient) {}

  getAll(activeOnly?: boolean): Observable<Buyer[]> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', String(activeOnly));
    }
    return this.http.get<Buyer[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Buyer> {
    return this.http.get<Buyer>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateBuyerDto): Observable<Buyer> {
    return this.http.post<Buyer>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateBuyerDto): Observable<Buyer> {
    return this.http.put<Buyer>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<Buyer> {
    return this.http.delete<Buyer>(`${this.baseUrl}/${id}`);
  }
}
