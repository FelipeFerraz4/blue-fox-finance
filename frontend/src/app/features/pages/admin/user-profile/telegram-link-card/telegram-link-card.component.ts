import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BotService } from '../../../../../core/services/bot/bot.service';
import { BotLinkCode, BotLinkStatus } from '../../../../../shared/model/types/bot.model';

const POLL_MS = 3000;

/**
 * Card "Telegram" do perfil: conecta a conta ao bot com um código de uso único
 * (deep link t.me/<bot>?start=<código>) e acompanha até o vínculo aparecer.
 */
@Component({
  selector: 'app-telegram-link-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './telegram-link-card.component.html',
  styleUrl: './telegram-link-card.component.css',
})
export class TelegramLinkCardComponent implements OnInit {
  private readonly bot = inject(BotService);

  readonly status = signal<BotLinkStatus | null>(null);
  readonly pending = signal<BotLinkCode | null>(null);
  readonly secondsLeft = signal(0);
  readonly busy = signal(false);
  readonly confirmingUnlink = signal(false);
  readonly justConnected = signal(false);
  readonly error = signal<string | null>(null);

  readonly countdown = computed(() => {
    const s = this.secondsLeft();
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  });

  private timer: ReturnType<typeof setInterval> | null = null;
  private poller: ReturnType<typeof setInterval> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopWaiting());
  }

  ngOnInit(): void {
    this.load();
  }

  connect(): void {
    this.busy.set(true);
    this.error.set(null);
    this.bot.createCode().subscribe({
      next: (code) => {
        this.busy.set(false);
        this.pending.set(code);
        this.startWaiting(code);
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Não foi possível gerar o link. Tente de novo.');
      },
    });
  }

  cancelPending(): void {
    this.stopWaiting();
    this.pending.set(null);
  }

  unlink(): void {
    if (!this.confirmingUnlink()) {
      this.confirmingUnlink.set(true);
      return;
    }
    this.busy.set(true);
    this.bot.unlink().subscribe({
      next: () => {
        this.busy.set(false);
        this.confirmingUnlink.set(false);
        this.justConnected.set(false);
        this.load();
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Não foi possível desconectar. Tente de novo.');
      },
    });
  }

  private load(): void {
    this.bot.getStatus().subscribe({
      next: (status) => this.status.set(status),
      error: () => this.status.set({ enabled: false, botUsername: null, vinculo: null }),
    });
  }

  /** Conta o tempo do código e consulta o vínculo até o usuário tocar em Iniciar no Telegram. */
  private startWaiting(code: BotLinkCode): void {
    this.stopWaiting();
    const expiresAt = new Date(code.expiraEm).getTime();
    const tick = () => {
      const left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      this.secondsLeft.set(left);
      if (left === 0) this.cancelPending();
    };
    tick();
    this.timer = setInterval(tick, 1000);
    this.poller = setInterval(() => {
      this.bot.getStatus().subscribe((status) => {
        if (status.vinculo) {
          this.cancelPending();
          this.justConnected.set(true);
          this.status.set(status);
        }
      });
    }, POLL_MS);
  }

  private stopWaiting(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.poller) clearInterval(this.poller);
    this.timer = this.poller = null;
  }
}
