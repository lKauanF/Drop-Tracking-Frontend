import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SuporteService, Ticket, TicketStatus } from '../../core/services/suporte.service';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-suporte-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatChipsModule
  ],
  template: `
  <h2 mat-dialog-title>Falar com o time</h2>

  <div class="wrap" mat-dialog-content>
    <!-- Coluna esquerda: formulário -->
    <form class="col form" [formGroup]="form" (ngSubmit)="enviar()">
      <mat-form-field appearance="outline" class="w100 slim">
        <mat-label>Descreva o problema</mat-label>
        <textarea matInput rows="8" formControlName="descricao" maxlength="2000"></textarea>
        <mat-hint align="end">{{form.value.descricao?.length || 0}}/2000</mat-hint>
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
      <div class="tabs">
        <button class="tab" [class.atv]="filtro==='aberto'" (click)="setFiltro('aberto')">
          Abertos <span class="badge">{{contagem.aberto}}</span>
        </button>
        <button class="tab" [class.atv]="filtro==='em_atendimento'" (click)="setFiltro('em_atendimento')">
          Em atendimento <span class="badge">{{contagem.em_atendimento}}</span>
        </button>
        <button class="tab" [class.atv]="filtro==='resolvido'" (click)="setFiltro('resolvido')">
          Resolvidos <span class="badge">{{contagem.resolvido}}</span>
        </button>
      </div>

      <div class="lista" *ngIf="filtrados().length; else vazioTpl">
        <div class="item" *ngFor="let t of filtrados()">
          <div class="top">
            <b>#{{t.id}}</b>
            <span class="status" [class.aberto]="t.status==='aberto'"
                                 [class.atendimento]="t.status==='em_atendimento'"
                                 [class.resolvido]="t.status==='resolvido'">{{ labelStatus(t.status) }}</span>
          </div>
          <div class="assunto">{{ t.assunto }}</div>
          <div class="meta">{{ t.criadoEm | date:'dd/MM/yyyy HH:mm' }}</div>
        </div>
      </div>
      <ng-template #vazioTpl><div class="vazio">Nenhum pedido neste status.</div></ng-template>
    </div>
  </div>
  `,
  styles: [`
  :host{ --muted:#6b7a80; --ink:#0f2a2e; --rail:#146d60; --line:#e9eff1; --card:#fff; }
  .wrap{ display:grid; grid-template-columns: minmax(340px,1fr) 360px; gap:16px; width:min(960px, 94vw); }
  .col{ background:var(--card); }
  .form{ display:grid; gap:12px; }
  .w100{ width:100%; }
  .slim :deep(.mat-mdc-text-field-wrapper){ height:auto; border-radius:8px; background:#eef4f6; }
  .anexo{ display:flex; align-items:center; gap:10px; color:var(--muted); }
  .anexo .file{ font-size:12px; }
  .acoes{ display:flex; justify-content:flex-end; gap:10px; margin-top:4px; }

  .pedidos{ border-left:1px solid var(--line); padding-left:12px; }
  .tabs{ display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap; }
  .tab{ border:1px solid var(--line); background:#f1f6f5; color:#0f2a2e; padding:6px 10px; border-radius:999px; cursor:pointer; }
  .tab.atv{ background:#def2ee; border-color:#cde8e3; font-weight:600; }
  .badge{ background:#fff; border:1px solid #d9e6e2; padding:0 6px; border-radius:999px; margin-left:6px; font-size:12px; }

  .lista{ display:grid; gap:10px; }
  .item{ border:1px solid var(--line); background:#fff; border-radius:10px; padding:10px 12px; }
  .top{ display:flex; align-items:center; justify-content:space-between; }
  .assunto{ color:var(--ink); margin:2px 0 4px; font-weight:600; }
  .meta{ color:var(--muted); font-size:12px; }
  .status{ font-size:12px; padding:3px 8px; border-radius:999px; }
  .status.aberto{ background:#fff4e5; color:#7c4a03; border:1px solid #fcd9b6; }
  .status.atendimento{ background:#e7f0ff; color:#0b4a91; border:1px solid #cfe0ff; }
  .status.resolvido{ background:#e7f7ef; color:#0f5132; border:1px solid #c7ecd9; }
  .vazio{ color:var(--muted); text-align:center; padding:24px 0; }

  @media (max-width: 860px){
    .wrap{ grid-template-columns:1fr; }
    .pedidos{ border-left:0; padding-left:0; border-top:1px solid var(--line); padding-top:12px; }
  }
  `]
})
export class SuporteDialogComponent {
  private ref = inject(MatDialogRef<SuporteDialogComponent>);
  private svc = inject(SuporteService);
  private fb = inject(FormBuilder);
  private suporte = inject(SuporteService);

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

  labelStatus(s: TicketStatus){
    return s==='aberto' ? 'Aberto' : s==='em_atendimento' ? 'Em atendimento' : 'Resolvido';
  }

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
