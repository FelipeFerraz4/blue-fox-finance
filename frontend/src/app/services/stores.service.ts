import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store, CreateStoreDto } from '../models/store.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StoresService {
  private readonly baseUrl = `${environment.apiUrl}/stores`;

  constructor(private readonly http: HttpClient) {}

  getAll(categoria?: string): Observable<Store[]> {
    let params = new HttpParams();
    if (categoria) {
      params = params.set('categoria', categoria);
    }
    return this.http.get<Store[]>(this.baseUrl, { params });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  getById(id: string): Observable<Store> {
    return this.http.get<Store>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateStoreDto): Observable<Store> {
    return this.http.post<Store>(this.baseUrl, dto);
  }

  delete(id: string): Observable<Store> {
    return this.http.delete<Store>(`${this.baseUrl}/${id}`);
  }
}
