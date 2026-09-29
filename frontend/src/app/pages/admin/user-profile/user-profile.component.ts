import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService, UserProfile, SystemAvatar } from '../../../services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profile-page">
      <!-- Breadcrumb & Cabeçalho -->
      <div class="page-header">
        <div class="breadcrumb-row">
          <a routerLink="/admin" class="breadcrumb-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Voltar para Administração
          </a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Perfil do Usuário</span>
        </div>

        <div class="header-main">
          <div class="header-text">
            <div class="title-with-badge">
              <h1 class="page-title">Configurações de Usuário</h1>
              <span class="badge-role">{{ profile.role }}</span>
            </div>
            <p class="page-subtitle">
              Gerencie suas informações cadastrais, preferências e escolha seu avatar oficial do sistema.
            </p>
          </div>
        </div>
      </div>

      <!-- Feedback de Sucesso -->
      <div *ngIf="successMessage" class="feedback-banner success">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>{{ successMessage }}</span>
      </div>

      <div class="profile-grid">
        <!-- Coluna Esquerda: Cartão de Avatar & Identidade -->
        <div class="profile-col-side">
          <div class="card card-avatar-preview">
            <div class="avatar-hero-wrap">
              <div
                class="avatar-hero-circle"
                [style.background]="'linear-gradient(135deg, ' + selectedAvatar.color + ' 0%, #0b132b 100%)'"
              >
                <!-- SVG Dinâmico por Tipo de Avatar -->
                <svg *ngIf="selectedAvatar.iconType === 'fox-blue'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <svg *ngIf="selectedAvatar.iconType === 'fox-cyan'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <svg *ngIf="selectedAvatar.iconType === 'fox-shield'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <svg *ngIf="selectedAvatar.iconType === 'fox-star'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <svg *ngIf="selectedAvatar.iconType === 'fox-bolt'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <svg *ngIf="selectedAvatar.iconType === 'fox-chart'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <span class="avatar-status-dot" title="Usuário Ativo"></span>
            </div>

            <div class="user-hero-info">
              <h3 class="user-display-name">{{ profile.name }}</h3>
              <p class="user-display-username">&#64;{{ profile.username }}</p>
              <div class="user-pill-wrap">
                <span class="status-pill online">Conta Ativa</span>
              </div>
            </div>

            <!-- Seletor de Avatares Fixos do Sistema -->
            <div class="avatars-selection-section">
              <label class="section-sublabel">Escolha seu Avatar Blue Fox:</label>
              <div class="avatars-grid">
                <button
                  type="button"
                  *ngFor="let av of userService.availableAvatars"
                  class="avatar-option-btn"
                  [class.active]="formData.avatarId === av.id"
                  [style.borderColor]="formData.avatarId === av.id ? av.color : 'transparent'"
                  (click)="selectAvatar(av)"
                  [title]="av.name"
                >
                  <div
                    class="avatar-mini-icon"
                    [style.background]="'linear-gradient(135deg, ' + av.color + ' 0%, #0b132b 100%)'"
                  >
                    <svg *ngIf="av.iconType === 'fox-blue'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <svg *ngIf="av.iconType === 'fox-cyan'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    <svg *ngIf="av.iconType === 'fox-shield'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <svg *ngIf="av.iconType === 'fox-star'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <svg *ngIf="av.iconType === 'fox-bolt'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    <svg *ngIf="av.iconType === 'fox-chart'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </div>
                  <span class="avatar-option-name">{{ av.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna Direita: Formulário de Atualização Cadastral -->
        <div class="profile-col-main">
          <div class="card form-card">
            <div class="card-header-clean">
              <div class="header-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <h3 class="card-title">Dados Pessoais & Acesso</h3>
                <p class="card-subtitle">Mantenha seus dados atualizados para identificação e auditoria</p>
              </div>
            </div>

            <form (ngSubmit)="saveProfile()" class="profile-form">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="fullName" class="form-label">
                    Nome Completo <span class="required">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="name"
                    [(ngModel)]="formData.name"
                    required
                    class="form-control"
                    placeholder="Nome e sobrenome"
                  />
                </div>

                <div class="form-group flex-1">
                  <label for="userName" class="form-label">
                    Nome de Usuário (Username) <span class="required">*</span>
                  </label>
                  <input
                    id="userName"
                    type="text"
                    name="username"
                    [(ngModel)]="formData.username"
                    required
                    class="form-control"
                    placeholder="Ex: felipe.ferraz"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="userEmail" class="form-label">
                    E-mail Corporativo <span class="required">*</span>
                  </label>
                  <input
                    id="userEmail"
                    type="email"
                    name="email"
                    [(ngModel)]="formData.email"
                    required
                    class="form-control"
                    placeholder="email@bluefox.com.br"
                  />
                </div>

                <div class="form-group flex-1">
                  <label for="userPhone" class="form-label">Telefone / WhatsApp</label>
                  <input
                    id="userPhone"
                    type="text"
                    name="phone"
                    [(ngModel)]="formData.phone"
                    class="form-control"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="userRole" class="form-label">Cargo / Função no Sistema</label>
                  <input
                    id="userRole"
                    type="text"
                    name="role"
                    [(ngModel)]="formData.role"
                    class="form-control"
                    placeholder="Ex: Administrador do Sistema"
                  />
                </div>
              </div>

              <div class="form-actions">
                <a routerLink="/admin" class="btn btn-light btn-pill">
                  Cancelar
                </a>
                <button
                  type="submit"
                  class="btn btn-primary btn-pill shadow-glow"
                  [disabled]="!formData.name || !formData.email || isSaving"
                >
                  <svg *ngIf="!isSaving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  <span>{{ isSaving ? 'Salvando Alterações...' : 'Salvar Alterações' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .breadcrumb-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      color: #004aad;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.15s ease;
    }

    .breadcrumb-link:hover {
      color: #38b6ff;
    }

    .breadcrumb-separator {
      color: #94a3b8;
    }

    .breadcrumb-current {
      color: #64748b;
      font-weight: 500;
    }

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .page-title {
      font-family: var(--font-outfit), sans-serif;
      font-size: 1.85rem;
      font-weight: 800;
      color: #0b132b;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .badge-role {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      background: #eff6ff;
      color: #004aad;
      border: 1px solid rgba(56, 182, 255, 0.4);
      padding: 0.2rem 0.65rem;
      border-radius: 50px;
    }

    .page-subtitle {
      font-family: var(--font-inter), sans-serif;
      font-size: 0.92rem;
      color: #64748b;
      margin: 0.35rem 0 0 0;
    }

    .feedback-banner {
      padding: 0.85rem 1.25rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.9rem;
      font-weight: 500;
      animation: fadeIn 0.2s ease-out;
    }

    .feedback-banner.success {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid rgba(21, 128, 61, 0.2);
    }

    /* Grid do Perfil */
    .profile-grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    .profile-col-side {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid rgba(0, 74, 173, 0.08);
      box-shadow: 0 4px 16px rgba(0, 74, 173, 0.04);
      overflow: hidden;
    }

    .card-avatar-preview {
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .avatar-hero-wrap {
      position: relative;
      margin-bottom: 1rem;
    }

    .avatar-hero-circle {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0, 74, 173, 0.25);
      border: 3px solid #ffffff;
    }

    .avatar-status-dot {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #10b981;
      border: 3px solid #ffffff;
    }

    .user-hero-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
      width: 100%;
    }

    .user-display-name {
      font-family: var(--font-outfit), sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0b132b;
      margin: 0;
    }

    .user-display-username {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }

    .user-pill-wrap {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.6rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .status-pill {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 50px;
    }

    .status-pill.online {
      background: #dcfce7;
      color: #15803d;
    }

    .avatars-selection-section {
      width: 100%;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid #f1f5f9;
      text-align: left;
    }

    .section-sublabel {
      display: block;
      font-family: var(--font-inter), sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      margin-bottom: 0.75rem;
    }

    .avatars-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.65rem;
    }

    .avatar-option-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.6rem;
      border-radius: 10px;
      border: 2px solid transparent;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
    }

    .avatar-option-btn:hover {
      background: #eff6ff;
    }

    .avatar-option-btn.active {
      background: #eff6ff;
    }

    .avatar-mini-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar-option-name {
      font-size: 0.76rem;
      font-weight: 600;
      color: #334155;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Coluna Formulário */
    .form-card {
      padding: 1.75rem;
    }

    .card-header-clean {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 1.5rem;
    }

    .header-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #eff6ff;
      color: #004aad;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-title {
      font-family: var(--font-outfit), sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0b132b;
      margin: 0;
    }

    .card-subtitle {
      font-size: 0.82rem;
      color: #64748b;
      margin: 0.15rem 0 0 0;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-row {
      display: flex;
      gap: 1.25rem;
      flex-wrap: wrap;
    }

    .flex-1 {
      flex: 1;
      min-width: 240px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-label {
      font-family: var(--font-inter), sans-serif;
      font-size: 0.84rem;
      font-weight: 600;
      color: #334155;
    }

    .required {
      color: #ef4444;
    }

    .form-control {
      width: 100%;
      padding: 0.7rem 0.9rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      box-sizing: border-box;
      transition: all 0.2s ease;
      font-family: var(--font-inter), sans-serif;
      background: #f8fafc;
    }

    .form-control:focus {
      outline: none;
      background: #ffffff;
      border-color: #004aad;
      box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.12);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1.25rem;
      border-top: 1px solid #f1f5f9;
    }

    @media (max-width: 900px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `],
})
export class UserProfileComponent implements OnInit {
  profile: UserProfile;
  formData: {
    name: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    avatarId: string;
  };

  selectedAvatar: SystemAvatar;
  isSaving = false;
  successMessage = '';

  constructor(public readonly userService: UserService) {
    this.profile = this.userService.currentProfile;
    this.formData = {
      name: this.profile.name,
      username: this.profile.username,
      email: this.profile.email,
      phone: this.profile.phone,
      role: this.profile.role,
      avatarId: this.profile.avatarId,
    };
    this.selectedAvatar = this.userService.getAvatarById(this.profile.avatarId);
  }

  ngOnInit(): void {
    this.userService.profile$.subscribe((p) => {
      this.profile = p;
      this.selectedAvatar = this.userService.getAvatarById(p.avatarId);
    });
  }

  selectAvatar(avatar: SystemAvatar): void {
    this.formData.avatarId = avatar.id;
    this.selectedAvatar = avatar;
  }

  saveProfile(): void {
    if (!this.formData.name || !this.formData.email) return;

    this.isSaving = true;
    setTimeout(() => {
      this.userService.updateProfile({
        name: this.formData.name.trim(),
        username: this.formData.username.trim(),
        email: this.formData.email.trim(),
        phone: this.formData.phone.trim(),
        role: this.formData.role.trim(),
        avatarId: this.formData.avatarId,
      });

      this.isSaving = false;
      this.successMessage = 'Dados do usuário atualizados com sucesso!';
      setTimeout(() => {
        this.successMessage = '';
      }, 3500);
    }, 400);
  }
}
