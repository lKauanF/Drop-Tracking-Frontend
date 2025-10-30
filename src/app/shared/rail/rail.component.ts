import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, inject, signal, HostBinding
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LogoComponent } from '../components/logo/logo.component';
import { estaNoBrowser } from '../utils/plataforma';

@Component({
  selector: 'app-rail',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule, LogoComponent],
  template: `
    <!-- Botão hamburger (só aparece no mobile via CSS) -->
    <button
      class="hamburger"
      type="button"
      aria-label="Abrir menu"
      [attr.aria-expanded]="aberto()"
      aria-controls="rail-offcanvas"
      (click)="toggle()">
      <span class="linha"></span><span class="linha"></span><span class="linha"></span>
    </button>

    <!-- Backdrop clicável no mobile -->
    <button
      *ngIf="aberto()"
      class="backdrop"
      type="button"
      aria-label="Fechar menu"
      (click)="fechar()"></button>

    <!-- Drawer / Rail -->
    <aside id="rail-offcanvas" class="rail" #rail [attr.aria-hidden]="!aberto()">
      <a class="logo" routerLink="/pacientes" aria-label="Início"
         matTooltip="Início" matTooltipPosition="right">
        <app-logo [size]="36"></app-logo>
      </a>

      <nav class="menu">
        <a class="item" routerLink="/pacientes" routerLinkActive="ativo"
           [routerLinkActiveOptions]="{ exact: true }"
           aria-label="Pacientes" matTooltip="Pacientes" matTooltipPosition="right" matTooltipShowDelay="200"
           (click)="fecharNoMobile()">
          <mat-icon>groups</mat-icon>
        </a>

        <a class="item" routerLink="/registros" routerLinkActive="ativo"
           aria-label="Registros" matTooltip="Registros" matTooltipPosition="right" matTooltipShowDelay="200"
           (click)="fecharNoMobile()">
          <mat-icon>table_rows</mat-icon>
        </a>

        <a class="item" routerLink="/alertas" routerLinkActive="ativo"
           aria-label="Notificações" matTooltip="Notificações" matTooltipPosition="right" matTooltipShowDelay="200"
           (click)="fecharNoMobile()">
          <mat-icon>notifications</mat-icon>
        </a>

        <a class="item" routerLink="/config" routerLinkActive="ativo"
           aria-label="Configurações" matTooltip="Configurações" matTooltipPosition="right" matTooltipShowDelay="200"
           (click)="fecharNoMobile()">
          <mat-icon>settings</mat-icon>
        </a>

        <a class="item" routerLink="/sobre" routerLinkActive="ativo"
           aria-label="Guia do Usuário" matTooltip="Guia do Usuário" matTooltipPosition="right" matTooltipShowDelay="200"
           (click)="fecharNoMobile()">
          <mat-icon>menu_book</mat-icon>
        </a>
      </nav>

      <div class="rodape-rail">
        <a class="item" routerLink="/entrar" aria-label="Sair"
           matTooltip="Sair" matTooltipPosition="right" matTooltipShowDelay="200"
           (click)="fecharNoMobile()">
          <mat-icon>logout</mat-icon>
        </a>
      </div>
    </aside>
  `,
  styleUrls: ['./rail.component.scss'],
})
export class RailComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rail', { static: true }) railRef!: ElementRef<HTMLElement>;

  // classe no host para CSS (ex.: [class.is-open]="aberto()")
  @HostBinding('class.is-open') get isOpenClass() { return this.aberto(); }

  // estado do drawer
  aberto = signal(false);

  private zone = inject(NgZone);
  private isBrowser = estaNoBrowser();

  private ro?: ResizeObserver;
  private onResize?: () => void;
  private onOrient?: () => void;
  private onKeyDown?: (e: KeyboardEvent) => void;

  // Ações de abertura/fechamento
  toggle(){ this.aberto.update(v => !v); }
  abrir(){ this.aberto.set(true); }
  fechar(){ this.aberto.set(false); }

  // Fecha somente em telas mobile (quando o drawer é off-canvas)
  fecharNoMobile(){
    if (!this.isBrowser) return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) this.fechar();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return; // SSR: não toca no DOM

    const setVar = () => {
      const el: unknown = this.railRef?.nativeElement;
      if (!(el instanceof Element)) return;
      const bcrOk = typeof (el as any).getBoundingClientRect === 'function';
      if (!bcrOk) return;

      const rect = el.getBoundingClientRect();
      const h = Math.ceil(rect.height);

      const root = document.documentElement;
      root.style.setProperty('--altura-navbar', `${h}px`);
    };

    // mede agora
    queueMicrotask(setVar);

    // tecla ESC fecha o drawer
    this.onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.aberto()) this.fechar();
    };

    // observa mudanças de layout somente no browser
    this.zone.runOutsideAngular(() => {
      if ('ResizeObserver' in globalThis) {
        this.ro = new ResizeObserver(setVar);
        this.ro.observe(this.railRef.nativeElement);
      }
      this.onResize = () => setVar();
      this.onOrient = () => setVar();

      window.addEventListener('resize', this.onResize, { passive: true });
      window.addEventListener('orientationchange', this.onOrient, { passive: true });
      window.addEventListener('keydown', this.onKeyDown!);
    });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    this.ro?.disconnect();

    if (this.onResize) { window.removeEventListener('resize', this.onResize); this.onResize = undefined; }
    if (this.onOrient) { window.removeEventListener('orientationchange', this.onOrient); this.onOrient = undefined; }
    if (this.onKeyDown) { window.removeEventListener('keydown', this.onKeyDown); this.onKeyDown = undefined; }
  }
}
