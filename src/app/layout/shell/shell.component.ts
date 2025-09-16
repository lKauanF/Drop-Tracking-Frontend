import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RailComponent } from '../../shared/rail/rail.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RailComponent],
  template: `
    <div class="layout">
      <app-rail></app-rail>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {}
