import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminUsersService } from '../../../../core/services/admin-users/admin-users.service';
import { AdminUser, CreateAdminUserDto } from '../../../../shared/model/types/admin-user.model';

// Sem caracteres ambíguos (0/O, 1/l/I) para facilitar repassar a senha
const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

interface CreatedCredentials {
  nome: string;
  username: string;
  senha: string;
}

/**
 * Admin → Usuários (só ROLE_FINANCE_ADMIN): cria a conta no Keycloak com
 * ROLE_FINANCE_USER + ROLE_USER e senha temporária, e registra no banco.
 */
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [FormsModule, RouterModule, DatePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  private readonly service = inject(AdminUsersService);

  readonly users = signal<AdminUser[]>([]);
  readonly roles = signal<string[]>([]);
  readonly configured = signal(true);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly created = signal<CreatedCredentials | null>(null);
  readonly copied = signal(false);
  readonly showPassword = signal(false);

  form: CreateAdminUserDto = this.emptyForm();
  submitted = false;

  ngOnInit(): void {
    this.load();
  }

  generatePassword(): void {
    const bytes = new Uint32Array(12);
    let password = '';
    // Garante ao menos uma minúscula, uma maiúscula e um número
    do {
      crypto.getRandomValues(bytes);
      password = Array.from(bytes, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join('');
    } while (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password));
    this.form.senhaTemporaria = password;
    this.showPassword.set(true);
  }

  submit(ngForm: NgForm): void {
    this.submitted = true;
    if (ngForm.invalid || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);
    const dto: CreateAdminUserDto = {
      nome: this.form.nome.trim(),
      sobrenome: this.form.sobrenome?.trim() || undefined,
      email: this.form.email.trim().toLowerCase(),
      senhaTemporaria: this.form.senhaTemporaria,
    };

    this.service.create(dto).subscribe({
      next: (user) => {
        this.saving.set(false);
        this.created.set({ nome: user.nome, username: user.username, senha: dto.senhaTemporaria });
        this.copied.set(false);
        this.users.update((list) => [user, ...list]);
        this.form = this.emptyForm();
        this.submitted = false;
        this.showPassword.set(false);
        ngForm.resetForm(this.form);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(this.messageOf(err));
      },
    });
  }

  async copyCredentials(): Promise<void> {
    const c = this.created();
    if (!c) return;
    const text = `Acesso ao Blue Fox Finance\nLogin (e-mail): ${c.username}\nSenha temporária: ${c.senha}\n(no primeiro acesso você vai definir uma nova senha)`;
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
    } catch {
      this.copied.set(false);
    }
  }

  fullName(u: AdminUser): string {
    return [u.nome, u.sobrenome].filter(Boolean).join(' ');
  }

  private load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.roles.set(res.roles);
        this.configured.set(res.configured);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.messageOf(err));
      },
    });
  }

  private messageOf(err: HttpErrorResponse): string {
    if (err.status === 403) return 'Você não tem permissão para gerenciar usuários.';
    const message = err.error?.message;
    if (Array.isArray(message)) return message.join('; ');
    return typeof message === 'string' ? message : 'Não foi possível concluir. Tente de novo.';
  }

  private emptyForm(): CreateAdminUserDto {
    return { nome: '', sobrenome: '', email: '', senhaTemporaria: '' };
  }
}
