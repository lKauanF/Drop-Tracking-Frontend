import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { SuporteService, Ticket, TicketStatus } from '../../core/services/suporte.service';

@Component({
  selector: 'app-suporte-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title class="dlg__titulo">Falar com o time</h2>

    <div class="dlg__conteudo" mat-dialog-content>
      <!-- Coluna esquerda: formulário -->
      <form class="col form" [formGroup]="form" (ngSubmit)="enviar()">
        <mat-form-field appearance="outline" class="w100 slim">
          <mat-label>Descreva o problema</mat-label>
          <textarea
            matInput
            formControlName="descricao"
            maxlength="2000"
            class="textarea-auto"
            rows="8"></textarea>
          <mat-hint align="end">{{ form.value.descricao?.length || 0 }}/2000</mat-hint>
        </mat-form-field>

        <div class="anexo">
          <button type="button" mat-stroked-button (click)="fileInput.click()">
            <mat-icon>attach_file</mat-icon> Adicionar anexo (opcional)
          </button>
          <input #fileInput type="file" (change)="onFile($event)" hidden>
          <span class="file" *ngIf="fileName">{{ fileName }}</span>
        </div>

        <div class="acoes">
          <button mat-stroked-button type="button" (click)="fechar()">Cancelar</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || enviando">
            {{ enviando ? 'Enviando...' : 'Enviar' }}
          </button>
        </div>
      </form>

      <!-- Coluna direita: Meus pedidos -->
      <div class="col pedidos">
        <div class="tabs" role="tablist">
          <button class="tab" [class.atv]="filtro==='aberto'" (click)="setFiltro('aberto')" role="tab">
            Abertos <span class="badge">{{contagem.aberto}}</span>
          </button>
          <button class="tab" [class.atv]="filtro==='em_atendimento'" (click)="setFiltro('em_atendimento')" role="tab">
            Em atendimento <span class="badge">{{contagem.em_atendimento}}</span>
          </button>
          <button class="tab" [class.atv]="filtro==='resolvido'" (click)="setFiltro('resolvido')" role="tab">
            Resolvidos <span class="badge">{{contagem.resolvido}}</span>
          </button>
        </div>

        <div class="lista" *ngIf="filtrados().length; else vazioTpl">
          <div class="item" *ngFor="let t of filtrados()">
            <div class="top">
              <b>#{{t.id}}</b>
              <span class="status"
                    [class.aberto]="t.status==='aberto'"
                    [class.atendimento]="t.status==='em_atendimento'"
                    [class.resolvido]="t.status==='resolvido'">
                {{ labelStatus(t.status) }}
              </span>
            </div>
            <div class="assunto">{{ t.assunto }}</div>
            <div class="meta">{{ t.criadoEm | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>
        </div>
        <ng-template #vazioTpl>
          <div class="vazio">Nenhum pedido neste status.</div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    :host{
      --muted:#6b7a80; --ink:#0f2a2e; --line:#e9eff1; --card:#fff;
    }

    /* ---- Superfície do dialog segura e fluida ---- */
    :host ::ng-deep .mat-mdc-dialog-surface{
      max-width: 100vw !important;
      width: min(960px, calc(100vw - 24px)) !important;    /* 12px de margem por lado */
      max-height: calc(100dvh - 24px) !important;          /* cabe mesmo com teclado */
      overflow: hidden;                                     /* rolagem só no conteúdo */
      border-radius: 16px;
    }

    /* Conteúdo com rolagem própria, sem “pular” ações */
    .dlg__conteudo{
      display: grid;
      grid-template-columns: minmax(340px,1fr) 360px;      /* desktop: 2 colunas */
      gap: 16px;
      width: 100%;
      max-width: 920px;                                    /* bate com largura do dialog */
      padding: 0 16px 16px;
      box-sizing: border-box;
      overflow: auto;                                      /* rola aqui */
    }
    .dlg__titulo{
      margin: 0;
      padding: 16px 16px 8px;
      font-weight: 700;
      font-size: 18px;
      color: var(--ink);
    }

    /* Colunas */
    .col{ background: var(--card); }
    .form{ display: grid; gap: 12px; }
    .w100{ width: 100%; }

    /* Material field “slim” também para textarea */
    .slim :deep(.mat-mdc-text-field-wrapper){
      border-radius: 10px; background:#eef4f6;
    }
    .slim :deep(.mdc-notched-outline__leading),
    .slim :deep(.mdc-notched-outline__trailing),
    .slim :deep(.mdc-notched-outline__notch){
      border-color:#e2e9ec !important; border-radius:10px;
    }

    /* Textarea responsiva (altura confortável) */
    .textarea-auto{
      min-height: 160px;
    }

    .anexo{ display:flex; align-items:center; gap:10px; color:var(--muted); flex-wrap: wrap; }
    .anexo .file{ font-size:12px; }

    /* Ações sempre visíveis em telas baixas */
    .acoes{
      position: sticky; bottom: 0;
      display:flex; justify-content:flex-end; gap:10px; margin-top:4px;
      padding-top: 8px;
      background: linear-gradient(to top, #fff 70%, rgba(255,255,255,0));
    }

    /* Painel “Meus pedidos” */
    .pedidos{ border-left:1px solid var(--line); padding-left:12px; }
    .tabs{ display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap; }
    .tab{
      border:1px solid var(--line); background:#f1f6f5; color:#0f2a2e;
      padding:6px 10px; border-radius:999px; cursor:pointer; white-space: nowrap;
    }
    .tab.atv{ background:#def2ee; border-color:#cde8e3; font-weight:600; }
    .badge{ background:#fff; border:1px solid #d9e6e2; padding:0 6px; border-radius:999px; margin-left:6px; font-size:12px; }

    .lista{ display:grid; gap:10px; }
    .item{ border:1px solid var(--line); background:#fff; border-radius:10px; padding:10px 12px; }
    .top{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .assunto{ color:var(--ink); margin:2px 0 4px; font-weight:600; }
    .meta{ color:var(--muted); font-size:12px; }
    .status{ font-size:12px; padding:3px 8px; border-radius:999px; white-space:nowrap; }
    .status.aberto{ background:#fff4e5; color:#7c4a03; border:1px solid #fcd9b6; }
    .status.atendimento{ background:#e7f0ff; color:#0b4a91; border:1px solid #cfe0ff; }
    .status.resolvido{ background:#e7f7ef; color:#0f5132; border:1px solid #c7ecd9; }
    .vazio{ color:var(--muted); text-align:center; padding:24px 0; }

    /* ====== Responsividade ====== */
    @media (max-width: 920px){
      :host ::ng-deep .mat-mdc-dialog-surface{
        width: min(720px, calc(100vw - 24px)) !important;
      }
      .dlg__conteudo{ max-width: 680px; grid-template-columns: 1fr 320px; }
    }

    @media (max-width: 860px){
      .dlg__conteudo{
        grid-template-columns: 1fr;                 /* 1 coluna */
        row-gap: 14px;
      }
      .pedidos{
        border-left: 0; padding-left: 0;
        border-top: 1px solid var(--line); padding-top: 12px;
      }
    }

    @media (max-width: 560px){
      :host ::ng-deep .mat-mdc-dialog-surface{
        width: calc(100vw - 16px) !important;
        max-height: calc(100dvh - 16px) !important;
      }
      .dlg__titulo{ font-size: 16px; padding: 14px 12px 6px; }
      .dlg__conteudo{ padding: 0 12px 12px; }
      .tabs{
        overflow-x: auto; gap: 6px; padding-bottom: 2px;
        -webkit-overflow-scrolling: touch;
      }
      .tab{ padding: 6px 10px; }
      .textarea-auto{ min-height: 140px; }           /* textarea um pouco menor no phone */
      .acoes{ gap: 8px; }
    }

    @media (max-width: 380px){
      .tab{ padding: 5px 8px; font-size: 12px; }
      .badge{ font-size: 11px; }
      .textarea-auto{ min-height: 120px; }
    }

    /* Acessibilidade – respeita preferência de menos animação */
    @media (prefers-reduced-motion: reduce){
      *{ animation: none !important; transition: none !important; }
    }
  `]
})
export class SuporteDialogComponent {
  private ref = inject(MatDialogRef<SuporteDialogComponent>);
  private svc = inject(SuporteService);
  private fb = inject(FormBuilder);

  enviando = false;
  file?: File; fileName = '';

  form = this.fb.group({
    descricao: ['', [Validators.required, Validators.minLength(10)]],
  });

  // pedidos
  todos = signal<Ticket[]>([]);
  filtro: TicketStatus = 'aberto';
  filtrados = computed(() => this.todos().filter(t => t.status === this.filtro));

  contagem = { aberto: 0, em_atendimento: 0, resolvido: 0 };

  ngOnInit(){
    this.svc.listarMeus().subscribe(list => {
      this.todos.set(list);
      this.contagem = {
        aberto: list.filter(x=>x.status==='aberto').length,
        em_atendimento: list.filter(x=>x.status==='em_atendimento').length,
        resolvido: list.filter(x=>x.status==='resolvido').length,
      };
    });
  }

  setFiltro(f: TicketStatus){ this.filtro = f; }
  labelStatus(s: TicketStatus){ return s==='aberto' ? 'Aberto' : s==='em_atendimento' ? 'Em atendimento' : 'Resolvido'; }

  onFile(ev: Event){
    const f = (ev.target as HTMLInputElement).files?.[0];
    if (f) { this.file = f; this.fileName = f.name; }
  }

  fechar(){ this.ref.close(); }

  enviar(){
    if (this.form.invalid) return;
    this.enviando = true;
    this.svc.criar(this.form.value.descricao!, this.file).subscribe({
      next: (t) => { this.enviando = false; this.ref.close(t); },
      error: () => { this.enviando = false; }
    });
  }
}
