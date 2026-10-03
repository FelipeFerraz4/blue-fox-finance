import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SidebarService } from './services/sidebar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-layout">
      <!-- Barra Superior Fixa Completa (Full Width) -->
      <app-navbar></app-navbar>

      <!-- Corpo da Aplicação: Menu Lateral Interno + Conteúdo -->
      <div class="app-body">
        <!-- Menu Lateral Interno (com cor de fundo da página e toggle no topo) -->
        <app-sidebar></app-sidebar>

        <!-- Área Principal de Conteúdo (Alinhada à Esquerda) -->
        <main class="page-container">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f8fafc;
    }

    app-navbar {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
    }

    .app-body {
      display: flex;
      flex: 1;
      position: relative;
    }

    .page-container {
      flex: 1;
      padding: 2rem 2.5rem;
      max-width: 1440px;
      margin: 0; /* Alinhado à esquerda junto ao menu lateral */
      width: 100%;
      box-sizing: border-box;
      min-width: 0;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1.25rem 1rem;
      }
    }
  `],
})
export class AppComponent {
  constructor(public readonly sidebarService: SidebarService) {}
}
