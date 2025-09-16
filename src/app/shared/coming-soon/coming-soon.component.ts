import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Data, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
  <main class="conteudo">
    <header class="topbar">
      <h2 class="title">{{ title }}</h2>
      <div class="meta-right"></div>
    </header>

    <div class="hairline"></div>

    <section class="wrap">
      <article class="card">
        <div class="badge">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
        <h3>Em breve</h3>
        <p class="lead">
          {{ 'Estamos preparando novidades por aqui. Em uma atualização futura, esta área ficará disponível.'}}
        </p>
      </article>
    </section>
  </main>
  `,
  styles: [`
  :host{
    --bg:#f7faf9; --ink:#0f2a2e; --muted:#6b7a80;
    --primary:#46b39c; --line:#e9eff1; --card:#fff;
    --shadow:0 10px 24px rgba(16,24,40,.08);
  }

  .conteudo{ max-width:1280px; width:100%; padding:16px 28px 28px; margin:0 auto; }

  .topbar{
    display:grid; grid-template-columns:auto 1fr auto; align-items:center; column-gap:16px;
    min-height:40px; margin-bottom:8px;
  }
  .title{ margin:0; font-size:16px; font-weight:700; color:#0f2a2e; }
  .hairline{ height:1px; background:var(--line); margin:8px 0 16px; }

  .wrap{ display:grid; place-items:center; padding:16px 0 32px; }
  .card{
    width:min(720px, 92vw);
    background:var(--card);
    border:1px solid #e7eeec;
    border-radius:16px;
    box-shadow:var(--shadow);
    padding:28px 24px;
    text-align:center;
  }
  .badge{
    width:64px; height:64px; border-radius:50%;
    margin:0 auto 10px;
    display:grid; place-items:center;
    background:radial-gradient(80% 80% at 30% 20%, #7fd6c5, #46b39c);
    color:#fff;
    box-shadow:0 10px 24px rgba(70,179,156,.35);
  }
  .badge .mat-icon{ width:30px; height:30px; font-size:30px; }

  h3{ margin:6px 0 6px; font-size:20px; color:#0f2a2e; }
  .lead{ margin:0 auto; max-width:560px; color:var(--muted); font-size:14px; }

  .actions{ margin-top:16px; display:flex; justify-content:center; gap:10px; }
  .actions .mat-icon{ margin-right:6px; }
  `]
})
export class ComingSoonComponent {
  @Input() title = 'Em breve';
  @Input() subtitle = 'Estamos preparando novidades por aqui. Em uma atualização futura, esta área ficará disponível.';
  @Input() icon: string = 'hourglass_empty';

  private route = inject(ActivatedRoute);

  constructor() {
    const data: Data = this.route.snapshot.data ?? {};
    this.title   = (data['title'] as string)   ?? this.title;
    this.subtitle= (data['subtitle'] as string)?? this.subtitle;
    this.icon    = (data['icon'] as string)    ?? this.icon;
  }
}
