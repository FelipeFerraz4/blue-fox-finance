import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUser, AdminUsersResponse, CreateAdminUserDto } from '../../../shared/model/types/admin-user.model';
import { environment } from '../../../../environments/environment';

/** Criação de usuários no Keycloak + banco (só ROLE_FINANCE_ADMIN). */
@Injectable({
  providedIn: 'root',
})
export class AdminUsersService {
  private readonly baseUrl = `${environment.apiUrl}/admin/users`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<AdminUsersResponse> {
    return this.http.get<AdminUsersResponse>(this.baseUrl);
  }

  create(dto: CreateAdminUserDto): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.baseUrl, dto);
  }
}
