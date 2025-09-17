import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LogoComponent } from '../components/logo/logo.component';

@Component({
  selector: 'app-rail',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule, LogoComponent],
  // ⬇️ inline template no TS
  template: `
    <aside class="rail">
      <a class="logo" routerLink="/pacientes" aria-label="Início" matTooltip="Início" matTooltipPosition="right">
        <app-logo [size]="36"></app-logo>
      </a>

      <nav class="menu">
        <a class="item" routerLink="/pacientes" routerLinkActive="ativo" aria-label="Pacientes"
           matTooltip="Pacientes" matTooltipPosition="right" matTooltipShowDelay="200">
          <mat-icon>groups</mat-icon>
        </a>

        <a class="item" routerLink="/registros" routerLinkActive="ativo" aria-label="Registros"
           matTooltip="Registros" matTooltipPosition="right" matTooltipShowDelay="200">
          <mat-icon>table_rows</mat-icon>
        </a>

        <a class="item" routerLink="/alertas" routerLinkActive="ativo" aria-label="Notificações"
           matTooltip="Notificações" matTooltipPosition="right" matTooltipShowDelay="200">
          <mat-icon>notifications</mat-icon>
        </a>

        <a class="item" routerLink="/config" routerLinkActive="ativo" aria-label="Configurações"
           matTooltip="Configurações" matTooltipPosition="right" matTooltipShowDelay="200">
          <mat-icon>settings</mat-icon>
        </a>

        <a class="item" routerLink="/sobre" routerLinkActive="ativo" aria-label="Guia do Usuário"
           matTooltip="Guia do Usuário" matTooltipPosition="right" matTooltipShowDelay="200">
          <mat-icon>menu_book</mat-icon>
        </a>
      </nav>

      <div class="rodape-rail">
        <a class="item" routerLink="/entrar" aria-label="Sair"
           matTooltip="Sair" matTooltipPosition="right" matTooltipShowDelay="200">
          <mat-icon>logout</mat-icon>
        </a>
      </div>
    </aside>
  `,
  // se já tem SCSS separado, mantenha:
  styleUrls: ['./rail.component.scss'],
  // ou, se quiser tudo inline, use `styles: [ '...css...' ]`
})
export class RailComponent {}
