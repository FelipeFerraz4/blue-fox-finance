import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BotLinkCode, BotLinkStatus } from '../../../shared/model/types/bot.model';
import { environment } from '../../../../environments/environment';

/** Vínculo da conta com o bot do Telegram. */
@Injectable({
  providedIn: 'root',
})
export class BotService {
  private readonly baseUrl = `${environment.apiUrl}/bot/link`;

  constructor(private readonly http: HttpClient) {}

  getStatus(): Observable<BotLinkStatus> {
    return this.http.get<BotLinkStatus>(this.baseUrl);
  }

  createCode(): Observable<BotLinkCode> {
    return this.http.post<BotLinkCode>(`${this.baseUrl}/code`, {});
  }

  unlink(): Observable<void> {
    return this.http.delete<void>(this.baseUrl);
  }
}
