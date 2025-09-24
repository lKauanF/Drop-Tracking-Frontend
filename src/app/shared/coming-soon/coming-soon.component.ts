import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Data } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Componente: Em Breve (responsivo, mobile-first)
 * - Usa tokens via CSS variables (mantém consistência visual do app)
 * - Tipografia com clamp() para escalar em diferentes larguras
 * - Breakpoints simples (768px e 480px)
 * - Acessível (aria-label na badge/ícone)
 */
@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
  <main class="conteudo" role="main">
    <!-- Topbar -->
    <header class="topbar">
      <h2 class="topbar__titulo">{{ titulo }}</h2>
      <div class="topbar__meta" aria-hidden="true"></div>
    </header>

    <div class="hairline" aria-hidden="true"></div>

    <!-- Cartão central -->
    <section class="miolo">
      <article class="cartao" aria-labelledby="titulo-card" aria-describedby="texto-card">
        <div class="cartao__badge" aria-label="Ícone ilustrativo">
          <mat-icon aria-hidden="true">{{ icone }}</mat-icon>
        </div>

        <h3 id="titulo-card" class="cartao__titulo">Em breve</h3>
        <p id="texto-card" class="cartao__lead">
          {{ subtitulo }}
        </p>

        <!-- Exemplo de ação opcional (mantenha comentado se não usar)
        <div class="cartao__acoes">
          <button mat-stroked-button color="primary">
            <mat-icon>notifications</mat-icon>
            Avise-me
          </button>
        </div>
        -->
      </article>
    </section>
  </main>
  `,
  styles: [`
  /* ==============================
     Tokens (alinhados ao resto do app)
     ============================== */
  :host{
    --bg:#f7faf9;
    --ink:#0f2a2e;
    --muted:#6b7a80;
    --primary:#46b39c;
    --line:#e9eff1;
    --card:#ffffff;
    --shadow:0 10px 24px rgba(16,24,40,.08);

    /* Tipografia base (mobile-first) */
    --fz-12: clamp(11px, .85rem, 12px);
    --fz-14: clamp(12px, .9rem, 14px);
    --fz-16: clamp(14px, 1rem, 16px);
    --fz-18: clamp(15px, 1.05rem, 18px);
    --fz-20: clamp(16px, 1.15rem, 20px);
  }

  /* ==============================
     Layout base (mobile-first)
     ============================== */
  .conteudo{
    width:100%;
    max-width:1280px;
    margin:0 auto;
    padding:16px 16px 28px; /* padding compacto no mobile */
    box-sizing:border-box;
    color:var(--ink);
    background:transparent;
  }

  .topbar{
    display:grid;
    grid-template-columns: 1fr; /* mobile: uma coluna */
    align-items:center;
    justify-items:center;
    row-gap:8px;
    min-height:40px;
    margin-bottom:8px;
    text-align:center;
  }
  .topbar__titulo{
    margin:0;
    font-weight:700;
    font-size:var(--fz-16);
    color:var(--ink);
  }
  .topbar__meta{ width:100%; }

  .hairline{
    height:1px;
    background:var(--line);
    margin:8px 0 16px;
  }

  .miolo{
    display:grid;
    place-items:center;
    padding:16px 0 32px;
  }

.cartao{
  max-width: 720px;  /* trava no desktop */
  width: 100%;       /* 100% do espaço ÚTIL (respeita o padding do pai) */
  background: var(--card);
  border: 1px solid #e7eeec;
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 24px 18px;
  text-align: center;
}



  .cartao__badge{
    width:56px; height:56px; border-radius:50%;
    margin:0 auto 10px;
    display:grid; place-items:center;
    background:radial-gradient(80% 80% at 30% 20%, #7fd6c5, #46b39c);
    color:#fff;
    box-shadow:0 10px 24px rgba(70,179,156,.35);
  }
  .cartao__badge .mat-icon{ width:26px; height:26px; font-size:26px; }

  .cartao__titulo{
    margin:6px 0 6px;
    font-size:var(--fz-20);
    line-height:1.25;
  }

  .cartao__lead{
    margin:0 auto;
    max-width:560px;
    color:var(--muted);
    font-size:var(--fz-14);
    line-height:1.55;
  }

  .cartao__acoes{
    margin-top:16px;
    display:flex;
    justify-content:center;
    gap:10px;
  }
  .cartao__acoes .mat-icon{ margin-right:6px; }




  /* Respeita usuários que preferem menos animação */
  @media (prefers-reduced-motion: reduce){
    *{ animation:none !important; transition:none !important; }
  }

  /* ==============================
     Breakpoint: >= 768px (tablet/desktop)
     ============================== */
  @media (min-width: 768px){
    .conteudo{ padding:16px 28px 28px; }

    .topbar{
      grid-template-columns: auto 1fr auto; /* volta a grade completa */
      justify-items:stretch;
      text-align:left;
    }
    .topbar__titulo{ font-size:var(--fz-18); }

    .cartao{ padding:28px 24px; }
    .cartao__badge{ width:64px; height:64px; }
    .cartao__badge .mat-icon{ width:30px; height:30px; font-size:30px; }
    .cartao__titulo{ font-size:var(--fz-20); }
    .cartao__lead{ font-size:var(--fz-14); }
  }

  /* ==============================
     Breakpoint: >= 1200px (desktop amplo)
     ============================== */
  @media (min-width: 1200px){
    .cartao{ padding:32px 28px; }
  }
  `]
})
export class ComingSoonComponent {
  /* Inputs em PT-BR para manter padrão do projeto */
  @Input() titulo: string = 'Em breve';
  @Input() subtitulo: string =
    'Estamos preparando novidades por aqui. Em uma atualização futura, esta área ficará disponível.';
  @Input() icone: string = 'hourglass_empty';

  private rota = inject(ActivatedRoute);

  constructor() {
    // Permite sobrepor via dados de rota (title, subtitle, icon)
    const dados: Data = this.rota.snapshot.data ?? {};
    this.titulo    = (dados['title']     as string) ?? this.titulo;
    this.subtitulo = (dados['subtitle']  as string) ?? this.subtitulo;
    this.icone     = (dados['icon']      as string) ?? this.icone;
  }
}
