import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsBasis, AnalyticsOverview } from '../../../shared/model/types/analytics.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly baseUrl = `${environment.apiUrl}/analytics`;

  constructor(private readonly http: HttpClient) {}

  getOverview(year: number, basis: AnalyticsBasis): Observable<AnalyticsOverview> {
    const params = new HttpParams().set('year', year).set('basis', basis);
    return this.http.get<AnalyticsOverview>(this.baseUrl, { params });
  }
}
