import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-guia',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatExpansionModule],
  templateUrl: './guia.component.html',
  styleUrls: ['./guia.component.scss'],
})
export class GuiaComponent {}
