import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoComponent } from '../components/logo/logo.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rail',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogoComponent, MatIconModule],
  template: `
    <aside class="rail">
      <a class="logo" routerLink="/pacientes" aria-label="Início">
        <app-logo [size]="36"></app-logo>
      </a>

      <nav class="menu">
        <a class="item" routerLink="/pacientes" routerLinkActive="ativo" aria-label="Pacientes">
          <mat-icon>groups</mat-icon>
        </a>
        <a class="item" routerLink="/registros" routerLinkActive="ativo" aria-label="Registros">
          <mat-icon>table_rows</mat-icon>
        </a>
        <a class="item" routerLink="/alertas" routerLinkActive="ativo" aria-label="Alertas">
          <mat-icon>notifications</mat-icon>
        </a>
        <a class="item" routerLink="/config" routerLinkActive="ativo" aria-label="Configurações">
          <mat-icon>settings</mat-icon>
        </a>
      </nav>

      <div class="rodape-rail">
        <a class="item" routerLink="/sobre" routerLinkActive="ativo" aria-label="Sobre">
          <mat-icon>help</mat-icon>
        </a>
      </div>
    </aside>
  `,
  styleUrls: ['./rail.component.scss']
})
export class RailComponent {}
