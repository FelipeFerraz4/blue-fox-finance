import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExpensePreference, UpdateExpensePreferenceDto } from '../../../shared/model/types/preference.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensePreferencesService {
  private readonly baseUrl = `${environment.apiUrl}/preferences/expenses`;

  private readonly preferencesSubject = new BehaviorSubject<ExpensePreference | null>(null);
  public readonly preferences$: Observable<ExpensePreference | null> = this.preferencesSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  public get currentPreferences(): ExpensePreference | null {
    return this.preferencesSubject.value;
  }

  loadPreferences(): Observable<ExpensePreference> {
    return this.http.get<ExpensePreference>(this.baseUrl).pipe(
      tap((prefs) => this.preferencesSubject.next(prefs)),
    );
  }

  updatePreferences(dto: UpdateExpensePreferenceDto): Observable<ExpensePreference> {
    return this.http.put<ExpensePreference>(this.baseUrl, dto).pipe(
      tap((prefs) => this.preferencesSubject.next(prefs)),
    );
  }

  clearPreferences(): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(this.baseUrl).pipe(
      tap(() => this.preferencesSubject.next(null)),
    );
  }

  setDefaultBuyer(buyerId: string | null): Observable<ExpensePreference> {
    return this.updatePreferences({ compradorPadraoId: buyerId });
  }

  setDefaultStore(storeId: string | null): Observable<ExpensePreference> {
    return this.updatePreferences({ lojaPadraoId: storeId });
  }

  setDefaultPaymentMethod(paymentMethodId: string | null): Observable<ExpensePreference> {
    return this.updatePreferences({ meioPagamentoPadraoId: paymentMethodId });
  }

  setDefaultCategory(categoryName: string | null): Observable<ExpensePreference> {
    return this.updatePreferences({ categoriaPadrao: categoryName });
  }
}
