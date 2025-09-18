import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SuporteDialogComponent } from '../guia/suporte-dialog.component'; // ajuste o caminho se necessário

@Component({
  selector: 'app-guia',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatDialogModule
  ],
  templateUrl: './guia.component.html',
  styleUrls: ['./guia.component.scss']
})
export class GuiaComponent {
  private dialog = inject(MatDialog);

  abrirSuporte() {
    this.dialog.open(SuporteDialogComponent, {
      panelClass: 'dlg--suporte',
      backdropClass: 'backdrop--blur',
      disableClose: true
    });
  }
}
