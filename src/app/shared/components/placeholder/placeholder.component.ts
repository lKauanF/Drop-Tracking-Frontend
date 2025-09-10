import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../logo/logo.component';

@Component({
  standalone: true,
  selector: 'app-placeholder',
  imports: [CommonModule, LogoComponent],
  template: `
    <div class="container-centro">
      <div style="text-align:center">
        <app-logo tamanho="pequeno"></app-logo>
        <h2 style="margin: 16px 0 8px">{{ titulo }}</h2>
        <p>Componente ainda não implementado. Vamos criar na próxima etapa. 🙂</p>
      </div>
    </div>
  `,
})
export class PlaceholderComponent {
  private rota = inject(ActivatedRoute);
  titulo = this.rota.snapshot.data?.['titulo'] ?? 'Em breve';
}
