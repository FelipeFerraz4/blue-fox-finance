import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CategoriaItem,
  CreateCategoriaItemDto,
  UpdateCategoriaItemDto,
  CategoriaLoja,
  CreateCategoriaLojaDto,
  UpdateCategoriaLojaDto,
} from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  constructor(private readonly http: HttpClient) {}

  // ===================== CATEGORIAS DE ITENS =====================

  getItemCategories(activeOnly?: boolean): Observable<CategoriaItem[]> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly.toString());
    }
    return this.http.get<CategoriaItem[]>(`${this.baseUrl}/items`, { params });
  }

  getItemCategoryById(id: string): Observable<CategoriaItem> {
    return this.http.get<CategoriaItem>(`${this.baseUrl}/items/${id}`);
  }

  createItemCategory(dto: CreateCategoriaItemDto): Observable<CategoriaItem> {
    return this.http.post<CategoriaItem>(`${this.baseUrl}/items`, dto);
  }

  updateItemCategory(id: string, dto: UpdateCategoriaItemDto): Observable<CategoriaItem> {
    return this.http.put<CategoriaItem>(`${this.baseUrl}/items/${id}`, dto);
  }

  deleteItemCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/items/${id}`);
  }

  // ===================== CATEGORIAS DE LOJAS =====================

  getStoreCategories(activeOnly?: boolean): Observable<CategoriaLoja[]> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly.toString());
    }
    return this.http.get<CategoriaLoja[]>(`${this.baseUrl}/stores`, { params });
  }

  getStoreCategoryById(id: string): Observable<CategoriaLoja> {
    return this.http.get<CategoriaLoja>(`${this.baseUrl}/stores/${id}`);
  }

  createStoreCategory(dto: CreateCategoriaLojaDto): Observable<CategoriaLoja> {
    return this.http.post<CategoriaLoja>(`${this.baseUrl}/stores`, dto);
  }

  updateStoreCategory(id: string, dto: UpdateCategoriaLojaDto): Observable<CategoriaLoja> {
    return this.http.put<CategoriaLoja>(`${this.baseUrl}/stores/${id}`, dto);
  }

  deleteStoreCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/stores/${id}`);
  }
}
